export const locales = ["tr", "en", "el"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "tr";

export function isLocale(value: string | null | undefined): value is Locale {
  return Boolean(value && locales.includes(value as Locale));
}

export function stripLocalePrefix(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  if (isLocale(parts[0])) {
    const path = `/${parts.slice(1).join("/")}`;
    return path === "/" ? "/" : path.replace(/\/$/, "");
  }
  return pathname === "" ? "/" : pathname;
}

export function localeFromPathname(pathname: string): Locale | null {
  const first = pathname.split("/").filter(Boolean)[0];
  return isLocale(first) ? first : null;
}

export function localizedPath(pathname: string, locale: Locale) {
  const clean = stripLocalePrefix(pathname);
  return clean === "/" ? `/${locale}` : `/${locale}${clean}`;
}
