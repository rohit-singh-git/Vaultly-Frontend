/**
 * Real API service layer (Phase 2).
 *
 * Same contract as the Phase 1 mock: every function returns a Promise,
 * resolves with data on success, and rejects with { message, status } on
 * failure. No component/page/context needed to change — see API_CONTRACT.md.
 */

import { API_BASE_URL } from "./config.js";

const SESSION_KEY = "vaultly_session";
const CHUNK_SIZE = 20 * 1024 * 1024; // 20MB per chunk (matches multer's 40MB cap, 2x headroom)

// Server allows 480 chunk requests/min per user (chunkRateLimiter). Space
// chunk sends out client-side, shared across ALL concurrent uploads, so we
// stay under that budget proactively instead of hitting 429 and retrying.
// A small safety margin (400 instead of 480) covers session init/complete
// calls sharing the same limiter window.
const CHUNK_MIN_INTERVAL_MS = 60000 / 400;
let chunkPacerReadyAt = 0;

function waitForChunkSlot(signal) {
    const now = Date.now();
    const runAt = Math.max(now, chunkPacerReadyAt);
    chunkPacerReadyAt = runAt + CHUNK_MIN_INTERVAL_MS;
    return sleep(Math.max(0, runAt - now), signal);
}

// Server allows 60 session requests/min per user (sessionRateLimiter), shared
// across init/complete/abort. Many small files finishing quickly can burst
// init+complete pairs past that budget even with chunk pacing in place, so
// pace session calls the same way. Margin: 45 instead of 60.
const SESSION_MIN_INTERVAL_MS = 60000 / 45;
let sessionPacerReadyAt = 0;

function waitForSessionSlot(signal) {
    const now = Date.now();
    const runAt = Math.max(now, sessionPacerReadyAt);
    sessionPacerReadyAt = runAt + SESSION_MIN_INTERVAL_MS;
    return sleep(Math.max(0, runAt - now), signal);
}

// ---- Session helpers ------------------------------------------------------

function getSession() {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

function setSession(session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function clearSession() {
    localStorage.removeItem(SESSION_KEY);
}

function authHeader() {
    const session = getSession();
    return session?.token ? { Authorization: `Bearer ${session.token}` } : {};
}

// ---- Core request helper ---------------------------------------------------
// Wraps fetch so every caller gets the same resolve/reject shape the mock
// layer used: success -> parsed JSON, failure -> Error with { message, status }.

function sleep(ms, signal) {
    return new Promise((resolve, reject) => {
        const t = setTimeout(resolve, ms);
        signal?.addEventListener("abort", () => {
            clearTimeout(t);
            const err = new Error("Upload cancelled");
            err.name = "AbortError";
            reject(err);
        });
    });
}

// 429s from the upload session/chunk rate limiters are expected under normal
// multi-file usage (see rateLimit.middleware.js) — they mean "slow down",
// not "failed". Retry silently with backoff instead of surfacing an error.
const MAX_RATE_LIMIT_RETRIES = 8;

async function request(
    path,
    { method = "GET", body, headers = {}, signal, isFormData = false } = {},
) {
    for (let attempt = 0; ; attempt++) {
        let res;
        try {
            res = await fetch(`${API_BASE_URL}${path}`, {
                method,
                signal,
                headers: {
                    ...(isFormData
                        ? {}
                        : { "Content-Type": "application/json" }),
                    ...authHeader(),
                    ...headers,
                },
                body:
                    body === undefined
                        ? undefined
                        : isFormData
                          ? body
                          : JSON.stringify(body),
            });
        } catch (networkErr) {
            if (networkErr.name === "AbortError") throw networkErr;
            const err = new Error(
                "Network error — check your connection and try again",
            );
            err.status = 0;
            throw err;
        }

        if (res.status === 429 && attempt < MAX_RATE_LIMIT_RETRIES) {
            const retryAfterHeader = res.headers.get("Retry-After");
            const retryAfterMs = retryAfterHeader
                ? Number(retryAfterHeader) * 1000
                : null;
            const backoffMs =
                retryAfterMs ??
                Math.min(1000 * 2 ** attempt, 15000) + Math.random() * 300;
            await sleep(backoffMs, signal);
            continue;
        }

        if (res.status === 204) return undefined;

        let data = null;
        const text = await res.text();
        if (text) {
            try {
                data = JSON.parse(text);
            } catch {
                data = null;
            }
        }

        if (!res.ok) {
            const message =
                data?.error?.message || `Request failed (${res.status})`;
            const err = new Error(message);
            err.status = data?.error?.status || res.status;
            throw err;
        }

        return data;
    }
}

export function guessFileType(filename) {
    const ext = filename.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext))
        return "image";
    if (["mp4", "mov", "avi", "webm"].includes(ext)) return "video";
    if (["doc", "docx"].includes(ext)) return "doc";
    if (["xls", "xlsx", "csv"].includes(ext)) return "sheet";
    if (ext === "pdf") return "pdf";
    return "default";
}

// ---- Auth -------------------------------------------------------------

export const auth = {
    async login(email, password) {
        const session = await request("/auth/login", {
            method: "POST",
            body: { email, password },
        });
        setSession(session);
        return session;
    },

    async signup(name, email, password) {
        return request("/auth/signup", {
            method: "POST",
            body: { name, email, password },
        });
    },

    async verifyOtp(email, code) {
        const session = await request("/auth/verify-otp", {
            method: "POST",
            body: { email, code },
        });
        setSession(session);
        return session;
    },

    async requestPasswordReset(email) {
        return request("/auth/request-password-reset", {
            method: "POST",
            body: { email },
        });
    },

    async logout() {
        // JWT auth is stateless server-side — logout just drops the local session.
        clearSession();
    },

    async getCurrentUser() {
        const session = getSession();
        if (!session?.token) return null;
        try {
            return await request("/auth/me");
        } catch {
            // Token invalid/expired — clear the stale session so future calls don't retry it.
            clearSession();
            return null;
        }
    },
};

// ---- Files & folders ----------------------------------------------------

export const files = {
    async list(folderId = null) {
        const qs = folderId ? `?folderId=${encodeURIComponent(folderId)}` : "";
        return request(`/files${qs}`);
    },

    async listFolders(parentId = null, excludeId = null) {
        const params = new URLSearchParams();
        if (parentId) params.set("parentId", parentId);
        if (excludeId) params.set("excludeId", excludeId);
        const qs = params.toString() ? `?${params}` : "";
        return request(`/files/folders${qs}`);
    },

    async createFolder(name, parentId = null) {
        return request("/files/folders", {
            method: "POST",
            body: { name, parentId },
        });
    },

    async upload(file, folderId, onProgress, { signal, pauseController } = {}) {
        const totalChunks = Math.max(1, Math.ceil(file.size / CHUNK_SIZE));

        await waitForSessionSlot(signal);
        const { uploadId } = await request("/files/upload/init", {
            method: "POST",
            signal,
            body: {
                fileName: file.name,
                fileSize: file.size,
                folderId,
                totalChunks,
            },
        });

        try {
            let uploadedBytes = 0;
            let smoothedBps = 0; // exponential moving average, avoids jumpy speed readout

            for (let i = 0; i < totalChunks; i++) {
                if (signal?.aborted) {
                    const err = new Error("Upload cancelled");
                    err.name = "AbortError";
                    throw err;
                }
                // Blocks here (without holding a chunk slot or timer) until
                // resumed. A cancel while paused rejects via the same signal.
                await pauseController?.waitIfPaused(signal);
                const start = i * CHUNK_SIZE;
                const chunk = file.slice(start, start + CHUNK_SIZE);
                const formData = new FormData();
                formData.append("chunk", chunk);

                await waitForChunkSlot(signal);
                const requestStart = performance.now();
                await request(`/files/upload/chunk/${uploadId}/${i}`, {
                    method: "POST",
                    signal,
                    isFormData: true,
                    body: formData,
                });

                const elapsedSec = Math.max(
                    (performance.now() - requestStart) / 1000,
                    0.001,
                );
                const instantBps = chunk.size / elapsedSec;
                // First sample sets the baseline; afterwards blend 70% history / 30% latest.
                smoothedBps =
                    smoothedBps === 0
                        ? instantBps
                        : smoothedBps * 0.7 + instantBps * 0.3;
                uploadedBytes += chunk.size;

                onProgress?.({
                    progress: Math.round(((i + 1) / totalChunks) * 100),
                    loaded: uploadedBytes,
                    total: file.size,
                    speedBps: smoothedBps,
                });
            }

            await waitForSessionSlot(signal);
            return await request(`/files/upload/complete/${uploadId}`, {
                method: "POST",
            });
        } catch (err) {
            if (err.name === "AbortError") {
                // Best-effort cleanup of the abandoned session; don't let this mask the AbortError.
                waitForSessionSlot()
                    .then(() =>
                        request(`/files/upload/${uploadId}`, {
                            method: "DELETE",
                        }),
                    )
                    .catch(() => {});
            }
            throw err;
        }
    },

    async rename(fileId, newName) {
        return request(`/files/${fileId}/rename`, {
            method: "PATCH",
            body: { newName },
        });
    },

    async move(fileId, targetFolderId) {
        return request(`/files/${fileId}/move`, {
            method: "PATCH",
            body: { targetFolderId },
        });
    },

    async remove(fileId) {
        return request(`/files/${fileId}`, { method: "DELETE" });
    },

    async listTrash() {
        return request("/files/trash");
    },

    async emptyTrash() {
        return request("/files/trash", { method: "DELETE" });
    },

    async restore(fileId) {
        return request(`/files/${fileId}/restore`, { method: "POST" });
    },

    async permanentDelete(fileId) {
        return request(`/files/${fileId}/permanent`, { method: "DELETE" });
    },

    async listRecent() {
        return request("/files/recent");
    },

    async download(fileId, fileName) {
        const session = getSession();
        const res = await fetch(`${API_BASE_URL}/files/${fileId}/download`, {
            headers: {
                ...(session?.token
                    ? { Authorization: `Bearer ${session.token}` }
                    : {}),
            },
        });
        if (!res.ok) {
            const err = new Error("Download failed");
            err.status = res.status;
            throw err;
        }
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    },
};

// ---- Sharing ------------------------------------------------------------

export const sharing = {
    async getShares(fileId) {
        return request(`/shares/${fileId}`);
    },

    async share(fileId, email, accessLevel = "view") {
        return request(`/shares/${fileId}`, {
            method: "POST",
            body: { email, accessLevel },
        });
    },

    async updateAccess(fileId, email, accessLevel) {
        return request(`/shares/${fileId}/access`, {
            method: "PATCH",
            body: { email, accessLevel },
        });
    },

    async unshare(fileId, email) {
        return request(`/shares/${fileId}`, {
            method: "DELETE",
            body: { email },
        });
    },

    async setLinkSharing(fileId, enabled) {
        return request(`/shares/${fileId}/link`, {
            method: "PUT",
            body: { enabled },
        });
    },

    async setLinkAccess(fileId, accessLevel) {
        return request(`/shares/${fileId}/link/access`, {
            method: "PATCH",
            body: { accessLevel },
        });
    },

    async getShareLink(fileId) {
        const res = await request(`/shares/${fileId}/link`);
        return res?.url ?? null;
    },

    async listSharedWithMe() {
        return request("/shares/shared-with-me");
    },
};

// ---- Search & quota -------------------------------------------------------

export const search = {
    async query(term, filters = {}) {
        const { type = "all", modified = "any", owner = "all" } = filters;
        const params = new URLSearchParams({ term, type, modified, owner });
        return request(`/search?${params}`);
    },
};

export const quota = {
    async get() {
        return request("/quota");
    },
};
