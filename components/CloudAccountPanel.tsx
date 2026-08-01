"use client";

import { Cloud, CloudOff, LogIn, LogOut, RefreshCw } from "lucide-react";
import { useCloudSync } from "@/components/CloudSyncProvider";

export function CloudAccountPanel() {
  const { configured, user, status, error, signIn, signOut, syncNow } = useCloudSync();
  return (
    <div className="glass-card p-5">
      <p className="text-xs uppercase tracking-[0.24em] text-mint">Bulut hesabı</p>
      <h2 className="mt-2 text-2xl font-black text-white">Cihazlar arası senkronizasyon</h2>
      <p className="mt-2 text-sm leading-6 text-slate-400">Portföy, favoriler, alarmlar, notlar, tema ve dil tercihi hesabına kaydedilir.</p>
      {!configured ? (
        <div className="mt-5 rounded-xl border border-amber-300/20 bg-amber-300/5 p-4 text-sm leading-6 text-amber-100">
          <CloudOff className="mb-2 h-5 w-5" /> Supabase anahtarları Vercel’e eklenince Google giriş sistemi otomatik aktif olur. Kurulum adımları ZIP içindeki <strong>KURULUM.md</strong> dosyasında hazır.
        </div>
      ) : user ? (
        <div className="mt-5 space-y-3">
          <div className="flex items-center gap-3 rounded-xl border border-line bg-white/5 p-4"><Cloud className="h-5 w-5 text-mint" /><div><p className="font-bold text-white">{user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email}</p><p className="text-xs text-slate-400">{status === "synced" ? "Her şey bulutla eşitlendi" : status === "saving" ? "Değişiklikler kaydediliyor" : "Bağlantı kontrol ediliyor"}</p></div></div>
          <div className="flex flex-wrap gap-2"><button className="premium-button" onClick={() => void syncNow()}><RefreshCw className="h-4 w-4" /> Şimdi eşitle</button><button className="rounded-xl border border-rose-300/20 bg-rose-300/5 px-4 py-2 text-sm font-bold text-rose-200" onClick={() => void signOut()}><LogOut className="mr-2 inline h-4 w-4" />Çıkış yap</button></div>
        </div>
      ) : (
        <button className="premium-button mt-5" onClick={signIn}><LogIn className="h-4 w-4" /> Google ile giriş yap</button>
      )}
      {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
    </div>
  );
}
