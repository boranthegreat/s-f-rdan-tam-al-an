"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BellRing, Calculator, CircleDollarSign, House, WalletCards } from "lucide-react";
import { getLocaleFromPath, localizedHref } from "@/components/enhancements/locale";

const labels = {
  tr: { home: "Panel", markets: "Piyasa", portfolio: "Portföy", alerts: "Alarm", tools: "Araçlar" },
  en: { home: "Home", markets: "Markets", portfolio: "Portfolio", alerts: "Alerts", tools: "Tools" },
  el: { home: "Αρχική", markets: "Αγορές", portfolio: "Χαρτοφυλάκιο", alerts: "Ειδοπ.", tools: "Εργαλεία" }
} as const;

export function MobileBottomNavigation() {
  const pathname = usePathname();
  const locale = getLocaleFromPath(pathname);
  const t = labels[locale];
  const links = [
    { href: "/", label: t.home, icon: House },
    { href: "/exchange", label: t.markets, icon: CircleDollarSign },
    { href: "/portfolio", label: t.portfolio, icon: WalletCards },
    { href: "/alerts", label: t.alerts, icon: BellRing },
    { href: "/tools", label: t.tools, icon: Calculator }
  ];

  return (
    <nav aria-label="Mobil ana menü" className="btg-mobile-nav fixed inset-x-3 bottom-3 z-50 grid grid-cols-5 rounded-2xl border border-white/10 bg-slate-950/90 p-1.5 shadow-2xl backdrop-blur-xl md:hidden">
      {links.map(({ href, label, icon: Icon }) => {
        const localized = localizedHref(pathname, href);
        const active = href === "/" ? pathname === `/${locale}` || pathname === "/" : pathname.startsWith(localized);
        return (
          <Link key={href} href={localized} aria-current={active ? "page" : undefined} className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-bold transition ${active ? "bg-mint/15 text-mint" : "text-slate-400 hover:text-white"}`}>
            <Icon className="h-4 w-4" aria-hidden="true" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
