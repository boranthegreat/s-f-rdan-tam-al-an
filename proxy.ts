import { NextResponse, type NextRequest } from "next/server";
import { isLocale, localizedPath, stripLocalePrefix } from "@/lib/i18n";

const PUBLIC_FILE = /\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|webmanifest|js|map)$/i;

function preferredLocale(request: NextRequest) {
  const queryLocale = request.nextUrl.searchParams.get("lang");
  if (isLocale(queryLocale)) return queryLocale;

  const savedLocale = request.cookies.get("btg-language")?.value;
  if (isLocale(savedLocale)) return savedLocale;

  const accepted = request.headers.get("accept-language")?.toLowerCase() ?? "";
  const ranked = accepted
    .split(",")
    .map((entry) => {
      const [tag, ...parameters] = entry.trim().split(";");
      const qualityText = parameters.find((part) => part.trim().startsWith("q="))?.split("=")[1];
      return { tag, quality: qualityText ? Number(qualityText) : 1 };
    })
    .filter((entry) => Number.isFinite(entry.quality) && entry.quality > 0)
    .sort((a, b) => b.quality - a.quality);

  for (const { tag } of ranked) {
    const language = tag.split("-")[0];
    if (language === "el" || language === "en" || language === "tr") return language;
  }
  return "tr";
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname === "/manifest.webmanifest" ||
    pathname === "/opengraph-image" ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const firstSegment = pathname.split("/").filter(Boolean)[0];

  if (!isLocale(firstSegment)) {
    const locale = preferredLocale(request);
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = localizedPath(pathname, locale);
    redirectUrl.searchParams.delete("lang");
    return NextResponse.redirect(redirectUrl);
  }

  const internalPath = stripLocalePrefix(pathname);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-btg-locale", firstSegment);
  requestHeaders.set("x-btg-public-path", pathname);

  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = internalPath;
  rewriteUrl.search = search;

  const response = NextResponse.rewrite(rewriteUrl, {
    request: { headers: requestHeaders }
  });
  response.cookies.set("btg-language", firstSegment, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax"
  });
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
