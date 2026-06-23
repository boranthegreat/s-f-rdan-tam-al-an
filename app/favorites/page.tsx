import { FavoritesPanel } from "@/components/FavoritesPanel";
import { SectionHeader } from "@/components/SectionHeader";

export default function FavoritesPage() {
  return (
    <div>
      <SectionHeader
        eyebrow="Favoriler"
        title="Favoriler"
        description="LocalStorage üzerinde saklanan döviz, coin ve şehir favorilerini buradan yönet."
      />
      <FavoritesPanel />
    </div>
  );
}
