import type { ReactNode } from "react";

export function PageHero({ eyebrow, title, description, children }: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/55 p-6 shadow-card sm:p-8">
      <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-mint/10 blur-3xl" />
      <div className="relative max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-mint">{eyebrow}</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">{description}</p>
        {children ? <div className="mt-6">{children}</div> : null}
      </div>
    </section>
  );
}
