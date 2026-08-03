"use client";

import Image, { type ImageLoaderProps } from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AssetHistoryDialog } from "@/components/AssetHistoryDialog";
import { BarChartCard } from "@/components/ChartCard";
import { ErrorState } from "@/components/ErrorState";
import { FavoriteButton } from "@/components/FavoriteButton";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { LivePrice } from "@/components/live-market/LivePrice";
import { coinMarketKey, useLiveMarket } from "@/components/live-market/LiveMarketProvider";
import { formatCurrencyPrecise, formatCurrencyShort, formatNumber, formatPercent } from "@/lib/format";
import { createSyntheticHistory, type HistoryRange } from "@/lib/history";
import { useFavorites } from "@/lib/useFavorites";

const coinIconLoader = ({ src }: ImageLoaderProps) => src;
const hasValue = (value: number) => Number.isFinite(value) && value > 0;

export function CoinPanel({ compact = false }: { compact?: boolean }) {
  const { coins, getRate, isLoading, error } = useLiveMarket();
  const [displayCurrency, setDisplayCurrency] = useState<"USD" | "TRY">("USD");
  const [selectedCoinId, setSelectedCoinId] = useState<string | null>(null);
  const [historyRange, setHistoryRange] = useState<HistoryRange>("1W");
  const { isFavorite, toggleFavorite } = useFavorites();

  const visibleCoins = useMemo(() => (compact ? coins.slice(0, 4) : coins), [coins, compact]);
  const currencyRate = displayCurrency === "TRY" ? getRate("TRY") || 1 : 1;
  const selectedCoin = selectedCoinId ? coins.find((coin) => coin.id === selectedCoinId) ?? null : null;
  const chartData = coins.map((coin) => ({
    name: coin.symbol.toUpperCase(),
    value: hasValue(coin.total_volume) ? Math.round(coin.total_volume / 1_000_000) : 0
  }));
  const selectedCoinHistory = selectedCoin
    ? createSyntheticHistory(
        selectedCoin.current_price * currencyRate,
        historyRange,
        selectedCoin.market_cap || selectedCoin.current_price,
        selectedCoin.sparkline_in_7d?.price?.map((price) => price * currencyRate)
      )
    : [];

  if (isLoading && !coins.length) return <LoadingSkeleton count={compact ? 4 : 5} />;

  return (
    <div className="space-y-6">
      {error && !coins.length ? <ErrorState message={error} /> : null}
      {!compact ? (
        <div className="glass-card flex justify-end p-4">
          <div className="flex rounded-lg border border-line bg-white/5 p-1">
            {(["USD", "TRY"] as const).map((currency) => (
              <button
                key={currency}
                onClick={() => setDisplayCurrency(currency)}
                className={displayCurrency === currency ? "rounded-md bg-white/15 px-4 py-2 text-sm font-bold text-white" : "px-4 py-2 text-sm font-bold text-slate-400"}
              >
                {currency}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {visibleCoins.map((coin) => (
          <div
            key={coin.id}
            className="glass-card group cursor-pointer p-5 transition hover:-translate-y-1 hover:border-mint/30"
            role="button"
            tabIndex={0}
            onClick={() => setSelectedCoinId(coin.id)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setSelectedCoinId(coin.id);
              }
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-full border border-mint/20 bg-white/10 shadow-[0_0_24px_rgba(94,234,212,0.12)] transition group-hover:scale-105 group-hover:border-mint/40">
                  <Image src={coin.image} alt={coin.name} width={36} height={36} className="h-9 w-9 rounded-full" loader={coinIconLoader} unoptimized />
                </span>
                <div>
                  <p className="font-bold text-white">{coin.symbol.toUpperCase()}</p>
                  <p className="text-xs text-slate-400">{coin.name}</p>
                </div>
              </div>
              <FavoriteButton
                label={`${coin.name} favori`}
                isFavorite={isFavorite(`coin:${coin.id}`)}
                onClick={() =>
                  toggleFavorite({
                    id: `coin:${coin.id}`,
                    type: "coin",
                    symbol: coin.symbol.toUpperCase(),
                    name: coin.name
                  })
                }
              />
            </div>
            <PreciseCoinPrice
              value={coin.current_price * currencyRate}
              currency={displayCurrency}
              marketKey={coinMarketKey(coin.symbol)}
            />
            <p className={coin.price_change_percentage_24h >= 0 ? "mt-2 text-sm text-emerald-300" : "mt-2 text-sm text-rose-300"}>
              24s {hasValue(Math.abs(coin.price_change_percentage_24h)) ? formatPercent(coin.price_change_percentage_24h) : "N/A"}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3 text-xs text-slate-400">
              <span className="rounded-lg border border-line bg-white/5 p-2 break-words">Hacim: {hasValue(coin.total_volume) ? formatNumber(coin.total_volume) : "N/A"}</span>
              <span className="rounded-lg border border-line bg-white/5 p-2 break-words">Piyasa değeri: {hasValue(coin.market_cap) ? formatNumber(coin.market_cap) : "N/A"}</span>
            </div>
            <Link
              href={`/coins/${coin.id}`}
              className="mt-4 block rounded-xl border border-mint/20 bg-mint/5 px-3 py-2 text-center text-xs font-bold text-mint transition hover:bg-mint/10"
              onClick={(event) => event.stopPropagation()}
            >
              Detay sayfasını aç
            </Link>
          </div>
        ))}
      </div>

      {!compact ? <BarChartCard title="24s Hacim (M USD)" data={chartData} dataKey="value" /> : null}
      {selectedCoin ? (
        <AssetHistoryDialog
          title={`${selectedCoin.name} (${selectedCoin.symbol.toUpperCase()})`}
          description={`${displayCurrency} bazlı ${historyRange} fiyat grafiği. Fiyatın üzerine gelince hassas değerleri görebilirsin.`}
          range={historyRange}
          data={selectedCoinHistory}
          onRangeChange={setHistoryRange}
          onClose={() => setSelectedCoinId(null)}
        />
      ) : null}
    </div>
  );
}

function PreciseCoinPrice({ value, currency, marketKey }: { value: number; currency: "USD" | "TRY"; marketKey: string }) {
  if (!hasValue(value)) return <p className="mt-5 text-2xl font-black text-white">Bekleniyor</p>;

  const shortValue = formatCurrencyShort(value, currency);
  const fullValue = formatCurrencyPrecise(value, currency);

  return (
    <div className="group/price relative mt-5 w-fit max-w-full" tabIndex={0} title={fullValue}>
      <p className="truncate text-2xl font-black text-white">
        <LivePrice marketKey={marketKey} numericValue={value}>{shortValue}</LivePrice>
      </p>
      <div className="pointer-events-none absolute left-0 top-full z-20 mt-2 min-w-max max-w-[min(18rem,80vw)] translate-y-1 rounded-xl border border-mint/25 bg-slate-950/95 px-3 py-2 text-xs font-bold text-mint opacity-0 shadow-[0_18px_44px_rgba(0,0,0,0.45)] backdrop-blur-xl transition group-hover/price:translate-y-0 group-hover/price:opacity-100 group-focus/price:translate-y-0 group-focus/price:opacity-100">
        Tam değer: {fullValue}
      </div>
    </div>
  );
}
