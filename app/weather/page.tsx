import type { Metadata } from "next";
import { SectionHeader } from "@/components/SectionHeader";
import { WeatherPanel } from "@/components/WeatherPanel";

export const metadata: Metadata = {
  title: "Dünya Hava Durumu",
  description: "Dünya başkentleri ve şehirleri için sıcaklık, rüzgar, nem, yağış ihtimali ve 7 günlük tahmini izle."
};

export default function WeatherPage() {
  return (
    <div>
      <SectionHeader
        eyebrow="Hava Radarı"
        title="Dünya Hava Durumu"
        description="Dünya genelinde şehir ara; anlık sıcaklık, rüzgar, nem, yağış ihtimali ve 7 günlük tahmini tek panelden gör."
      />
      <WeatherPanel />
    </div>
  );
}
