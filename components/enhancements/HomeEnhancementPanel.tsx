"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BellRing,
  BookOpen,
  Calculator,
  Check,
  CloudSun,
  Coins,
  ExternalLink,
  RefreshCw,
  Settings2,
  Share2,
  Sparkles,
  TrendingDown,
  TrendingUp,
  WalletCards
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getLocaleFromPath, localizedHref, type BtgLocale } from "@/components/enhancements/locale";
import { LivePrice } from "@/components/live-market/LivePrice";
import { useLiveMarket } from "@/components/live-market/LiveMarketProvider";

type CityKey = "mersin" | "istanbul" | "ankara" | "athens" | "new-york";
type Currency = "TRY" | "USD" | "EUR";
type AssetKey = "usdtry" | "bitcoin" | "ethereum" | "weather";

type Preferences = {
  city: CityKey;
  currency: Currency;
  assets: AssetKey[];
};

type MarketSnapshot = {
  usdTry: number | null;
  usdEur: number | null;
  btcUsd: number | null;
  btcTry: number | null;
  btcChange: number | null;
  ethUsd: number | null;
  ethTry: number | null;
  ethChange: number | null;
  temperature: number | null;
  weatherCode: number | null;
  updatedAt: string | null;
  errors: string[];
};

const DEFAULT_PREFS: Preferences = {
  city: "mersin",
  currency: "TRY",
  assets: ["usdtry", "bitcoin", "ethereum", "weather"]
};

const cityOptions: Record<CityKey, { label: Record<BtgLocale, string>; lat: number; lon: number }> = {
  mersin: { label: { tr: "Mersin", en: "Mersin", el: "Μερσίνα" }, lat: 36.8121, lon: 34.6415 },
  istanbul: { label: { tr: "İstanbul", en: "Istanbul", el: "Κωνσταντινούπολη" }, lat: 41.0082, lon: 28.9784 },
  ankara: { label: { tr: "Ankara", en: "Ankara", el: "Άγκυρα" }, lat: 39.9334, lon: 32.8597 },
  athens: { label: { tr: "Atina", en: "Athens", el: "Αθήνα" }, lat: 37.9838, lon: 23.7275 },
  "new-york": { label: { tr: "New York", en: "New York", el: "Νέα Υόρκη" }, lat: 40.7128, lon: -74.006 }
};

const copy = {
  tr: {
    eyebrow: "Kişisel kontrol merkezi",
    greeting: "Tekrar hoş geldin",
    title: "Takip ettiğin veriler, tek bakışta.",
    description: "Ana panel tercihlerini cihazında sakla; piyasayı, hava durumunu ve önemli bağlantıları daha hızlı aç.",
    customize: "Paneli kişiselleştir",
    city: "Varsayılan şehir",
    currency: "Gösterim para birimi",
    assets: "Ana kartlar",
    save: "Tercihleri kaydet",
    saved: "Kaydedildi",
    liveTitle: "Canlı özet",
    liveDescription: "Kaynak ve güncelleme zamanı her kartta açıkça gösterilir.",
    refresh: "Yenile",
    loading: "Canlı veriler hazırlanıyor…",
    unavailable: "Şu anda alınamadı",
    updated: "Güncellendi",
    source: "Kaynak",
    dailyTitle: "Bugünün kısa özeti",
    dailyFallback: "Canlı kaynaklardan yeterli veri alınamadı. Kartları yenileyerek tekrar deneyebilirsin.",
    btcUp: "Bitcoin son 24 saatte yükselişte.",
    btcDown: "Bitcoin son 24 saatte geriliyor.",
    btcFlat: "Bitcoin son 24 saatte yatay seyrediyor.",
    usd: "Dolar/TL anlık olarak",
    weather: "Seçili şehirde sıcaklık",
    quickTitle: "Hızlı işlemler",
    tools: "Finans hesaplamaları",
    alerts: "Kolay alarm oluştur",
    portfolio: "Portföyümü aç",
    guide: "Finans sözlüğü",
    share: "Paylaşım kartı hazırla",
    transparent: "Veri kaynaklarını gör",
    weatherCard: "Hava",
    partialData: "Bazı canlı kaynaklara ulaşılamadı",
    assetsLabels: { usdtry: "USD/TRY", bitcoin: "Bitcoin", ethereum: "Ethereum", weather: "Hava" }
  },
  en: {
    eyebrow: "Personal control center",
    greeting: "Welcome back",
    title: "Everything you follow, at a glance.",
    description: "Save dashboard preferences on this device and reach markets, weather and important actions faster.",
    customize: "Customize dashboard",
    city: "Default city",
    currency: "Display currency",
    assets: "Main cards",
    save: "Save preferences",
    saved: "Saved",
    liveTitle: "Live snapshot",
    liveDescription: "Every card clearly shows its source and update time.",
    refresh: "Refresh",
    loading: "Preparing live data…",
    unavailable: "Unavailable right now",
    updated: "Updated",
    source: "Source",
    dailyTitle: "Today in brief",
    dailyFallback: "There is not enough live data right now. Refresh the cards and try again.",
    btcUp: "Bitcoin is up over the last 24 hours.",
    btcDown: "Bitcoin is down over the last 24 hours.",
    btcFlat: "Bitcoin is moving sideways over the last 24 hours.",
    usd: "The live USD/TRY rate is",
    weather: "Temperature in the selected city is",
    quickTitle: "Quick actions",
    tools: "Finance calculators",
    alerts: "Create an easy alert",
    portfolio: "Open my portfolio",
    guide: "Finance glossary",
    share: "Create a share card",
    transparent: "View data sources",
    weatherCard: "Weather",
    partialData: "Some live sources are unavailable",
    assetsLabels: { usdtry: "USD/TRY", bitcoin: "Bitcoin", ethereum: "Ethereum", weather: "Weather" }
  },
  el: {
    eyebrow: "Προσωπικό κέντρο ελέγχου",
    greeting: "Καλώς ήρθες ξανά",
    title: "Όσα παρακολουθείς, με μία ματιά.",
    description: "Αποθήκευσε τις προτιμήσεις του πίνακα στη συσκευή και άνοιγε γρηγορότερα αγορές, καιρό και σημαντικές ενέργειες.",
    customize: "Προσαρμογή πίνακα",
    city: "Προεπιλεγμένη πόλη",
    currency: "Νόμισμα εμφάνισης",
    assets: "Κύριες κάρτες",
    save: "Αποθήκευση προτιμήσεων",
    saved: "Αποθηκεύτηκε",
    liveTitle: "Ζωντανή σύνοψη",
    liveDescription: "Κάθε κάρτα εμφανίζει καθαρά την πηγή και την ώρα ενημέρωσης.",
    refresh: "Ανανέωση",
    loading: "Προετοιμασία ζωντανών δεδομένων…",
    unavailable: "Δεν είναι διαθέσιμο τώρα",
    updated: "Ενημερώθηκε",
    source: "Πηγή",
    dailyTitle: "Η ημέρα σε λίγες γραμμές",
    dailyFallback: "Δεν υπάρχουν αρκετά ζωντανά δεδομένα. Κάνε ανανέωση και δοκίμασε ξανά.",
    btcUp: "Το Bitcoin κινείται ανοδικά το τελευταίο 24ωρο.",
    btcDown: "Το Bitcoin υποχωρεί το τελευταίο 24ωρο.",
    btcFlat: "Το Bitcoin κινείται πλευρικά το τελευταίο 24ωρο.",
    usd: "Η ζωντανή ισοτιμία USD/TRY είναι",
    weather: "Η θερμοκρασία στην επιλεγμένη πόλη είναι",
    quickTitle: "Γρήγορες ενέργειες",
    tools: "Οικονομικοί υπολογισμοί",
    alerts: "Εύκολη δημιουργία ειδοποίησης",
    portfolio: "Άνοιγμα χαρτοφυλακίου",
    guide: "Οικονομικό λεξικό",
    share: "Δημιουργία κάρτας κοινοποίησης",
    transparent: "Προβολή πηγών δεδομένων",
    weatherCard: "Καιρός",
    partialData: "Ορισμένες ζωντανές πηγές δεν είναι διαθέσιμες",
    assetsLabels: { usdtry: "USD/TRY", bitcoin: "Bitcoin", ethereum: "Ethereum", weather: "Καιρός" }
  }
} as const;

function isHomePath(pathname: string): boolean {
  return pathname === "/" || pathname === "/tr" || pathname === "/en" || pathname === "/el";
}

function formatNumber(value: number | null, locale: BtgLocale, options?: Intl.NumberFormatOptions): string {
  if (value === null || !Number.isFinite(value)) return "—";
  const localeCode = locale === "tr" ? "tr-TR" : locale === "el" ? "el-GR" : "en-US";
  return new Intl.NumberFormat(localeCode, options).format(value);
}

function weatherLabel(code: number | null, locale: BtgLocale): string {
  if (code === null) return "";
  const labels = {
    clear: { tr: "Açık", en: "Clear", el: "Αίθριος" },
    cloudy: { tr: "Bulutlu", en: "Cloudy", el: "Συννεφιά" },
    fog: { tr: "Sisli", en: "Foggy", el: "Ομίχλη" },
    rain: { tr: "Yağmurlu", en: "Rainy", el: "Βροχή" },
    snow: { tr: "Karlı", en: "Snowy", el: "Χιόνι" },
    storm: { tr: "Fırtınalı", en: "Stormy", el: "Καταιγίδα" }
  } as const;
  if (code === 0) return labels.clear[locale];
  if ([1, 2, 3].includes(code)) return labels.cloudy[locale];
  if ([45, 48].includes(code)) return labels.fog[locale];
  if (code >= 51 && code <= 82) return labels.rain[locale];
  if (code >= 85 && code <= 86) return labels.snow[locale];
  return labels.storm[locale];
}

export function HomeEnhancementPanel() {
  const pathname = usePathname();
  const locale = getLocaleFromPath(pathname);
  const t = copy[locale];
  const { coins, rates, updatedAt, hasLivePrice } = useLiveMarket();
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFS);
  const [draft, setDraft] = useState<Preferences>(DEFAULT_PREFS);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [snapshot, setSnapshot] = useState<MarketSnapshot>({
    usdTry: null,
    usdEur: null,
    btcUsd: null,
    btcTry: null,
    btcChange: null,
    ethUsd: null,
    ethTry: null,
    ethChange: null,
    temperature: null,
    weatherCode: null,
    updatedAt: null,
    errors: []
  });

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("btg_dashboard_preferences_v2");
      if (!stored) return;
      const parsed = JSON.parse(stored) as Partial<Preferences>;
      const next: Preferences = {
        city: parsed.city && parsed.city in cityOptions ? parsed.city : DEFAULT_PREFS.city,
        currency: parsed.currency === "USD" || parsed.currency === "EUR" || parsed.currency === "TRY" ? parsed.currency : DEFAULT_PREFS.currency,
        assets: Array.isArray(parsed.assets)
          ? parsed.assets.filter((asset): asset is AssetKey => ["usdtry", "bitcoin", "ethereum", "weather"].includes(asset))
          : DEFAULT_PREFS.assets
      };
      if (next.assets.length === 0) next.assets = DEFAULT_PREFS.assets;
      setPrefs(next);
      setDraft(next);
    } catch {
      // Corrupted browser preferences should never block the dashboard.
    }
  }, []);

  const loadSnapshot = useCallback(async () => {
    setLoading(true);
    const city = cityOptions[prefs.city];
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 9000);

    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,weather_code&timezone=auto`,
        { signal: controller.signal }
      );
      if (!response.ok) throw new Error("Open-Meteo");
      const weather = (await response.json()) as { current?: { temperature_2m?: number; weather_code?: number } };
      setSnapshot((current) => ({
        ...current,
        temperature: weather.current?.temperature_2m ?? null,
        weatherCode: weather.current?.weather_code ?? null,
        updatedAt: new Date().toISOString(),
        errors: current.errors.filter((item) => item !== "Open-Meteo")
      }));
    } catch {
      setSnapshot((current) => ({
        ...current,
        errors: Array.from(new Set([...current.errors.filter((item) => item !== "Open-Meteo"), "Open-Meteo"]))
      }));
    } finally {
      window.clearTimeout(timeout);
      setLoading(false);
    }
  }, [prefs.city]);

  useEffect(() => {
    if (!isHomePath(pathname)) return;
    void loadSnapshot();
  }, [loadSnapshot, pathname]);

  const bitcoin = coins.find((coin) => coin.id === "bitcoin");
  const ethereum = coins.find((coin) => coin.id === "ethereum");
  const usdTry = rates.find((rate) => rate.code === "TRY")?.rate ?? null;
  const usdEur = rates.find((rate) => rate.code === "EUR")?.rate ?? null;
  const btcUsd = bitcoin?.current_price ?? null;
  const ethUsd = ethereum?.current_price ?? null;
  const btcChange = bitcoin?.price_change_percentage_24h ?? null;
  const ethChange = ethereum?.price_change_percentage_24h ?? null;

  useEffect(() => {
    setSnapshot((current) => ({
      ...current,
      usdTry,
      usdEur,
      btcUsd,
      btcTry: btcUsd !== null && usdTry !== null ? btcUsd * usdTry : null,
      btcChange,
      ethUsd,
      ethTry: ethUsd !== null && usdTry !== null ? ethUsd * usdTry : null,
      ethChange,
      updatedAt: updatedAt?.toISOString() ?? current.updatedAt
    }));
  }, [btcChange, btcUsd, ethChange, ethUsd, updatedAt, usdEur, usdTry]);

  const dailySummary = useMemo(() => {
    const lines: string[] = [];
    if (snapshot.btcChange !== null) {
      if (snapshot.btcChange > 0.35) lines.push(`${t.btcUp} (${formatNumber(snapshot.btcChange, locale, { maximumFractionDigits: 2 })}%)`);
      else if (snapshot.btcChange < -0.35) lines.push(`${t.btcDown} (${formatNumber(snapshot.btcChange, locale, { maximumFractionDigits: 2 })}%)`);
      else lines.push(`${t.btcFlat} (${formatNumber(snapshot.btcChange, locale, { maximumFractionDigits: 2 })}%)`);
    }
    if (snapshot.usdTry !== null) lines.push(`${t.usd} ${formatNumber(snapshot.usdTry, locale, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}.`);
    if (snapshot.temperature !== null) lines.push(`${t.weather} ${formatNumber(snapshot.temperature, locale, { maximumFractionDigits: 1 })}°C.`);
    return lines;
  }, [locale, snapshot, t]);

  if (!isHomePath(pathname)) return null;

  const savePreferences = () => {
    const normalized = { ...draft, assets: draft.assets.length ? draft.assets : DEFAULT_PREFS.assets };
    setPrefs(normalized);
    try {
      window.localStorage.setItem("btg_dashboard_preferences_v2", JSON.stringify(normalized));
    } catch {
      // Preferences still work for the current session.
    }
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  const toggleAsset = (asset: AssetKey) => {
    setDraft((current) => ({
      ...current,
      assets: current.assets.includes(asset) ? current.assets.filter((item) => item !== asset) : [...current.assets, asset]
    }));
  };

  const cryptoValue = (usd: number | null, tryValue: number | null) => {
    if (prefs.currency === "TRY") return `${formatNumber(tryValue, locale, { maximumFractionDigits: 0 })} ₺`;
    if (prefs.currency === "EUR") {
      const eur = usd !== null && snapshot.usdEur !== null ? usd * snapshot.usdEur : null;
      return `${formatNumber(eur, locale, { maximumFractionDigits: 2 })} €`;
    }
    return `$${formatNumber(usd, locale, { maximumFractionDigits: 2 })}`;
  };

  const cards = [
    {
      key: "usdtry" as const,
      title: "USD/TRY",
      value: formatNumber(snapshot.usdTry, locale, { minimumFractionDigits: 2, maximumFractionDigits: 4 }),
      numericValue: snapshot.usdTry,
      meta: hasLivePrice("USDTRY") ? "Binance TRY canlı piyasa akışı" : "Frankfurter yedek veri",
      marketKey: "USDTRY",
      icon: Coins,
      change: null as number | null
    },
    {
      key: "bitcoin" as const,
      title: "Bitcoin",
      value: cryptoValue(snapshot.btcUsd, snapshot.btcTry),
      numericValue: prefs.currency === "TRY" ? snapshot.btcTry : prefs.currency === "EUR" && snapshot.btcUsd !== null && snapshot.usdEur !== null ? snapshot.btcUsd * snapshot.usdEur : snapshot.btcUsd,
      meta: hasLivePrice("BTC") ? "Binance WebSocket" : "CoinGecko yedek veri",
      marketKey: "BTC",
      icon: TrendingUp,
      change: snapshot.btcChange
    },
    {
      key: "ethereum" as const,
      title: "Ethereum",
      value: cryptoValue(snapshot.ethUsd, snapshot.ethTry),
      numericValue: prefs.currency === "TRY" ? snapshot.ethTry : prefs.currency === "EUR" && snapshot.ethUsd !== null && snapshot.usdEur !== null ? snapshot.ethUsd * snapshot.usdEur : snapshot.ethUsd,
      meta: hasLivePrice("ETH") ? "Binance WebSocket" : "CoinGecko yedek veri",
      marketKey: "ETH",
      icon: WalletCards,
      change: snapshot.ethChange
    },
    {
      key: "weather" as const,
      title: `${t.weatherCard} · ${cityOptions[prefs.city].label[locale]}`,
      value: snapshot.temperature === null ? "—" : `${formatNumber(snapshot.temperature, locale, { maximumFractionDigits: 1 })}°C`,
      numericValue: snapshot.temperature,
      meta: `Open-Meteo · ${weatherLabel(snapshot.weatherCode, locale)}`,
      marketKey: "",
      icon: CloudSun,
      change: null as number | null
    }
  ].filter((card) => prefs.assets.includes(card.key));

  const quickLinks = [
    { href: "/tools", label: t.tools, icon: Calculator },
    { href: "/alerts", label: t.alerts, icon: BellRing },
    { href: "/portfolio", label: t.portfolio, icon: WalletCards },
    { href: "/guide", label: t.guide, icon: BookOpen },
    { href: "/tools#share-card", label: t.share, icon: Share2 },
    { href: "/data-sources", label: t.transparent, icon: ExternalLink }
  ];

  return (
    <section className="mt-10 space-y-6" aria-labelledby="btg-personal-dashboard-title">
      <div className="overflow-hidden rounded-3xl border border-mint/20 bg-gradient-to-br from-slate-950/85 via-slate-900/75 to-mint/5 p-6 shadow-card sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-mint/20 bg-mint/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-mint">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              {t.eyebrow}
            </div>
            <p className="mt-5 text-sm font-semibold text-slate-400">{t.greeting}</p>
            <h2 id="btg-personal-dashboard-title" className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">{t.title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300 sm:text-base">{t.description}</p>
          </div>

          <details className="w-full rounded-2xl border border-white/10 bg-black/20 p-4 lg:max-w-md">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-bold text-white">
              <span className="inline-flex items-center gap-2"><Settings2 className="h-4 w-4 text-mint" />{t.customize}</span>
              <span className="text-xs text-slate-400">▼</span>
            </summary>
            <div className="mt-5 space-y-4">
              <label className="block text-sm font-semibold text-slate-300">
                {t.city}
                <select
                  value={draft.city}
                  onChange={(event) => setDraft((current) => ({ ...current, city: event.target.value as CityKey }))}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-mint/60"
                >
                  {(Object.keys(cityOptions) as CityKey[]).map((city) => <option key={city} value={city}>{cityOptions[city].label[locale]}</option>)}
                </select>
              </label>
              <label className="block text-sm font-semibold text-slate-300">
                {t.currency}
                <select
                  value={draft.currency}
                  onChange={(event) => setDraft((current) => ({ ...current, currency: event.target.value as Currency }))}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-mint/60"
                >
                  <option value="TRY">TRY (₺)</option><option value="USD">USD ($)</option><option value="EUR">EUR (€)</option>
                </select>
              </label>
              <fieldset>
                <legend className="text-sm font-semibold text-slate-300">{t.assets}</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(Object.keys(t.assetsLabels) as AssetKey[]).map((asset) => {
                    const active = draft.assets.includes(asset);
                    return (
                      <button
                        key={asset}
                        type="button"
                        onClick={() => toggleAsset(asset)}
                        className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-semibold transition ${active ? "border-mint/40 bg-mint/15 text-mint" : "border-white/10 bg-white/5 text-slate-400 hover:text-white"}`}
                      >
                        {active ? <Check className="h-3.5 w-3.5" /> : null}{t.assetsLabels[asset]}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
              <button type="button" onClick={savePreferences} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-mint px-4 py-3 font-black text-slate-950 transition hover:brightness-110">
                {saved ? <Check className="h-4 w-4" /> : <Settings2 className="h-4 w-4" />}{saved ? t.saved : t.save}
              </button>
            </div>
          </details>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-slate-950/45 p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-xl font-black text-white">{t.liveTitle}</h3>
            <p className="mt-1 text-sm text-slate-400">{t.liveDescription}</p>
          </div>
          <button type="button" onClick={() => void loadSnapshot()} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white transition hover:border-mint/30 hover:text-mint disabled:cursor-wait disabled:opacity-60">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />{t.refresh}
          </button>
        </div>

        {loading && snapshot.updatedAt === null ? <p className="mt-5 text-sm text-slate-400">{t.loading}</p> : null}
        {snapshot.errors.length ? <p className="mt-4 rounded-xl border border-amber-300/20 bg-amber-300/[0.07] px-3 py-2 text-xs font-semibold text-amber-100">{t.partialData}: {snapshot.errors.join(", ")}</p> : null}
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;
            const isMissing = card.value === "—";
            return (
              <article key={card.key} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition hover:-translate-y-0.5 hover:border-mint/25">
                <div className="flex items-start justify-between gap-3">
                  <div className="rounded-xl border border-mint/15 bg-mint/10 p-2.5 text-mint"><Icon className="h-5 w-5" /></div>
                  {card.change !== null ? (
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-black ${card.change >= 0 ? "bg-emerald-400/10 text-emerald-300" : "bg-rose-400/10 text-rose-300"}`}>
                      {card.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {formatNumber(card.change, locale, { maximumFractionDigits: 2 })}%
                    </span>
                  ) : null}
                </div>
                <p className="mt-4 text-sm font-semibold text-slate-400">{card.title}</p>
                <p className="mt-1 text-2xl font-black text-white">
                  {isMissing ? t.unavailable : card.marketKey ? <LivePrice marketKey={card.marketKey} numericValue={card.numericValue}>{card.value}</LivePrice> : card.value}
                </p>
                <div className="mt-4 border-t border-white/10 pt-3 text-xs leading-5 text-slate-500">
                  <p>{t.source}: {card.meta}</p>
                  {snapshot.updatedAt ? <p>{t.updated}: {new Date(snapshot.updatedAt).toLocaleTimeString(locale === "tr" ? "tr-TR" : locale === "el" ? "el-GR" : "en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</p> : null}
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <article className="rounded-3xl border border-white/10 bg-slate-950/45 p-6">
          <div className="flex items-center gap-2 text-mint"><Sparkles className="h-5 w-5" /><h3 className="text-xl font-black text-white">{t.dailyTitle}</h3></div>
          <div className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
            {dailySummary.length ? dailySummary.map((line) => <p key={line}>{line}</p>) : <p>{t.dailyFallback}</p>}
          </div>
        </article>

        <article className="rounded-3xl border border-white/10 bg-slate-950/45 p-6">
          <h3 className="text-xl font-black text-white">{t.quickTitle}</h3>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {quickLinks.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={localizedHref(pathname, href)} className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3 text-sm font-bold text-slate-300 transition hover:border-mint/30 hover:text-mint">
                <span className="rounded-xl bg-white/5 p-2 transition group-hover:bg-mint/10"><Icon className="h-4 w-4" /></span>{label}
              </Link>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
