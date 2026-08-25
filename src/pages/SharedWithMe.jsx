import { useEffect, useState } from "react";
import { Users, Download, Menu } from "lucide-react";
import Sidebar from "../components/Sidebar.jsx";
import SearchResultRow from "../components/SearchResultRow.jsx";
import ContextMenu from "../components/ContextMenu.jsx";
import { sharing, files } from "../services/api.js";
import { useToast } from "../context/ToastContext.jsx";

export default function SharedWithMe() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState(null);
    const [menu, setMenu] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const toast = useToast();

    useEffect(() => {
        sharing
            .listSharedWithMe()
            .then(setItems)
            .finally(() => setLoading(false));
    }, []);

    async function handleAction(actionKey) {
        const item = menu.item;
        if (actionKey === "download") {
            try {
                await files.download(item.id, item.name);
            } catch {
                toast("Download failed", "error");
            }
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
                    <Users size={18} className="text-text-secondary" />
                    <h1 className="font-display text-lg font-semibold text-text-primary">
                        Shared with me
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
                            Nothing has been shared with you yet.
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
                        { key: "download", label: "Download", icon: Download },
                    ]}
                />
            )}
        </div>
    );
}
