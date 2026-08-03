"use client";

import { Activity, CloudSun, Coins, Gem, Landmark } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { LivePrice } from "@/components/live-market/LivePrice";
import { coinMarketKey, currencyMarketKey, useLiveMarket } from "@/components/live-market/LiveMarketProvider";
import { getWeatherForecast } from "@/lib/api/weather";
import { defaultCities } from "@/data/cities";
import { formatCurrency, formatPercent, formatRate } from "@/lib/format";
import type { CoinMarket, WeatherForecast } from "@/types";

type TickerItem = {
  label: string;
  value: React.ReactNode;
  detail: string;
  tone?: "up" | "down" | "neutral";
  icon: React.ComponentType<{ className?: string }>;
};

const statusLabel = {
  connecting: "Canlı bağlantı kuruluyor",
  live: "Saniyelik akış aktif",
  reconnecting: "Canlı akış yeniden bağlanıyor",
  fallback: "Yedek veri aktif",
  offline: "İnternet bağlantısı yok"
} as const;

export function PrecisionTicker() {
  const { coins, rates, gold, status, updatedAt } = useLiveMarket();
  const [weather, setWeather] = useState<WeatherForecast | null>(null);

  useEffect(() => {
    function loadWeather() {
      getWeatherForecast(defaultCities[0]).then(setWeather).catch(() => undefined);
    }
    loadWeather();
    const timer = window.setInterval(loadWeather, 10 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  const items = useMemo<TickerItem[]>(() => {
    const btc = coins.find((coin) => coin.symbol.toLowerCase() === "btc");
    const eth = coins.find((coin) => coin.symbol.toLowerCase() === "eth");
    const trx = coins.find((coin) => coin.symbol.toLowerCase() === "trx");
    const tryRate = rates.find((rate) => rate.code === "TRY");
    const eurRate = rates.find((rate) => rate.code === "EUR");

    return [
      coinItem("BTC", btc),
      coinItem("ETH", eth),
      coinItem("TRX", trx),
      {
        label: "USD/TRY",
        value: <LivePrice marketKey="USDTRY" numericValue={tryRate?.rate}>{tryRate ? formatRate(tryRate.rate) : "Bekleniyor"}</LivePrice>,
        detail: "1 USD karşılığı",
        icon: Landmark
      },
      {
        label: "USD/EUR",
        value: <LivePrice marketKey={currencyMarketKey("EUR")} numericValue={eurRate?.rate}>{eurRate ? formatRate(eurRate.rate) : "Bekleniyor"}</LivePrice>,
        detail: "1 USD karşılığı",
        icon: Landmark
      },
      {
        label: "Gram altın",
        value: <LivePrice marketKey="GOLD_GRAM_TRY" numericValue={gold?.gramTry}>{gold ? formatCurrency(gold.gramTry, "TRY") : "Bekleniyor"}</LivePrice>,
        detail: gold?.source ?? "Altın takip",
        icon: Gem
      },
      {
        label: weather?.city.name ?? "Hava",
        value: weather ? `${Math.round(weather.current.temperature)} C` : "Bekleniyor",
        detail: weather ? `Nem %${weather.current.humidity} - yağış %${weather.current.precipitationProbability}` : "Tahmin",
        icon: CloudSun
      }
    ];
  }, [coins, rates, gold, weather]);

  const streamItems = [...items, ...items];
  const time = updatedAt
    ? new Intl.DateTimeFormat("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(updatedAt)
    : "";

  return (
    <section className="glass-card overflow-hidden p-0">
      <div className="flex flex-col gap-3 border-b border-line px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg border border-mint/20 bg-mint/10 text-mint"><Activity className="h-4 w-4" /></span>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-mint">Canlı hassas veri bandı</p>
            <p className="text-xs text-slate-500">Fiyat değiştiği anda yeşil veya kırmızı yanar.</p>
          </div>
        </div>
        <p className={status === "live" ? "text-xs font-semibold text-emerald-300" : status === "offline" ? "text-xs font-semibold text-rose-300" : "text-xs font-semibold text-amber-200"}>
          {statusLabel[status]}{time ? ` · ${time}` : ""}
        </p>
      </div>

      <div className="ticker-window">
        <div className="ticker-track">
          {streamItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={`${item.label}-${index}`} className="ticker-chip">
                <Icon className="h-4 w-4 text-mint" />
                <div className="min-w-0">
                  <p className="text-[0.68rem] uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                  <p className="max-w-56 truncate text-sm font-black text-white">{item.value}</p>
                  <p className={item.tone === "down" ? "text-xs text-rose-300" : item.tone === "up" ? "text-xs text-emerald-300" : "text-xs text-slate-500"}>{item.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function coinItem(label: string, coin?: CoinMarket): TickerItem {
  return {
    label,
    value: <LivePrice marketKey={coinMarketKey(label)} numericValue={coin?.current_price}>{coin ? formatCurrency(coin.current_price) : "Bekleniyor"}</LivePrice>,
    detail: coin ? `24s ${formatPercent(coin.price_change_percentage_24h)}` : "Coin verisi",
    tone: coin ? (coin.price_change_percentage_24h >= 0 ? "up" : "down") : "neutral",
    icon: Coins
  };
}
