import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Grid2x2,
    List,
    UploadCloud,
    FolderOpen,
    FilePlus2,
    SearchX,
    Menu,
} from "lucide-react";
import Sidebar from "../components/Sidebar.jsx";
import Breadcrumbs from "../components/Breadcrumbs.jsx";
import FileGridItem from "../components/FileGridItem.jsx";
import FileListRow from "../components/FileListRow.jsx";
import SearchBar from "../components/SearchBar.jsx";
import SearchResultRow from "../components/SearchResultRow.jsx";
import ContextMenu from "../components/ContextMenu.jsx";
import NamePromptModal from "../components/NamePromptModal.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";
import MoveFileModal from "../components/MoveFileModal.jsx";
import ShareModal from "../components/ShareModal.jsx";
import { files, search } from "../services/api.js";
import { useUploads } from "../context/UploadContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

export default function Drive() {
    const { folderId = null } = useParams();
    const navigate = useNavigate();

    const [items, setItems] = useState([]);
    const [path, setPath] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState("grid"); // 'grid' | 'list'
    const [selectedId, setSelectedId] = useState(null);
    const [menu, setMenu] = useState(null); // { item, x, y }
    const [modal, setModal] = useState(null); // 'newFolder' | 'rename'
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const { uploads, addFiles } = useUploads();
    const toast = useToast();
    const fileInputRef = useRef(null);
    const seenDoneIds = useRef(new Set());
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    const [searchQuery, setSearchQuery] = useState("");
    const [searchFilters, setSearchFilters] = useState({
        type: "all",
        modified: "any",
        owner: "all",
    });
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const isSearchMode = searchQuery.trim().length > 0;

    useEffect(() => {
        if (!isSearchMode) return;
        setSearching(true);
        search.query(searchQuery, searchFilters).then((results) => {
            setSearchResults(results);
            setSearching(false);
        });
    }, [searchQuery, searchFilters, isSearchMode]);

    const loadFolder = useCallback(async (id) => {
        setLoading(true);
        const result = await files.list(id);
        setItems(result.items);
        setPath(result.path);
        setLoading(false);
    }, []);

    useEffect(() => {
        loadFolder(folderId);
        setSelectedId(null);
    }, [folderId, loadFolder]);

    // Refresh the listing whenever an upload targeting the currently-open folder finishes.
    useEffect(() => {
        const newlyDone = uploads.filter(
            (u) =>
                u.status === "done" &&
                u.folderId === folderId &&
                !seenDoneIds.current.has(u.id),
        );
        if (newlyDone.length > 0) {
            newlyDone.forEach((u) => seenDoneIds.current.add(u.id));
            loadFolder(folderId);
        }
    }, [uploads, folderId, loadFolder]);

    function openFolder(id) {
        setSearchQuery("");
        navigate(id ? `/drive/folder/${id}` : "/drive");
    }

    function handleMenu(item, e) {
        setSelectedId(item.id);
        setMenu({ item, x: e.clientX, y: e.clientY });
    }

    async function handleAction(actionKey) {
        const item = menu.item;
        if (actionKey === "rename") {
            setModal({ type: "rename", item });
        } else if (actionKey === "delete") {
            setModal({ type: "delete", item });
        } else if (actionKey === "move") {
            setModal({ type: "move", item });
        } else if (actionKey === "share") {
            setModal({ type: "share", item });
        } else if (actionKey === "download") {
            try {
                await files.download(item.id, item.name);
            } catch {
                toast("Download failed", "error");
            }
        }
    }

    async function handleCreateFolder(name) {
        try {
            await files.createFolder(name, folderId);
            loadFolder(folderId);
            toast(`Created "${name}"`, "success");
        } catch (err) {
            toast(err.message || "Could not create folder", "error");
        }
    }

    async function handleRename(name) {
        try {
            await files.rename(modal.item.id, name);
            loadFolder(folderId);
            toast("Renamed", "success");
        } catch (err) {
            toast(err.message || "Could not rename", "error");
        }
    }

    async function handleDelete() {
        try {
            await files.remove(modal.item.id);
            loadFolder(folderId);
            toast(`Deleted "${modal.item.name}"`, "success");
        } catch (err) {
            toast(err.message || "Could not delete", "error");
        }
    }

    async function handleMove(targetFolderId) {
        try {
            await files.move(modal.item.id, targetFolderId);
            loadFolder(folderId);
            toast("Moved", "success");
        } catch (err) {
            toast(err.message || "Could not move item", "error");
        }
    }

    const ViewItem = view === "grid" ? FileGridItem : FileListRow;

    return (
        <div className="flex h-screen bg-bg">
            <Sidebar
                onNewFolder={() => setModal({ type: "newFolder" })}
                open={mobileNavOpen}
                onClose={() => setMobileNavOpen(false)}
            />

            <main
                className="flex flex-1 flex-col overflow-hidden"
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingOver(true);
                }}
                onDragLeave={() => setIsDraggingOver(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingOver(false);
                    if (e.dataTransfer.files.length) {
                        addFiles(e.dataTransfer.files, folderId);
                    }
                }}
            >
                <header className="flex flex-col gap-3 border-b border-border bg-surface px-4 py-3 sm:px-6 sm:py-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-2">
                            <button
                                onClick={() => setMobileNavOpen(true)}
                                className="shrink-0 rounded-md p-1.5 text-text-secondary hover:bg-bg hover:text-text-primary lg:hidden"
                            >
                                <Menu size={20} />
                            </button>
                            <div className="min-w-0 overflow-x-auto">
                                <Breadcrumbs
                                    path={path}
                                    onNavigate={openFolder}
                                />
                            </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                className="hidden"
                                onChange={(e) => {
                                    if (e.target.files.length)
                                        addFiles(e.target.files, folderId);
                                    e.target.value = "";
                                }}
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-2 rounded-lg border border-border bg-surface px-2.5 py-2 text-sm font-medium text-text-primary transition hover:bg-accent-soft sm:px-3.5"
                            >
                                <FilePlus2 size={16} />
                                <span className="hidden sm:inline">
                                    Upload files
                                </span>
                            </button>
                            <div className="flex items-center gap-1 rounded-lg border border-border bg-bg p-1">
                                <button
                                    onClick={() => setView("grid")}
                                    className={`rounded-md p-1.5 transition ${view === "grid" ? "bg-surface text-accent shadow-sm" : "text-text-secondary"}`}
                                >
                                    <Grid2x2 size={16} />
                                </button>
                                <button
                                    onClick={() => setView("list")}
                                    className={`rounded-md p-1.5 transition ${view === "list" ? "bg-surface text-accent shadow-sm" : "text-text-secondary"}`}
                                >
                                    <List size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <SearchBar
                        value={searchQuery}
                        onChange={setSearchQuery}
                        filters={searchFilters}
                        onFiltersChange={setSearchFilters}
                    />
                </header>

                <div className="relative flex-1 overflow-y-auto p-4 sm:p-6">
                    {isSearchMode ? (
                        searching ? (
                            <div className="space-y-2">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="h-11 animate-pulse rounded-lg bg-border/40"
                                    />
                                ))}
                            </div>
                        ) : searchResults.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center text-center">
                                <SearchX
                                    size={40}
                                    className="mb-3 text-text-secondary"
                                />
                                <p className="font-display text-base font-semibold text-text-primary">
                                    No results for "{searchQuery}"
                                </p>
                                <p className="mt-1 text-sm text-text-secondary">
                                    Try a different term or clear your filters.
                                </p>
                            </div>
                        ) : (
                            <div>
                                <p className="mb-3 text-sm text-text-secondary">
                                    {searchResults.length} result
                                    {searchResults.length > 1 ? "s" : ""} for "
                                    {searchQuery}"
                                </p>
                                <div className="grid grid-cols-[1fr_40px] gap-4 px-3 pb-2 font-mono text-xs uppercase tracking-wide text-text-secondary sm:grid-cols-[1fr_180px_120px_40px]">
                                    <span>Name</span>
                                    <span className="hidden sm:block">
                                        Location
                                    </span>
                                    <span className="hidden sm:block">
                                        Size / Modified
                                    </span>
                                    <span />
                                </div>
                                <div className="space-y-0.5">
                                    {searchResults.map((item) => (
                                        <SearchResultRow
                                            key={item.id}
                                            item={item}
                                            onOpen={openFolder}
                                            onMenu={handleMenu}
                                            onSelect={setSelectedId}
                                            selected={selectedId === item.id}
                                        />
                                    ))}
                                </div>
                            </div>
                        )
                    ) : loading ? (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="h-32 animate-pulse rounded-xl bg-border/40"
                                />
                            ))}
                        </div>
                    ) : items.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center text-center">
                            <FolderOpen
                                size={40}
                                className="mb-3 text-text-secondary"
                            />
                            <p className="font-display text-base font-semibold text-text-primary">
                                This folder is empty
                            </p>
                            <p className="mt-1 text-sm text-text-secondary">
                                Drag files here or use New folder to get
                                started.
                            </p>
                        </div>
                    ) : view === "grid" ? (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                            {items.map((item) => (
                                <ViewItem
                                    key={item.id}
                                    item={item}
                                    onOpen={openFolder}
                                    onMenu={handleMenu}
                                    onSelect={setSelectedId}
                                    selected={selectedId === item.id}
                                />
                            ))}
                        </div>
                    ) : (
                        <div>
                            <div className="grid grid-cols-[1fr_40px] gap-4 px-3 pb-2 font-mono text-xs uppercase tracking-wide text-text-secondary sm:grid-cols-[1fr_120px_140px_40px]">
                                <span>Name</span>
                                <span className="hidden sm:block">Size</span>
                                <span className="hidden sm:block">
                                    Modified
                                </span>
                                <span />
                            </div>
                            <div className="space-y-0.5">
                                {items.map((item) => (
                                    <ViewItem
                                        key={item.id}
                                        item={item}
                                        onOpen={openFolder}
                                        onMenu={handleMenu}
                                        onSelect={setSelectedId}
                                        selected={selectedId === item.id}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {isDraggingOver && (
                        <div className="pointer-events-none absolute inset-4 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-accent bg-accent-soft/80">
                            <UploadCloud
                                size={36}
                                className="mb-2 text-accent"
                            />
                            <p className="font-medium text-accent">
                                Drop files to upload
                            </p>
                        </div>
                    )}
                </div>
            </main>

            {menu && (
                <ContextMenu
                    x={menu.x}
                    y={menu.y}
                    onAction={handleAction}
                    onClose={() => setMenu(null)}
                />
            )}

            {modal?.type === "newFolder" && (
                <NamePromptModal
                    title="New folder"
                    confirmLabel="Create"
                    onConfirm={handleCreateFolder}
                    onClose={() => setModal(null)}
                />
            )}

            {modal?.type === "rename" && (
                <NamePromptModal
                    title="Rename"
                    confirmLabel="Save"
                    initialValue={modal.item.name}
                    onConfirm={handleRename}
                    onClose={() => setModal(null)}
                />
            )}

            {modal?.type === "delete" && (
                <ConfirmModal
                    title={`Delete "${modal.item.name}"?`}
                    description={
                        modal.item.type === "folder"
                            ? "This folder and everything inside it will be permanently deleted."
                            : "This file will be permanently deleted. This cannot be undone."
                    }
                    confirmLabel="Delete"
                    danger
                    onConfirm={handleDelete}
                    onClose={() => setModal(null)}
                />
            )}

            {modal?.type === "move" && (
                <MoveFileModal
                    item={modal.item}
                    onConfirm={handleMove}
                    onClose={() => setModal(null)}
                />
            )}

            {modal?.type === "share" && (
                <ShareModal item={modal.item} onClose={() => setModal(null)} />
            )}
        </div>
    );
}
