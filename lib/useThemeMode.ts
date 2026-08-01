"use client";

import { useCallback, useEffect, useState } from "react";

export const themes = ["mint", "blue", "purple", "gold", "rose", "white", "black"] as const;
export type ThemeMode = (typeof themes)[number];

const STORAGE_KEY = "boranthegreat:theme";
const EVENT_NAME = "boranthegreat:theme-updated";

function readTheme(): ThemeMode {
  if (typeof window === "undefined") return "mint";
  const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
  return stored && themes.includes(stored) ? stored : "mint";
}

export function useThemeMode() {
  const [theme, setTheme] = useState<ThemeMode>("mint");

  const applyStoredTheme = useCallback(() => {
    const nextTheme = readTheme();
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
  }, []);

  useEffect(() => {
    applyStoredTheme();
    window.addEventListener("storage", applyStoredTheme);
    window.addEventListener(EVENT_NAME, applyStoredTheme);
    return () => {
      window.removeEventListener("storage", applyStoredTheme);
      window.removeEventListener(EVENT_NAME, applyStoredTheme);
    };
  }, [applyStoredTheme]);

  function updateTheme(nextTheme: ThemeMode) {
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    window.dispatchEvent(new Event(EVENT_NAME));
  }

  return { theme, updateTheme };
}
