import { useLayoutEffect, useRef, useState } from "react";
import { Pencil, FolderInput, Share2, Download, Trash2 } from "lucide-react";

const defaultActions = [
    { key: "rename", label: "Rename", icon: Pencil },
    { key: "move", label: "Move", icon: FolderInput },
    { key: "share", label: "Share", icon: Share2 },
    { key: "download", label: "Download", icon: Download },
    { key: "delete", label: "Delete", icon: Trash2, danger: true },
];

export default function ContextMenu({
    x,
    y,
    onAction,
    onClose,
    actions = defaultActions,
}) {
    const ref = useRef(null);
    const [position, setPosition] = useState(null);

    useLayoutEffect(() => {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();
        const padding = 8;

        let newX = x;
        let newY = y;

        // Right edge
        if (newX + rect.width > window.innerWidth - padding) {
            newX = window.innerWidth - rect.width - padding;
        }

        // Bottom edge
        if (newY + rect.height > window.innerHeight - padding) {
            newY = window.innerHeight - rect.height - padding;
        }

        // Left edge
        if (newX < padding) {
            newX = padding;
        }

        // Top edge
        if (newY < padding) {
            newY = padding;
        }

        setPosition({
            x: newX,
            y: newY,
        });
    }, [x, y]);

    useLayoutEffect(() => {
        function handleClick(e) {
            if (ref.current && !ref.current.contains(e.target)) {
                onClose();
            }
        }

        document.addEventListener("mousedown", handleClick);

        return () => {
            document.removeEventListener("mousedown", handleClick);
        };
    }, [onClose]);

    return (
        <div
            ref={ref}
            style={{
                top: position?.y ?? y,
                left: position?.x ?? x,
                visibility: position ? "visible" : "hidden",
            }}
            className="fixed z-50 w-44 rounded-lg border border-border bg-surface py-1.5 shadow-lg"
        >
            {actions.map(({ key, label, icon: Icon, danger }) => (
                <button
                    key={key}
                    onClick={() => {
                        onAction(key);
                        onClose();
                    }}
                    className={`flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm transition hover:bg-bg ${
                        danger ? "text-danger" : "text-text-primary"
                    }`}
                >
                    <Icon size={15} />
                    {label}
                </button>
            ))}
        </div>
    );
}
