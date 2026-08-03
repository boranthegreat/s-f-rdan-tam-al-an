"use client";

import { Activity, CloudSun, Coins, Gem, Landmark } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { LivePrice } from "@/components/live-market/LivePrice";
import { useLiveMarket } from "@/components/live-market/LiveMarketProvider";
import { getWeatherForecast } from "@/lib/api/weather";
import { defaultCities } from "@/data/cities";
import { formatCurrency, formatPercent, formatRate } from "@/lib/format";
import type { WeatherForecast } from "@/types";

export function DailyBriefPanel() {
  const { coins, rates, gold } = useLiveMarket();
  const [weather, setWeather] = useState<WeatherForecast | null>(null);

  useEffect(() => {
    getWeatherForecast(defaultCities[0]).then(setWeather).catch(() => undefined);
  }, []);

  const brief = useMemo(() => {
    const sorted = [...coins].sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);
    const best = sorted[0];
    const tryRate = rates.find((rate) => rate.code === "TRY");
    return {
      best,
      tryRate,
      sentence: best
        ? `${best.symbol.toUpperCase()} bugün ${formatPercent(best.price_change_percentage_24h)} ile takip listesinin en hareketli varlığı.`
        : "Piyasa özeti yükleniyor."
    };
  }, [coins, rates]);

  return (
    <section className="glass-card p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-mint">Akıllı günlük özet</p>
          <h2 className="mt-2 text-2xl font-black text-white">Bugün neye bakmalı?</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{brief.sentence}</p>
        </div>
        <span className="grid h-12 w-12 place-items-center rounded-lg border border-mint/20 bg-mint/10 text-mint"><Activity className="h-5 w-5" /></span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <BriefMetric icon={Coins} label="En hareketli coin" value={brief.best?.symbol.toUpperCase() ?? "Bekleniyor"} detail={brief.best ? formatPercent(brief.best.price_change_percentage_24h) : "Veri bekleniyor"} />
        <BriefMetric icon={Landmark} label="USD/TRY" value={<LivePrice marketKey="USDTRY" numericValue={brief.tryRate?.rate}>{brief.tryRate ? formatRate(brief.tryRate.rate) : "N/A"}</LivePrice>} detail="Saniyelik döviz radarı" />
        <BriefMetric icon={Gem} label="Gram altın" value={<LivePrice marketKey="GOLD_GRAM_TRY" numericValue={gold?.gramTry}>{gold ? formatCurrency(gold.gramTry, "TRY") : "N/A"}</LivePrice>} detail="Canlı yaklaşık altın" />
        <BriefMetric icon={CloudSun} label={weather?.city.name ?? "Hava"} value={weather ? `${Math.round(weather.current.temperature)} C` : "N/A"} detail={weather ? `Nem %${weather.current.humidity}` : "Tahmin bekleniyor"} />
      </div>
    </section>
  );
}

function BriefMetric({ icon: Icon, label, value, detail }: { icon: React.ComponentType<{ className?: string }>; label: string; value: React.ReactNode; detail: string }) {
  return (
    <div className="rounded-lg border border-line bg-white/5 p-4">
      <div className="flex items-center justify-between gap-3"><p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p><Icon className="h-4 w-4 text-mint" /></div>
      <p className="mt-3 text-xl font-black text-white">{value}</p>
      <p className="mt-1 text-sm text-slate-400">{detail}</p>
    </div>
  );
}
