import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { UploadProvider } from "./context/UploadContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import UploadTray from "./components/UploadTray.jsx";
import DesignPreview from "./pages/DesignPreview.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import VerifyOtp from "./pages/VerifyOtp.jsx";
import Drive from "./pages/Drive.jsx";
import Recent from "./pages/Recent.jsx";
import Trash from "./pages/Trash.jsx";
import SharedWithMe from "./pages/SharedWithMe.jsx";
import Settings from "./pages/Settings.jsx";

function App() {
    return (
        <ToastProvider>
            <AuthProvider>
                {/* UploadProvider sits above Routes so the queue survives folder navigation */}
                <UploadProvider>
                    <Routes>
                        <Route
                            path="/"
                            element={<Navigate to="/login" replace />}
                        />
                        <Route path="/preview" element={<DesignPreview />} />

                        {/* Auth */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route
                            path="/forgot-password"
                            element={<ForgotPassword />}
                        />
                        <Route path="/verify-otp" element={<VerifyOtp />} />

                        {/* Protected — file explorer */}
                        <Route
                            path="/drive"
                            element={
                                <ProtectedRoute>
                                    <Drive />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/drive/folder/:folderId"
                            element={
                                <ProtectedRoute>
                                    <Drive />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/drive/recent"
                            element={
                                <ProtectedRoute>
                                    <Recent />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/drive/trash"
                            element={
                                <ProtectedRoute>
                                    <Trash />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/drive/shared"
                            element={
                                <ProtectedRoute>
                                    <SharedWithMe />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/drive/settings"
                            element={
                                <ProtectedRoute>
                                    <Settings />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                    <UploadTray />
                </UploadProvider>
            </AuthProvider>
        </ToastProvider>
    );
}

export default App;
