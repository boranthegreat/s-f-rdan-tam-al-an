"use client";

import { useMemo } from "react";
import { LivePrice } from "@/components/live-market/LivePrice";
import { useLiveMarket } from "@/components/live-market/LiveMarketProvider";
import { formatPercent, formatRate } from "@/lib/format";

export function MarketSummary() {
  const { coins, rates } = useLiveMarket();
  const summary = useMemo(() => {
    const sorted = [...coins].sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);
    return { best: sorted[0], worst: sorted[sorted.length - 1], tryRate: rates.find((rate) => rate.code === "TRY") };
  }, [coins, rates]);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="glass-card p-5">
        <p className="text-xs uppercase tracking-[0.24em] text-mint">En güçlü coin</p>
        <p className="mt-3 text-2xl font-black text-white">{summary.best?.symbol.toUpperCase() ?? "N/A"}</p>
        <p className="mt-2 text-sm text-emerald-300">{summary.best ? formatPercent(summary.best.price_change_percentage_24h) : "N/A"}</p>
      </div>
      <div className="glass-card p-5">
        <p className="text-xs uppercase tracking-[0.24em] text-mint">En zayıf coin</p>
        <p className="mt-3 text-2xl font-black text-white">{summary.worst?.symbol.toUpperCase() ?? "N/A"}</p>
        <p className="mt-2 text-sm text-rose-300">{summary.worst ? formatPercent(summary.worst.price_change_percentage_24h) : "N/A"}</p>
      </div>
      <div className="glass-card p-5">
        <p className="text-xs uppercase tracking-[0.24em] text-mint">USD / TRY</p>
        <p className="mt-3 text-2xl font-black text-white"><LivePrice marketKey="USDTRY" numericValue={summary.tryRate?.rate}>{summary.tryRate ? formatRate(summary.tryRate.rate) : "N/A"}</LivePrice></p>
        <p className="mt-2 text-sm text-slate-400">Saniyelik piyasa akışı</p>
      </div>
    </div>
  );
}
