"use client";

import { useMemo, useSyncExternalStore } from "react";

export type MarketNote = {
  id: string;
  text: string;
  createdAt: string;
};

const STORAGE_KEY = "boranthegreat:market-notes";
const EVENT_NAME = "boranthegreat:market-notes-updated";

function readNotes(): MarketNote[] {
  if (typeof window === "undefined") {
    return [];
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return [];
  }

  try {
    return JSON.parse(stored) as MarketNote[];
  } catch {
    return [];
  }
}

function writeNotes(notes: MarketNote[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
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

export function useMarketNotes() {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => JSON.stringify(readNotes()),
    () => "[]"
  );
  const notes = useMemo(() => JSON.parse(snapshot) as MarketNote[], [snapshot]);

  function addNote(text: string) {
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }

    writeNotes([
      {
        id: crypto.randomUUID(),
        text: trimmed,
        createdAt: new Date().toISOString()
      },
      ...readNotes()
    ]);
  }

  function removeNote(id: string) {
    writeNotes(readNotes().filter((note) => note.id !== id));
  }

  return { notes, addNote, removeNote };
}
