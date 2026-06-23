import type { Metadata } from "next";
import { DashboardOverview } from "@/components/DashboardOverview";

export const metadata: Metadata = {
  title: "Ana Panel",
  description: "Döviz, coin, altın, hava durumu ve piyasa özetlerini tek ekranda takip et."
};

export default function HomePage() {
  return <DashboardOverview />;
}
