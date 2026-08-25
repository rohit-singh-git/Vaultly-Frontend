import { useAuth } from "../context/AuthContext.jsx";
import Button from "../components/Button.jsx";

export default function DrivePlaceholder() {
    const { user, logout } = useAuth();

    return (
        <div className="flex min-h-screen items-center justify-center bg-bg px-6">
            <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-8 text-center">
                <p className="font-display text-xl font-semibold text-text-primary">
                    Welcome, {user?.name?.split(" ")[0] || "there"} 👋
                </p>
                <p className="mt-2 text-sm text-text-secondary">
                    The file explorer arrives in Phase 1, Task 3.
                </p>
                <div className="mt-6">
                    <Button variant="ghost" onClick={logout}>
                        Log out
                    </Button>
                </div>
            </div>
        </div>
    );
}
