import Link from "next/link";
import { Bell, BriefcaseBusiness, CloudSun, Command, Gem, Heart, Landmark, Newspaper, Search, Settings } from "lucide-react";

const actions = [
  { href: "/portfolio", label: "Portföy ekle", description: "Varlıklarını takip et", icon: BriefcaseBusiness },
  { href: "/alerts", label: "Alarm kur", description: "Hedef fiyat belirle", icon: Bell },
  { href: "/favorites", label: "Favorileri aç", description: "Canlı takip listesi", icon: Heart },
  { href: "/currency", label: "Kur çevir", description: "Döviz hesapla", icon: Landmark },
  { href: "/currency", label: "Altın kuru", description: "Gram altın takip et", icon: Gem },
  { href: "/weather", label: "Şehir ara", description: "7 günlük tahmin", icon: CloudSun },
  { href: "/news", label: "Piyasa özeti", description: "Haber ve takvim", icon: Newspaper },
  { href: "/search", label: "Genel arama", description: "Her şeyi bul", icon: Search },
  { href: "/search", label: "Komut paleti", description: "Ctrl + K ile hızlı geçiş", icon: Command },
  { href: "/settings", label: "Ayarlar", description: "Paneli kişiselleştir", icon: Settings }
];

export function QuickActions() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Link key={`${action.href}:${action.label}`} href={action.href} className="glass-card group flex items-center gap-4 p-4">
            <span className="grid h-11 w-11 place-items-center rounded-lg border border-mint/20 bg-mint/10 transition group-hover:scale-105">
              <Icon className="h-5 w-5 text-mint" />
            </span>
            <span>
              <span className="block font-bold text-white">{action.label}</span>
              <span className="block text-sm text-slate-400">{action.description}</span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
