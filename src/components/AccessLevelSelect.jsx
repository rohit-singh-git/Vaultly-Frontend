import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Eye, Pencil } from "lucide-react";

const LABELS = {
    view: "Can view",
    edit: "Can edit",
};

const OPTIONS = [
    {
        value: "view",
        label: LABELS.view,
        description: "Can view this link",
        icon: Eye,
    },
    {
        value: "edit",
        label: LABELS.edit,
        description: "Can edit this link",
        icon: Pencil,
    },
];

export default function AccessLevelSelect({ value, onChange, disabled }) {
    const [open, setOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState(null);
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);

    const selectedOption =
        OPTIONS.find((option) => option.value === value) ?? OPTIONS[0];

    const SelectedIcon = selectedOption.icon;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (!open || !buttonRef.current) return;

        const updateMenuPosition = () => {
            const rect = buttonRef.current.getBoundingClientRect();
            const menuWidth = 224;
            const menuHeight = 112;
            const gap = 8;
            const padding = 8;

            const left = Math.min(
                Math.max(rect.right - menuWidth, padding),
                window.innerWidth - menuWidth - padding,
            );

            const spaceBelow = window.innerHeight - rect.bottom;
            const openUpward =
                spaceBelow < menuHeight + gap && rect.top >= menuHeight + gap;

            setMenuPosition({
                top: openUpward
                    ? rect.top - menuHeight - gap
                    : rect.bottom + gap,
                left,
            });
        };

        updateMenuPosition();
        window.addEventListener("resize", updateMenuPosition);
        window.addEventListener("scroll", updateMenuPosition, true);

        return () => {
            window.removeEventListener("resize", updateMenuPosition);
            window.removeEventListener("scroll", updateMenuPosition, true);
        };
    }, [open]);

    const handleSelect = (nextValue) => {
        onChange(nextValue);
        setOpen(false);
    };

    return (
        <div ref={dropdownRef} className="relative inline-block">
            <button
                ref={buttonRef}
                type="button"
                disabled={disabled}
                onClick={() => setOpen((prev) => !prev)}
                className={`
                    flex min-w-[110px] items-center justify-between
                    gap-3 rounded-lg border border-border
                    bg-surface px-3 py-2.5
                    text-xs font-medium text-text
                    shadow-sm
                    outline-none
                    transition-all duration-200
                    ${
                        open
                            ? "border-accent ring-4 ring-accent/10"
                            : "hover:border-text-secondary hover:bg-bg"
                    }
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                `}
            >
                <span className="flex min-w-0 items-center gap-2">
                    <SelectedIcon
                        size={14}
                        strokeWidth={1.8}
                        className="shrink-0 text-text-secondary"
                    />

                    <span className="truncate">{selectedOption.label}</span>
                </span>

                <ChevronDown
                    size={14}
                    strokeWidth={2}
                    className={`
                        shrink-0 text-text-secondary
                        transition-transform duration-200
                        ${open ? "rotate-180" : ""}
                    `}
                />
            </button>

            {open && menuPosition && (
                <div
                    className="
                        fixed z-[100] w-56
                        overflow-hidden rounded-xl
                        border border-border
                        bg-surface
                        p-1.5
                        shadow-xl shadow-black/5
                        ring-1 ring-black/5
                        animate-in fade-in
                        slide-in-from-top-1
                        duration-150
                    "
                    style={{
                        top: menuPosition.top,
                        left: menuPosition.left,
                    }}
                >
                    {OPTIONS.map((option) => {
                        const Icon = option.icon;
                        const isSelected = option.value === value;

                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => handleSelect(option.value)}
                                className={`
                                    flex w-full items-center gap-3
                                    rounded-lg px-3 py-2.5
                                    text-left
                                    transition-colors duration-150
                                    ${
                                        isSelected
                                            ? "bg-accent/10"
                                            : "hover:bg-bg"
                                    }
                                `}
                            >
                                <div
                                    className={`
                                        flex h-8 w-8 shrink-0
                                        items-center justify-center
                                        rounded-lg
                                        transition-colors
                                        ${
                                            isSelected
                                                ? "bg-accent/15 text-accent"
                                                : "bg-bg text-text-secondary"
                                        }
                                    `}
                                >
                                    <Icon size={15} strokeWidth={1.8} />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div
                                        className={`
                                            text-xs font-medium
                                            ${
                                                isSelected
                                                    ? "text-text"
                                                    : "text-text-secondary"
                                            }
                                        `}
                                    >
                                        {option.label}
                                    </div>

                                    <div className="mt-0.5 text-[10px] text-text-secondary">
                                        {option.description}
                                    </div>
                                </div>

                                {isSelected && (
                                    <Check
                                        size={14}
                                        strokeWidth={2}
                                        className="shrink-0 text-accent"
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
