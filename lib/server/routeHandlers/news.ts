import { NextResponse } from "next/server";
import type { MarketNewsItem } from "@/types";

const queries = {
  tr: {
    sourceLanguage: "turkish",
    crypto: "(bitcoin OR ethereum OR kripto OR kripto para)",
    forex: "(döviz OR dolar OR euro OR kur piyasası)",
    economy: "(enflasyon OR faiz OR merkez bankası OR ekonomi)",
    world: "(küresel piyasalar OR dünya ekonomisi OR finans piyasaları)"
  },
  en: {
    sourceLanguage: "english",
    crypto: "(bitcoin OR ethereum OR cryptocurrency OR crypto)",
    forex: "(forex OR currency markets OR dollar OR euro)",
    economy: "(inflation OR interest rates OR central bank OR economy)",
    world: "(global markets OR world economy OR financial markets)"
  },
  el: {
    sourceLanguage: "greek",
    crypto: "(bitcoin OR ethereum OR κρυπτονόμισμα OR κρυπτονομίσματα)",
    forex: "(συνάλλαγμα OR δολάριο OR ευρώ OR ισοτιμίες)",
    economy: "(πληθωρισμός OR επιτόκια OR κεντρική τράπεζα OR οικονομία)",
    world: "(παγκόσμιες αγορές OR παγκόσμια οικονομία OR χρηματοπιστωτικές αγορές)"
  }
} as const;

type Locale = keyof typeof queries;
type Category = Exclude<keyof (typeof queries)["en"], "sourceLanguage">;

type GdeltArticle = {
  url?: string;
  title?: string;
  seendate?: string;
  socialimage?: string;
  domain?: string;
};

function isLocale(value: string | null): value is Locale {
  return value === "tr" || value === "en" || value === "el";
}

function parseDate(value?: string) {
  if (!value) return new Date().toISOString();
  const match = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/);
  if (!match) {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
  }
  const [, y, m, d, hh, mm, ss] = match;
  return `${y}-${m}-${d}T${hh}:${mm}:${ss}Z`;
}


function safeWebUrl(value?: string) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

function fallbackTitle(locale: Locale) {
  if (locale === "en") return "The live news service is temporarily unavailable";
  if (locale === "el") return "Η υπηρεσία ζωντανών ειδήσεων είναι προσωρινά μη διαθέσιμη";
  return "Canlı haber servisine geçici olarak ulaşılamıyor";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawLocale = searchParams.get("lang");
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "tr";
  const rawCategory = searchParams.get("category") ?? "economy";
  const category: Category = ["crypto", "forex", "economy", "world"].includes(rawCategory)
    ? (rawCategory as Category)
    : "economy";
  const config = queries[locale];
  const url = new URL("https://api.gdeltproject.org/api/v2/doc/doc");
  url.searchParams.set("query", `${config[category]} sourcelang:${config.sourceLanguage}`);
  url.searchParams.set("mode", "ArtList");
  url.searchParams.set("format", "json");
  url.searchParams.set("maxrecords", "18");
  url.searchParams.set("sort", "DateDesc");
  url.searchParams.set("timespan", "7d");

  try {
    const response = await fetch(url, { next: { revalidate: 900 }, headers: { accept: "application/json" } });
    if (!response.ok) throw new Error("GDELT unavailable");
    const data = (await response.json()) as { articles?: GdeltArticle[] };
    const seen = new Set<string>();
    const items: MarketNewsItem[] = [];
    for (const article of data.articles ?? []) {
      if (!article.title) continue;
      const articleUrl = safeWebUrl(article.url);
      if (!articleUrl) continue;
      const key = article.title.toLocaleLowerCase(locale === "el" ? "el" : locale === "tr" ? "tr" : "en");
      if (seen.has(key)) continue;
      seen.add(key);
      const imageUrl = safeWebUrl(article.socialimage);
      items.push({
        id: `${locale}-${category}-${items.length}-${article.seendate ?? "now"}`,
        title: article.title,
        url: articleUrl.toString(),
        source: article.domain ?? articleUrl.hostname,
        publishedAt: parseDate(article.seendate),
        image: imageUrl?.toString(),
        category
      });
      if (items.length >= 12) break;
    }
    if (!items.length) throw new Error("No localized GDELT results");
    return NextResponse.json({ items, live: true, provider: "GDELT", locale });
  } catch {
    const items: MarketNewsItem[] = [
      {
        id: `fallback-market-${locale}`,
        title: fallbackTitle(locale),
        url: "https://www.gdeltproject.org/",
        source: "BoranTheGreat",
        publishedAt: new Date().toISOString(),
        category
      }
    ];
    return NextResponse.json({ items, live: false, provider: "fallback", locale }, { status: 200 });
  }
}
