"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

type Locale = "tr" | "en" | "el";

type MarketState = {
  usdTry: number | null;
  eurTry: number | null;
  btcTry: number | null;
  btcChange: number | null;
  ethTry: number | null;
  ethChange: number | null;
  goldGramTry: number | null;
  goldChange: number | null;
};

const copy = {
  tr: {
    overview: "Piyasa özeti",
    subtitle: "Önemli varlıkları tek bakışta takip et.",
    loading: "Canlı veriler yükleniyor",
    unavailable: "Veri bekleniyor",
    approx: "yaklaşık",
    usd: "Dolar",
    eur: "Euro",
    gold: "Gram altın",
    btc: "Bitcoin",
    eth: "Ethereum",
    brief: "Boran Brief",
    markets: "Piyasalar",
    portfolio: "Portföy",
    news: "Haberler",
    home: "Ana Sayfa",
    profile: "Profil",
    more: "Daha Fazla",
    weather: "Hava",
    alerts: "Alarmlar",
    favorites: "Favoriler",
    search: "Arama",
    settings: "Ayarlar",
    portfolioGuide: "Portföyünü üç adımda oluşturmaya başla",
    steps: ["Varlığını seç", "Miktarı ve alış fiyatını gir", "Kâr/zararı takip et"],
  },
  en: {
    overview: "Market overview",
    subtitle: "Track the assets that matter at a glance.",
    loading: "Loading live data",
    unavailable: "Waiting for data",
    approx: "approx.",
    usd: "US dollar",
    eur: "Euro",
    gold: "Gold per gram",
    btc: "Bitcoin",
    eth: "Ethereum",
    brief: "Boran Brief",
    markets: "Markets",
    portfolio: "Portfolio",
    news: "News",
    home: "Home",
    profile: "Profile",
    more: "More",
    weather: "Weather",
    alerts: "Alerts",
    favorites: "Favorites",
    search: "Search",
    settings: "Settings",
    portfolioGuide: "Build your portfolio in three steps",
    steps: ["Choose an asset", "Enter quantity and cost", "Track profit and loss"],
  },
  el: {
    overview: "Επισκόπηση αγοράς",
    subtitle: "Παρακολούθησε τα σημαντικά στοιχεία με μια ματιά.",
    loading: "Φόρτωση ζωντανών δεδομένων",
    unavailable: "Αναμονή δεδομένων",
    approx: "περ.",
    usd: "Δολάριο ΗΠΑ",
    eur: "Ευρώ",
    gold: "Χρυσός ανά γραμμάριο",
    btc: "Bitcoin",
    eth: "Ethereum",
    brief: "Boran Brief",
    markets: "Αγορές",
    portfolio: "Χαρτοφυλάκιο",
    news: "Ειδήσεις",
    home: "Αρχική",
    profile: "Προφίλ",
    more: "Περισσότερα",
    weather: "Καιρός",
    alerts: "Ειδοποιήσεις",
    favorites: "Αγαπημένα",
    search: "Αναζήτηση",
    settings: "Ρυθμίσεις",
    portfolioGuide: "Δημιούργησε χαρτοφυλάκιο σε τρία βήματα",
    steps: ["Επίλεξε στοιχείο", "Βάλε ποσότητα και κόστος", "Παρακολούθησε κέρδος/ζημία"],
  },
} as const;

const emptyMarket: MarketState = {
  usdTry: null,
  eurTry: null,
  btcTry: null,
  btcChange: null,
  ethTry: null,
  ethChange: null,
  goldGramTry: null,
  goldChange: null,
};

function localeFromPath(): Locale {
  if (typeof window === "undefined") return "tr";
  const first = window.location.pathname.split("/").filter(Boolean)[0];
  return first === "en" || first === "el" ? first : "tr";
}

function withLocale(locale: Locale, route = "") {
  const suffix = route ? `/${route.replace(/^\//, "")}` : "";
  return `/${locale}${suffix}`;
}

function formatTry(value: number | null, locale: Locale) {
  if (value == null || !Number.isFinite(value)) return "—";
  return new Intl.NumberFormat(locale === "tr" ? "tr-TR" : locale === "el" ? "el-GR" : "en-US", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: value > 1000 ? 0 : 2,
  }).format(value);
}

function changeLabel(value: number | null) {
  if (value == null || !Number.isFinite(value)) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function getBrief(locale: Locale, market: MarketState) {
  const direction = (value: number | null) => {
    if (value == null) return locale === "tr" ? "veri bekliyor" : locale === "el" ? "αναμένει δεδομένα" : "is waiting for data";
    if (locale === "tr") return value > 0.15 ? "yükseliyor" : value < -0.15 ? "geriliyor" : "yatay";
    if (locale === "el") return value > 0.15 ? "ενισχύεται" : value < -0.15 ? "υποχωρεί" : "κινείται σταθερά";
    return value > 0.15 ? "is rising" : value < -0.15 ? "is falling" : "is flat";
  };
  if (locale === "tr") return `Bitcoin ${direction(market.btcChange)}, Ethereum ${direction(market.ethChange)}, gram altın ${direction(market.goldChange)}.`;
  if (locale === "el") return `Το Bitcoin ${direction(market.btcChange)}, το Ethereum ${direction(market.ethChange)} και ο χρυσός ${direction(market.goldChange)}.`;
  return `Bitcoin ${direction(market.btcChange)}, Ethereum ${direction(market.ethChange)}, and gold ${direction(market.goldChange)}.`;
}

function closestCard(element: Element | null) {
  if (!element) return null;
  return element.closest("section, article, li, [class*='card'], [class*='panel'], [class*='tile']") || element.parentElement;
}

function removeEntranceWorm() {
  const direct = document.querySelectorAll(
    "[class*='worm' i], [id*='worm' i], [data-worm], [class*='solucan' i], [id*='solucan' i]",
  );
  direct.forEach((element) => element.remove());

  document.querySelectorAll("[class*='splash' i], [id*='splash' i], [class*='preloader' i], [id*='preloader' i], [class*='intro' i], [id*='intro' i]").forEach((element) => {
    const style = window.getComputedStyle(element as Element);
    const rect = (element as HTMLElement).getBoundingClientRect();
    const coversScreen = rect.width >= window.innerWidth * 0.65 && rect.height >= window.innerHeight * 0.65;
    if ((style.position === "fixed" || style.position === "absolute") && coversScreen) element.remove();
  });
}

function replaceVisibleText() {
  const replacements = new Map<string, string>([
    ["Canli veri izleme", "Canlı piyasa takibi"],
    ["Canlı veri izleme", "Canlı piyasa takibi"],
    ["Hazir", "Hazır"],
    ["LocalStorage", "Cihazında güvende"],
    ["Recharts", "Etkileşimli grafik"],
    ["Küresel piyasalar ve hava radarını tek koyu panelde izle.", "Piyasaları tek ekrandan takip et."],
    ["Döviz kurları, kripto piyasa sinyalleri, altın kuru, 7 günlük dünya hava tahmini ve favori listesi tek premium panelde birleşir.", "Döviz, kripto, altın, portföy ve önemli piyasa gelişmelerini tek kontrol merkezinden izle."],
    ["Döviz takip", "Piyasaları aç"],
    ["Coin panelini aç", "Takip listemi oluştur"],
    ["Hava radarını aç", "Hava durumunu gör"],
  ]);
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  nodes.forEach((node) => {
    const value = node.nodeValue?.trim();
    if (value && replacements.has(value)) node.nodeValue = node.nodeValue!.replace(value, replacements.get(value)!);
  });
}

function hideTechnicalContent() {
  const phrases = [
    "İlk ekran hafifletildi",
    "Hızlı açılış",
    "Hafif efektler",
    "Gecikmeli canlı panel",
    "pointer efekti",
    "ilk render",
    "ağır paneller",
    "Yayın modu",
    "Animasyonlar azaltıldı",
    "Site daha hızlı tepki verir",
  ];
  document.querySelectorAll("main *").forEach((element) => {
    const text = element.textContent?.trim() || "";
    if (!text || text.length > 900) return;
    if (phrases.some((phrase) => text.toLocaleLowerCase("tr").includes(phrase.toLocaleLowerCase("tr")))) {
      const card = closestCard(element);
      if (card) card.classList.add("btg-technical-hidden");
    }
  });
}

function removeDuplicateStatusCards() {
  const exactLabels = ["Canlı piyasa takibi", "BorAI", "Favoriler", "Piyasa radarı"];
  exactLabels.forEach((label) => {
    const matches = Array.from(document.querySelectorAll("body *")).filter((element) => element.children.length === 0 && element.textContent?.trim() === label);
    matches.slice(1).forEach((match) => {
      const card = closestCard(match);
      if (card && (card.textContent?.length || 0) < 220) card.classList.add("btg-duplicate-hidden");
    });
  });
}

function simplifyThemeOptions() {
  if (/settings|ayar/i.test(window.location.pathname)) return;
  const labels = new Set(["Mint", "Mavi", "Mor", "Altın", "Rose", "Beyaz", "Siyah", "Blue", "Purple", "Gold", "White", "Black"]);
  document.querySelectorAll("button, [role='button'], label").forEach((element) => {
    if (labels.has(element.textContent?.trim() || "")) element.classList.add("btg-theme-option-hidden");
  });
}

function simplifyDesktopNavigation(locale: Locale) {
  const t = copy[locale];
  const nav = Array.from(document.querySelectorAll("header nav, nav")).find((candidate) => candidate.querySelectorAll("a").length >= 5);
  if (!nav || nav.querySelector(".btg-more-menu")) return;

  const extraRoutes = [
    { pattern: /weather|hava/i, label: t.weather },
    { pattern: /alert|alarm/i, label: t.alerts },
    { pattern: /search|ara/i, label: t.search },
    { pattern: /setting|ayar/i, label: t.settings },
    { pattern: /favorite|favori/i, label: t.favorites },
  ];
  const links = Array.from(nav.querySelectorAll<HTMLAnchorElement>("a"));
  const extras: HTMLAnchorElement[] = [];
  links.forEach((link) => {
    if (extraRoutes.some((route) => route.pattern.test(link.getAttribute("href") || ""))) {
      link.classList.add("btg-extra-nav-link");
      extras.push(link);
    }
  });
  if (!extras.length) return;

  const details = document.createElement("details");
  details.className = "btg-more-menu";
  const summary = document.createElement("summary");
  summary.textContent = t.more;
  details.appendChild(summary);
  const menu = document.createElement("div");
  menu.className = "btg-more-menu-panel";
  extras.forEach((link) => {
    const clone = link.cloneNode(true) as HTMLAnchorElement;
    clone.classList.remove("btg-extra-nav-link");
    menu.appendChild(clone);
  });
  details.appendChild(menu);
  nav.appendChild(details);
}

function addPortfolioGuide(locale: Locale) {
  if (!/portfolio/i.test(window.location.pathname) || document.querySelector(".btg-portfolio-guide")) return;
  const main = document.querySelector("main");
  if (!main) return;
  const zeroState = Array.from(main.querySelectorAll("*")).some((element) => /0\s*(pozisyon|position|θέση)/i.test(element.textContent?.trim() || ""));
  if (!zeroState) return;
  const guide = document.createElement("section");
  guide.className = "btg-portfolio-guide";
  guide.innerHTML = `<div><span>01</span><strong>${copy[locale].steps[0]}</strong></div><div><span>02</span><strong>${copy[locale].steps[1]}</strong></div><div><span>03</span><strong>${copy[locale].steps[2]}</strong></div>`;
  guide.setAttribute("aria-label", copy[locale].portfolioGuide);
  const firstSection = main.querySelector("section");
  if (firstSection?.nextSibling) main.insertBefore(guide, firstSection.nextSibling);
  else main.appendChild(guide);
}

function MarketCard({ label, value, change, approximate }: { label: string; value: string; change?: number | null; approximate?: string }) {
  const positive = typeof change === "number" && change >= 0;
  return (
    <article className="btg-market-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <div>
        {approximate ? <small>{approximate}</small> : <small>24h</small>}
        {change != null ? <em data-positive={positive}>{changeLabel(change)}</em> : <em>—</em>}
      </div>
    </article>
  );
}

function PremiumOverview({ locale, market, loading }: { locale: Locale; market: MarketState; loading: boolean }) {
  const t = copy[locale];
  return (
    <section className="btg-premium-overview" aria-label={t.overview}>
      <div className="btg-overview-heading">
        <div>
          <span className="btg-eyebrow">{t.brief}</span>
          <h2>{t.overview}</h2>
          <p>{t.subtitle}</p>
        </div>
        <p className="btg-brief-text">{loading ? t.loading : getBrief(locale, market)}</p>
      </div>
      <div className="btg-market-grid">
        <MarketCard label="USD/TRY" value={formatTry(market.usdTry, locale)} />
        <MarketCard label="EUR/TRY" value={formatTry(market.eurTry, locale)} />
        <MarketCard label={t.gold} value={formatTry(market.goldGramTry, locale)} change={market.goldChange} approximate={t.approx} />
        <MarketCard label={t.btc} value={formatTry(market.btcTry, locale)} change={market.btcChange} />
        <MarketCard label={t.eth} value={formatTry(market.ethTry, locale)} change={market.ethChange} />
      </div>
      <nav className="btg-overview-actions" aria-label={t.overview}>
        <a href={withLocale(locale, "currency")}>{t.markets}</a>
        <a href={withLocale(locale, "portfolio")}>{t.portfolio}</a>
        <a href={withLocale(locale, "news")}>{t.news}</a>
      </nav>
    </section>
  );
}

export default function BtgPremiumRefresh() {
  const [locale, setLocale] = useState<Locale>("tr");
  const [mount, setMount] = useState<HTMLElement | null>(null);
  const [isHome, setIsHome] = useState(false);
  const [market, setMarket] = useState<MarketState>(emptyMarket);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentLocale = localeFromPath();
    setLocale(currentLocale);
    const parts = window.location.pathname.split("/").filter(Boolean);
    const home = parts.length === 0 || (parts.length === 1 && ["tr", "en", "el"].includes(parts[0]));
    setIsHome(home);

    document.documentElement.classList.add("btg-premium-refresh");
    const enhance = () => {
      removeEntranceWorm();
      replaceVisibleText();
      hideTechnicalContent();
      removeDuplicateStatusCards();
      simplifyThemeOptions();
      simplifyDesktopNavigation(currentLocale);
      addPortfolioGuide(currentLocale);
    };
    enhance();
    let enhancementScheduled = false;
    const observer = new MutationObserver(() => {
      if (enhancementScheduled) return;
      enhancementScheduled = true;
      window.requestAnimationFrame(() => {
        enhancementScheduled = false;
        enhance();
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    let portalMount: HTMLDivElement | null = null;
    if (home) {
      const main = document.querySelector("main");
      if (main) {
        portalMount = document.createElement("div");
        portalMount.className = "btg-premium-overview-mount";
        const hero = main.querySelector("section");
        if (hero?.nextSibling) main.insertBefore(portalMount, hero.nextSibling);
        else main.prepend(portalMount);
        setMount(portalMount);
      }
    }

    return () => {
      observer.disconnect();
      portalMount?.remove();
      document.documentElement.classList.remove("btg-premium-refresh");
    };
  }, []);

  useEffect(() => {
    if (!isHome) return;
    const controller = new AbortController();
    async function loadMarket() {
      try {
        const [fxResponse, coinResponse] = await Promise.all([
          fetch("https://api.frankfurter.app/latest?from=USD&to=TRY,EUR", { signal: controller.signal }),
          fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,pax-gold&vs_currencies=try&include_24hr_change=true", { signal: controller.signal }),
        ]);
        if (!fxResponse.ok || !coinResponse.ok) throw new Error("Market request failed");
        const fx = await fxResponse.json();
        const coins = await coinResponse.json();
        const usdTry = Number(fx?.rates?.TRY);
        const usdEur = Number(fx?.rates?.EUR);
        const paxTry = Number(coins?.["pax-gold"]?.try);
        setMarket({
          usdTry: Number.isFinite(usdTry) ? usdTry : null,
          eurTry: Number.isFinite(usdTry) && Number.isFinite(usdEur) && usdEur !== 0 ? usdTry / usdEur : null,
          btcTry: Number(coins?.bitcoin?.try) || null,
          btcChange: Number.isFinite(Number(coins?.bitcoin?.try_24h_change)) ? Number(coins.bitcoin.try_24h_change) : null,
          ethTry: Number(coins?.ethereum?.try) || null,
          ethChange: Number.isFinite(Number(coins?.ethereum?.try_24h_change)) ? Number(coins.ethereum.try_24h_change) : null,
          goldGramTry: Number.isFinite(paxTry) ? paxTry / 31.1034768 : null,
          goldChange: Number.isFinite(Number(coins?.["pax-gold"]?.try_24h_change)) ? Number(coins["pax-gold"].try_24h_change) : null,
        });
      } catch (error) {
        if ((error as Error).name !== "AbortError") console.warn("BTG market overview could not load", error);
      } finally {
        setLoading(false);
      }
    }
    void loadMarket();
    return () => controller.abort();
  }, [isHome]);

  const t = useMemo(() => copy[locale], [locale]);
  const bottomLinks = [
    { href: withLocale(locale), label: t.home, icon: "⌂" },
    { href: withLocale(locale, "currency"), label: t.markets, icon: "↗" },
    { href: withLocale(locale, "portfolio"), label: t.portfolio, icon: "◫" },
    { href: withLocale(locale, "news"), label: t.news, icon: "◌" },
    { href: withLocale(locale, "settings"), label: t.profile, icon: "◎" },
  ];

  return (
    <>
      {mount && isHome ? createPortal(<PremiumOverview locale={locale} market={market} loading={loading} />, mount) : null}
      <nav className="btg-mobile-bottom-nav" aria-label="Mobile navigation">
        {bottomLinks.map((link) => (
          <a key={link.href} href={link.href}>
            <span aria-hidden="true">{link.icon}</span>
            <small>{link.label}</small>
          </a>
        ))}
      </nav>
    </>
  );
}