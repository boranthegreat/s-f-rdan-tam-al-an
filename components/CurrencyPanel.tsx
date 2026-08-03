"use client";

import { useEffect, useMemo, useState } from "react";
import { AssetHistoryDialog } from "@/components/AssetHistoryDialog";
import { AreaChartCard } from "@/components/ChartCard";
import { ErrorState } from "@/components/ErrorState";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { MetricCard } from "@/components/MetricCard";
import { LivePrice } from "@/components/live-market/LivePrice";
import { currencyMarketKey, useLiveMarket } from "@/components/live-market/LiveMarketProvider";
import { converterCurrencies } from "@/data/currencies";
import { getCurrencyHistory } from "@/lib/api/currency";
import { formatCurrency, formatRate } from "@/lib/format";
import { getRangeDays, type HistoryRange } from "@/lib/history";
import { useFavorites } from "@/lib/useFavorites";
import type { CurrencyRate, CurrencyTimePoint } from "@/types";

export function CurrencyPanel({ compact = false }: { compact?: boolean }) {
  const { rates, convert, isLoading, error: marketError } = useLiveMarket();
  const [history, setHistory] = useState<CurrencyTimePoint[]>([]);
  const [amount, setAmount] = useState(100);
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("EUR");
  const [historyError, setHistoryError] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyRate | null>(null);
  const [historyRange, setHistoryRange] = useState<HistoryRange>("1W");
  const [detailHistory, setDetailHistory] = useState<CurrencyTimePoint[]>([]);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    getCurrencyHistory("USD", "EUR")
      .then((data) => {
        setHistory(data);
        setHistoryError("");
      })
      .catch((loadError) => setHistoryError(loadError instanceof Error ? loadError.message : "Döviz geçmişi yüklenemedi."));
  }, []);

  const visibleRates = useMemo(() => (compact ? rates.slice(0, 4) : rates), [compact, rates]);
  const detailTarget = selectedCurrency?.code === "USD" ? "TRY" : (selectedCurrency?.code ?? "EUR");
  const converted = useMemo(() => {
    if (!Number.isFinite(amount) || amount <= 0) return 0;
    return convert(amount, from, to);
  }, [amount, convert, from, to]);

  useEffect(() => {
    if (!selectedCurrency) return;

    async function loadDetailHistory() {
      try {
        setIsDetailLoading(true);
        setDetailHistory(await getCurrencyHistory("USD", detailTarget, getRangeDays(historyRange)));
        setDetailError("");
      } catch (loadError) {
        setDetailHistory([]);
        setDetailError(loadError instanceof Error ? loadError.message : "Döviz grafiği alınamadı.");
      } finally {
        setIsDetailLoading(false);
      }
    }

    loadDetailHistory();
  }, [detailTarget, historyRange, selectedCurrency]);

  if (isLoading && !rates.length) return <LoadingSkeleton count={compact ? 4 : 5} />;

  return (
    <div className="space-y-6">
      {marketError && !rates.length ? <ErrorState message={marketError} /> : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {visibleRates.map((currency) => (
          <MetricCard
            key={currency.code}
            label={currency.code}
            value={
              <LivePrice marketKey={currencyMarketKey(currency.code)} numericValue={currency.rate}>
                {currency.code === "USD" ? "Baz 1,00" : formatRate(currency.rate)}
              </LivePrice>
            }
            detail={currency.name}
            onClick={() => setSelectedCurrency(currency)}
            href={`/currency/${currency.code.toLowerCase()}`}
            isFavorite={isFavorite(`currency:${currency.code}`)}
            onFavorite={() =>
              toggleFavorite({
                id: `currency:${currency.code}`,
                type: "currency",
                symbol: currency.code,
                name: currency.name
              })
            }
          />
        ))}
      </div>

      {!compact ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div className="glass-card p-5">
            <h2 className="text-lg font-bold text-white">Döviz Çevirici</h2>
            <div className="mt-5 grid gap-3">
              <input
                className="premium-input"
                min={0}
                step="any"
                type="number"
                value={amount}
                onChange={(event) => setAmount(event.target.value === "" ? 0 : Number(event.target.value))}
              />
              <div className="grid grid-cols-2 gap-3">
                <select className="premium-input" value={from} onChange={(event) => setFrom(event.target.value)}>
                  {converterCurrencies.map((currency) => <option key={currency}>{currency}</option>)}
                </select>
                <select className="premium-input" value={to} onChange={(event) => setTo(event.target.value)}>
                  {converterCurrencies.map((currency) => <option key={currency}>{currency}</option>)}
                </select>
              </div>
              <div className="rounded-lg border border-line bg-white/5 p-4">
                <p className="text-sm text-slate-400">Sonuç</p>
                <p className="mt-2 text-2xl font-black text-white">
                  <LivePrice marketKey={from === "USD" ? currencyMarketKey(to) : currencyMarketKey(from)} numericValue={converted}>
                    {converted === null ? "Veri alınamadı" : formatCurrency(converted, to)}
                  </LivePrice>
                </p>
              </div>
            </div>
          </div>

          {historyError && !history.length ? <ErrorState message={historyError} /> : <AreaChartCard title="USD / EUR 14 Günlük Eğilim" data={history} dataKey="value" />}
        </div>
      ) : null}

      {selectedCurrency ? (
        <AssetHistoryDialog
          title={`USD / ${detailTarget}`}
          description={`${selectedCurrency.name} için ${historyRange} aralıklı döviz grafiği.`}
          range={historyRange}
          data={detailHistory}
          isLoading={isDetailLoading}
          error={detailError}
          onRangeChange={setHistoryRange}
          onClose={() => setSelectedCurrency(null)}
        />
      ) : null}
    </div>
  );
}
