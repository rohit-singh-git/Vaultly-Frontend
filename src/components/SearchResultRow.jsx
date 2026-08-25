import { MoreVertical, ChevronRight, Home } from "lucide-react";
import { getFileVisual } from "../utils/fileVisuals.js";
import { formatBytes, formatDate } from "../utils/format.js";

export default function SearchResultRow({
    item,
    onOpen,
    onMenu,
    selected,
    onSelect,
}) {
    const { icon: Icon, color } = getFileVisual(item.type);
    const path = item.path || [];

    return (
        <div
            onClick={() => onSelect(item.id)}
            onDoubleClick={() => item.type === "folder" && onOpen(item.id)}
            className={`group grid cursor-pointer grid-cols-[1fr_40px] items-center gap-4 rounded-lg px-3 py-2.5 transition sm:grid-cols-[1fr_180px_120px_40px] ${
                selected ? "bg-accent-soft" : "hover:bg-bg"
            }`}
        >
            <div className="flex min-w-0 items-center gap-3">
                <Icon
                    size={18}
                    style={{ color }}
                    strokeWidth={1.5}
                    className="shrink-0"
                />
                <span className="truncate text-sm font-medium text-text-primary">
                    {item.name}
                </span>
            </div>

            <div className="hidden min-w-0 items-center gap-1 font-mono text-xs text-text-secondary sm:flex">
                <Home size={11} className="shrink-0" />
                {path.length === 0 ? (
                    <span>My Drive</span>
                ) : (
                    path.map((folder, i) => (
                        <span
                            key={folder.id}
                            className="flex min-w-0 items-center gap-1"
                        >
                            <ChevronRight size={10} className="shrink-0" />
                            <span
                                className={
                                    i === path.length - 1
                                        ? "truncate"
                                        : "shrink-0"
                                }
                            >
                                {folder.name}
                            </span>
                        </span>
                    ))
                )}
            </div>

            <span className="hidden font-mono text-xs text-text-secondary sm:block">
                {item.type === "folder"
                    ? formatDate(item.modifiedAt)
                    : formatBytes(item.size)}
            </span>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onMenu(item, e);
                }}
                className="justify-self-end rounded-md p-1 text-text-secondary opacity-0 transition hover:bg-surface group-hover:opacity-100"
            >
                <MoreVertical size={16} />
            </button>
        </div>
    );
}
