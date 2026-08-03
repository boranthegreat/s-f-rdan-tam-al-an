"use client";

import Image, { type ImageLoaderProps } from "next/image";
import { Bell, ExternalLink, Heart, LineChart, WalletCards } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { AreaChartCard } from "@/components/ChartCard";
import { ErrorState } from "@/components/ErrorState";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { formatCurrencyPrecise, formatNumber, formatPercent } from "@/lib/format";
import { LivePrice } from "@/components/live-market/LivePrice";
import { coinMarketKey, useLiveMarket } from "@/components/live-market/LiveMarketProvider";
import { useAlerts } from "@/lib/useAlerts";
import { useFavorites } from "@/lib/useFavorites";
import { usePortfolio } from "@/lib/usePortfolio";
import type { CoinDetail } from "@/types";

const imageLoader = ({ src }: ImageLoaderProps) => src;
const ranges = [
  { label: "24S", days: 1 },
  { label: "7G", days: 7 },
  { label: "1A", days: 30 },
  { label: "1Y", days: 365 }
] as const;

export function CoinDetailPanel({ id }: { id: string }) {
  const pathname = usePathname();
  const locale = ["tr", "en", "el"].includes(pathname.split("/").filter(Boolean)[0]) ? pathname.split("/").filter(Boolean)[0] : "tr";
  const [coin, setCoin] = useState<CoinDetail | null>(null);
  const [error, setError] = useState("");
  const [currency, setCurrency] = useState<"USD" | "TRY" | "EUR">("USD");
  const [days, setDays] = useState(30);
  const [target, setTarget] = useState(0);
  const { coins, getRate } = useLiveMarket();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { upsertAsset } = usePortfolio();
  const { addAlert } = useAlerts();

  useEffect(() => {
    fetch(`/api/coins/${encodeURIComponent(id)}?lang=${locale}`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Coin detayı yüklenemedi.");
        return response.json() as Promise<CoinDetail>;
      })
      .then((data) => {
        setCoin(data);
        setTarget(data.currentPrice);
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Coin detayı yüklenemedi."));
  }, [id, locale]);

  const liveCoin = coin ? coins.find((item) => item.id === coin.id || item.symbol.toUpperCase() === coin.symbol.toUpperCase()) : undefined;
  const liveUsdPrice = liveCoin?.current_price ?? coin?.currentPrice ?? 0;
  const rate = currency === "USD" ? 1 : getRate(currency) || 1;


  const handleCurrencyChange = (nextCurrency: "USD" | "TRY" | "EUR") => {
    const nextRate = nextCurrency === "USD" ? 1 : getRate(nextCurrency) || 1;
    setCurrency(nextCurrency);
    setTarget(liveUsdPrice * nextRate);
  };

  const history = useMemo(() => {
    if (!coin) return [];
    const selected = days === 1 ? coin.history24h : coin.history.slice(-Math.max(days, 2));
    return selected.map((point) => ({ ...point, value: Number((point.value * rate).toFixed(currency === "TRY" ? 2 : 4)) }));
  }, [coin, currency, days, rate]);

  if (error) return <ErrorState message={error} />;
  if (!coin) return <LoadingSkeleton count={6} />;

  const price = liveUsdPrice * rate;
  const favoriteId = `coin:${coin.id}`;

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-center gap-4">
            {coin.image ? <Image loader={imageLoader} unoptimized src={coin.image} alt={coin.name} width={64} height={64} className="h-16 w-16 rounded-full" /> : null}
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-mint">{coin.symbol}</p>
              <h1 className="mt-1 text-3xl font-black text-white">{coin.name}</h1>
              <p className="mt-2 text-sm text-slate-400">Son güncelleme: {new Date(coin.lastUpdated).toLocaleString(locale === "el" ? "el-GR" : locale === "en" ? "en-US" : "tr-TR")}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(["USD", "TRY", "EUR"] as const).map((item) => (
              <button key={item} className={currency === item ? "premium-button" : "rounded-xl border border-line bg-white/5 px-4 py-2 text-sm font-bold text-slate-300"} onClick={() => handleCurrencyChange(item)}>{item}</button>
            ))}
          </div>
        </div>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Güncel fiyat" value={<LivePrice marketKey={coinMarketKey(coin.symbol)} numericValue={price}>{formatCurrencyPrecise(price, currency)}</LivePrice>} />
          <Stat label="24s değişim" value={formatPercent(coin.change24h)} tone={coin.change24h >= 0 ? "positive" : "negative"} />
          <Stat label="24s en yüksek" value={formatCurrencyPrecise(coin.high24h * rate, currency)} />
          <Stat label="24s en düşük" value={formatCurrencyPrecise(coin.low24h * rate, currency)} />
          <Stat label="Piyasa değeri" value={formatNumber(coin.marketCap * rate)} />
          <Stat label="24s hacim" value={formatNumber(coin.totalVolume * rate)} />
          <Stat label="Tüm zamanlar zirvesi" value={coin.ath > 0 ? formatCurrencyPrecise(coin.ath * rate, currency) : "N/A"} />
          <Stat label="Dolaşımdaki arz" value={coin.circulatingSupply ? formatNumber(coin.circulatingSupply) : "N/A"} />
        </div>
      </div>

      <div className="glass-card flex flex-col gap-4 p-5 md:flex-row md:items-end">
        <button className="flex items-center justify-center gap-2 rounded-xl border border-line bg-white/5 px-4 py-3 text-sm font-bold text-white" onClick={() => toggleFavorite({ id: favoriteId, type: "coin", symbol: coin.symbol, name: coin.name })}>
          <Heart className={isFavorite(favoriteId) ? "h-4 w-4 fill-rose-400 text-rose-400" : "h-4 w-4"} /> {isFavorite(favoriteId) ? "Favorilerden kaldır" : "Favoriye ekle"}
        </button>
        <button className="flex items-center justify-center gap-2 rounded-xl border border-line bg-white/5 px-4 py-3 text-sm font-bold text-white" onClick={() => upsertAsset({ type: "coin", symbol: coin.symbol, amount: 1 })}>
          <WalletCards className="h-4 w-4 text-mint" /> Portföye 1 adet ekle
        </button>
        <div className="flex flex-1 gap-2">
          <input className="premium-input" type="number" min={0} step="any" value={target} onChange={(event) => setTarget(Number(event.target.value))} aria-label="Hedef fiyat" />
          <button className="premium-button whitespace-nowrap" onClick={() => addAlert({ targetType: "coin", symbol: coin.symbol, direction: "above", target: target / rate })}>
            <Bell className="h-4 w-4" /> Alarm kur
          </button>
        </div>
      </div>

      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-bold text-white"><LineChart className="h-4 w-4 text-mint" /> Fiyat geçmişi</div>
          <div className="flex rounded-xl border border-line bg-white/5 p-1">
            {ranges.map((range) => <button key={range.label} onClick={() => setDays(range.days)} className={days === range.days ? "rounded-lg bg-white/15 px-3 py-1.5 text-xs font-bold text-white" : "px-3 py-1.5 text-xs font-bold text-slate-400"}>{range.label}</button>)}
          </div>
        </div>
        <AreaChartCard title={`${coin.symbol} / ${currency}`} data={history} dataKey="value" />
      </div>

      {coin.description ? <div className="glass-card p-6"><h2 className="text-xl font-black text-white">{`${coin.name} hakkında`}</h2><p className="mt-3 text-sm leading-7 text-slate-400">{coin.description}</p>{coin.homepage ? <a className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-mint" href={coin.homepage} target="_blank" rel="noreferrer">Resmî site <ExternalLink className="h-4 w-4" /></a> : null}</div> : null}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: React.ReactNode; tone?: "positive" | "negative" }) {
  return <div className="rounded-2xl border border-line bg-white/[0.04] p-4"><p className="text-xs text-slate-500">{label}</p><p className={tone === "positive" ? "mt-2 text-lg font-black text-emerald-300" : tone === "negative" ? "mt-2 text-lg font-black text-rose-300" : "mt-2 break-words text-lg font-black text-white"}>{value}</p></div>;
}
