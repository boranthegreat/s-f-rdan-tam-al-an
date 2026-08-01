"use client";

import { useEffect, useState } from "react";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import type { EconomicEvent } from "@/types";

export function EconomicCalendar({ compact = false }: { compact?: boolean }) {
  const [items, setItems] = useState<EconomicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);

  useEffect(() => {
    fetch("/api/economic-calendar")
      .then((response) => response.json() as Promise<{ items: EconomicEvent[]; live: boolean }>)
      .then((data) => {
        setItems(data.items);
        setLive(data.live);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton count={compact ? 2 : 6} />;
  const visible = compact ? items.slice(0, 2) : items;

  return (
    <div className="space-y-4">
      {!live && !compact ? <div className="rounded-xl border border-amber-300/20 bg-amber-300/5 p-4 text-sm text-amber-100">Canlı ekonomi takvimi için Vercel’e <strong>FINNHUB_API_KEY</strong> eklenmeli. Şu an güvenli örnek görünüm gösteriliyor.</div> : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((event) => (
          <div key={event.id} className="glass-card p-5">
            <div className="flex items-start justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.2em] text-mint">{event.country}</p><p className="mt-1 text-xs text-slate-500">{event.date} {event.time ?? ""}</p></div><Impact value={event.impact} /></div>
            <h2 className="mt-4 text-lg font-black text-white">{event.title}</h2>
            <div className="mt-4 grid grid-cols-3 gap-2 text-xs"><Value label="Gerçekleşen" value={event.actual} /><Value label="Beklenti" value={event.estimate} /><Value label="Önceki" value={event.previous} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Impact({ value }: { value: EconomicEvent["impact"] }) {
  const label = value === "high" ? "Yüksek" : value === "low" ? "Düşük" : "Orta";
  return <span className={value === "high" ? "rounded-full bg-rose-400/10 px-3 py-1 text-xs font-bold text-rose-300" : value === "low" ? "rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300" : "rounded-full bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-200"}>{label}</span>;
}
function Value({ label, value }: { label: string; value?: string | number | null }) { return <div className="rounded-lg bg-white/5 p-2"><p className="text-slate-500">{label}</p><p className="mt-1 truncate font-bold text-white">{value ?? "—"}</p></div>; }
