"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    let registration: ServiceWorkerRegistration | null = null;
    const sendLocale = () => {
      const first = window.location.pathname.split("/").filter(Boolean)[0];
      const locale = first === "en" || first === "el" ? first : "tr";
      registration?.active?.postMessage({ type: "SET_LOCALE", locale });
    };
    navigator.serviceWorker.register("/sw.js", { scope: "/" })
      .then(() => navigator.serviceWorker.ready)
      .then((value) => {
        registration = value;
        sendLocale();
      })
      .catch(() => undefined);
    window.addEventListener("boranthegreat:language-updated", sendLocale);
    return () => window.removeEventListener("boranthegreat:language-updated", sendLocale);
  }, []);
  return null;
}
