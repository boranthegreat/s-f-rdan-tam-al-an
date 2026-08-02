"use client";

import { CheckCircle2, Clipboard, Trash2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getLocaleFromPath } from "@/components/enhancements/locale";

type Draft = { symbol?: string; direction?: "above" | "below"; target?: number; note?: string };

const copy = {
  tr: { title: "Hazırladığın alarm taslağı", above: "üstüne çıkınca", below: "altına düşünce", copy: "Özeti kopyala", copied: "Kopyalandı", clear: "Taslağı temizle", help: "Aşağıdaki değerleri alarm formuna girerek alarmı etkinleştir." },
  en: { title: "Your prepared alert draft", above: "rises above", below: "falls below", copy: "Copy summary", copied: "Copied", clear: "Clear draft", help: "Enter these values in the alert form to activate the alert." },
  el: { title: "Το προσχέδιο ειδοποίησης", above: "ανέβει πάνω από", below: "πέσει κάτω από", copy: "Αντιγραφή", copied: "Αντιγράφηκε", clear: "Διαγραφή", help: "Βάλε αυτές τις τιμές στη φόρμα ειδοποίησης για ενεργοποίηση." }
} as const;

export function AlertDraftBridge() {
  const pathname = usePathname();
  const locale = getLocaleFromPath(pathname);
  const t = copy[locale];
  const [draft, setDraft] = useState<Draft | null>(null);
  const [copied, setCopied] = useState(false);
  const isAlerts = pathname === `/${locale}/alerts` || pathname === "/alerts";

  useEffect(() => {
    if (!isAlerts) return;
    try {
      const stored = window.localStorage.getItem("btg_alert_wizard_draft_v1");
      if (stored) setDraft(JSON.parse(stored) as Draft);
    } catch {
      setDraft(null);
    }
  }, [isAlerts]);

  if (!isAlerts || !draft?.symbol || !draft.target) return null;
  const summary = `${draft.symbol} · ${draft.direction === "below" ? t.below : t.above} ${draft.target}${draft.note ? ` · ${draft.note}` : ""}`;

  const clear = () => {
    try { window.localStorage.removeItem("btg_alert_wizard_draft_v1"); } catch {}
    setDraft(null);
  };

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <section className="mt-6 rounded-2xl border border-mint/25 bg-mint/[0.07] p-4 sm:p-5" aria-live="polite">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-mint" />
        <div className="min-w-0 flex-1">
          <h2 className="font-black text-white">{t.title}</h2>
          <p className="mt-1 break-words text-sm font-bold text-mint">{summary}</p>
          <p className="mt-2 text-xs leading-5 text-slate-400">{t.help}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => void copySummary()} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white hover:text-mint"><Clipboard className="h-3.5 w-3.5" />{copied ? t.copied : t.copy}</button>
            <button type="button" onClick={clear} className="inline-flex items-center gap-2 rounded-xl border border-rose-300/20 bg-rose-300/10 px-3 py-2 text-xs font-bold text-rose-200"><Trash2 className="h-3.5 w-3.5" />{t.clear}</button>
          </div>
        </div>
      </div>
    </section>
  );
}
