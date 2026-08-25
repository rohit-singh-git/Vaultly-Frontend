import { useEffect, useState } from "react";
import { Trash2, RotateCcw, XCircle, Menu } from "lucide-react";
import Sidebar from "../components/Sidebar.jsx";
import SearchResultRow from "../components/SearchResultRow.jsx";
import ContextMenu from "../components/ContextMenu.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";
import { files } from "../services/api.js";
import { useToast } from "../context/ToastContext.jsx";

export default function Trash() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState(null);
    const [menu, setMenu] = useState(null);
    const [modal, setModal] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const toast = useToast();

    function refresh() {
        setLoading(true);
        files
            .listTrash()
            .then(setItems)
            .finally(() => setLoading(false));
    }

    useEffect(() => {
        refresh();
    }, []);

    async function handleAction(actionKey) {
        const item = menu.item;
        if (actionKey === "restore") {
            try {
                await files.restore(item.id);
                setItems((prev) => prev.filter((i) => i.id !== item.id));
                toast(`Restored "${item.name}"`, "success");
            } catch (err) {
                toast(err.message, "error");
            }
        } else if (actionKey === "delete-forever") {
            setModal({ type: "delete-forever", item });
        }
    }

    async function handlePermanentDelete() {
        try {
            await files.permanentDelete(modal.item.id);
            setItems((prev) => prev.filter((i) => i.id !== modal.item.id));
            toast(`Permanently deleted "${modal.item.name}"`, "success");
        } catch (err) {
            toast(err.message, "error");
        } finally {
            setModal(null);
        }
    }

    async function handleEmptyTrash() {
        try {
            await files.emptyTrash();
            setItems([]);
            toast("Trash emptied", "success");
        } catch (err) {
            toast(err.message, "error");
        } finally {
            setModal(null);
        }
    }

    return (
        <div className="flex h-screen bg-bg">
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="flex flex-1 flex-col overflow-hidden">
                <header className="flex items-center gap-3 border-b border-border px-4 py-3 sm:px-6">
                    <button
                        className="rounded-md p-1.5 hover:bg-bg sm:hidden"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu size={20} />
                    </button>
                    <Trash2 size={18} className="text-text-secondary" />
                    <h1 className="font-display text-lg font-semibold text-text-primary">
                        Trash
                    </h1>
                    {items.length > 0 && (
                        <button
                            onClick={() => setModal({ type: "empty-trash" })}
                            className="ml-auto rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-text-primary transition hover:bg-bg"
                        >
                            Empty trash
                        </button>
                    )}
                </header>

                <div
                    className="flex-1 overflow-y-auto px-4 py-4 sm:px-6"
                    onClick={() => setSelectedId(null)}
                >
                    {loading ? (
                        <p className="py-10 text-center text-sm text-text-secondary">
                            Loading…
                        </p>
                    ) : items.length === 0 ? (
                        <p className="py-10 text-center text-sm text-text-secondary">
                            Trash is empty.
                        </p>
                    ) : (
                        <div className="space-y-0.5">
                            {items.map((item) => (
                                <SearchResultRow
                                    key={item.id}
                                    item={item}
                                    selected={selectedId === item.id}
                                    onSelect={setSelectedId}
                                    onOpen={() => {}}
                                    onMenu={(item, e) => {
                                        e.stopPropagation();
                                        setSelectedId(item.id);
                                        setMenu({
                                            item,
                                            x: e.clientX,
                                            y: e.clientY,
                                        });
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {menu && (
                <ContextMenu
                    x={menu.x}
                    y={menu.y}
                    onClose={() => setMenu(null)}
                    onAction={handleAction}
                    actions={[
                        { key: "restore", label: "Restore", icon: RotateCcw },
                        {
                            key: "delete-forever",
                            label: "Delete forever",
                            icon: XCircle,
                            danger: true,
                        },
                    ]}
                />
            )}

            {modal?.type === "delete-forever" && (
                <ConfirmModal
                    title="Delete forever?"
                    message={`"${modal.item.name}" will be permanently deleted. This cannot be undone.`}
                    confirmLabel="Delete forever"
                    danger
                    onConfirm={handlePermanentDelete}
                    onClose={() => setModal(null)}
                />
            )}

            {modal?.type === "empty-trash" && (
                <ConfirmModal
                    title="Empty trash?"
                    message="All items in Trash will be permanently deleted. This cannot be undone."
                    confirmLabel="Empty trash"
                    danger
                    onConfirm={handleEmptyTrash}
                    onClose={() => setModal(null)}
                />
            )}
        </div>
    );
}
