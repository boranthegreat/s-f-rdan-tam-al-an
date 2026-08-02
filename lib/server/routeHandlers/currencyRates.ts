import { NextResponse } from "next/server";
import { trackedCurrencies } from "@/data/currencies";

type LatestRatesResponse = {
  rates: Record<string, number>;
};

const FRANKFURTER_URL = "https://api.frankfurter.app";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const base = searchParams.get("base") ?? "USD";
  const symbols = trackedCurrencies
    .map((currency) => currency.code)
    .filter((code) => code !== base)
    .join(",");

  try {
    const response = await fetch(`${FRANKFURTER_URL}/latest?from=${base}&to=${symbols}`, {
      next: { revalidate: 120 }
    });

    if (!response.ok) {
      return NextResponse.json({ message: "Döviz verileri alınamadı." }, { status: response.status });
    }

    const data = (await response.json()) as LatestRatesResponse;
    const rates = trackedCurrencies
      .filter((currency) => currency.code !== base)
      .map((currency) => ({
        ...currency,
        rate: data.rates[currency.code]
      }));

    return NextResponse.json(rates);
  } catch {
    return NextResponse.json({ message: "Döviz servisine ulaşılamadı." }, { status: 502 });
  }
}
