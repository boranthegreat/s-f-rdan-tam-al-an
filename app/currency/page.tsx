import type { Metadata } from "next";
import { getRequestLocale } from "@/lib/server/requestLocale";
import { CurrencyPanel } from "@/components/CurrencyPanel";
import { GoldPanel } from "@/components/GoldPanel";
import { SectionHeader } from "@/components/SectionHeader";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const values = {
    tr: ["Döviz ve Altın Takip", "USD bazlı küresel kurları, altın fiyatlarını ve döviz çeviriciyi tek panelde takip et."],
    en: ["Currencies and Gold", "Track USD-based global exchange rates, gold prices and the currency converter in one dashboard."],
    el: ["Ισοτιμίες και Χρυσός", "Παρακολούθησε παγκόσμιες ισοτιμίες με βάση το USD, τιμές χρυσού και μετατροπέα νομισμάτων σε έναν πίνακα."]
  } as const;
  return { title: values[locale][0], description: values[locale][1] };
}

export default function CurrencyPage() {
  return (
    <div>
      <SectionHeader
        eyebrow="Döviz Masası"
        title="Döviz Takip"
        description="USD bazlı küresel kurları izle, favorilerine ekle ve anlık döviz çevirici ile para birimleri arasında hesaplama yap."
      />
      <div className="mb-8">
        <GoldPanel />
      </div>
      <CurrencyPanel />
    </div>
  );
}
