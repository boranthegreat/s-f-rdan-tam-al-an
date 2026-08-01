import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n";
import { trackedCoinIds } from "@/data/coins";
import { trackedCurrencies } from "@/data/currencies";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://boranthegreat.xyz").replace(/\/$/, "");

const routes = [
  "",
  "/currency",
  "/coins",
  "/weather",
  "/favorites",
  "/portfolio",
  "/alerts",
  "/news",
  "/search",
  "/settings"
];

function languageAlternates(route: string) {
  return {
    ...Object.fromEntries(locales.map((locale) => [locale, `${siteUrl}/${locale}${route}`])),
    "x-default": `${siteUrl}/tr${route}`
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticEntries = locales.flatMap((locale) =>
    routes.map((route) => ({
      url: `${siteUrl}/${locale}${route}`,
      lastModified: now,
      changeFrequency: route === "" ? ("daily" as const) : ("weekly" as const),
      priority: route === "" ? 1 : 0.75,
      alternates: { languages: languageAlternates(route) }
    }))
  );

  const coinEntries = locales.flatMap((locale) =>
    trackedCoinIds.map((id) => {
      const route = `/coins/${id}`;
      return {
        url: `${siteUrl}/${locale}${route}`,
        lastModified: now,
        changeFrequency: "daily" as const,
        priority: 0.7,
        alternates: { languages: languageAlternates(route) }
      };
    })
  );

  const currencyEntries = locales.flatMap((locale) =>
    trackedCurrencies.map(({ code }) => {
      const route = `/currency/${code.toLowerCase()}`;
      return {
        url: `${siteUrl}/${locale}${route}`,
        lastModified: now,
        changeFrequency: "daily" as const,
        priority: 0.65,
        alternates: { languages: languageAlternates(route) }
      };
    })
  );

  return [...staticEntries, ...coinEntries, ...currencyEntries];
}
