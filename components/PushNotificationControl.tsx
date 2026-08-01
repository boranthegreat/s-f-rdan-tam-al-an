"use client";

import { Bell, BellOff, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useCloudSync } from "@/components/CloudSyncProvider";

function decodeKey(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  return Uint8Array.from(raw, (character) => character.charCodeAt(0));
}

export function PushNotificationControl() {
  const { configured, session, user, signIn } = useCloudSync();
  const [supported, setSupported] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const available = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
    setSupported(available);
    if (!available) {
      setLoading(false);
      return;
    }
    navigator.serviceWorker.ready.then((registration) => registration.pushManager.getSubscription()).then((subscription) => setEnabled(Boolean(subscription))).finally(() => setLoading(false));
  }, []);

  const enable = async () => {
    if (!configured || !user || !session) {
      signIn();
      return;
    }
    let createdSubscription: PushSubscription | null = null;
    try {
      setLoading(true);
      const permission = await Notification.requestPermission();
      if (permission !== "granted") throw new Error("Bildirim izni verilmedi.");
      const keyResponse = await fetch("/api/push/public-key");
      if (!keyResponse.ok) throw new Error("VAPID anahtarları henüz Vercel’e eklenmemiş.");
      const { key } = await keyResponse.json() as { key: string };
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: decodeKey(key) });
      createdSubscription = subscription;
      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ subscription: subscription.toJSON() })
      });
      if (!response.ok) throw new Error((await response.json() as { message?: string }).message ?? "Bildirim kaydedilemedi.");
      const { token } = await response.json() as { token: string };
      registration.active?.postMessage({ type: "SET_PUSH_TOKEN", token });
      setEnabled(true);
      setMessage("Arka plan fiyat bildirimleri açıldı.");
    } catch (error) {
      if (createdSubscription) await createdSubscription.unsubscribe().catch(() => false);
      setEnabled(false);
      setMessage(error instanceof Error ? error.message : "Bildirim açılamadı.");
    } finally {
      setLoading(false);
    }
  };

  const disable = async () => {
    try {
      setLoading(true);
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        if (session) {
          await fetch("/api/push/subscribe", { method: "DELETE", headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ endpoint: subscription.endpoint }) }).catch(() => undefined);
        }
        await subscription.unsubscribe();
      }
      registration.active?.postMessage({ type: "CLEAR_PUSH_TOKEN" });
      setEnabled(false);
      setMessage("Arka plan bildirimleri kapatıldı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="text-xs uppercase tracking-[0.22em] text-mint">Gerçek bildirim</p><h2 className="mt-2 text-xl font-black text-white">Site kapalıyken fiyat alarmı</h2><p className="mt-2 text-sm text-slate-400">Google hesabın ve push altyapısı bağlandığında hedef gerçekleşince cihazına bildirim gelir.</p></div>
        <button disabled={loading || !supported} onClick={() => void (enabled ? disable() : enable())} className={enabled ? "flex items-center justify-center gap-2 rounded-xl border border-rose-300/25 bg-rose-300/5 px-5 py-3 text-sm font-bold text-rose-200" : "premium-button"}>
          {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : enabled ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />} {enabled ? "Bildirimleri kapat" : user ? "Bildirimleri aç" : "Google ile giriş yap"}
        </button>
      </div>
      {!supported ? <p className="mt-3 text-sm text-rose-300">Bu tarayıcı Web Push özelliğini desteklemiyor.</p> : null}
      {message ? <p className="mt-3 text-sm text-slate-300">{message}</p> : null}
    </div>
  );
}
