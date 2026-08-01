import { SearchCenter } from "@/components/SearchCenter";
import { SectionHeader } from "@/components/SectionHeader";

export default function SearchPage() {
  return (
    <div>
      <SectionHeader
        eyebrow="Arama"
        title="Arama Merkezi"
        description="Coin, döviz, altın, şehir ve site sayfalarını tek arama alanından bul."
      />
      <SearchCenter />
    </div>
  );
}
