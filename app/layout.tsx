import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { AppShell } from "@/components/AppShell";
import { CloudSyncProvider } from "@/components/CloudSyncProvider";
import { ServiceWorkerRegistrar } from "@/components/ServiceWorkerRegistrar";
import { isLocale, localizedPath, type Locale } from "@/lib/i18n";

import BtgPremiumRefresh from "@/components/BtgPremiumRefresh";

import "./btg-premium-refresh.css";
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://boranthegreat.xyz").replace(/\/$/, "");

const descriptions: Record<Locale, string> = {
  tr: "Döviz, kripto para, altın, ekonomi haberleri ve dünya hava durumunu tek premium panelde takip et.",
  en: "Track currencies, crypto, gold, economic news and global weather from one premium dashboard.",
  el: "Παρακολούθησε ισοτιμίες, κρυπτονομίσματα, χρυσό, οικονομικές ειδήσεις και τον παγκόσμιο καιρό σε έναν ενιαίο προηγμένο πίνακα."
};

export async function generateMetadata(): Promise<Metadata> {
  const headerList = await headers();
  const headerLocale = headerList.get("x-btg-locale");
  const locale: Locale = isLocale(headerLocale) ? headerLocale : "tr";
  const publicPath = headerList.get("x-btg-public-path") ?? `/${locale}`;
  const description = descriptions[locale];
  const languageLinks = {
    tr: localizedPath(publicPath, "tr"),
    en: localizedPath(publicPath, "en"),
    el: localizedPath(publicPath, "el"),
    "x-default": localizedPath(publicPath, "tr")
  };

  return {
    metadataBase: new URL(siteUrl),
    applicationName: "BoranTheGreat",
    title: {
      default: "BoranTheGreat | Global Markets & Weather Radar",
      template: "%s | BoranTheGreat"
    },
    description,
    keywords: [
      "BoranTheGreat",
      "currency tracker",
      "crypto tracker",
      "gold price",
      "economic calendar",
      "market news",
      "weather radar"
    ],
    authors: [{ name: "BoranTheGreat", url: siteUrl }],
    creator: "BoranTheGreat",
    publisher: "BoranTheGreat",
    alternates: {
      canonical: publicPath,
      languages: languageLinks
    },
    openGraph: {
      type: "website",
      locale: locale === "tr" ? "tr_TR" : locale === "el" ? "el_GR" : "en_US",
      url: `${siteUrl}${publicPath}`,
      siteName: "BoranTheGreat",
      title: "BoranTheGreat | Global Markets & Weather Radar",
      description,
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: "BoranTheGreat global markets and weather dashboard"
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: "BoranTheGreat",
      description,
      images: ["/opengraph-image"]
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1
      }
    },
    manifest: "/manifest.webmanifest",
    category: "finance",
    icons: {
      icon: "/icon.svg",
      apple: "/apple-touch-icon.png"
    },
    appleWebApp: {
      capable: true,
      title: "BoranTheGreat",
      statusBarStyle: "black-translucent"
    },
    formatDetection: { telephone: false }
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const headerList = await headers();
  const headerLocale = headerList.get("x-btg-locale");
  const locale: Locale = isLocale(headerLocale) ? headerLocale : "tr";

  return (
    <html lang={locale}>
      <body className="bg-radial-grid font-sans antialiased">
        <CloudSyncProvider>
          <ServiceWorkerRegistrar />
          <AppShell>{children}</AppShell>
        </CloudSyncProvider>
        <BtgPremiumRefresh />
      </body>
    </html>
  );
}
