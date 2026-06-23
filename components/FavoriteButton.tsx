"use client";

import clsx from "clsx";
import { Heart } from "lucide-react";

export function FavoriteButton({
  label,
  isFavorite,
  onClick
}: {
  label: string;
  isFavorite: boolean;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className={clsx(
        "rounded-lg border p-2 transition hover:-translate-y-0.5 hover:shadow-[0_0_22px_rgba(251,113,133,0.16)]",
        isFavorite
          ? "border-rose-400/50 bg-rose-400/15 text-rose-300"
          : "border-line bg-white/5 text-slate-400 hover:text-white"
      )}
    >
      <Heart className="h-4 w-4" fill={isFavorite ? "currentColor" : "none"} />
    </button>
  );
}
