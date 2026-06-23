import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/AppShell";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://boranthegreat.xyz";
const siteDescription =
  "Döviz, kripto para, altın ve dünya hava durumunu tek premium finans panelinde takip et.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "BoranTheGreat",
  title: {
    default: "BoranTheGreat | Global Markets & Weather Radar",
    template: "%s | BoranTheGreat"
  },
  description: siteDescription,
  keywords: [
    "BoranTheGreat",
    "döviz takip",
    "coin takip",
    "kripto para",
    "altın kuru",
    "hava durumu",
    "finans dashboard"
  ],
  authors: [{ name: "BoranTheGreat", url: siteUrl }],
  creator: "BoranTheGreat",
  publisher: "BoranTheGreat",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: siteUrl,
    siteName: "BoranTheGreat",
    title: "BoranTheGreat | Global Markets & Weather Radar",
    description: siteDescription,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "BoranTheGreat finans ve hava durumu paneli"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "BoranTheGreat",
    description: siteDescription,
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
    apple: "/icon.svg"
  },
  appleWebApp: {
    capable: true,
    title: "BoranTheGreat",
    statusBarStyle: "black-translucent"
  },
  formatDetection: {
    telephone: false
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="bg-radial-grid font-sans antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
