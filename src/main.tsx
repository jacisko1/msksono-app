import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { registerSW } from "virtual:pwa-register";
import App from "./App";
import "./styles/global.css";

if (import.meta.env.PROD) {
  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      updateSW(true);
    },
    onRegisteredSW(_swUrl, registration) {
      if (registration) {
        setInterval(() => {
          registration.update();
        }, 60 * 1000);
      }
    }
  });

  // iOS Safari can keep a stale tab/chunk after deploys; force one safe reload.
  const reloadFlagKey = "msk-us-chunk-reload";
  const safeReload = () => {
    if (!sessionStorage.getItem(reloadFlagKey)) {
      sessionStorage.setItem(reloadFlagKey, "1");
      window.location.reload();
    }
  };

  window.addEventListener("error", (event) => {
    const message = String((event as ErrorEvent).message ?? "");
    if (message.includes("Failed to fetch dynamically imported module") || message.includes("Loading chunk")) {
      safeReload();
    }
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason = String((event as PromiseRejectionEvent).reason ?? "");
    if (reason.includes("Failed to fetch dynamically imported module") || reason.includes("Loading chunk")) {
      safeReload();
    }
  });
} else if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      registration.unregister();
    });
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
