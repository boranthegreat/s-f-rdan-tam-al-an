"use client";

import clsx from "clsx";
import { themes, useThemeMode, type ThemeMode } from "@/lib/useThemeMode";

const labels: Record<ThemeMode, string> = {
  mint: "Mint",
  blue: "Mavi",
  purple: "Mor",
  gold: "Altın",
  rose: "Rose",
  white: "Beyaz",
  black: "Siyah"
};

const swatches: Record<ThemeMode, string> = {
  mint: "from-emerald-300 to-cyan-400",
  blue: "from-sky-300 to-blue-500",
  purple: "from-violet-300 to-fuchsia-500",
  gold: "from-amber-200 to-orange-500",
  rose: "from-rose-300 to-pink-600",
  white: "from-white to-slate-300",
  black: "from-slate-950 to-slate-500"
};

export function ThemePicker() {
  const { theme, updateTheme } = useThemeMode();

  return (
    <div className="flex flex-wrap gap-1 rounded-lg border border-line bg-white/5 p-1 shadow-[0_0_28px_rgba(2,6,23,0.25)]">
      {themes.map((item) => (
        <button
          key={item}
          onClick={() => updateTheme(item)}
          className={clsx(
            "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-semibold transition",
            theme === item ? "bg-white/15 text-white ring-1 ring-white/15" : "text-slate-400 hover:bg-white/10 hover:text-white"
          )}
          title={`${labels[item]} font ve renk modu`}
        >
          <span className={clsx("h-3 w-3 rounded-full bg-gradient-to-br shadow-[0_0_12px_currentColor]", swatches[item])} />
          {labels[item]}
        </button>
      ))}
    </div>
  );
}
