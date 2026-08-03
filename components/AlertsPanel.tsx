"use client";

import { useMemo, useState } from "react";
import { PushNotificationControl } from "@/components/PushNotificationControl";
import { LivePrice } from "@/components/live-market/LivePrice";
import { coinMarketKey, currencyMarketKey, useLiveMarket } from "@/components/live-market/LiveMarketProvider";
import { formatCurrency } from "@/lib/format";
import { useAlerts } from "@/lib/useAlerts";
import type { PriceAlert } from "@/types";

const alertSymbols: Record<PriceAlert["targetType"], string[]> = {
  coin: ["BTC", "ETH", "SOL", "BNB", "XRP", "TRX"],
  currency: ["USD", "EUR", "GBP", "TRY"],
  gold: ["GOLD"]
};

export function AlertsPanel({ compact = false }: { compact?: boolean }) {
  const { alerts, addAlert, removeAlert } = useAlerts();
  const { coins, gold, convert } = useLiveMarket();
  const [targetType, setTargetType] = useState<PriceAlert["targetType"]>("coin");
  const [symbol, setSymbol] = useState("BTC");
  const [direction, setDirection] = useState<PriceAlert["direction"]>("above");
  const [target, setTarget] = useState(100);

  const priceMap = useMemo<Record<string, number>>(() => {
    const coinPrices = Object.fromEntries(coins.map((coin) => [coin.symbol.toUpperCase(), coin.current_price]));
    return {
      ...coinPrices,
      USD: 1,
      EUR: convert(1, "EUR", "USD") ?? 0,
      GBP: convert(1, "GBP", "USD") ?? 0,
      TRY: convert(1, "TRY", "USD") ?? 0,
      GOLD: gold?.gramUsd ?? 0
    };
  }, [coins, convert, gold]);

  const evaluated = alerts.map((alert) => {
    const current = priceMap[alert.symbol] ?? 0;
    const triggered = current > 0 && (alert.direction === "above" ? current >= alert.target : current <= alert.target);
    const marketKey = alert.targetType === "coin" ? coinMarketKey(alert.symbol) : alert.targetType === "gold" ? "GOLD_GRAM_USD" : currencyMarketKey(alert.symbol);
    return { ...alert, current, triggered, marketKey };
  });
  const selectableSymbols = alertSymbols[targetType];

  if (compact) {
    const active = evaluated.filter((item) => item.triggered).length;
    return (
      <div className="glass-card p-5">
        <p className="text-xs uppercase tracking-[0.24em] text-mint">Alarmlar</p>
        <p className="mt-3 text-3xl font-black text-white">{active}/{alerts.length}</p>
        <p className="mt-2 text-sm text-slate-400">tetiklenen alarm</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PushNotificationControl />
      <div className="glass-card grid gap-3 p-5 md:grid-cols-[1fr_1fr_1fr_1fr_auto]">
        <select
          className="premium-input"
          value={targetType}
          onChange={(event) => {
            const nextType = event.target.value as PriceAlert["targetType"];
            setTargetType(nextType);
            setSymbol(alertSymbols[nextType][0]);
          }}
        >
          <option value="coin">Coin</option>
          <option value="currency">Döviz</option>
          <option value="gold">Altın</option>
        </select>
        <select className="premium-input" value={symbol} onChange={(event) => setSymbol(event.target.value)}>
          {selectableSymbols.map((item) => <option key={item}>{item}</option>)}
        </select>
        <select className="premium-input" value={direction} onChange={(event) => setDirection(event.target.value as PriceAlert["direction"])}>
          <option value="above">Üstüne çıkarsa</option>
          <option value="below">Altına inerse</option>
        </select>
        <input className="premium-input" type="number" min={0} step="any" value={target} onChange={(event) => setTarget(Number(event.target.value))} />
        <button className="premium-button" onClick={() => addAlert({ targetType, symbol, direction, target })}>Alarm ekle</button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {evaluated.map((alert) => (
          <div key={alert.id} className="glass-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-xl font-black text-white">{alert.symbol}</p>
              <span className={alert.triggered ? "text-sm font-bold text-emerald-300" : "text-sm text-slate-400"}>{alert.triggered ? "Tetiklendi" : "Beklemede"}</span>
            </div>
            <p className="mt-3 text-sm text-slate-400">Hedef: {alert.direction === "above" ? ">" : "<"} {formatCurrency(alert.target)}</p>
            <p className="mt-1 text-sm text-slate-400">Güncel: <LivePrice marketKey={alert.marketKey} numericValue={alert.current}>{alert.current ? formatCurrency(alert.current) : "N/A"}</LivePrice></p>
            <button className="mt-4 text-sm font-semibold text-rose-300" onClick={() => removeAlert(alert.id)}>Sil</button>
          </div>
        ))}
        {evaluated.length === 0 ? <div className="glass-card p-6 text-sm text-slate-400">Henüz alarm eklenmedi.</div> : null}
      </div>
    </div>
  );
}
