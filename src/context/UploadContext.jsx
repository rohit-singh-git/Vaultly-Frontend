import {
    createContext,
    useCallback,
    useContext,
    useRef,
    useState,
} from "react";
import { files, guessFileType } from "../services/api.js";

const UploadContext = createContext(null);

// status: 'queued' | 'uploading' | 'paused' | 'resuming' | 'done' | 'error' | 'cancelled'
let nextId = 1;

// Must stay <= backend MAX_CONCURRENT_UPLOAD_SESSIONS_PER_USER
// (vaultly-server/src/modules/files/uploadConcurrency.js) so we never hit
// the 429 "Too many concurrent uploads" response.
const MAX_CONCURRENT_UPLOADS = 6;

// A pause doesn't touch the network or the upload session — it just blocks
// the chunk loop in api.js between chunks until resume() is called. Cancel
// (via the same AbortController/signal used for fetch) still works while
// paused: the abort listener below rejects the wait with AbortError, which
// flows through upload()'s existing catch/cleanup path unchanged.
function createPauseController() {
    let paused = false;
    let resolveWait = null;
    return {
        pause() {
            paused = true;
        },
        resume() {
            paused = false;
            resolveWait?.();
            resolveWait = null;
        },
        waitIfPaused(signal) {
            if (!paused) return Promise.resolve();
            return new Promise((resolve, reject) => {
                resolveWait = resolve;
                signal?.addEventListener("abort", () => {
                    const err = new Error("Upload cancelled");
                    err.name = "AbortError";
                    reject(err);
                });
            });
        },
    };
}

export function UploadProvider({ children }) {
    const [uploads, setUploads] = useState([]);
    const controllers = useRef(new Map());
    const pauseControllers = useRef(new Map());
    const queue = useRef([]); // { id, type: 'start', file, folderId } | { id, type: 'resume' }
    const activeCount = useRef(0);
    // Tracks whether a given upload currently "occupies" a concurrency slot,
    // so pause (which releases the slot early) and the eventual finally
    // block (which normally releases it) never double-decrement.
    const slotHeld = useRef(new Map());

    const updateUpload = useCallback((id, patch) => {
        setUploads((prev) =>
            prev.map((u) => (u.id === id ? { ...u, ...patch } : u)),
        );
    }, []);

    const startNextQueued = useCallback(() => {
        while (
            activeCount.current < MAX_CONCURRENT_UPLOADS &&
            queue.current.length > 0
        ) {
            const next = queue.current.shift();
            activeCount.current += 1;
            slotHeld.current.set(next.id, true);
            if (next.type === "resume") {
                updateUpload(next.id, { status: "uploading" });
                pauseControllers.current.get(next.id)?.resume();
            } else {
                // eslint-disable-next-line no-use-before-define
                runUpload(next.id, next.file, next.folderId);
            }
        }
    }, [updateUpload]);

    const runUpload = useCallback(
        async (uploadId, file, folderId) => {
            const controller = new AbortController();
            controllers.current.set(uploadId, controller);
            const pauseController = createPauseController();
            pauseControllers.current.set(uploadId, pauseController);
            updateUpload(uploadId, { status: "uploading", progress: 0 });

            try {
                await files.upload(
                    file,
                    folderId,
                    ({ progress, loaded, total, speedBps }) =>
                        updateUpload(uploadId, {
                            progress,
                            loaded,
                            total,
                            speedBps,
                        }),
                    { signal: controller.signal, pauseController },
                );
                updateUpload(uploadId, { status: "done", progress: 100 });
            } catch (err) {
                if (err.name === "AbortError") {
                    updateUpload(uploadId, { status: "cancelled" });
                } else {
                    updateUpload(uploadId, {
                        status: "error",
                        error: err.message,
                    });
                }
            } finally {
                controllers.current.delete(uploadId);
                pauseControllers.current.delete(uploadId);
                if (slotHeld.current.get(uploadId)) {
                    activeCount.current = Math.max(0, activeCount.current - 1);
                }
                slotHeld.current.delete(uploadId);
                startNextQueued();
            }
        },
        [updateUpload, startNextQueued],
    );

    const addFiles = useCallback(
        (fileList, folderId) => {
            const newUploads = Array.from(fileList).map((file) => ({
                id: nextId++,
                file,
                name: file.name,
                size: file.size,
                type: guessFileType(file.name),
                folderId,
                progress: 0,
                status: "queued",
            }));
            setUploads((prev) => [...prev, ...newUploads]);
            queue.current.push(
                ...newUploads.map((u) => ({
                    id: u.id,
                    file: u.file,
                    folderId: u.folderId,
                })),
            );
            startNextQueued();
        },
        [startNextQueued],
    );

    const cancelUpload = useCallback(
        (id) => {
            // If it hasn't started yet (or is paused-and-queued to resume),
            // just drop it from the queue.
            const queuedIndex = queue.current.findIndex((u) => u.id === id);
            if (queuedIndex !== -1) {
                queue.current.splice(queuedIndex, 1);
            }
            // Abort works whether the upload is actively transferring or
            // paused (mid-wait) — see createPauseController's abort listener.
            const controller = controllers.current.get(id);
            if (controller) {
                controller.abort();
            } else if (queuedIndex !== -1) {
                updateUpload(id, { status: "cancelled" });
            }
        },
        [updateUpload],
    );

    const pauseUpload = useCallback(
        (id) => {
            const pauseController = pauseControllers.current.get(id);
            if (!pauseController) return; // not currently running
            pauseController.pause();
            updateUpload(id, { status: "paused" });
            if (slotHeld.current.get(id)) {
                slotHeld.current.set(id, false);
                activeCount.current = Math.max(0, activeCount.current - 1);
                startNextQueued();
            }
        },
        [updateUpload, startNextQueued],
    );

    const resumeUpload = useCallback(
        (id) => {
            if (!pauseControllers.current.has(id)) return;
            updateUpload(id, { status: "resuming" });
            // Resumed uploads jump the line ahead of never-started files,
            // since the user explicitly asked to continue this one.
            queue.current.unshift({ id, type: "resume" });
            startNextQueued();
        },
        [updateUpload, startNextQueued],
    );

    const retryUpload = useCallback(
        (id) => {
            const upload = uploads.find((u) => u.id === id);
            if (!upload) return;
            updateUpload(id, { status: "queued", progress: 0 });
            queue.current.push({
                id,
                file: upload.file,
                folderId: upload.folderId,
            });
            startNextQueued();
        },
        [uploads, updateUpload, startNextQueued],
    );

    const dismissUpload = useCallback((id) => {
        setUploads((prev) => prev.filter((u) => u.id !== id));
    }, []);

    const clearFinished = useCallback(() => {
        setUploads((prev) =>
            prev.filter(
                (u) =>
                    u.status === "uploading" ||
                    u.status === "queued" ||
                    u.status === "paused" ||
                    u.status === "resuming",
            ),
        );
    }, []);

    const value = {
        uploads,
        addFiles,
        cancelUpload,
        retryUpload,
        pauseUpload,
        resumeUpload,
        dismissUpload,
        clearFinished,
    };

    return (
        <UploadContext.Provider value={value}>
            {children}
        </UploadContext.Provider>
    );
}

export function useUploads() {
    const ctx = useContext(UploadContext);
    if (!ctx) throw new Error("useUploads must be used within UploadProvider");
    return ctx;
}
