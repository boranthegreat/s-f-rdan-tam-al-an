import { PortfolioPanel } from "@/components/PortfolioPanel";
import { SectionHeader } from "@/components/SectionHeader";

export default function PortfolioPage() {
  return (
    <div>
      <SectionHeader
        eyebrow="Portföy"
        title="Portföy Takibi"
        description="Coin ve döviz varlıklarını LocalStorage üzerinde sakla, toplam USD portföy değerini takip et."
      />
      <PortfolioPanel />
    </div>
  );
}
