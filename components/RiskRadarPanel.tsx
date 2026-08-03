"use client";

import { AlertTriangle, BarChart3, CloudRain, Gauge, ShieldCheck, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { LivePrice } from "@/components/live-market/LivePrice";
import { useLiveMarket } from "@/components/live-market/LiveMarketProvider";
import { getWeatherForecast } from "@/lib/api/weather";
import { defaultCities } from "@/data/cities";
import { formatCurrency, formatPercent } from "@/lib/format";
import type { WeatherForecast } from "@/types";

type RiskLevel = "dusuk" | "orta" | "yuksek";

export function RiskRadarPanel() {
  const { coins, gold } = useLiveMarket();
  const [weather, setWeather] = useState<WeatherForecast | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const weatherData = await getWeatherForecast(defaultCities[0]);
        setWeather(weatherData);
        setError("");
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Risk radarı verisi alınamadı.");
      }
    }

    load().catch(() => undefined);
  }, []);

  const radar = useMemo(() => {
    const sorted = [...coins].sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);
    const best = sorted[0];
    const worst = sorted[sorted.length - 1];
    const averageChange = coins.length
      ? coins.reduce((total, coin) => total + coin.price_change_percentage_24h, 0) / coins.length
      : 0;
    const volatility = coins.length
      ? coins.reduce((total, coin) => total + Math.abs(coin.price_change_percentage_24h), 0) / coins.length
      : 0;
    const rainRisk = weather?.current.precipitationProbability ?? 0;
    const score = Math.min(100, Math.round(volatility * 8 + Math.max(0, rainRisk - 35) * 0.35));
    const level: RiskLevel = score > 65 ? "yuksek" : score > 32 ? "orta" : "dusuk";

    return { best, worst, averageChange, volatility, rainRisk, score, level };
  }, [coins, weather]);

  const levelText = {
    dusuk: "Sakin radar",
    orta: "Dengeli takip",
    yuksek: "Yüksek dikkat"
  } satisfies Record<RiskLevel, string>;

  const levelClass = {
    dusuk: "text-emerald-300",
    orta: "text-amber-200",
    yuksek: "text-rose-300"
  } satisfies Record<RiskLevel, string>;

  return (
    <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="glass-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-mint">Akıllı risk radarı</p>
            <h2 className="mt-2 text-2xl font-black text-white">Bugünkü piyasa modu</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Coin oynaklığı, altın takibi ve hava riski tek panelde okunabilir hale getirildi.
            </p>
          </div>
          <span className="grid h-12 w-12 place-items-center rounded-lg border border-mint/20 bg-mint/10 text-mint">
            <Gauge className="h-5 w-5" />
          </span>
        </div>

        <div className="mt-6 rounded-xl border border-line bg-white/5 p-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Risk skoru</p>
              <p className={`mt-2 text-4xl font-black ${levelClass[radar.level]}`}>{radar.score}/100</p>
            </div>
            <p className={`text-right text-lg font-black ${levelClass[radar.level]}`}>{levelText[radar.level]}</p>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-amber-200 to-rose-400" style={{ width: `${Math.max(8, radar.score)}%` }} />
          </div>
          {error ? <p className="mt-3 text-xs text-rose-300">{error}</p> : null}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <RadarMetric
          icon={radar.averageChange >= 0 ? TrendingUp : TrendingDown}
          label="Coin ortalaması"
          value={formatPercent(radar.averageChange)}
          detail={`Oynaklık ${formatPercent(radar.volatility)}`}
          tone={radar.averageChange >= 0 ? "up" : "down"}
        />
        <RadarMetric
          icon={BarChart3}
          label="En güçlü / zayıf"
          value={radar.best && radar.worst ? `${radar.best.symbol.toUpperCase()} / ${radar.worst.symbol.toUpperCase()}` : "Bekleniyor"}
          detail={radar.best ? `${radar.best.name} önde` : "Coinler yükleniyor"}
        />
        <RadarMetric
          icon={ShieldCheck}
          label="Altın sigortası"
          value={gold ? <LivePrice marketKey="GOLD_GRAM_TRY" numericValue={gold.gramTry}>{formatCurrency(gold.gramTry, "TRY")}</LivePrice> : "Bekleniyor"}
          detail="Gram altın TRY bazlı"
        />
        <RadarMetric
          icon={radar.rainRisk > 50 ? CloudRain : AlertTriangle}
          label="Hava riski"
          value={weather ? `%${radar.rainRisk}` : "Bekleniyor"}
          detail={weather ? `${weather.city.name} yağış ihtimali` : "Tahmin yükleniyor"}
          tone={radar.rainRisk > 50 ? "down" : "neutral"}
        />
      </div>
    </section>
  );
}

function RadarMetric({
  icon: Icon,
  label,
  value,
  detail,
  tone = "neutral"
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  detail: string;
  tone?: "up" | "down" | "neutral";
}) {
  const toneClass = tone === "up" ? "text-emerald-300" : tone === "down" ? "text-rose-300" : "text-white";

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
        <Icon className="h-4 w-4 text-mint" />
      </div>
      <p className={`mt-3 text-2xl font-black ${toneClass}`}>{value}</p>
      <p className="mt-2 text-sm text-slate-400">{detail}</p>
    </div>
  );
}
