"use client";

import { useEffect, useMemo, useState } from "react";
import { AssetHistoryDialog } from "@/components/AssetHistoryDialog";
import { AreaChartCard } from "@/components/ChartCard";
import { ErrorState } from "@/components/ErrorState";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { MetricCard } from "@/components/MetricCard";
import { converterCurrencies, trackedCurrencies } from "@/data/currencies";
import { convertCurrency, getCurrencyHistory, getCurrencyRates } from "@/lib/api/currency";
import { formatCurrency, formatRate } from "@/lib/format";
import { getRangeDays, type HistoryRange } from "@/lib/history";
import { useFavorites } from "@/lib/useFavorites";
import type { CurrencyRate, CurrencyTimePoint } from "@/types";

export function CurrencyPanel({ compact = false }: { compact?: boolean }) {
  const [rates, setRates] = useState<CurrencyRate[]>([]);
  const [history, setHistory] = useState<CurrencyTimePoint[]>([]);
  const [amount, setAmount] = useState(100);
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("EUR");
  const [converted, setConverted] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState("");
  const [conversionError, setConversionError] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyRate | null>(null);
  const [historyRange, setHistoryRange] = useState<HistoryRange>("1W");
  const [detailHistory, setDetailHistory] = useState<CurrencyTimePoint[]>([]);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const [ratesData, historyData] = await Promise.all([
          getCurrencyRates("USD"),
          getCurrencyHistory("USD", "EUR")
        ]);
        setRates([{ code: "USD", name: "US Dollar", rate: 1 }, ...ratesData]);
        setHistory(historyData);
        setError("");
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Döviz verileri yüklenemedi.");
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, []);

  useEffect(() => {
    async function runConversion() {
      if (!Number.isFinite(amount) || amount <= 0) {
        setConverted(0);
        setConversionError("");
        return;
      }

      try {
        setIsConverting(true);
        setConverted(await convertCurrency(amount, from, to));
        setConversionError("");
      } catch (conversionFailure) {
        setConverted(null);
        setConversionError(
          conversionFailure instanceof Error
            ? conversionFailure.message
            : "Döviz çevirisi yapılamadı. Lütfen tekrar deneyin."
        );
      } finally {
        setIsConverting(false);
      }
    }

    runConversion();
  }, [amount, from, to]);

  const visibleRates = useMemo(() => (compact ? rates.slice(0, 4) : rates), [compact, rates]);
  const detailTarget = selectedCurrency?.code === "USD" ? "TRY" : (selectedCurrency?.code ?? "EUR");

  useEffect(() => {
    if (!selectedCurrency) {
      return;
    }

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

  if (isLoading) {
    return <LoadingSkeleton count={compact ? 4 : 5} />;
  }

  return (
    <div className="space-y-6">
      {error ? <ErrorState message={error} /> : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {visibleRates.map((currency) => (
          <MetricCard
            key={currency.code}
            label={currency.code}
            value={currency.code === "USD" ? "Baz 1,00" : formatRate(currency.rate)}
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
                  {converterCurrencies.map((currency) => (
                    <option key={currency}>{currency}</option>
                  ))}
                </select>
                <select className="premium-input" value={to} onChange={(event) => setTo(event.target.value)}>
                  {converterCurrencies.map((currency) => (
                    <option key={currency}>{currency}</option>
                  ))}
                </select>
              </div>
              <div className="rounded-lg border border-line bg-white/5 p-4">
                <p className="text-sm text-slate-400">Sonuç</p>
                <p className="mt-2 text-2xl font-black text-white">
                  {isConverting
                    ? "Hesaplanıyor..."
                    : converted === null
                      ? "Veri alınamadı"
                      : formatCurrency(converted, to)}
                </p>
                {conversionError ? <p className="mt-2 text-xs text-rose-300">{conversionError}</p> : null}
              </div>
            </div>
          </div>

          <AreaChartCard title="USD / EUR 14 Günlük Eğilim" data={history} dataKey="value" />
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
