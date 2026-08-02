import { NextResponse } from "next/server";
import { trackedCoinIds } from "@/data/coins";
import { fallbackCoinMarkets } from "@/data/fallbackCoins";
import type { CoinDetail } from "@/types";

const COINGECKO_URL = "https://api.coingecko.com/api/v3";

type CoinGeckoDetail = {
  id: string;
  symbol: string;
  name: string;
  image?: { large?: string };
  description?: Record<string, string | undefined>;
  links?: { homepage?: string[] };
  market_data?: {
    current_price?: { usd?: number };
    market_cap?: { usd?: number };
    total_volume?: { usd?: number };
    high_24h?: { usd?: number };
    low_24h?: { usd?: number };
    ath?: { usd?: number };
    circulating_supply?: number;
    total_supply?: number | null;
    price_change_percentage_24h?: number;
    price_change_percentage_7d?: number;
    price_change_percentage_30d?: number;
  };
  last_updated?: string;
};

type MarketChart = { prices?: Array<[number, number]> };

function cleanDescription(value = "") {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 900);
}

function cleanWebUrl(value?: string) {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const requestedLanguage = new URL(request.url).searchParams.get("lang");
  const language = requestedLanguage === "tr" || requestedLanguage === "el" ? requestedLanguage : "en";
  if (!trackedCoinIds.includes(id)) {
    return NextResponse.json({ message: "Coin bulunamadı." }, { status: 404 });
  }

  try {
    const [detailResponse, chartResponse, dayChartResponse] = await Promise.all([
      fetch(`${COINGECKO_URL}/coins/${id}?localization=true&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`, {
        next: { revalidate: 300 },
        headers: { accept: "application/json" }
      }),
      fetch(`${COINGECKO_URL}/coins/${id}/market_chart?vs_currency=usd&days=365&interval=daily`, {
        next: { revalidate: 900 },
        headers: { accept: "application/json" }
      }),
      fetch(`${COINGECKO_URL}/coins/${id}/market_chart?vs_currency=usd&days=1`, {
        next: { revalidate: 300 },
        headers: { accept: "application/json" }
      })
    ]);

    if (!detailResponse.ok || !chartResponse.ok) throw new Error("CoinGecko unavailable");
    const detail = (await detailResponse.json()) as CoinGeckoDetail;
    const chart = (await chartResponse.json()) as MarketChart;
    const dayChart = dayChartResponse.ok ? (await dayChartResponse.json()) as MarketChart : { prices: chart.prices?.slice(-2) };
    const market = detail.market_data ?? {};
    const result: CoinDetail = {
      id: detail.id,
      symbol: detail.symbol.toUpperCase(),
      name: detail.name,
      image: detail.image?.large ?? "",
      description: cleanDescription(detail.description?.[language] || detail.description?.en),
      homepage: cleanWebUrl(detail.links?.homepage?.find(Boolean)),
      currentPrice: market.current_price?.usd ?? 0,
      marketCap: market.market_cap?.usd ?? 0,
      totalVolume: market.total_volume?.usd ?? 0,
      high24h: market.high_24h?.usd ?? 0,
      low24h: market.low_24h?.usd ?? 0,
      ath: market.ath?.usd ?? 0,
      circulatingSupply: market.circulating_supply ?? 0,
      totalSupply: market.total_supply ?? null,
      change24h: market.price_change_percentage_24h ?? 0,
      change7d: market.price_change_percentage_7d ?? 0,
      change30d: market.price_change_percentage_30d ?? 0,
      lastUpdated: detail.last_updated ?? new Date().toISOString(),
      history: (chart.prices ?? []).map(([timestamp, value]) => ({ date: new Date(timestamp).toISOString().slice(0, 10), value })),
      history24h: (dayChart.prices ?? []).map(([timestamp, value]) => ({ date: new Date(timestamp).toISOString(), value }))
    };
    return NextResponse.json(result);
  } catch {
    const fallback = fallbackCoinMarkets.find((coin) => coin.id === id)!;
    const source = (fallback.sparkline_in_7d?.price ?? [fallback.current_price]).filter((value) => Number.isFinite(value) && value > 0);
    const safeSource = source.length ? source : [fallback.current_price];
    const history = safeSource.map((price, index) => {
      const date = new Date(Date.now() - ((safeSource.length - 1 - index) / Math.max(safeSource.length - 1, 1)) * 7 * 24 * 60 * 60 * 1000);
      return { date: date.toISOString(), value: price };
    });
    const high = Math.max(...safeSource);
    const low = Math.min(...safeSource);
    const result: CoinDetail = {
      id: fallback.id,
      symbol: fallback.symbol.toUpperCase(),
      name: fallback.name,
      image: fallback.image,
      description: language === "en"
        ? "Live detail data is temporarily unavailable, so basic market data is shown."
        : language === "el"
          ? "Τα λεπτομερή δεδομένα σε πραγματικό χρόνο είναι προσωρινά μη διαθέσιμα, επομένως εμφανίζονται βασικά δεδομένα αγοράς."
          : "Canlı detay servisi geçici olarak kullanılamadığı için temel piyasa verileri gösteriliyor.",
      currentPrice: fallback.current_price,
      marketCap: fallback.market_cap,
      totalVolume: fallback.total_volume,
      high24h: high,
      low24h: low,
      ath: 0,
      circulatingSupply: 0,
      totalSupply: null,
      change24h: fallback.price_change_percentage_24h,
      change7d: 0,
      change30d: 0,
      lastUpdated: new Date().toISOString(),
      history,
      history24h: history.slice(-24)
    };
    return NextResponse.json(result, { headers: { "x-boranthegreat-fallback": "static" } });
  }
}
