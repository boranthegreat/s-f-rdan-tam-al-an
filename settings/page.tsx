import { SectionHeader } from "@/components/SectionHeader";
import { SettingsPanel } from "@/components/SettingsPanel";

export default function SettingsPage() {
  return (
    <div>
      <SectionHeader
        eyebrow="Ayarlar"
        title="Kişisel Panel Ayarları"
        description="Tema, varsayılan para birimi, şehir ve panel tercihlerini yönet."
      />
      <SettingsPanel />
    </div>
  );
}
