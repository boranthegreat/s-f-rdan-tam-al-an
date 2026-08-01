"use client";

import { BarChart3, Bell, BriefcaseBusiness, CloudSun, Coins, Heart, Landmark, Newspaper, Search, Settings } from "lucide-react";
import { NavLink } from "@/components/NavLink";

const navItems = [
  { href: "/", label: "Panel", icon: BarChart3 },
  { href: "/currency", label: "Döviz", icon: Landmark },
  { href: "/coins", label: "Coin", icon: Coins },
  { href: "/weather", label: "Hava", icon: CloudSun },
  { href: "/portfolio", label: "Portföy", icon: BriefcaseBusiness },
  { href: "/alerts", label: "Alarm", icon: Bell },
  { href: "/news", label: "Haber", icon: Newspaper },
  { href: "/search", label: "Ara", icon: Search },
  { href: "/settings", label: "Ayar", icon: Settings },
  { href: "/favorites", label: "Favoriler", icon: Heart }
];

export function Navigation() {
  return (
    <nav className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
      {navItems.map((item) => (
        <NavLink key={item.href} {...item} />
      ))}
    </nav>
  );
}
