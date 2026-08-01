"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";

const loading = () => <LoadingSkeleton count={2} />;

const AlertsPanel = dynamic(() => import("@/components/AlertsPanel").then((mod) => mod.AlertsPanel), { ssr: false, loading });
const CoinPanel = dynamic(() => import("@/components/CoinPanel").then((mod) => mod.CoinPanel), { ssr: false, loading });
const CurrencyPanel = dynamic(() => import("@/components/CurrencyPanel").then((mod) => mod.CurrencyPanel), { ssr: false, loading });
const DailyBriefPanel = dynamic(() => import("@/components/DailyBriefPanel").then((mod) => mod.DailyBriefPanel), { ssr: false, loading });
const DataQualityPanel = dynamic(() => import("@/components/DataQualityPanel").then((mod) => mod.DataQualityPanel), { ssr: false, loading });
const EconomicCalendar = dynamic(() => import("@/components/EconomicCalendar").then((mod) => mod.EconomicCalendar), { ssr: false, loading });
const GoldPanel = dynamic(() => import("@/components/GoldPanel").then((mod) => mod.GoldPanel), { ssr: false, loading });
const MarketNotesPanel = dynamic(() => import("@/components/MarketNotesPanel").then((mod) => mod.MarketNotesPanel), { ssr: false, loading });
const MarketSummary = dynamic(() => import("@/components/MarketSummary").then((mod) => mod.MarketSummary), { ssr: false, loading });
const NewsPanel = dynamic(() => import("@/components/NewsPanel").then((mod) => mod.NewsPanel), { ssr: false, loading });
const PortfolioPanel = dynamic(() => import("@/components/PortfolioPanel").then((mod) => mod.PortfolioPanel), { ssr: false, loading });
const PrecisionTicker = dynamic(() => import("@/components/PrecisionTicker").then((mod) => mod.PrecisionTicker), { ssr: false, loading });
const QuickActions = dynamic(() => import("@/components/QuickActions").then((mod) => mod.QuickActions), { ssr: false, loading });
const RiskRadarPanel = dynamic(() => import("@/components/RiskRadarPanel").then((mod) => mod.RiskRadarPanel), { ssr: false, loading });
const WeatherPanel = dynamic(() => import("@/components/WeatherPanel").then((mod) => mod.WeatherPanel), { ssr: false, loading });

export function DashboardDeferredModules() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const idle = window.requestIdleCallback ?? ((callback: IdleRequestCallback) => window.setTimeout(callback, 900));
    const cancelIdle = window.cancelIdleCallback ?? window.clearTimeout;
    const id = idle(() => setReady(true), { timeout: 1400 });

    return () => cancelIdle(id);
  }, []);

  if (!ready) {
    return (
      <section className="glass-card p-5">
        <p className="text-sm font-semibold text-slate-400">Canlı paneller hazırlanıyor...</p>
      </section>
    );
  }

  return (
    <>
      <PrecisionTicker />
      <DailyBriefPanel />

      <section className="space-y-4">
        <PanelTitle title="Hızlı İşlemler" href="/portfolio" />
        <QuickActions />
      </section>

      <section className="space-y-4">
        <PanelTitle title="Piyasa Özeti" href="/news" />
        <MarketSummary />
      </section>

      <RiskRadarPanel />

      <section className="space-y-4">
        <PanelTitle title="Veri Kalitesi" href="/settings" />
        <DataQualityPanel />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <PortfolioPanel compact />
        <AlertsPanel compact />
      </section>

      <section className="space-y-4">
        <PanelTitle title="Altın Kuru" href="/currency" />
        <GoldPanel compact />
      </section>

      <section className="space-y-4">
        <PanelTitle title="Döviz Özeti" href="/currency" />
        <CurrencyPanel compact />
      </section>

      <section className="space-y-4">
        <PanelTitle title="Coin Özeti" href="/coins" />
        <CoinPanel compact />
      </section>

      <section className="space-y-4">
        <PanelTitle title="Hava Durumu Özeti" href="/weather" />
        <WeatherPanel compact />
      </section>

      <section className="space-y-4">
        <PanelTitle title="Ekonomi Takvimi" href="/news" />
        <EconomicCalendar compact />
      </section>

      <section className="space-y-4">
        <PanelTitle title="Piyasa Haberleri" href="/news" />
        <NewsPanel compact />
      </section>

      <section className="space-y-4">
        <PanelTitle title="Kişisel Piyasa Notları" href="/news" />
        <MarketNotesPanel compact />
      </section>
    </>
  );
}

function PanelTitle({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Panel modülü</p>
        <h2 className="text-xl font-black text-white">{title}</h2>
      </div>
      <Link href={href} className="text-sm font-semibold text-mint hover:text-white">
        Detaylar
      </Link>
    </div>
  );
}
