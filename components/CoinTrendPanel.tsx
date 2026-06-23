"use client";

import { useEffect, useMemo, useState } from "react";
import { AreaChartCard } from "@/components/ChartCard";
import { getCoinMarkets } from "@/lib/api/coins";
import type { CoinMarket } from "@/types";

export function CoinTrendPanel() {
  const [coins, setCoins] = useState<CoinMarket[]>([]);
  const [selected, setSelected] = useState("bitcoin");

  useEffect(() => {
    getCoinMarkets().then(setCoins).catch(() => setCoins([]));
  }, []);

  const coin = coins.find((item) => item.id === selected) ?? coins[0];
  const data = useMemo(() => {
    const prices = coin?.sparkline_in_7d?.price;
    const base = coin?.current_price ?? 0;

    if (prices?.length) {
      return prices.slice(-30).map((value, index) => ({ date: `${index + 1}`, value }));
    }

    return Array.from({ length: 14 }).map((_, index) => ({
      date: `${index + 1}`,
      value: base * (1 + Math.sin(index / 2) * 0.025)
    }));
  }, [coin]);

  return (
    <div className="space-y-4">
      <div className="glass-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-mint">Gelismis grafik</p>
          <h2 className="text-xl font-black text-white">Coin trend analizi</h2>
        </div>
        <select className="premium-input" value={selected} onChange={(event) => setSelected(event.target.value)}>
          {coins.map((item) => (
            <option key={item.id} value={item.id}>
              {item.symbol.toUpperCase()}
            </option>
          ))}
        </select>
      </div>
      <AreaChartCard title={`${coin?.symbol.toUpperCase() ?? "Coin"} Trend`} data={data} dataKey="value" />
    </div>
  );
}
