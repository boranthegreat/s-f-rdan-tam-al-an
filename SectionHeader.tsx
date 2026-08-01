export function SectionHeader({
  eyebrow,
  title,
  description
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6 rounded-lg border border-line bg-white/[0.03] p-5 backdrop-blur-xl">
      <p className="text-xs font-semibold uppercase tracking-[0.26em] text-mint">{eyebrow}</p>
      <h1 className="shine-text mt-2 text-3xl font-black tracking-tight sm:text-4xl">{title}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">{description}</p>
    </div>
  );
}
