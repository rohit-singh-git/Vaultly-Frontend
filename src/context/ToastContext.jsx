import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);
let nextId = 1;

const STYLES = {
    success: { icon: CheckCircle2, className: "text-success" },
    error: { icon: XCircle, className: "text-danger" },
    info: { icon: Info, className: "text-accent" },
};

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const dismiss = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const toast = useCallback(
        (message, type = "info") => {
            const id = nextId++;
            setToasts((prev) => [...prev, { id, message, type }]);
            setTimeout(() => dismiss(id), 4000);
        },
        [dismiss],
    );

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <div className="fixed left-1/2 top-4 z-60 flex w-[calc(100vw-2.5rem)] max-w-sm -translate-x-1/2 flex-col gap-2 sm:bottom-5 sm:left-5 sm:top-auto sm:translate-x-0">
                {toasts.map((t) => {
                    const { icon: Icon, className } =
                        STYLES[t.type] || STYLES.info;
                    return (
                        <div
                            key={t.id}
                            className="flex items-center gap-2.5 rounded-lg border border-border bg-surface px-4 py-3 shadow-lg"
                        >
                            <Icon
                                size={17}
                                className={`shrink-0 ${className}`}
                            />
                            <p className="min-w-0 flex-1 text-sm text-text-primary">
                                {t.message}
                            </p>
                            <button
                                onClick={() => dismiss(t.id)}
                                className="shrink-0 text-text-secondary hover:text-text-primary"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used within ToastProvider");
    return ctx.toast;
}
