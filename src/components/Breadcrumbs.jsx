import { ChevronRight, Home } from "lucide-react";

export default function Breadcrumbs({ path, onNavigate }) {
    return (
        <div className="flex items-center gap-1.5 text-sm">
            <button
                onClick={() => onNavigate(null)}
                className={`flex items-center gap-1.5 rounded-md px-2 py-1 font-medium transition hover:bg-accent-soft ${
                    path.length === 0
                        ? "text-text-primary"
                        : "text-text-secondary"
                }`}
            >
                <Home size={14} />
                My Drive
            </button>
            {path.map((folder, i) => (
                <span key={folder.id} className="flex items-center gap-1.5">
                    <ChevronRight size={14} className="text-text-secondary" />
                    <button
                        onClick={() => onNavigate(folder.id)}
                        className={`rounded-md px-2 py-1 font-medium transition hover:bg-accent-soft ${
                            i === path.length - 1
                                ? "text-text-primary"
                                : "text-text-secondary"
                        }`}
                    >
                        {folder.name}
                    </button>
                </span>
            ))}
        </div>
    );
}
