"use client";

import { useEffect, useState } from "react";

export const themes = ["mint", "blue", "purple", "gold", "rose", "white", "black"] as const;
export type ThemeMode = (typeof themes)[number];

export function useThemeMode() {
  const [theme, setTheme] = useState<ThemeMode>("mint");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = window.localStorage.getItem("boranthegreat:theme") as ThemeMode | null;
      if (stored && themes.includes(stored)) {
        setTheme(stored);
        document.documentElement.dataset.theme = stored;
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  function updateTheme(nextTheme: ThemeMode) {
    setTheme(nextTheme);
    window.localStorage.setItem("boranthegreat:theme", nextTheme);
    document.documentElement.dataset.theme = nextTheme;
  }

  return { theme, updateTheme };
}
