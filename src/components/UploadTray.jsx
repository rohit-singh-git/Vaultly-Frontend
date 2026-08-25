import { useState } from "react";
import {
    ChevronDown,
    ChevronUp,
    X,
    RotateCw,
    CheckCircle2,
    XCircle,
    UploadCloud,
    Pause,
    Play,
} from "lucide-react";
import { useUploads } from "../context/UploadContext.jsx";
import { formatBytes, formatSpeed } from "../utils/format.js";
import { getFileVisual } from "../utils/fileVisuals.js";

const IN_PROGRESS_STATUSES = ["uploading", "queued", "paused", "resuming"];

function statusIcon(status) {
    if (status === "done")
        return <CheckCircle2 size={16} className="text-success" />;
    if (status === "error")
        return <XCircle size={16} className="text-danger" />;
    return null;
}

export default function UploadTray() {
    const {
        uploads,
        cancelUpload,
        retryUpload,
        pauseUpload,
        resumeUpload,
        dismissUpload,
        clearFinished,
    } = useUploads();
    const [collapsed, setCollapsed] = useState(false);

    if (uploads.length === 0) return null;

    const activeCount = uploads.filter((u) =>
        IN_PROGRESS_STATUSES.includes(u.status),
    ).length;
    const doneCount = uploads.filter((u) => u.status === "done").length;

    return (
        <div className="fixed bottom-5 left-1/2 z-40 w-[calc(100vw-2.5rem)] max-w-80 -translate-x-1/2 overflow-hidden rounded-xl border border-border bg-surface shadow-xl sm:left-auto sm:right-5 sm:translate-x-0">
            <div className="flex items-center justify-between border-b border-border bg-bg px-4 py-3">
                <div className="flex items-center gap-2">
                    <UploadCloud size={16} className="text-accent" />
                    <p className="text-sm font-medium text-text-primary">
                        {activeCount > 0
                            ? `Uploading ${activeCount} item${activeCount > 1 ? "s" : ""}`
                            : `${doneCount} upload${doneCount > 1 ? "s" : ""} complete`}
                    </p>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setCollapsed((c) => !c)}
                        className="rounded p-1 text-text-secondary hover:bg-border/40"
                    >
                        {collapsed ? (
                            <ChevronUp size={16} />
                        ) : (
                            <ChevronDown size={16} />
                        )}
                    </button>
                    <button
                        onClick={clearFinished}
                        className="rounded p-1 text-text-secondary hover:bg-border/40"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>

            {!collapsed && (
                <div className="max-h-72 overflow-y-auto">
                    {uploads.map((u) => {
                        const { icon: Icon, color } = getFileVisual(u.type);
                        return (
                            <div
                                key={u.id}
                                className="flex items-center gap-3 border-b border-border px-4 py-2.5 last:border-0"
                            >
                                <Icon
                                    size={18}
                                    style={{ color }}
                                    strokeWidth={1.5}
                                    className="shrink-0"
                                />
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="truncate text-xs font-medium text-text-primary">
                                            {u.name}
                                        </p>
                                        {statusIcon(u.status)}
                                    </div>

                                    {IN_PROGRESS_STATUSES.includes(
                                        u.status,
                                    ) && (
                                        <>
                                            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-border">
                                                <div
                                                    className={`h-full rounded-full transition-all ${u.status === "paused" ? "bg-text-secondary" : "bg-accent"}`}
                                                    style={{
                                                        width: `${u.progress}%`,
                                                    }}
                                                />
                                            </div>
                                            <div className="mt-0.5 flex items-center justify-between font-mono text-[11px] text-text-secondary">
                                                <span>
                                                    {u.status === "queued" &&
                                                        "Waiting…"}
                                                    {u.status === "paused" &&
                                                        `Paused · ${u.progress}%`}
                                                    {u.status === "resuming" &&
                                                        "Resuming…"}
                                                    {u.status === "uploading" &&
                                                        `${u.progress}%`}
                                                </span>
                                                {u.status === "uploading" &&
                                                    formatSpeed(u.speedBps) && (
                                                        <span>
                                                            {formatSpeed(
                                                                u.speedBps,
                                                            )}
                                                        </span>
                                                    )}
                                            </div>
                                        </>
                                    )}

                                    {u.status === "error" && (
                                        <p className="mt-0.5 text-xs text-danger">
                                            {u.error}
                                        </p>
                                    )}
                                    {u.status === "cancelled" && (
                                        <p className="mt-0.5 text-xs text-text-secondary">
                                            Cancelled
                                        </p>
                                    )}
                                    {u.status === "done" && (
                                        <p className="mt-0.5 font-mono text-xs text-text-secondary">
                                            {formatBytes(u.size)}
                                        </p>
                                    )}
                                </div>

                                {u.status === "uploading" && (
                                    <button
                                        onClick={() => pauseUpload(u.id)}
                                        className="shrink-0 text-text-secondary hover:text-accent"
                                    >
                                        <Pause size={15} />
                                    </button>
                                )}
                                {u.status === "paused" && (
                                    <button
                                        onClick={() => resumeUpload(u.id)}
                                        className="shrink-0 text-text-secondary hover:text-accent"
                                    >
                                        <Play size={15} />
                                    </button>
                                )}
                                {IN_PROGRESS_STATUSES.includes(u.status) && (
                                    <button
                                        onClick={() => cancelUpload(u.id)}
                                        className="shrink-0 text-text-secondary hover:text-danger"
                                    >
                                        <X size={15} />
                                    </button>
                                )}
                                {u.status === "error" && (
                                    <button
                                        onClick={() => retryUpload(u.id)}
                                        className="shrink-0 text-text-secondary hover:text-accent"
                                    >
                                        <RotateCw size={15} />
                                    </button>
                                )}
                                {(u.status === "done" ||
                                    u.status === "cancelled") && (
                                    <button
                                        onClick={() => dismissUpload(u.id)}
                                        className="shrink-0 text-text-secondary hover:text-text-primary"
                                    >
                                        <X size={15} />
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
