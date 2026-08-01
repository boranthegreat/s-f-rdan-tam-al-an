import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CurrencyDetailPanel } from "@/components/CurrencyDetailPanel";
import { trackedCurrencies } from "@/data/currencies";
import { getRequestLocale } from "@/lib/server/requestLocale";

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code } = await params;
  const locale = await getRequestLocale();
  const symbol = code.toUpperCase();
  return locale === "en"
    ? { title: `${symbol} Exchange Rate Details`, description: `${symbol} rate, historical chart, portfolio and alert tools.` }
    : locale === "el"
      ? { title: `Λεπτομέρειες Ισοτιμίας ${symbol}`, description: `Ισοτιμία ${symbol}, ιστορικό γράφημα, χαρτοφυλάκιο και εργαλεία ειδοποιήσεων.` }
      : { title: `${symbol} Kur Detayı`, description: `${symbol} kuru, geçmiş grafik, portföy ve alarm araçları.` };
}

export default async function CurrencyDetailPage({ params }: { params: Promise<{ code: string }> }) {
  const { code: rawCode } = await params;
  const code = rawCode.toUpperCase();
  const currency = trackedCurrencies.find((item) => item.code === code);
  if (!currency) notFound();
  return <CurrencyDetailPanel code={currency.code} name={currency.name} />;
}
