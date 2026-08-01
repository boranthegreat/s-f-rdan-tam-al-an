"use client";

import { ExternalLink, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ErrorState } from "@/components/ErrorState";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import type { MarketNewsItem } from "@/types";

const categories = [
  { id: "economy", label: "Ekonomi" },
  { id: "crypto", label: "Kripto" },
  { id: "forex", label: "Döviz" },
  { id: "world", label: "Dünya" }
] as const;

export function NewsPanel({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();
  const locale = ["tr", "en", "el"].includes(pathname.split("/").filter(Boolean)[0]) ? pathname.split("/").filter(Boolean)[0] : "tr";
  const [category, setCategory] = useState<(typeof categories)[number]["id"]>("economy");
  const [items, setItems] = useState<MarketNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/news?category=${category}&lang=${locale}&r=${revision}`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Haberler yüklenemedi.");
        return response.json() as Promise<{ items: MarketNewsItem[] }>;
      })
      .then((data) => {
        setItems(data.items);
        setError("");
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Haberler yüklenemedi."))
      .finally(() => setLoading(false));
  }, [category, locale, revision]);

  const visible = compact ? items.slice(0, 3) : items;

  return (
    <div className="space-y-5">
      {!compact ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {categories.map((item) => <button key={item.id} onClick={() => setCategory(item.id)} className={category === item.id ? "premium-button" : "rounded-xl border border-line bg-white/5 px-4 py-2 text-sm font-bold text-slate-300"}>{item.label}</button>)}
          </div>
          <button className="flex items-center gap-2 text-sm font-bold text-mint" onClick={() => setRevision((value) => value + 1)}><RefreshCw className="h-4 w-4" /> Yenile</button>
        </div>
      ) : null}
      {loading ? <LoadingSkeleton count={compact ? 3 : 6} /> : null}
      {error ? <ErrorState message={error} /> : null}
      {!loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((item) => (
            <article key={item.id} className="glass-card overflow-hidden">
              {item.image ? <div className="h-36 bg-cover bg-center" style={{ backgroundImage: `linear-gradient(rgba(2,6,23,.15),rgba(2,6,23,.8)),url("${item.image.replace(/"/g, "%22")}")` }} /> : null}
              <div className="p-5">
                <div className="flex items-center justify-between gap-3 text-xs text-slate-500"><span className="truncate uppercase tracking-[0.16em] text-mint">{item.source}</span><time>{new Date(item.publishedAt).toLocaleString()}</time></div>
                <h2 className="mt-3 text-lg font-black leading-6 text-white">{item.title}</h2>
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-mint">Haberi aç <ExternalLink className="h-4 w-4" /></a>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}
