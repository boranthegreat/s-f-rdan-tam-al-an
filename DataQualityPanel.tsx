"use client";

import { useEffect, useState } from "react";

type SourceStatus = {
  name: string;
  status: "Canlı" | "Yedek" | "Kontrol";
  detail: string;
};

export function DataQualityPanel() {
  const [sources, setSources] = useState<SourceStatus[]>([
    { name: "Döviz", status: "Kontrol", detail: "Frankfurter API" },
    { name: "Coin", status: "Kontrol", detail: "CoinGecko / CoinLore" },
    { name: "Altın", status: "Kontrol", detail: "Yahoo Finance + Frankfurter" },
    { name: "Hava", status: "Kontrol", detail: "Open-Meteo" }
  ]);

  useEffect(() => {
    async function load() {
      const [currency, coins, gold, weather] = await Promise.allSettled([
        fetch("/api/currency/rates?base=USD"),
        fetch("/api/coins"),
        fetch("/api/gold"),
        fetch("/api/weather/forecast?id=745044&name=Istanbul&country=Turkey&latitude=41.0138&longitude=28.9497")
      ]);

      setSources([
        statusFromResponse("Döviz", "Frankfurter API", currency),
        statusFromResponse("Coin", "CoinGecko / CoinLore", coins),
        statusFromResponse("Altın", "Yahoo Finance + Frankfurter", gold),
        statusFromResponse("Hava", "Open-Meteo", weather)
      ]);
    }

    load().catch(() => undefined);
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {sources.map((source) => (
        <div key={source.name} className="glass-card p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-mint">{source.name}</p>
          <p className={source.status === "Canlı" ? "mt-3 text-xl font-black text-emerald-300" : "mt-3 text-xl font-black text-amber-200"}>
            {source.status}
          </p>
          <p className="mt-2 text-sm text-slate-400">{source.detail}</p>
        </div>
      ))}
    </div>
  );
}

function statusFromResponse(
  name: string,
  detail: string,
  result: PromiseSettledResult<Response>
): SourceStatus {
  if (result.status === "fulfilled" && result.value.ok) {
    return { name, detail, status: "Canlı" };
  }

  return { name, detail, status: "Yedek" };
}
