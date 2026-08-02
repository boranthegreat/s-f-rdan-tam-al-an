"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckCircle2, Cloud, ShieldCheck, Trash2 } from "lucide-react";
import { useState } from "react";
import { getLocaleFromPath, localizedHref } from "@/components/enhancements/locale";

const copy = {
  tr: {
    title: "Bu cihazdaki site verilerini temizle",
    description: "Favoriler, yerel portföy, alarm taslakları, tema, dil ve panel tercihleri bu tarayıcıdan kaldırılır.",
    button: "Yerel verileri temizle",
    done: "Yerel veriler temizlendi",
    cloudTitle: "Bulut verileri",
    cloudDescription: "Bu işlem Supabase hesabındaki senkronize verileri sunucudan silmez. Bulut verisi veya hesabın tamamen silinmesi için iletişim sayfasından talep gönder.",
    contact: "Silme talebi gönder"
  },
  en: {
    title: "Clear site data on this device",
    description: "Favorites, local portfolio, alert drafts, theme, language and dashboard preferences are removed from this browser.",
    button: "Clear local data",
    done: "Local data cleared",
    cloudTitle: "Cloud data",
    cloudDescription: "This action does not remove synchronized Supabase data from the server. Use the contact page to request deletion of cloud data or the whole account.",
    contact: "Send a deletion request"
  },
  el: {
    title: "Διαγραφή δεδομένων ιστοτόπου από τη συσκευή",
    description: "Αγαπημένα, τοπικό χαρτοφυλάκιο, προσχέδια ειδοποιήσεων, θέμα, γλώσσα και προτιμήσεις πίνακα αφαιρούνται από αυτόν τον browser.",
    button: "Διαγραφή τοπικών δεδομένων",
    done: "Τα τοπικά δεδομένα διαγράφηκαν",
    cloudTitle: "Δεδομένα cloud",
    cloudDescription: "Η ενέργεια δεν διαγράφει συγχρονισμένα δεδομένα Supabase από τον server. Χρησιμοποίησε τη σελίδα επικοινωνίας για αίτημα διαγραφής δεδομένων cloud ή λογαριασμού.",
    contact: "Αποστολή αιτήματος διαγραφής"
  }
} as const;

export function DataPrivacyControls() {
  const pathname = usePathname();
  const locale = getLocaleFromPath(pathname);
  const t = copy[locale];
  const [done, setDone] = useState(false);

  const clearLocalData = async () => {
    try { window.localStorage.clear(); } catch { /* Storage can be blocked by the browser. */ }
    try { window.sessionStorage.clear(); } catch { /* Storage can be blocked by the browser. */ }
    try {
      document.cookie.split(";").forEach((entry) => {
        const name = entry.split("=")[0]?.trim();
        if (name) document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
      });
    } catch {}
    if ("caches" in window) {
      try {
        const names = await window.caches.keys();
        await Promise.all(names.map((name) => window.caches.delete(name)));
      } catch {}
    }
    setDone(true);
  };

  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <article className="rounded-2xl border border-rose-300/20 bg-rose-300/[0.06] p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="rounded-xl bg-rose-300/10 p-2.5 text-rose-200"><Trash2 className="h-5 w-5" /></span>
          <div><h2 className="text-lg font-black text-white">{t.title}</h2><p className="mt-2 text-sm leading-7 text-slate-300">{t.description}</p></div>
        </div>
        <button type="button" onClick={() => void clearLocalData()} className="mt-5 inline-flex items-center gap-2 rounded-xl border border-rose-300/25 bg-rose-300/10 px-4 py-3 font-black text-rose-100 transition hover:bg-rose-300/15">
          {done ? <CheckCircle2 className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}{done ? t.done : t.button}
        </button>
      </article>
      <article className="rounded-2xl border border-mint/20 bg-mint/[0.06] p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="rounded-xl bg-mint/10 p-2.5 text-mint"><Cloud className="h-5 w-5" /></span>
          <div><h2 className="text-lg font-black text-white">{t.cloudTitle}</h2><p className="mt-2 text-sm leading-7 text-slate-300">{t.cloudDescription}</p></div>
        </div>
        <Link href={localizedHref(pathname, "/contact")} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-mint px-4 py-3 font-black text-slate-950 transition hover:brightness-110"><ShieldCheck className="h-4 w-4" />{t.contact}</Link>
      </article>
    </section>
  );
}
