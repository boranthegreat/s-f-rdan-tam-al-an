"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { PriceAlert } from "@/types";

const STORAGE_KEY = "boranthegreat:alerts";
const EVENT_NAME = "boranthegreat:alerts-updated";

function readAlerts(): PriceAlert[] {
  if (typeof window === "undefined") {
    return [];
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return [];
  }

  try {
    return JSON.parse(stored) as PriceAlert[];
  } catch {
    return [];
  }
}

function writeAlerts(alerts: PriceAlert[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
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

export function useAlerts() {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => JSON.stringify(readAlerts()),
    () => "[]"
  );
  const alerts = useMemo(() => JSON.parse(snapshot) as PriceAlert[], [snapshot]);

  function addAlert(alert: Omit<PriceAlert, "id" | "createdAt">) {
    writeAlerts([
      ...readAlerts(),
      {
        ...alert,
        id: crypto.randomUUID(),
        symbol: alert.symbol.toUpperCase(),
        createdAt: new Date().toISOString()
      }
    ]);
  }

  function removeAlert(id: string) {
    writeAlerts(readAlerts().filter((alert) => alert.id !== id));
  }

  return { alerts, addAlert, removeAlert };
}
