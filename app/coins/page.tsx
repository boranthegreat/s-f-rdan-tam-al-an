import type { Metadata } from "next";
import { CoinPanel } from "@/components/CoinPanel";
import { CoinTrendPanel } from "@/components/CoinTrendPanel";

export const metadata: Metadata = {
  title: "Coin Takip",
  description: "BTC, ETH, SOL, BNB, XRP ve TRX fiyatlarını, hacmi ve piyasa değerini takip et."
};

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
