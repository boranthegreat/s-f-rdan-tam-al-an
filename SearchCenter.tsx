"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const searchable = [
  { label: "Bitcoin", category: "Coin", href: "/coins" },
  { label: "Ethereum", category: "Coin", href: "/coins" },
  { label: "TRX", category: "Coin", href: "/coins" },
  { label: "USD/TRY", category: "Döviz", href: "/currency" },
  { label: "Gram Altın", category: "Altın", href: "/currency" },
  { label: "Istanbul", category: "Hava", href: "/weather" },
  { label: "Portföy", category: "Sayfa", href: "/portfolio" },
  { label: "Alarm", category: "Sayfa", href: "/alerts" },
  { label: "Ekonomi Takvimi", category: "Sayfa", href: "/news" },
  { label: "Ayarlar", category: "Sayfa", href: "/settings" }
];

export function SearchCenter() {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return searchable;
    }

    return searchable.filter((item) => `${item.label} ${item.category}`.toLowerCase().includes(normalized));
  }, [query]);

  return (
    <div className="space-y-5">
      <div className="glass-card p-5">
        <p className="text-xs uppercase tracking-[0.24em] text-mint">Arama Merkezi</p>
        <input
          className="premium-input mt-4 w-full"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Coin, döviz, altın, şehir veya sayfa ara..."
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {results.map((item) => (
          <Link key={`${item.category}-${item.label}`} href={item.href} className="glass-card p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-mint">{item.category}</p>
            <h2 className="mt-3 text-xl font-black text-white">{item.label}</h2>
            <p className="mt-2 text-sm text-slate-400">Git ve detayları gör</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
