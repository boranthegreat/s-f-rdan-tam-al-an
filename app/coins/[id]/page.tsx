import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CoinDetailPanel } from "@/components/CoinDetailPanel";
import { trackedCoinIds } from "@/data/coins";
import { getRequestLocale } from "@/lib/server/requestLocale";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const locale = await getRequestLocale();
  const name = `${id.charAt(0).toUpperCase()}${id.slice(1)}`;
  return locale === "en"
    ? { title: `${name} Details`, description: `${name} price, chart, volume, market capitalization and alert tools.` }
    : locale === "el"
      ? { title: `Λεπτομέρειες ${name}`, description: `Τιμή, γράφημα, όγκος, κεφαλαιοποίηση αγοράς και εργαλεία ειδοποιήσεων για ${name}.` }
      : { title: `${name} Detay`, description: `${name} fiyatı, grafiği, hacmi, piyasa değeri ve alarm araçları.` };
}

export default async function CoinDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!trackedCoinIds.includes(id)) notFound();
  return <CoinDetailPanel id={id} />;
}
