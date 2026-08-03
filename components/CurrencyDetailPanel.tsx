"use client";

import { Bell, Heart, WalletCards } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AreaChartCard } from "@/components/ChartCard";
import { ErrorState } from "@/components/ErrorState";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { LivePrice } from "@/components/live-market/LivePrice";
import { currencyMarketKey, useLiveMarket } from "@/components/live-market/LiveMarketProvider";
import { getCurrencyHistory } from "@/lib/api/currency";
import { formatCurrencyPrecise, formatRate } from "@/lib/format";
import { useAlerts } from "@/lib/useAlerts";
import { useFavorites } from "@/lib/useFavorites";
import { usePortfolio } from "@/lib/usePortfolio";
import type { CurrencyTimePoint } from "@/types";

const ranges = [{ label: "7G", days: 7 }, { label: "1A", days: 30 }, { label: "3A", days: 90 }, { label: "1Y", days: 365 }] as const;

export function CurrencyDetailPanel({ code, name }: { code: string; name: string }) {
  const { convert } = useLiveMarket();
  const [targetCurrency, setTargetCurrency] = useState(code === "TRY" ? "USD" : "TRY");
  const [days, setDays] = useState(30);
  const [history, setHistory] = useState<CurrencyTimePoint[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [target, setTarget] = useState(0);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { upsertAsset } = usePortfolio();
  const { addAlert } = useAlerts();

  const rates = useMemo(() => {
    return Object.fromEntries(
      ["USD", "TRY", "EUR"].map((currency) => [currency, currency === code ? 1 : (convert(1, code, currency) ?? 0)])
    ) as Record<string, number>;
  }, [code, convert]);

  useEffect(() => {
    setLoading(true);
    getCurrencyHistory(code, targetCurrency, days)
      .then((historyData) => {
        setHistory(historyData);
        setError("");
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Döviz detayı yüklenemedi."))
      .finally(() => setLoading(false));
  }, [code, days, targetCurrency]);

  const usdRate = rates.USD ?? 1;

  useEffect(() => {
    setTarget((current) => current > 0 ? current : usdRate);
  }, [usdRate]);

  const favoriteId = `currency:${code}`;
  const chartData = useMemo(() => history.map((point) => ({ ...point, value: Number(point.value.toFixed(6)) })), [history]);

  if (loading && !history.length) return <LoadingSkeleton count={5} />;
  if (error && !history.length) return <ErrorState message={error} />;

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-mint">{code}</p>
        <h1 className="mt-2 text-3xl font-black text-white">{name}</h1>
        <p className="mt-2 text-sm text-slate-400">{`1 ${code} değerinin farklı para birimlerindeki güncel karşılığı.`}</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {(["USD", "TRY", "EUR"] as const).map((currency) => (
            <div key={currency} className="rounded-2xl border border-line bg-white/[0.04] p-4">
              <p className="text-xs text-slate-500">1 {code} / {currency}</p>
              <p className="mt-2 text-xl font-black text-white">
                <LivePrice marketKey={currencyMarketKey(code === "USD" ? currency : code)} numericValue={rates[currency]}>
                  {rates[currency] ? formatCurrencyPrecise(rates[currency], currency) : "N/A"}
                </LivePrice>
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card flex flex-col gap-3 p-5 md:flex-row md:items-center">
        <button className="flex items-center justify-center gap-2 rounded-xl border border-line bg-white/5 px-4 py-3 text-sm font-bold text-white" onClick={() => toggleFavorite({ id: favoriteId, type: "currency", symbol: code, name })}><Heart className={isFavorite(favoriteId) ? "h-4 w-4 fill-rose-400 text-rose-400" : "h-4 w-4"} /> {isFavorite(favoriteId) ? "Favorilerden kaldır" : "Favoriye ekle"}</button>
        <button className="flex items-center justify-center gap-2 rounded-xl border border-line bg-white/5 px-4 py-3 text-sm font-bold text-white" onClick={() => upsertAsset({ type: "currency", symbol: code, amount: 1 })}><WalletCards className="h-4 w-4 text-mint" /> Portföye ekle</button>
        <input className="premium-input md:ml-auto md:max-w-48" aria-label="Hedef fiyat" type="number" min={0} step="any" value={target} onChange={(event) => setTarget(Number(event.target.value))} />
        <button className="premium-button" onClick={() => addAlert({ targetType: "currency", symbol: code, direction: "above", target })}><Bell className="h-4 w-4" /> USD alarmı kur</button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">{["USD", "TRY", "EUR"].filter((item) => item !== code).map((item) => <button key={item} onClick={() => setTargetCurrency(item)} className={targetCurrency === item ? "premium-button" : "rounded-xl border border-line bg-white/5 px-4 py-2 text-sm font-bold text-slate-300"}>{code}/{item}</button>)}</div>
        <div className="flex rounded-xl border border-line bg-white/5 p-1">{ranges.map((range) => <button key={range.label} onClick={() => setDays(range.days)} className={days === range.days ? "rounded-lg bg-white/15 px-3 py-1.5 text-xs font-bold text-white" : "px-3 py-1.5 text-xs font-bold text-slate-400"}>{range.label}</button>)}</div>
      </div>
      <AreaChartCard title={`${code} / ${targetCurrency} — ${history.at(-1) ? formatRate(history.at(-1)!.value) : ""}`} data={chartData} dataKey="value" />
    </div>
  );
}
