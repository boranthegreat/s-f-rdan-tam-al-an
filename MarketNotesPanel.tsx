"use client";

import { useState } from "react";
import { useMarketNotes } from "@/lib/useMarketNotes";

export function MarketNotesPanel({ compact = false }: { compact?: boolean }) {
  const { notes, addNote, removeNote } = useMarketNotes();
  const [text, setText] = useState("");
  const visibleNotes = compact ? notes.slice(0, 2) : notes;

  function handleAddNote() {
    addNote(text);
    setText("");
  }

  return (
    <div className="space-y-4">
      {!compact ? (
        <div className="glass-card grid gap-3 p-5 md:grid-cols-[1fr_auto]">
          <input
            className="premium-input"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Piyasa notu ekle: Örnek BTC direnç seviyesi..."
          />
          <button className="premium-button" onClick={handleAddNote}>
            Not ekle
          </button>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {visibleNotes.map((note) => (
          <div key={note.id} className="glass-card p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-mint">Kişisel not</p>
            <p className="mt-3 text-sm leading-6 text-slate-200">{note.text}</p>
            <div className="mt-4 flex items-center justify-between gap-3 text-xs text-slate-500">
              <span>{new Date(note.createdAt).toLocaleString("tr-TR")}</span>
              <button className="font-semibold text-rose-300" onClick={() => removeNote(note.id)}>
                Sil
              </button>
            </div>
          </div>
        ))}
        {visibleNotes.length === 0 ? (
          <div className="glass-card p-5 text-sm text-slate-400">
            Henüz not yok. Piyasa fikirlerini ve takip seviyelerini buraya yazabilirsin.
          </div>
        ) : null}
      </div>
    </div>
  );
}
