import type { CoinMarket } from "@/types";
import { fetchJson } from "./http";

export async function getCoinMarkets(): Promise<CoinMarket[]> {
  return fetchJson<CoinMarket[]>("/api/coins", "Coin piyasa verileri alinamadi.");
}
