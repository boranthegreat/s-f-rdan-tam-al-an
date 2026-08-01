import type { Metadata } from "next";
import { getRequestLocale } from "@/lib/server/requestLocale";
import { DashboardOverview } from "@/components/DashboardOverview";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const values = {
    tr: ["Ana Panel", "Döviz, coin, altın, hava durumu ve piyasa özetlerini tek ekranda takip et."],
    en: ["Dashboard", "Track currencies, crypto, gold, weather and market summaries on one screen."],
    el: ["Πίνακας Ελέγχου", "Παρακολούθησε ισοτιμίες, κρυπτονομίσματα, χρυσό, καιρό και σύνοψη αγορών σε μία οθόνη."]
  } as const;
  return { title: values[locale][0], description: values[locale][1] };
}

export default function HomePage() {
  return <DashboardOverview />;
}
