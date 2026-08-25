import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";

const params = new URLSearchParams(window.location.search);
const redirect = params.get("redirect");

if (redirect) {
    const decodedRedirect = decodeURIComponent(redirect);

    window.history.replaceState(
        null,
        "",
        "/Vaultly-Frontend" + decodedRedirect,
    );
}

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <BrowserRouter basename="/Vaultly-Frontend">
            <App />
        </BrowserRouter>
    </StrictMode>,
);
