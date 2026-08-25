import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Download, Trash2, Menu } from "lucide-react";
import Sidebar from "../components/Sidebar.jsx";
import SearchResultRow from "../components/SearchResultRow.jsx";
import ContextMenu from "../components/ContextMenu.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";
import { files } from "../services/api.js";
import { useToast } from "../context/ToastContext.jsx";

export default function Recent() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState(null);
    const [menu, setMenu] = useState(null);
    const [modal, setModal] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const toast = useToast();

    useEffect(() => {
        files
            .listRecent()
            .then(setItems)
            .finally(() => setLoading(false));
    }, []);

    function handleOpen(folderId) {
        navigate(`/drive/folder/${folderId}`);
    }

    async function handleAction(actionKey) {
        const item = menu.item;
        if (actionKey === "download") {
            try {
                await files.download(item.id, item.name);
            } catch {
                toast("Download failed", "error");
            }
        } else if (actionKey === "delete") {
            setModal({ type: "delete", item });
        }
    }

    async function handleDelete() {
        try {
            await files.remove(modal.item.id);
            setItems((prev) => prev.filter((i) => i.id !== modal.item.id));
            toast(`Moved "${modal.item.name}" to trash`, "success");
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
                    <Clock size={18} className="text-text-secondary" />
                    <h1 className="font-display text-lg font-semibold text-text-primary">
                        Recent
                    </h1>
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
                            No recent files yet.
                        </p>
                    ) : (
                        <div className="space-y-0.5">
                            {items.map((item) => (
                                <SearchResultRow
                                    key={item.id}
                                    item={item}
                                    selected={selectedId === item.id}
                                    onSelect={setSelectedId}
                                    onOpen={handleOpen}
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
                        { key: "download", label: "Download", icon: Download },
                        {
                            key: "delete",
                            label: "Delete",
                            icon: Trash2,
                            danger: true,
                        },
                    ]}
                />
            )}

            {modal?.type === "delete" && (
                <ConfirmModal
                    title="Move to trash?"
                    message={`"${modal.item.name}" will be moved to Trash.`}
                    confirmLabel="Move to trash"
                    danger
                    onConfirm={handleDelete}
                    onClose={() => setModal(null)}
                />
            )}
        </div>
    );
}
