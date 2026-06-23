import type { GoldRate } from "@/types";
import { fetchJson } from "./http";

export async function getGoldRate(): Promise<GoldRate> {
  return fetchJson<GoldRate>("/api/gold", "Altin kuru alinamadi.");
}
