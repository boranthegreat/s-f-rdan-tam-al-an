import { BarChart3, CloudSun, Gem, LineChart, WalletCards } from "lucide-react";

const radarItems = [
  { label: "USD/TRY", value: "Kur radarı", top: "15%", left: "66%" },
  { label: "BTC", value: "Kripto sinyali", top: "58%", left: "72%" },
  { label: "Altın", value: "Gram takip", top: "42%", left: "18%" },
  { label: "Hava", value: "7 gün", top: "74%", left: "34%" }
];

const metrics = [
  { label: "Varlık", value: "17+", icon: WalletCards },
  { label: "Grafik", value: "Recharts", icon: LineChart },
  { label: "Altın", value: "Ons + Gram", icon: Gem },
  { label: "Hava", value: "Saatlik", icon: CloudSun }
];

export function DashboardHeroVisual() {
  return (
    <div className="hero-terminal glass-card h-full min-h-[30rem] p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-mint">Radar Terminali</p>
          <h3 className="mt-2 text-2xl font-black text-white">Küresel Sinyal Haritası</h3>
        </div>
        <span className="grid h-11 w-11 place-items-center rounded-lg border border-mint/20 bg-mint/10 text-mint">
          <BarChart3 className="h-5 w-5" />
        </span>
      </div>

      <div className="relative mt-6 h-72 overflow-hidden rounded-lg border border-line bg-slate-950/50">
        <div className="radar-scope absolute inset-6 rounded-full border border-mint/20" />
        <div className="radar-scope absolute inset-16 rounded-full border border-skyglow/20" />
        <div className="radar-sweep absolute left-1/2 top-1/2 h-[150%] w-1/2 origin-left" />
        <div className="absolute left-1/2 top-0 h-full w-px bg-white/10" />
        <div className="absolute left-0 top-1/2 h-px w-full bg-white/10" />

        {radarItems.map((item) => (
          <div key={item.label} className="radar-pin absolute" style={{ top: item.top, left: item.left }}>
            <span className="block h-3 w-3 rounded-full bg-mint shadow-[0_0_24px_rgba(94,234,212,0.9)]" />
            <span className="mt-2 block rounded-md border border-line bg-slate-950/80 px-3 py-2 text-xs backdrop-blur">
              <span className="block font-black text-white">{item.label}</span>
              <span className="text-slate-400">{item.value}</span>
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="rounded-lg border border-line bg-white/5 p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{metric.label}</p>
                <Icon className="h-4 w-4 text-mint" />
              </div>
              <p className="mt-2 font-black text-white">{metric.value}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
