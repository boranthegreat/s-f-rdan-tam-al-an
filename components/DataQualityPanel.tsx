"use client";

import { useEffect, useMemo, useState } from "react";
import { useLiveMarket } from "@/components/live-market/LiveMarketProvider";

type SourceStatus = {
  name: string;
  status: "Canlı" | "Yedek" | "Kontrol";
  detail: string;
};

export function DataQualityPanel() {
  const { hasLivePrice } = useLiveMarket();
  const [weatherStatus, setWeatherStatus] = useState<SourceStatus["status"]>("Kontrol");

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/weather/forecast?id=745044&name=Istanbul&country=Turkey&latitude=41.0138&longitude=28.9497", {
      signal: controller.signal
    })
      .then((response) => setWeatherStatus(response.ok ? "Canlı" : "Yedek"))
      .catch(() => setWeatherStatus("Yedek"));
    return () => controller.abort();
  }, []);

  const sources = useMemo<SourceStatus[]>(
    () => [
      {
        name: "Döviz",
        status: hasLivePrice("USDTRY") ? "Canlı" : "Yedek",
        detail: hasLivePrice("USDTRY") ? "Binance TRY piyasa akışı · Frankfurter yedek" : "Frankfurter yedek veri"
      },
      {
        name: "Coin",
        status: hasLivePrice("BTC") ? "Canlı" : "Yedek",
        detail: hasLivePrice("BTC") ? "Binance WebSocket · CoinGecko yedek" : "CoinGecko / CoinLore yedek"
      },
      {
        name: "Altın",
        status: hasLivePrice("GOLD_GRAM_TRY") ? "Canlı" : "Yedek",
        detail: hasLivePrice("GOLD_GRAM_TRY") ? "PAXG + TRY çapraz akışıyla canlı yaklaşık değer" : "Yahoo Finance + kur yedeği"
      },
      { name: "Hava", status: weatherStatus, detail: "Open-Meteo" }
    ],
    [hasLivePrice, weatherStatus]
  );

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
