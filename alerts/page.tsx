import { AlertsPanel } from "@/components/AlertsPanel";
import { SectionHeader } from "@/components/SectionHeader";

export default function AlertsPage() {
  return (
    <div>
      <SectionHeader
        eyebrow="Fiyat Alarmları"
        title="Fiyat Alarmları"
        description="Coin veya döviz için hedef fiyat belirle; yerel alarm paneli anlık durumu kontrol eder."
      />
      <AlertsPanel />
    </div>
  );
}
