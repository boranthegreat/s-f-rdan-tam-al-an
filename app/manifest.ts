import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BoranTheGreat — Global Markets & Weather Radar",
    short_name: "BTG",
    description: "Currencies, crypto, gold, economic news, alerts and global weather in one dashboard.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#020617",
    theme_color: "#020617",
    categories: ["finance", "weather", "productivity"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }
    ],
    shortcuts: [
      { name: "Crypto", short_name: "Crypto", url: "/coins", icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }] },
      { name: "FX", short_name: "FX", url: "/currency", icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }] },
      { name: "Alerts", short_name: "Alerts", url: "/alerts", icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }] }
    ]
  };
}
