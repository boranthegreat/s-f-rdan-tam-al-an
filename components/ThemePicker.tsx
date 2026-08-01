"use client";

import clsx from "clsx";
import { Check, ChevronDown, Palette } from "lucide-react";
import { useEffect, useState } from "react";
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

function ThemeOption({ item, active, onSelect }: { item: ThemeMode; active: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={clsx(
        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition",
        active ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
      )}
    >
      <span className={clsx("h-4 w-4 rounded-full bg-gradient-to-br shadow-[0_0_12px_currentColor]", swatches[item])} />
      <span>{labels[item]}</span>
      {active ? <Check className="ml-auto h-4 w-4 text-mint" /> : null}
    </button>
  );
}

export function ThemePicker({ expanded = false }: { expanded?: boolean }) {
  const { theme, updateTheme } = useThemeMode();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (expanded) return;
    const close = (event: PointerEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest("[data-theme-picker]")) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [expanded]);

  if (expanded) {
    return (
      <div className="grid gap-2 sm:grid-cols-2">
        {themes.map((item) => (
          <ThemeOption key={item} item={item} active={theme === item} onSelect={() => updateTheme(item)} />
        ))}
      </div>
    );
  }

  return (
    <div className="relative" data-theme-picker>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-10 items-center gap-2 rounded-xl border border-line bg-white/5 px-3 text-xs font-bold text-slate-200 transition hover:border-mint/35 hover:bg-white/10"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Palette className="h-4 w-4 text-mint" />
        <span>Tema</span>
        <span className={clsx("h-3 w-3 rounded-full bg-gradient-to-br", swatches[theme])} />
        <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
      </button>
      {open ? (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-48 rounded-2xl border border-line bg-slate-950/95 p-2 shadow-2xl backdrop-blur-xl" role="menu">
          {themes.map((item) => (
            <ThemeOption
              key={item}
              item={item}
              active={theme === item}
              onSelect={() => {
                updateTheme(item);
                setOpen(false);
              }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
