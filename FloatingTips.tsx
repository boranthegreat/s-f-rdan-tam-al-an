"use client";

import { HelpCircle, X } from "lucide-react";
import { useState } from "react";
import { ShortcutGuide } from "@/components/ShortcutGuide";

export function FloatingTips() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="fixed bottom-40 right-4 z-40 hidden rounded-full border border-line bg-slate-950/85 px-4 py-3 text-xs font-black text-slate-300 shadow-[0_0_35px_rgba(2,6,23,0.45)] backdrop-blur-xl transition hover:-translate-y-1 hover:border-mint/40 hover:text-white sm:right-6 lg:flex lg:items-center lg:gap-2"
        onClick={() => setOpen(true)}
      >
        <HelpCircle className="h-4 w-4 text-mint" />
        İpuçları
      </button>

      {open ? (
        <div className="fixed bottom-56 right-6 z-[65] w-[22rem] max-w-[calc(100vw-2rem)] rounded-xl border border-line bg-slate-950/95 p-4 shadow-[0_28px_90px_rgba(0,0,0,0.55)] backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-black text-white">Kullanım ipuçları</p>
            <button className="rounded-lg border border-line bg-white/5 p-2 text-slate-400 hover:text-white" onClick={() => setOpen(false)} aria-label="İpuçlarını kapat">
              <X className="h-4 w-4" />
            </button>
          </div>
          <ShortcutGuide compact />
        </div>
      ) : null}
    </>
  );
}
