"use client";

import { HeartOff } from "lucide-react";
import { useMemo } from "react";
import { LivePrice } from "@/components/live-market/LivePrice";
import { coinMarketKey, currencyMarketKey, useLiveMarket } from "@/components/live-market/LiveMarketProvider";
import { formatCurrency, formatPercent, formatRate } from "@/lib/format";
import { useFavorites } from "@/lib/useFavorites";
import type { CoinMarket, CurrencyRate } from "@/types";

const typeLabel = {
  currency: "Döviz",
  coin: "Coin",
  city: "Şehir"
};

export function FavoritesPanel() {
  const { favorites, clearFavorites, toggleFavorite } = useFavorites();
  const { coins, rates } = useLiveMarket();
  const coinMap = useMemo(() => new Map(coins.map((coin) => [coin.id, coin])), [coins]);
  const rateMap = useMemo(() => new Map(rates.map((rate) => [rate.code, rate])), [rates]);

  if (favorites.length === 0) {
    return (
      <div className="glass-card flex min-h-72 flex-col items-center justify-center p-8 text-center">
        <HeartOff className="h-10 w-10 text-slate-500" />
        <h2 className="mt-4 text-xl font-bold text-white">Favori listesi bos</h2>
        <p className="mt-2 max-w-md text-sm text-slate-400">Dövizleri, coinleri ve şehirleri favorilere ekleyerek tek panelde takip edebilirsin.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><button className="premium-button" onClick={clearFavorites}>Favorileri temizle</button></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {favorites.map((favorite) => (
          <div key={favorite.id} className="glass-card p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-mint">{typeLabel[favorite.type]}</p>
            <h2 className="mt-3 text-2xl font-black text-white">{favorite.symbol ?? favorite.name}</h2>
            {favorite.symbol ? <p className="mt-2 text-sm text-slate-400">{favorite.name}</p> : null}
            {favorite.type === "coin" ? <LiveCoinInfo coin={coinMap.get(favorite.id.replace("coin:", ""))} /> : null}
            {favorite.type === "currency" && favorite.symbol ? <LiveCurrencyInfo rate={rateMap.get(favorite.symbol)} /> : null}
            {favorite.type === "city" ? <p className="mt-3 text-sm text-slate-400">Hava durumu sayfasindan anlik takip edilebilir.</p> : null}
            <button className="mt-5 text-sm font-semibold text-rose-300" onClick={() => toggleFavorite(favorite)}>Favorilerden kaldir</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function LiveCoinInfo({ coin }: { coin?: CoinMarket }) {
  if (!coin) return <p className="mt-3 text-sm text-slate-400">Canli veri bekleniyor.</p>;
  return (
    <p className="mt-3 text-sm text-slate-300">
      <LivePrice marketKey={coinMarketKey(coin.symbol)} numericValue={coin.current_price}>{formatCurrency(coin.current_price)}</LivePrice> ·{" "}
      <span className={coin.price_change_percentage_24h >= 0 ? "text-emerald-300" : "text-rose-300"}>{formatPercent(coin.price_change_percentage_24h)}</span>
    </p>
  );
}

function LiveCurrencyInfo({ rate }: { rate?: CurrencyRate }) {
  if (!rate) return <p className="mt-3 text-sm text-slate-400">Canli veri bekleniyor.</p>;
  return <p className="mt-3 text-sm text-slate-300">1 USD = <LivePrice marketKey={currencyMarketKey(rate.code)} numericValue={rate.rate}>{formatRate(rate.rate)} {rate.code}</LivePrice></p>;
}
