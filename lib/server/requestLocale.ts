import { headers } from "next/headers";
import { isLocale, type Locale } from "@/lib/i18n";

export async function getRequestLocale(): Promise<Locale> {
  const value = (await headers()).get("x-btg-locale");
  return isLocale(value) ? value : "tr";
}
