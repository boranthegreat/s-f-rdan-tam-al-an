"use client";

import { useMemo, useSyncExternalStore } from "react";

export type UserSettings = {
  defaultCurrency: "USD" | "TRY" | "EUR";
  defaultCity: string;
  denseDashboard: boolean;
};

const STORAGE_KEY = "boranthegreat:user-settings";
const EVENT_NAME = "boranthegreat:user-settings-updated";
const defaultSettings: UserSettings = {
  defaultCurrency: "TRY",
  defaultCity: "Istanbul",
  denseDashboard: false
};

function readSettings(): UserSettings {
  if (typeof window === "undefined") {
    return defaultSettings;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return defaultSettings;
  }

  try {
    return { ...defaultSettings, ...(JSON.parse(stored) as Partial<UserSettings>) };
  } catch {
    return defaultSettings;
  }
}

function writeSettings(settings: UserSettings) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  window.dispatchEvent(new Event(EVENT_NAME));
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(EVENT_NAME, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(EVENT_NAME, callback);
  };
}

export function useUserSettings() {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => JSON.stringify(readSettings()),
    () => JSON.stringify(defaultSettings)
  );
  const settings = useMemo(() => JSON.parse(snapshot) as UserSettings, [snapshot]);

  function updateSettings(nextSettings: Partial<UserSettings>) {
    writeSettings({ ...readSettings(), ...nextSettings });
  }

  return { settings, updateSettings };
}
