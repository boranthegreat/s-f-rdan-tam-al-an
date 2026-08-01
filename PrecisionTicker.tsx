"use client";

import { Activity, CloudSun, Coins, Gem, Landmark } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getCoinMarkets } from "@/lib/api/coins";
import { getCurrencyRates } from "@/lib/api/currency";
import { getGoldRate } from "@/lib/api/gold";
import { getWeatherForecast } from "@/lib/api/weather";
import { defaultCities } from "@/data/cities";
import { formatCurrency, formatPercent, formatRate } from "@/lib/format";
import type { CoinMarket, CurrencyRate, GoldRate, WeatherForecast } from "@/types";

type TickerItem = {
  label: string;
  value: string;
  detail: string;
  tone?: "up" | "down" | "neutral";
  icon: React.ComponentType<{ className?: string }>;
};

export function PrecisionTicker() {
  const [coins, setCoins] = useState<CoinMarket[]>([]);
  const [rates, setRates] = useState<CurrencyRate[]>([]);
  const [gold, setGold] = useState<GoldRate | null>(null);
  const [weather, setWeather] = useState<WeatherForecast | null>(null);
  const [updatedAt, setUpdatedAt] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [coinData, rateData, goldData, weatherData] = await Promise.all([
          getCoinMarkets(),
          getCurrencyRates("USD"),
          getGoldRate(),
          getWeatherForecast(defaultCities[0])
        ]);

        setCoins(coinData);
        setRates(rateData);
        setGold(goldData);
        setWeather(weatherData);
        setUpdatedAt(new Intl.DateTimeFormat("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date()));
        setError("");
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Canlı akış verisi alınamadı.");
      }
    }

    load().catch(() => undefined);
    const timer = window.setInterval(() => load().catch(() => undefined), 120000);
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
        value: tryRate ? formatRate(tryRate.rate) : "Bekleniyor",
        detail: "1 USD karsiligi",
        icon: Landmark
      },
      {
        label: "USD/EUR",
        value: eurRate ? formatRate(eurRate.rate) : "Bekleniyor",
        detail: "1 USD karsiligi",
        icon: Landmark
      },
      {
        label: "Gram altın",
        value: gold ? formatCurrency(gold.gramTry, "TRY") : "Bekleniyor",
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

  return (
    <section className="glass-card overflow-hidden p-0">
      <div className="flex flex-col gap-3 border-b border-line px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg border border-mint/20 bg-mint/10 text-mint">
            <Activity className="h-4 w-4" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-mint">Canli hassas veri bandi</p>
            <p className="text-xs text-slate-500">Kisaltma yok, degerler detayli formatta.</p>
          </div>
        </div>
        <p className="text-xs font-semibold text-slate-400">
          {error ? "Veri geçici olarak bekliyor" : updatedAt ? `Son yenileme ${updatedAt}` : "Yükleniyor"}
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
                  <p className={item.tone === "down" ? "text-xs text-rose-300" : item.tone === "up" ? "text-xs text-emerald-300" : "text-xs text-slate-500"}>
                    {item.detail}
                  </p>
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
    value: coin ? formatCurrency(coin.current_price) : "Bekleniyor",
    detail: coin ? `24s ${formatPercent(coin.price_change_percentage_24h)}` : "Coin verisi",
    tone: coin ? (coin.price_change_percentage_24h >= 0 ? "up" : "down") : "neutral",
    icon: Coins
  };
}
