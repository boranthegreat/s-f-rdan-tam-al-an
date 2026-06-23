import { economicCalendar } from "@/data/economicCalendar";

export function EconomicCalendar({ compact = false }: { compact?: boolean }) {
  const items = compact ? economicCalendar.slice(0, 2) : economicCalendar;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {items.map((event) => (
        <div key={`${event.date}-${event.title}`} className="glass-card p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.24em] text-mint">{event.date}</p>
            <span className="rounded-full border border-line bg-white/5 px-3 py-1 text-xs text-slate-300">
              Etki: {event.impact}
            </span>
          </div>
          <h2 className="mt-4 text-xl font-black text-white">{event.title}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">{event.detail}</p>
        </div>
      ))}
    </div>
  );
}
