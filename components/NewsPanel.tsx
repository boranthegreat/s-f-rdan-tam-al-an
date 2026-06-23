import { marketNews } from "@/data/news";

export function NewsPanel({ compact = false }: { compact?: boolean }) {
  const visibleNews = compact ? marketNews.slice(0, 2) : marketNews;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {visibleNews.map((item) => (
        <article key={item.title} className="glass-card p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-mint">{item.source}</p>
          <h2 className="mt-3 text-xl font-black text-white">{item.title}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">{item.summary}</p>
        </article>
      ))}
    </div>
  );
}
