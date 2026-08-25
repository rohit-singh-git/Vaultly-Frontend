import { useEffect, useState } from "react";
import { Folder, ChevronRight, Home, Check } from "lucide-react";
import Button from "./Button.jsx";
import { files } from "../services/api.js";

export default function MoveFileModal({ item, onConfirm, onClose }) {
    const [currentId, setCurrentId] = useState(null);
    const [folders, setFolders] = useState([]);
    const [path, setPath] = useState([]);
    const [loading, setLoading] = useState(true);
    const [moving, setMoving] = useState(false);

    useEffect(() => {
        setLoading(true);
        files.listFolders(currentId, item.id).then((res) => {
            setFolders(res.folders);
            setPath(res.path);
            setLoading(false);
        });
    }, [currentId, item.id]);

    async function handleMove() {
        setMoving(true);
        await onConfirm(currentId);
        setMoving(false);
        onClose();
    }

    const alreadyHere = currentId === item.parentId;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="flex max-h-[28rem] w-full max-w-sm flex-col rounded-xl border border-border bg-surface shadow-xl"
            >
                <div className="border-b border-border px-5 py-4">
                    <h3 className="font-display text-base font-semibold text-text-primary">
                        Move "{item.name}"
                    </h3>
                    <div className="mt-2 flex flex-wrap items-center gap-1 text-xs">
                        <button
                            onClick={() => setCurrentId(null)}
                            className={`flex items-center gap-1 rounded px-1.5 py-0.5 hover:bg-bg ${currentId === null ? "font-medium text-text-primary" : "text-text-secondary"}`}
                        >
                            <Home size={12} /> My Drive
                        </button>
                        {path.map((folder, i) => (
                            <span
                                key={folder.id}
                                className="flex items-center gap-1"
                            >
                                <ChevronRight
                                    size={12}
                                    className="text-text-secondary"
                                />
                                <button
                                    onClick={() => setCurrentId(folder.id)}
                                    className={`rounded px-1.5 py-0.5 hover:bg-bg ${i === path.length - 1 ? "font-medium text-text-primary" : "text-text-secondary"}`}
                                >
                                    {folder.name}
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                    {loading ? (
                        <div className="space-y-2 p-3">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="h-9 animate-pulse rounded-lg bg-border/40"
                                />
                            ))}
                        </div>
                    ) : folders.length === 0 ? (
                        <p className="p-4 text-center text-sm text-text-secondary">
                            No subfolders here.
                        </p>
                    ) : (
                        folders.map((folder) => (
                            <button
                                key={folder.id}
                                onDoubleClick={() => setCurrentId(folder.id)}
                                onClick={() => setCurrentId(folder.id)}
                                className="flex w-full select-none items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-text-primary transition hover:bg-bg"
                            >
                                <Folder
                                    size={16}
                                    className="shrink-0 text-accent"
                                />
                                <span className="truncate">{folder.name}</span>
                            </button>
                        ))
                    )}
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-border px-5 py-3.5">
                    <p className="flex items-center gap-1.5 text-xs text-text-secondary">
                        {alreadyHere && (
                            <>
                                <Check size={13} className="text-success" />{" "}
                                Already here
                            </>
                        )}
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            className="w-auto px-4"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="w-auto px-4"
                            loading={moving}
                            disabled={alreadyHere}
                            onClick={handleMove}
                        >
                            Move here
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
