import type { Metadata } from "next";
import { getRequestLocale } from "@/lib/server/requestLocale";
import { CoinPanel } from "@/components/CoinPanel";
import { CoinTrendPanel } from "@/components/CoinTrendPanel";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const values = {
    tr: ["Coin Takip", "BTC, ETH, SOL, BNB, XRP ve TRX fiyatlarını, hacmi ve piyasa değerini takip et."],
    en: ["Crypto Tracking", "Track BTC, ETH, SOL, BNB, XRP and TRX prices, volume and market capitalization."],
    el: ["Παρακολούθηση Κρυπτονομισμάτων", "Παρακολούθησε τιμές, όγκο και κεφαλαιοποίηση αγοράς για BTC, ETH, SOL, BNB, XRP και TRX."]
  } as const;
  return { title: values[locale][0], description: values[locale][1] };
}

export default function CoinsPage() {
  return (
    <div>
      <div className="mb-6 rounded-lg border border-line bg-white/[0.03] p-5 text-sm leading-6 text-slate-400 backdrop-blur-xl">
        BTC, ETH, SOL, BNB, XRP ve TRX için fiyat, 24 saatlik değişim, hacim ve market cap verilerini takip et.
      </div>
      <CoinPanel />
      <div className="mt-8">
        <CoinTrendPanel />
      </div>
    </div>
  );
}
