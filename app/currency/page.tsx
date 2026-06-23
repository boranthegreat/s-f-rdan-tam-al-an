import type { Metadata } from "next";
import { CurrencyPanel } from "@/components/CurrencyPanel";
import { GoldPanel } from "@/components/GoldPanel";
import { SectionHeader } from "@/components/SectionHeader";

export const metadata: Metadata = {
  title: "Döviz ve Altın Takip",
  description: "USD bazlı küresel kurları, altın fiyatlarını ve döviz çeviriciyi tek panelde takip et."
};

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
