"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

interface InstallPrompt extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function subscribeOnline(change: () => void) {
  window.addEventListener("online", change);
  window.addEventListener("offline", change);
  return () => {
    window.removeEventListener("online", change);
    window.removeEventListener("offline", change);
  };
}
function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
}
function subscribeStandalone(change: () => void) {
  const media = window.matchMedia("(display-mode: standalone)");
  media.addEventListener("change", change);
  window.addEventListener("appinstalled", change);
  return () => {
    media.removeEventListener("change", change);
    window.removeEventListener("appinstalled", change);
  };
}

export function usePwa() {
  const online = useSyncExternalStore(subscribeOnline, () => navigator.onLine, () => true);
  const standalone = useSyncExternalStore(subscribeStandalone, isStandalone, () => false);
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null);
  const [ready, setReady] = useState(false);
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);
  const reloadForUpdate = useRef(false);

  useEffect(() => {
    const install = (event: Event) => {
      event.preventDefault();
      setPrompt(event as InstallPrompt);
    };
    const installed = () => setPrompt(null);
    window.addEventListener("beforeinstallprompt", install);
    window.addEventListener("appinstalled", installed);
    let disposed = false;
    let registration: ServiceWorkerRegistration | undefined;
    const inspect = () => {
      if (!disposed && registration?.waiting) setWaiting(registration.waiting);
    };
    const found = () => {
      const worker = registration?.installing;
      worker?.addEventListener("statechange", () => {
        inspect();
        if (!disposed && worker.state === "redundant" && !registration?.active)
          setError("Chưa lưu được giao diện để mở offline. Hãy kết nối mạng rồi tải lại app.");
      });
    };
    const check = () => {
      if (document.visibilityState === "visible" && navigator.onLine)
        void registration?.update().catch(() => {});
    };
    const controller = () => {
      // Only the window that explicitly accepted the update may reload.
      if (reloadForUpdate.current) window.location.reload();
      else setWaiting(null);
    };
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("controllerchange", controller);
      void (async () => {
        try {
          const root = `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/`;
          registration = await navigator.serviceWorker.register(`${root}sw.js`, {
            scope: root,
            updateViaCache: "none",
          });
          if (disposed) return;
          inspect();
          found();
          registration.addEventListener("updatefound", found);
          await navigator.serviceWorker.ready;
          if (!disposed) setReady(true);
        } catch {
          if (!disposed) setError("Chưa lưu được giao diện để mở offline. Hãy kết nối mạng rồi tải lại app.");
        }
      })();
      document.addEventListener("visibilitychange", check);
      window.addEventListener("online", check);
    }
    return () => {
      disposed = true;
      window.removeEventListener("beforeinstallprompt", install);
      window.removeEventListener("appinstalled", installed);
      document.removeEventListener("visibilitychange", check);
      window.removeEventListener("online", check);
      registration?.removeEventListener("updatefound", found);
      navigator.serviceWorker?.removeEventListener("controllerchange", controller);
    };
  }, []);

  async function install() {
    if (!prompt) return;
    setError("");
    try {
      await prompt.prompt();
      await prompt.userChoice;
      setPrompt(null);
    } catch {
      setError("Chưa cài được app. Hãy dùng mục Cài ứng dụng trong menu trình duyệt.");
    }
  }
  function update() {
    if (!waiting) return;
    reloadForUpdate.current = true;
    setUpdating(true);
    waiting.postMessage({ type: "ACTIVATE_UPDATE" });
  }
  return { online, standalone, canInstall: !!prompt, ready, waiting: !!waiting, error, updating, install, update };
}
