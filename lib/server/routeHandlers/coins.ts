import { NextResponse } from "next/server";
import { trackedCoinIds } from "@/data/coins";
import { fallbackCoinMarkets } from "@/data/fallbackCoins";
import type { CoinMarket } from "@/types";

const COINGECKO_URL = "https://api.coingecko.com/api/v3";
const COINLORE_URL = "https://api.coinlore.net/api/tickers/?start=0&limit=100";

type CoinLoreResponse = {
  data: Array<{
    symbol: string;
    name: string;
    nameid: string;
    price_usd: string;
    percent_change_24h: string;
    volume24: number;
    market_cap_usd: string;
  }>;
};

const coinLoreSymbolById: Record<string, string> = {
  bitcoin: "BTC",
  ethereum: "ETH",
  solana: "SOL",
  binancecoin: "BNB",
  ripple: "XRP",
  tron: "TRX"
};

export async function GET() {
  const ids = trackedCoinIds.join(",");

  try {
    const response = await fetch(
      `${COINGECKO_URL}/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=20&page=1&sparkline=true&price_change_percentage=24h`,
      {
        next: { revalidate: 120 },
        headers: {
          accept: "application/json"
        }
      }
    );

    if (!response.ok) {
      throw new Error("CoinGecko status error");
    }

    return NextResponse.json(await response.json());
  } catch {
    try {
      const response = await fetch(COINLORE_URL, {
        next: { revalidate: 120 },
        headers: {
          accept: "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("CoinLore status error");
      }

      const data = (await response.json()) as CoinLoreResponse;
      const bySymbol = new Map(data.data.map((coin) => [coin.symbol.toUpperCase(), coin]));
      const markets: CoinMarket[] = trackedCoinIds.map((id) => {
        const fallback = fallbackCoinMarkets.find((coin) => coin.id === id);
        const coin = bySymbol.get(coinLoreSymbolById[id]);

        if (!coin || !fallback) {
          return fallback ?? fallbackCoinMarkets[0];
        }

        return {
          ...fallback,
          symbol: coin.symbol.toLowerCase(),
          name: coin.name,
          current_price: Number(coin.price_usd),
          market_cap: Number(coin.market_cap_usd),
          total_volume: Number(coin.volume24),
          price_change_percentage_24h: Number(coin.percent_change_24h)
        };
      });

      return NextResponse.json(markets, {
        headers: {
          "x-boranthegreat-fallback": "coinlore"
        }
      });
    } catch {
      return NextResponse.json(fallbackCoinMarkets, {
        headers: {
          "x-boranthegreat-fallback": "static"
        }
      });
    }
  }
}
