import clsx from "clsx";
import Link from "next/link";
import { FavoriteButton } from "@/components/FavoriteButton";

export function MetricCard({
  label,
  value,
  detail,
  tone = "neutral",
  isFavorite,
  onFavorite,
  onClick,
  href
}: {
  label: string;
  value: string;
  detail?: string;
  tone?: "positive" | "negative" | "neutral";
  isFavorite?: boolean;
  onFavorite?: () => void;
  onClick?: () => void;
  href?: string;
}) {
  return (
    <div
      className={clsx("glass-card group p-5", onClick && "cursor-pointer transition hover:-translate-y-1 hover:border-mint/30")}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(event) => {
        if (onClick && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          onClick();
        }
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-400 transition group-hover:text-mint">{label}</p>
          <p className="mt-3 text-2xl font-black text-white">{value}</p>
        </div>
        {onFavorite ? (
          <FavoriteButton label={`${label} favori`} isFavorite={Boolean(isFavorite)} onClick={onFavorite} />
        ) : null}
      </div>
      {detail ? (
        <p
          className={clsx(
            "mt-4 text-sm",
            tone === "positive" && "text-emerald-300",
            tone === "negative" && "text-rose-300",
            tone === "neutral" && "text-slate-400"
          )}
        >
          {detail}
        </p>
      ) : null}
      {href ? (
        <Link
          href={href}
          onClick={(event) => event.stopPropagation()}
          className="mt-4 block rounded-xl border border-mint/20 bg-mint/5 px-3 py-2 text-center text-xs font-bold text-mint transition hover:bg-mint/10"
        >
          Detay sayfasını aç
        </Link>
      ) : null}
    </div>
  );
}
