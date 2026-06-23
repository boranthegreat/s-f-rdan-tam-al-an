"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { PortfolioAsset } from "@/types";

const STORAGE_KEY = "boranthegreat:portfolio";
const EVENT_NAME = "boranthegreat:portfolio-updated";

function readPortfolio(): PortfolioAsset[] {
  if (typeof window === "undefined") {
    return [];
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return [];
  }

  try {
    return JSON.parse(stored) as PortfolioAsset[];
  } catch {
    return [];
  }
}

function writePortfolio(items: PortfolioAsset[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
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

export function usePortfolio() {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => JSON.stringify(readPortfolio()),
    () => "[]"
  );
  const assets = useMemo(() => JSON.parse(snapshot) as PortfolioAsset[], [snapshot]);

  function upsertAsset(asset: Omit<PortfolioAsset, "id">) {
    const id = `${asset.type}:${asset.symbol.toUpperCase()}`;
    const current = readPortfolio().filter((item) => item.id !== id);
    writePortfolio([...current, { ...asset, id, symbol: asset.symbol.toUpperCase() }]);
  }

  function removeAsset(id: string) {
    writePortfolio(readPortfolio().filter((item) => item.id !== id));
  }

  function clearPortfolio() {
    writePortfolio([]);
  }

  return { assets, upsertAsset, removeAsset, clearPortfolio };
}
