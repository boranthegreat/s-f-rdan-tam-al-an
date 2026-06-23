"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { FavoriteItem } from "@/types";

const STORAGE_KEY = "boranthegreat:favorites";
const FAVORITES_EVENT = "boranthegreat:favorites-updated";

function readFavorites(): FavoriteItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return [];
  }

  try {
    return JSON.parse(stored) as FavoriteItem[];
  } catch {
    return [];
  }
}

function writeFavorites(favorites: FavoriteItem[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  window.dispatchEvent(new Event(FAVORITES_EVENT));
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(FAVORITES_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(FAVORITES_EVENT, callback);
  };
}

export function useFavorites() {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => JSON.stringify(readFavorites()),
    () => "[]"
  );
  const favorites = useMemo(() => JSON.parse(snapshot) as FavoriteItem[], [snapshot]);

  const ids = useMemo(() => new Set(favorites.map((item) => item.id)), [favorites]);

  function toggleFavorite(item: FavoriteItem) {
    const current = readFavorites();
    writeFavorites(
      current.some((favorite) => favorite.id === item.id)
        ? current.filter((favorite) => favorite.id !== item.id)
        : [...current, item]
    );
  }

  function clearFavorites() {
    writeFavorites([]);
  }

  return {
    favorites,
    isFavorite: (id: string) => ids.has(id),
    toggleFavorite,
    clearFavorites
  };
}
