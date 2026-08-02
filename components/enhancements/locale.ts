export type BtgLocale = "tr" | "en" | "el";

export function getLocaleFromPath(pathname: string): BtgLocale {
  const firstSegment = pathname.split("/").filter(Boolean)[0];
  if (firstSegment === "tr" || firstSegment === "en" || firstSegment === "el") {
    return firstSegment;
  }
  return "tr";
}

export function localizedHref(pathname: string, target: string): string {
  const locale = getLocaleFromPath(pathname);
  const normalizedTarget = target.startsWith("/") ? target : `/${target}`;
  return `/${locale}${normalizedTarget === "/" ? "" : normalizedTarget}`;
}
