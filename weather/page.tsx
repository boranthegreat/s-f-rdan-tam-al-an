import type { Metadata } from "next";
import { getRequestLocale } from "@/lib/server/requestLocale";
import { SectionHeader } from "@/components/SectionHeader";
import { WeatherPanel } from "@/components/WeatherPanel";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const values = {
    tr: ["Dünya Hava Durumu", "Dünya başkentleri ve şehirleri için sıcaklık, rüzgar, nem, yağış ihtimali ve 7 günlük tahmini izle."],
    en: ["World Weather", "Track temperature, wind, humidity, precipitation probability and 7-day forecasts for cities worldwide."],
    el: ["Παγκόσμιος Καιρός", "Παρακολούθησε θερμοκρασία, άνεμο, υγρασία, πιθανότητα βροχής και πρόγνωση 7 ημερών για πόλεις παγκοσμίως."]
  } as const;
  return { title: values[locale][0], description: values[locale][1] };
}

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
