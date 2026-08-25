import { useEffect, useState } from "react";
import { Link2, Check, Copy, X, Globe2, Lock } from "lucide-react";
import Button from "./Button.jsx";
import AccessLevelSelect from "./AccessLevelSelect.jsx";
import { sharing } from "../services/api.js";

export default function ShareModal({ item, onClose }) {
    const [email, setEmail] = useState("");
    const [newAccess, setNewAccess] = useState("view");
    const [people, setPeople] = useState([]);
    const [link, setLink] = useState({
        enabled: false,
        accessLevel: "view",
        token: null,
    });
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        sharing.getShares(item.id).then((res) => {
            setPeople(res.people);
            setLink(res.link);
            setLoading(false);
        });
    }, [item.id]);

    async function handleAddPerson(e) {
        e.preventDefault();
        setError("");
        if (!/^\S+@\S+\.\S+$/.test(email)) {
            setError("Enter a valid email address");
            return;
        }
        setAdding(true);
        const updated = await sharing.share(item.id, email, newAccess);
        setPeople(updated);
        setEmail("");
        setNewAccess("view");
        setAdding(false);
    }

    async function handleAccessChange(personEmail, accessLevel) {
        await sharing.updateAccess(item.id, personEmail, accessLevel);
        setPeople((prev) =>
            prev.map((p) =>
                p.email === personEmail ? { ...p, accessLevel } : p,
            ),
        );
    }

    async function handleRemove(personEmail) {
        await sharing.unshare(item.id, personEmail);
        setPeople((prev) => prev.filter((p) => p.email !== personEmail));
    }

    async function handleToggleLink() {
        const updated = await sharing.setLinkSharing(item.id, !link.enabled);
        setLink(updated);
    }

    async function handleLinkAccessChange(accessLevel) {
        const updated = await sharing.setLinkAccess(item.id, accessLevel);
        setLink(updated);
    }

    async function handleCopyLink() {
        const url = await sharing.getShareLink(item.id);
        if (url) {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="flex max-h-128 h-120 w-full max-w-md flex-col rounded-xl border border-border bg-surface shadow-xl"
            >
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                    <h3 className="font-display text-base font-semibold text-text-primary">
                        Share "{item.name}"
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-text-secondary hover:text-text-primary"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5">
                    <div className="">
                        <form
                            onSubmit={handleAddPerson}
                            className="flex flex-col gap-2 px-3"
                        >
                            <input
                                type="email"
                                placeholder="Add people by email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="min-w-auto flex-1 rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
                            />
                            <div className="flex gap-5">
                                <AccessLevelSelect
                                    value={newAccess}
                                    onChange={setNewAccess}
                                />
                                <Button
                                    type="submit"
                                    loading={adding}
                                    className="w-auto px-4"
                                >
                                    Add
                                </Button>
                            </div>
                        </form>
                    </div>

                    {error && (
                        <p className="mt-1.5 text-xs text-danger">{error}</p>
                    )}

                    <div className="mt-5">
                        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-secondary">
                            People with access
                        </p>
                        {loading ? (
                            <div className="space-y-2">
                                {Array.from({ length: 2 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="h-11 animate-pulse rounded-lg bg-border/40"
                                    />
                                ))}
                            </div>
                        ) : people.length === 0 ? (
                            <p className="rounded-lg bg-bg px-3 py-3 text-sm text-text-secondary">
                                Only you have access right now.
                            </p>
                        ) : (
                            <div className="space-y-1">
                                {people.map((p) => (
                                    <div
                                        key={p.email}
                                        className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-bg"
                                    >
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent">
                                            {p.email[0].toUpperCase()}
                                        </div>
                                        <span className="min-w-0 flex-1 truncate text-sm text-text-primary">
                                            {p.email}
                                        </span>
                                        <AccessLevelSelect
                                            value={p.accessLevel}
                                            onChange={(v) =>
                                                handleAccessChange(p.email, v)
                                            }
                                        />
                                        <button
                                            onClick={() =>
                                                handleRemove(p.email)
                                            }
                                            className="text-text-secondary hover:text-danger"
                                        >
                                            <X size={15} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="border-t border-border p-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            {link.enabled ? (
                                <Globe2 size={17} className="text-accent" />
                            ) : (
                                <Lock
                                    size={17}
                                    className="text-text-secondary"
                                />
                            )}
                            <div>
                                <p className="text-sm font-medium text-text-primary">
                                    {link.enabled
                                        ? "Anyone with the link"
                                        : "Link sharing off"}
                                </p>
                                <p className="text-xs text-text-secondary">
                                    {link.enabled
                                        ? "People outside Vaultly can access this"
                                        : "Only people you add can access this"}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleToggleLink}
                            aria-pressed={link.enabled}
                            className={`relative flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent/70 ${
                                link.enabled ? "bg-accent" : "bg-border"
                            }`}
                        >
                            <span
                                className={`absolute left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                                    link.enabled
                                        ? "translate-x-4"
                                        : "translate-x-0"
                                }`}
                            />
                        </button>
                    </div>

                    {link.enabled && (
                        <div className="mt-2 flex flex-col items-center gap-1">
                            <div className="flex min-w-8 items-center justify-center gap-2 rounded-lg border border-border bg-bg p-2">
                                <Link2
                                    size={14}
                                    className="shrink-0 text-text-secondary"
                                />
                                <span className="truncate font-mono text-xs text-text-secondary">
                                    vaultly.io/s/{link.token}
                                </span>
                            </div>
                            <div className="flex w-full gap-3 mt-0.5">
                                <AccessLevelSelect
                                    value={link.accessLevel}
                                    onChange={handleLinkAccessChange}
                                />
                                <Button
                                    variant="ghost"
                                    className="flex-1 px-3"
                                    onClick={handleCopyLink}
                                >
                                    {copied ? (
                                        <Check
                                            size={15}
                                            className="text-success"
                                        />
                                    ) : (
                                        <Copy size={15} />
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
