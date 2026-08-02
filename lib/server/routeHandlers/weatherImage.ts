import { NextResponse } from "next/server";

type WikiSearchResponse = {
  query?: {
    pages?: Record<
      string,
      {
        title?: string;
        extract?: string;
        fullurl?: string;
        thumbnail?: {
          source?: string;
        };
      }
    >;
  };
};

type WikiPage = NonNullable<NonNullable<WikiSearchResponse["query"]>["pages"]>[string];

const TITLE_OVERRIDES: Record<string, string> = {
  "washington|united states": "Washington, D.C.",
  "new york|united states": "New York City",
  "kiev|ukraine": "Kyiv",
  "kyiv|ukraine": "Kyiv",
  "brasilia|brazil": "Brasilia",
  "bogota|colombia": "Bogota",
  "asuncion|paraguay": "Asuncion",
  "reykjavik|iceland": "Reykjavik",
  "male|maldives": "Male, Maldives"
};

const COUNTRY_ALIASES: Record<string, string[]> = {
  czechia: ["czechia", "czech republic"],
  "dr congo": ["dr congo", "democratic republic of the congo", "congo"],
  "south korea": ["south korea", "republic of korea", "korea"],
  "united states": ["united states", "u s", "usa", "america"],
  "united kingdom": ["united kingdom", "uk", "britain", "england"],
  "united arab emirates": ["united arab emirates", "uae"]
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name")?.trim();
  const country = searchParams.get("country")?.trim();
  const admin1 = searchParams.get("admin1")?.trim();

  if (!name) {
    return NextResponse.json({ message: "Şehir adı gerekli." }, { status: 400 });
  }

  try {
    const pages = await fetchWikiPages(buildTitleCandidates(name, country, admin1));
    const imagePage = pages.find((page) => page.thumbnail?.source && isValidCityPage(page, name, country));

    if (!imagePage?.thumbnail?.source) {
      const searchedPages = await searchWikiPages(name, country);
      const searchedImagePage = searchedPages.find((page) => page.thumbnail?.source && isValidCityPage(page, name, country));

      if (!searchedImagePage?.thumbnail?.source) {
        return NextResponse.json(
          { message: "Bu şehir için doğrulanmış görsel bulunamadı." },
          { status: 404 }
        );
      }

      return NextResponse.json(toCityImage(searchedImagePage, name));
    }

    return NextResponse.json(toCityImage(imagePage, name));
  } catch {
    return NextResponse.json({ message: "Görsel servisine ulaşılamadı." }, { status: 502 });
  }
}

function buildTitleCandidates(name: string, country?: string, admin1?: string) {
  const override = TITLE_OVERRIDES[cityKey(name, country)];
  return unique([
    override,
    admin1 ? `${name}, ${admin1}` : undefined,
    country ? `${name}, ${country}` : undefined,
    name
  ]);
}

async function fetchWikiPages(titles: string[]) {
  if (titles.length === 0) {
    return [];
  }

  const params = baseWikiParams();
  params.set("titles", titles.join("|"));

  const response = await fetch(`https://en.wikipedia.org/w/api.php?${params.toString()}`, {
    next: { revalidate: 60 * 60 * 24 * 7 }
  });

  if (!response.ok) {
    throw new Error("Wikipedia page lookup failed.");
  }

  const data = (await response.json()) as WikiSearchResponse;
  return Object.values(data.query?.pages ?? {}).filter((page) => page.title && !("missing" in page));
}

async function searchWikiPages(name: string, country?: string) {
  const params = baseWikiParams();
  params.set("generator", "search");
  params.set("gsrsearch", `"${name}" ${country ?? ""} city`);
  params.set("gsrlimit", "4");

  const response = await fetch(`https://en.wikipedia.org/w/api.php?${params.toString()}`, {
    next: { revalidate: 60 * 60 * 24 * 7 }
  });

  if (!response.ok) {
    throw new Error("Wikipedia search failed.");
  }

  const data = (await response.json()) as WikiSearchResponse;
  return Object.values(data.query?.pages ?? {});
}

function baseWikiParams() {
  return new URLSearchParams({
    action: "query",
    prop: "pageimages|extracts|info",
    inprop: "url",
    piprop: "thumbnail",
    pithumbsize: "900",
    exintro: "1",
    explaintext: "1",
    exsentences: "2",
    format: "json",
    origin: "*",
    redirects: "1"
  });
}

function isValidCityPage(page: WikiPage, name: string, country?: string) {
  const title = normalize(page.title ?? "");
  const extract = normalize(page.extract ?? "");
  const city = normalize(name);
  const countryMatches = getCountryAliases(country).some((nation) => extract.includes(nation) || title.includes(nation));
  const isCityTitle = title.includes(city) || city.includes(title);
  const hasCountryContext = !country || countryMatches;
  const hasCityContext =
    extract.includes("city") ||
    extract.includes("capital") ||
    extract.includes("municipality") ||
    extract.includes("metropolis");

  return isCityTitle && hasCountryContext && hasCityContext;
}

function getCountryAliases(country?: string) {
  const normalizedCountry = normalize(country ?? "");
  if (!normalizedCountry) {
    return [];
  }

  return COUNTRY_ALIASES[normalizedCountry] ?? [normalizedCountry];
}

function toCityImage(page: WikiPage, fallbackTitle: string) {
  return {
    title: page.title ?? fallbackTitle,
    imageUrl: page.thumbnail?.source ?? "",
    sourceUrl: page.fullurl ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title ?? fallbackTitle)}`,
    description: page.extract,
    verified: true
  };
}

function cityKey(name: string, country?: string) {
  return `${normalize(name)}|${normalize(country ?? "")}`;
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function unique(values: Array<string | undefined>) {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value?.trim()))));
}
