"use client";

import Link from "next/link";
import { Bell, BriefcaseBusiness, CloudSun, Coins, Command, Gem, Heart, Landmark, Newspaper, Search, Settings, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const commands = [
  { label: "Ana panel", description: "Kontrol merkezine dön", href: "/", icon: Command, tags: "dashboard panel ana" },
  { label: "Piyasaları aç", description: "Kurlar ve çevirici", href: "/currency", icon: Landmark, tags: "usd eur try doviz kur" },
  { label: "Altın kuru", description: "Gram ve ons altın", href: "/currency", icon: Gem, tags: "gold altin gram ons" },
  { label: "Coin takip", description: "BTC, ETH, SOL, TRX", href: "/coins", icon: Coins, tags: "kripto crypto btc eth trx" },
  { label: "Dünya hava radarı", description: "Başkentler ve şehir arama", href: "/weather", icon: CloudSun, tags: "hava weather city baskent" },
  { label: "Favoriler", description: "Takip listesi", href: "/favorites", icon: Heart, tags: "favori watchlist" },
  { label: "Portföy", description: "Varlık değerini takip et", href: "/portfolio", icon: BriefcaseBusiness, tags: "portfoy portfolio" },
  { label: "Alarmlar", description: "Hedef fiyatlar", href: "/alerts", icon: Bell, tags: "alarm fiyat hedef" },
  { label: "Haber ve takvim", description: "Piyasa notları", href: "/news", icon: Newspaper, tags: "haber ekonomi takvim" },
  { label: "Arama merkezi", description: "Site içinde ara", href: "/search", icon: Search, tags: "arama search" },
  { label: "Ayarlar", description: "Tema ve panel ayarları", href: "/settings", icon: Settings, tags: "ayar tema renk" }
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }

      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return commands;
    }

    return commands.filter((item) => `${item.label} ${item.description} ${item.tags}`.toLowerCase().includes(normalized));
  }, [query]);

  return (
    <>
      <button
        className="fixed bottom-24 right-4 z-40 hidden rounded-full border border-line bg-slate-950/85 px-4 py-3 text-xs font-black text-slate-300 shadow-[0_0_35px_rgba(2,6,23,0.45)] backdrop-blur-xl transition hover:-translate-y-1 hover:border-mint/40 hover:text-white sm:right-6 lg:flex lg:items-center lg:gap-2"
        onClick={() => setOpen(true)}
      >
        <Command className="h-4 w-4 text-mint" />
        Ctrl K
      </button>

      {open ? (
        <div className="fixed inset-0 z-[70] bg-slate-950/70 p-4 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="mx-auto mt-20 max-w-2xl overflow-hidden rounded-xl border border-line bg-slate-950/95 shadow-[0_30px_100px_rgba(0,0,0,0.55)]" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center gap-3 border-b border-line p-4">
              <Sparkles className="h-5 w-5 text-mint" />
              <input
                autoFocus
                className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Sayfa, coin, döviz, hava veya ayar ara..."
              />
              <button className="rounded-lg border border-line bg-white/5 p-2 text-slate-400 hover:text-white" onClick={() => setOpen(false)} aria-label="Komut paletini kapat">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[26rem] overflow-y-auto p-2">
              {results.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-4 rounded-lg p-3 transition hover:bg-white/10"
                    onClick={() => setOpen(false)}
                  >
                    <span className="grid h-10 w-10 place-items-center rounded-lg border border-mint/20 bg-mint/10 text-mint">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block font-bold text-white">{item.label}</span>
                      <span className="block text-sm text-slate-400">{item.description}</span>
                    </span>
                  </Link>
                );
              })}
              {results.length === 0 ? <div className="p-6 text-sm text-slate-400">Sonuç bulunamadı.</div> : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
