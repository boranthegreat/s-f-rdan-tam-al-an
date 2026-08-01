import { Bot, Command, ExternalLink, MousePointer2, Palette, Search } from "lucide-react";

const tips = [
  { title: "Ctrl + K", description: "Komut paletini aç, sayfalara hızlı geç.", icon: Command },
  { title: "Yapay Zeka Asistanı", description: "Sağ alttan soru sor; piyasa, hava, kod veya genel konu.", icon: Bot },
  { title: "Renk modu", description: "Sağ üstten Mint, Mavi, Mor, Altın veya Rose seç.", icon: Palette },
  { title: "Logo efekti", description: "BG logosunun üstünde mouse gezdir; mini slither hareket eder.", icon: MousePointer2 },
  { title: "Instagram", description: "Logoya tıklayınca boranthegreat Instagram hesabına gider.", icon: ExternalLink },
  { title: "Arama", description: "Coin, döviz, altın, hava veya sayfa ara.", icon: Search }
];

export function ShortcutGuide({ compact = false }: { compact?: boolean }) {
  return (
    <section className={compact ? "space-y-3" : "glass-card p-5"}>
      <div className={compact ? "" : "flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"}>
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-mint">Kısa kullanım rehberi</p>
          <h2 className={compact ? "mt-2 text-lg font-black text-white" : "mt-2 text-2xl font-black text-white"}>
            Siteyi daha hızlı kullan
          </h2>
        </div>
        {!compact ? <p className="text-sm text-slate-400">Yeni özellikleri kaçırma</p> : null}
      </div>

      <div className={compact ? "grid gap-2" : "mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"}>
        {tips.map((tip) => {
          const Icon = tip.icon;
          return (
            <div key={tip.title} className="rounded-lg border border-line bg-white/5 p-3">
              <div className="flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-mint/20 bg-mint/10 text-mint">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-black text-white">{tip.title}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">{tip.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
