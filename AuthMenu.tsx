"use client";

import { Cloud, CloudOff, LogIn, LogOut, RefreshCw, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useCloudSync } from "@/components/CloudSyncProvider";

export function AuthMenu() {
  const { configured, user, status, signIn, signOut, syncNow } = useCloudSync();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const close = (event: PointerEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest("[data-auth-menu]")) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  const label = user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? user?.email ?? "Bulut hesabı";

  return (
    <div className="relative" data-auth-menu>
      <button
        type="button"
        className="flex min-h-10 items-center gap-2 rounded-xl border border-line bg-white/5 px-3 text-xs font-bold text-slate-200 transition hover:border-mint/35 hover:bg-white/10"
        onClick={() => (user ? setOpen((value) => !value) : signIn())}
        title={configured ? "Bulut hesabı ve senkronizasyon" : "Supabase kurulumu tamamlanınca aktif olur"}
      >
        {user ? <Cloud className="h-4 w-4 text-mint" /> : configured ? <LogIn className="h-4 w-4" /> : <CloudOff className="h-4 w-4" />}
        <span className="max-w-28 truncate">{user ? label : configured ? "Google ile giriş" : "Bulut kurulumu"}</span>
        {user ? <span className={status === "synced" ? "h-2 w-2 rounded-full bg-emerald-300" : "h-2 w-2 rounded-full bg-amber-300"} /> : null}
      </button>

      {open && user ? (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-64 rounded-2xl border border-line bg-slate-950/95 p-3 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
            <UserRound className="h-5 w-5 text-mint" />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">{label}</p>
              <p className="text-xs text-slate-400">{status === "synced" ? "Bulutla eşitlendi" : status === "saving" ? "Kaydediliyor..." : "Senkronizasyon kontrol ediliyor"}</p>
            </div>
          </div>
          <button className="mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-300 hover:bg-white/5" onClick={() => void syncNow()}>
            <RefreshCw className="h-4 w-4" /> Şimdi eşitle
          </button>
          <button className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-rose-300 hover:bg-white/5" onClick={() => void signOut()}>
            <LogOut className="h-4 w-4" /> Çıkış yap
          </button>
        </div>
      ) : null}
    </div>
  );
}
