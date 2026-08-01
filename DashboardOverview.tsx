import Link from "next/link";
import { Bell, BriefcaseBusiness, CloudSun, Coins, Landmark, Newspaper, ShieldCheck } from "lucide-react";
import { DashboardDeferredModules } from "@/components/DashboardDeferredModules";
import { DashboardHeroVisual } from "@/components/DashboardHeroVisual";
import { LiveInsightStrip } from "@/components/LiveInsightStrip";

const stats = [
  { label: "Döviz radarı", value: "16+", icon: Landmark },
  { label: "Kripto varlık", value: "BTC-TRX", icon: Coins },
  { label: "Dünya şehirleri", value: "7 gün", icon: CloudSun },
  { label: "Yerel takip listesi", value: "Gizli", icon: ShieldCheck }
];

export function DashboardOverview() {
  return (
    <div className="space-y-10">
      <LiveInsightStrip />

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr] xl:items-stretch">
        <div className="glass-card p-8">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-mint">BoranTheGreat Kontrol Merkezi</p>
            <span className="status-pill">Canlı veri hattı</span>
          </div>
          <h1 className="shine-text mt-5 max-w-3xl text-4xl font-black tracking-tight sm:text-6xl">
            Küresel piyasalar ve hava radarını tek koyu panelde izle.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-400">
            Döviz kurları, kripto piyasa sinyalleri, altın kuru, 7 günlük dünya hava tahmini ve favori listesi tek
            premium panelde birleşir.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/currency" className="premium-button">
              Döviz takip
            </Link>
            <Link href="/coins" className="premium-link">
              Coin panelini aç
            </Link>
            <Link href="/weather" className="premium-link">
              Hava radarını aç
            </Link>
          </div>
        </div>

        <DashboardHeroVisual />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="glass-card group p-5">
              <div className="grid h-10 w-10 place-items-center rounded-lg border border-mint/20 bg-mint/10 transition group-hover:scale-105">
                <Icon className="h-5 w-5 text-mint" />
              </div>
              <p className="mt-4 text-sm text-slate-400">{stat.label}</p>
              <p className="mt-1 text-2xl font-black text-white">{stat.value}</p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="glass-card p-5 lg:col-span-2">
          <p className="text-xs uppercase tracking-[0.24em] text-mint">Hızlı mod aktif</p>
          <h2 className="mt-3 text-2xl font-black text-white">İlk ekran hafifletildi, canlı modüller boşta yüklenir.</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
            Site daha hızlı tepki verir; piyasa, hava, portföy ve haber panelleri sayfa açılışını kilitlemeden arkadan hazırlanır.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {["Hızlı açılış", "Hafif efektler", "Gecikmeli canlı panel"].map((item) => (
              <span key={item} className="rounded-lg border border-line bg-white/5 px-4 py-3 text-sm font-bold text-white">
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="glass-card p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-amber-200">Yayın modu</p>
          <p className="mt-3 text-3xl font-black text-white">Düşük gecikme</p>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Animasyonlar azaltıldı, pointer efekti seyrekleştirildi ve ağır paneller ilk render dışında bırakıldı.
          </p>
        </div>
      </section>

      <DashboardDeferredModules />
    </div>
  );
}
