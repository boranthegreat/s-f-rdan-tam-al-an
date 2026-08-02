import { NextResponse } from "next/server";
import type { GoldRate } from "@/types";

const TROY_OUNCE_GRAMS = 31.1034768;
const FALLBACK_XAU_USD = 3350;
const FALLBACK_USD_TRY = 46.45;

type YahooChartResponse = {
  chart?: {
    result?: Array<{
      meta?: {
        regularMarketPrice?: number;
        previousClose?: number;
      };
    }>;
  };
};

type FrankfurterResponse = {
  rates: {
    TRY?: number;
  };
};

async function getGoldOunceUsd() {
  const response = await fetch("https://query1.finance.yahoo.com/v8/finance/chart/GC=F?range=1d&interval=1d", {
    next: { revalidate: 300 },
    headers: { accept: "application/json" }
  });

  if (!response.ok) {
    return FALLBACK_XAU_USD;
  }

  const data = (await response.json()) as YahooChartResponse;
  return data.chart?.result?.[0]?.meta?.regularMarketPrice ?? data.chart?.result?.[0]?.meta?.previousClose ?? FALLBACK_XAU_USD;
}

async function getUsdTry() {
  const response = await fetch("https://api.frankfurter.app/latest?from=USD&to=TRY", {
    next: { revalidate: 300 }
  });

  if (!response.ok) {
    return FALLBACK_USD_TRY;
  }

  const data = (await response.json()) as FrankfurterResponse;
  return data.rates.TRY ?? FALLBACK_USD_TRY;
}

export async function GET() {
  try {
    const [ounceUsd, usdTry] = await Promise.all([getGoldOunceUsd(), getUsdTry()]);
    const gramUsd = ounceUsd / TROY_OUNCE_GRAMS;
    const rate: GoldRate = {
      ounceUsd,
      gramUsd,
      gramTry: gramUsd * usdTry,
      source: "Yahoo Finance GC=F + Frankfurter USD/TRY",
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json(rate);
  } catch {
    const gramUsd = FALLBACK_XAU_USD / TROY_OUNCE_GRAMS;
    return NextResponse.json({
      ounceUsd: FALLBACK_XAU_USD,
      gramUsd,
      gramTry: gramUsd * FALLBACK_USD_TRY,
      source: "Yedek altın verisi",
      updatedAt: new Date().toISOString()
    } satisfies GoldRate);
  }
}
