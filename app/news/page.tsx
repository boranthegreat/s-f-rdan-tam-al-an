import { EconomicCalendar } from "@/components/EconomicCalendar";
import { MarketSummary } from "@/components/MarketSummary";
import { MarketNotesPanel } from "@/components/MarketNotesPanel";
import { NewsPanel } from "@/components/NewsPanel";
import { SectionHeader } from "@/components/SectionHeader";

export default function NewsPage() {
  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Piyasa Nabzi"
        title="Haberler ve Piyasa Özeti"
        description="Piyasa sinyallerini, ekonomi takvimini, kısa haber notlarını ve kendi takip notlarını tek ekranda gör."
      />
      <MarketSummary />
      <EconomicCalendar />
      <NewsPanel />
      <MarketNotesPanel />
    </div>
  );
}
