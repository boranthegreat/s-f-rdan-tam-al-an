"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BellRing, Check, ChevronRight, Copy, Target } from "lucide-react";
import { useMemo, useState } from "react";
import { getLocaleFromPath, localizedHref } from "@/components/enhancements/locale";

type AssetType = "coin" | "fx" | "gold";
type Direction = "above" | "below";

const copy = {
  tr: {
    title: "Kolay Alarm Sihirbazı",
    description: "Üç adımda alarm taslağını hazırla, sonra mevcut alarm ekranında son kontrolü yap.",
    step1: "1. Varlık",
    step2: "2. Koşul",
    step3: "3. Hedef",
    coin: "Kripto",
    fx: "Döviz",
    gold: "Altın",
    symbol: "Sembol",
    above: "Bu fiyatın üstüne çıkınca",
    below: "Bu fiyatın altına düşünce",
    target: "Hedef fiyat",
    note: "Not (isteğe bağlı)",
    notePlaceholder: "Örn. alım fırsatını kontrol et",
    save: "Taslağı kaydet",
    saved: "Taslak kaydedildi",
    open: "Alarm ekranını aç",
    copy: "Özeti kopyala",
    copied: "Kopyalandı",
    summary: "Alarm özeti",
    invalid: "Geçerli bir hedef fiyat gir.",
    draftInfo: "Taslak bu cihazda saklanır. Alarmı gerçekten etkinleştirmek için alarm ekranında eklemen gerekir."
  },
  en: {
    title: "Easy Alert Wizard",
    description: "Prepare an alert draft in three steps, then review it on the existing alerts screen.",
    step1: "1. Asset",
    step2: "2. Condition",
    step3: "3. Target",
    coin: "Crypto",
    fx: "FX",
    gold: "Gold",
    symbol: "Symbol",
    above: "When price rises above",
    below: "When price falls below",
    target: "Target price",
    note: "Note (optional)",
    notePlaceholder: "Example: review a buying opportunity",
    save: "Save draft",
    saved: "Draft saved",
    open: "Open alerts",
    copy: "Copy summary",
    copied: "Copied",
    summary: "Alert summary",
    invalid: "Enter a valid target price.",
    draftInfo: "The draft is stored on this device. Add it on the alerts screen to actually activate the alert."
  },
  el: {
    title: "Εύκολος οδηγός ειδοποίησης",
    description: "Ετοίμασε ένα προσχέδιο ειδοποίησης σε τρία βήματα και έλεγξέ το στη σελίδα ειδοποιήσεων.",
    step1: "1. Περιουσιακό στοιχείο",
    step2: "2. Συνθήκη",
    step3: "3. Στόχος",
    coin: "Κρυπτονομίσματα",
    fx: "Συνάλλαγμα",
    gold: "Χρυσός",
    symbol: "Σύμβολο",
    above: "Όταν η τιμή ανέβει πάνω από",
    below: "Όταν η τιμή πέσει κάτω από",
    target: "Τιμή στόχος",
    note: "Σημείωση (προαιρετικά)",
    notePlaceholder: "Παράδειγμα: έλεγχος ευκαιρίας αγοράς",
    save: "Αποθήκευση προσχεδίου",
    saved: "Το προσχέδιο αποθηκεύτηκε",
    open: "Άνοιγμα ειδοποιήσεων",
    copy: "Αντιγραφή σύνοψης",
    copied: "Αντιγράφηκε",
    summary: "Σύνοψη ειδοποίησης",
    invalid: "Βάλε έγκυρη τιμή στόχο.",
    draftInfo: "Το προσχέδιο αποθηκεύεται σε αυτή τη συσκευή. Για ενεργοποίηση, πρόσθεσέ το στη σελίδα ειδοποιήσεων."
  }
} as const;

const symbols: Record<AssetType, string[]> = {
  coin: ["BTC", "ETH", "SOL", "BNB", "XRP", "TRX"],
  fx: ["USD/TRY", "EUR/TRY", "GBP/TRY", "EUR/USD"],
  gold: ["GRAM ALTIN", "ONS ALTIN"]
};

export function AlertWizard() {
  const pathname = usePathname();
  const locale = getLocaleFromPath(pathname);
  const t = copy[locale];
  const [assetType, setAssetType] = useState<AssetType>("coin");
  const [symbol, setSymbol] = useState("BTC");
  const [direction, setDirection] = useState<Direction>("above");
  const [target, setTarget] = useState(0);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "saved" | "copied" | "invalid">("idle");

  const summary = useMemo(() => {
    const condition = direction === "above" ? t.above : t.below;
    return `${symbol} · ${condition} ${target || "—"}${note ? ` · ${note}` : ""}`;
  }, [direction, note, symbol, t, target]);

  const changeType = (type: AssetType) => {
    setAssetType(type);
    setSymbol(symbols[type][0]);
    setStatus("idle");
  };

  const saveDraft = () => {
    if (!Number.isFinite(target) || target <= 0) {
      setStatus("invalid");
      return;
    }
    try {
      window.localStorage.setItem("btg_alert_wizard_draft_v1", JSON.stringify({ assetType, symbol, direction, target, note, createdAt: new Date().toISOString() }));
    } catch {
      // The summary remains usable even when browser storage is unavailable.
    }
    setStatus("saved");
  };

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setStatus("copied");
    } catch {
      setStatus("idle");
    }
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/45 p-5 shadow-card sm:p-7">
      <div className="flex items-start gap-3">
        <span className="rounded-2xl border border-mint/20 bg-mint/10 p-3 text-mint"><BellRing className="h-6 w-6" /></span>
        <div>
          <h2 className="text-2xl font-black text-white">{t.title}</h2>
          <p className="mt-2 text-sm leading-7 text-slate-400">{t.description}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-mint">{t.step1}</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {(["coin", "fx", "gold"] as AssetType[]).map((type) => (
              <button key={type} type="button" onClick={() => changeType(type)} className={`rounded-xl border px-2 py-2 text-xs font-bold transition ${assetType === type ? "border-mint/40 bg-mint/15 text-mint" : "border-white/10 bg-slate-950 text-slate-400"}`}>
                {t[type]}
              </button>
            ))}
          </div>
          <label className="mt-4 block text-sm font-semibold text-slate-300">
            {t.symbol}
            <select value={symbol} onChange={(event) => setSymbol(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-white outline-none focus:border-mint/60">
              {symbols[assetType].map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-mint">{t.step2}</p>
          <div className="mt-3 space-y-2">
            {(["above", "below"] as Direction[]).map((item) => (
              <button key={item} type="button" onClick={() => setDirection(item)} className={`flex w-full items-center justify-between rounded-xl border px-3 py-3 text-left text-sm font-bold transition ${direction === item ? "border-mint/40 bg-mint/15 text-mint" : "border-white/10 bg-slate-950 text-slate-400"}`}>
                {t[item]}{direction === item ? <Check className="h-4 w-4" /> : null}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-mint">{t.step3}</p>
          <label className="mt-3 block text-sm font-semibold text-slate-300">
            {t.target}
            <input type="number" min="0" step="any" value={target || ""} onChange={(event) => setTarget(Number(event.target.value))} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-white outline-none focus:border-mint/60" />
          </label>
          <label className="mt-3 block text-sm font-semibold text-slate-300">
            {t.note}
            <input value={note} onChange={(event) => setNote(event.target.value)} placeholder={t.notePlaceholder} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-white outline-none placeholder:text-slate-600 focus:border-mint/60" />
          </label>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-mint/15 bg-mint/[0.06] p-4">
        <div className="flex items-center gap-2 text-mint"><Target className="h-4 w-4" /><p className="text-xs font-black uppercase tracking-[0.18em]">{t.summary}</p></div>
        <p className="mt-2 text-sm font-bold text-white">{summary}</p>
        <p className="mt-2 text-xs leading-5 text-slate-400">{t.draftInfo}</p>
      </div>

      {status === "invalid" ? <p className="mt-3 text-sm font-bold text-rose-300">{t.invalid}</p> : null}
      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button type="button" onClick={saveDraft} className="inline-flex items-center justify-center gap-2 rounded-xl bg-mint px-4 py-3 font-black text-slate-950 transition hover:brightness-110">
          {status === "saved" ? <Check className="h-4 w-4" /> : <BellRing className="h-4 w-4" />}{status === "saved" ? t.saved : t.save}
        </button>
        <button type="button" onClick={() => void copySummary()} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-bold text-white transition hover:border-mint/30 hover:text-mint">
          {status === "copied" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{status === "copied" ? t.copied : t.copy}
        </button>
        <Link href={`${localizedHref(pathname, "/alerts")}?draft=1`} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-bold text-white transition hover:border-mint/30 hover:text-mint">
          {t.open}<ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
