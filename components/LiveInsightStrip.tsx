"use client";

import { Activity, Clock3, RadioTower, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

const items = [
  { label: "Canlı piyasa takibi", value: "Aktif", icon: RadioTower },
  { label: "BorAI", value: "Hazır", icon: Sparkles },
  { label: "Favoriler", value: "LocalStorage", icon: ShieldCheck },
  { label: "Piyasa radarı", value: "Döviz + Coin + Altın", icon: Activity }
];

export function LiveInsightStrip() {
  const [time, setTime] = useState("");

  useEffect(() => {
    function tick() {
      setTime(new Intl.DateTimeFormat("tr-TR", { hour: "2-digit", minute: "2-digit" }).format(new Date()));
    }

    tick();
    const timer = window.setInterval(tick, 60000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="glass-card overflow-hidden p-0">
      <div className="ticker-track flex min-w-max gap-3 px-4 py-3">
        {[...items, ...items].map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={`${item.label}-${index}`} className="flex items-center gap-3 rounded-lg border border-line bg-white/5 px-4 py-2">
              <span className="grid h-8 w-8 place-items-center rounded-md bg-mint/10 text-mint">
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.22em] text-slate-500">{item.label}</p>
                <p className="text-sm font-bold text-white">{item.value}</p>
              </div>
            </div>
          );
        })}
        <div className="flex items-center gap-3 rounded-lg border border-mint/20 bg-mint/10 px-4 py-2">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-white/10 text-mint">
            <Clock3 className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.22em] text-slate-500">Yerel saat</p>
            <p className="text-sm font-bold text-white">{time || "--:--:--"}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
