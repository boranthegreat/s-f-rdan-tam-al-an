"use client";

import { useEffect, useState } from "react";
import { getCloudUser, sessionFromHash, writeStoredSession } from "@/lib/cloud/client";

export default function AuthCallbackPage() {
  const [message, setMessage] = useState("Google hesabı bağlanıyor...");

  useEffect(() => {
    async function finish() {
      const session = sessionFromHash(window.location.hash);
      if (!session) {
        setMessage("Giriş bilgisi alınamadı. Lütfen tekrar deneyin.");
        return;
      }
      try {
        session.user = await getCloudUser(session.access_token);
        writeStoredSession(session);
        const requestedNext = new URL(window.location.href).searchParams.get("next") || "/tr/settings";
        const next = requestedNext.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/tr/settings";
        window.location.replace(next);
      } catch {
        setMessage("Hesap doğrulanamadı. Lütfen tekrar giriş yapın.");
      }
    }
    void finish();
  }, []);

  return (
    <div className="mx-auto max-w-lg py-20">
      <div className="glass-card p-8 text-center">
        <p className="text-sm font-bold text-mint">Bulut hesabı</p>
        <h1 className="mt-3 text-2xl font-black text-white">{message}</h1>
      </div>
    </div>
  );
}
