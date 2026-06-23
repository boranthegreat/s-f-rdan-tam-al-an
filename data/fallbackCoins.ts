import type { CoinMarket } from "@/types";

export const fallbackCoinMarkets: CoinMarket[] = [
  {
    id: "bitcoin",
    symbol: "btc",
    name: "Bitcoin",
    image: "https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png",
    current_price: 0,
    market_cap: 0,
    total_volume: 0,
    price_change_percentage_24h: 0
  },
  {
    id: "ethereum",
    symbol: "eth",
    name: "Ethereum",
    image: "https://coin-images.coingecko.com/coins/images/279/large/ethereum.png",
    current_price: 0,
    market_cap: 0,
    total_volume: 0,
    price_change_percentage_24h: 0
  },
  {
    id: "solana",
    symbol: "sol",
    name: "Solana",
    image: "https://coin-images.coingecko.com/coins/images/4128/large/solana.png",
    current_price: 0,
    market_cap: 0,
    total_volume: 0,
    price_change_percentage_24h: 0
  },
  {
    id: "binancecoin",
    symbol: "bnb",
    name: "BNB",
    image: "https://coin-images.coingecko.com/coins/images/825/large/bnb-icon2_2x.png",
    current_price: 0,
    market_cap: 0,
    total_volume: 0,
    price_change_percentage_24h: 0
  },
  {
    id: "ripple",
    symbol: "xrp",
    name: "XRP",
    image: "https://coin-images.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png",
    current_price: 0,
    market_cap: 0,
    total_volume: 0,
    price_change_percentage_24h: 0
  },
  {
    id: "tron",
    symbol: "trx",
    name: "TRON",
    image: "https://coin-images.coingecko.com/coins/images/1094/large/tron-logo.png",
    current_price: 0,
    market_cap: 0,
    total_volume: 0,
    price_change_percentage_24h: 0
  }
];
