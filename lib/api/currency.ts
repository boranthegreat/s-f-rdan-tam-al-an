import type { CurrencyRate, CurrencyTimePoint } from "@/types";
import { fetchJson } from "./http";

export async function getCurrencyRates(base = "USD"): Promise<CurrencyRate[]> {
  return fetchJson<CurrencyRate[]>(`/api/currency/rates?base=${base}`, "Doviz verileri alinamadi.");
}

export async function convertCurrency(amount: number, from: string, to: string): Promise<number> {
  const data = await fetchJson<{ value: number }>(
    `/api/currency/convert?amount=${amount}&from=${from}&to=${to}`,
    "Doviz cevirisi yapilamadi."
  );

  return data.value;
}

export async function getCurrencyHistory(from = "USD", to = "EUR", days = 14): Promise<CurrencyTimePoint[]> {
  return fetchJson<CurrencyTimePoint[]>(
    `/api/currency/history?from=${from}&to=${to}&days=${days}`,
    "Doviz gecmis verileri alinamadi."
  );
}
