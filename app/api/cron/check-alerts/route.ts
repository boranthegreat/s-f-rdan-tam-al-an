import { NextResponse } from "next/server";
import { sendEmptyWebPush } from "@/lib/server/webPush";
import { serviceRest } from "@/lib/server/supabaseRest";
import type { PriceAlert } from "@/types";

type UserDataRow = { user_id: string; data?: { stores?: Record<string, string> } };
type SubscriptionRow = { id: string; user_id: string; endpoint: string; last_triggered?: Record<string, boolean> };

const VALID_SYMBOLS = new Set(["BTC", "ETH", "SOL", "BNB", "XRP", "TRX", "USD", "EUR", "GBP", "TRY", "GOLD"]);

function parseAlerts(raw?: string): PriceAlert[] {
  if (!raw) return [];
  try {
    const value = JSON.parse(raw) as unknown;
    if (!Array.isArray(value)) return [];
    return value
      .filter((item): item is PriceAlert => {
        if (!item || typeof item !== "object") return false;
        const alert = item as Partial<PriceAlert>;
        return typeof alert.id === "string"
          && typeof alert.symbol === "string"
          && VALID_SYMBOLS.has(alert.symbol)
          && (alert.direction === "above" || alert.direction === "below")
          && typeof alert.target === "number"
          && Number.isFinite(alert.target)
          && alert.target > 0;
      })
      .slice(0, 50);
  } catch {
    return [];
  }
}

async function marketSnapshot() {
  const prices: Record<string, number> = {};

  await Promise.all([
    (async () => {
      try {
        const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,binancecoin,ripple,tron&vs_currencies=usd", { cache: "no-store" });
        if (!response.ok) return;
        const coins = await response.json() as Record<string, { usd?: number }>;
        const values = {
          BTC: coins.bitcoin?.usd,
          ETH: coins.ethereum?.usd,
          SOL: coins.solana?.usd,
          BNB: coins.binancecoin?.usd,
          XRP: coins.ripple?.usd,
          TRX: coins.tron?.usd
        };
        for (const [symbol, value] of Object.entries(values)) if (value && value > 0) prices[symbol] = value;
      } catch {
        // Other market sources can still be evaluated.
      }
    })(),
    (async () => {
      try {
        const response = await fetch("https://api.frankfurter.app/latest?from=USD&to=EUR,GBP,TRY", { cache: "no-store" });
        if (!response.ok) return;
        const fx = await response.json() as { rates?: Record<string, number> };
        prices.USD = 1;
        for (const symbol of ["EUR", "GBP", "TRY"] as const) {
          const rate = fx.rates?.[symbol];
          if (rate && rate > 0) prices[symbol] = 1 / rate;
        }
      } catch {
        // Other market sources can still be evaluated.
      }
    })(),
    (async () => {
      try {
        const response = await fetch("https://query1.finance.yahoo.com/v8/finance/chart/GC=F?range=1d&interval=1d", { cache: "no-store", headers: { accept: "application/json" } });
        if (!response.ok) return;
        const gold = await response.json() as { chart?: { result?: Array<{ meta?: { regularMarketPrice?: number; previousClose?: number } }> } };
        const ounce = gold.chart?.result?.[0]?.meta?.regularMarketPrice ?? gold.chart?.result?.[0]?.meta?.previousClose ?? 0;
        if (ounce > 0) prices.GOLD = ounce / 31.1034768;
      } catch {
        // Other market sources can still be evaluated.
      }
    })()
  ]);

  if (!Object.keys(prices).length) throw new Error("Market data unavailable");
  return prices;
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    const [userResponse, subscriptionResponse, prices] = await Promise.all([
      serviceRest("user_data?select=user_id,data"),
      serviceRest("push_subscriptions?select=id,user_id,endpoint,last_triggered"),
      marketSnapshot()
    ]);
    if (!userResponse.ok || !subscriptionResponse.ok) throw new Error("Cloud data unavailable");
    const users = (await userResponse.json()) as UserDataRow[];
    const subscriptions = (await subscriptionResponse.json()) as SubscriptionRow[];
    const alertsByUser = new Map<string, PriceAlert[]>();
    const localeByUser = new Map<string, "tr" | "en" | "el">();
    for (const row of users) {
      try {
        const raw = row.data?.stores?.["boranthegreat:alerts"];
        alertsByUser.set(row.user_id, parseAlerts(raw));
        const storedLocale = row.data?.stores?.["btg-language"];
        localeByUser.set(row.user_id, storedLocale === "en" || storedLocale === "el" ? storedLocale : "tr");
      } catch {
        alertsByUser.set(row.user_id, []);
        localeByUser.set(row.user_id, "tr");
      }
    }

    let sent = 0;
    for (const subscription of subscriptions) {
      const alerts = alertsByUser.get(subscription.user_id) ?? [];
      const nextState = { ...(subscription.last_triggered ?? {}) };
      const newlyTriggered: Array<{ alert: PriceAlert; current: number }> = [];
      for (const alert of alerts) {
        const current = prices[alert.symbol] ?? 0;
        if (!(current > 0)) continue;
        const triggered = alert.direction === "above" ? current >= alert.target : current <= alert.target;
        if (triggered && !nextState[alert.id]) newlyTriggered.push({ alert, current });
        nextState[alert.id] = triggered;
      }
      const update: Record<string, unknown> = { last_triggered: nextState, updated_at: new Date().toISOString() };
      if (newlyTriggered.length) {
        const first = newlyTriggered[0];
        const locale = localeByUser.get(subscription.user_id) ?? "tr";
        const currentText = first.current.toLocaleString("en-US", { maximumFractionDigits: 6 });
        const targetText = first.alert.target.toLocaleString("en-US");
        if (newlyTriggered.length === 1) {
          update.pending_title = locale === "en"
            ? `${first.alert.symbol} price alert triggered`
            : locale === "el"
              ? `Ενεργοποιήθηκε ειδοποίηση τιμής για ${first.alert.symbol}`
              : `${first.alert.symbol} fiyat alarmı tetiklendi`;
          update.pending_body = locale === "en"
            ? `Current: ${currentText} USD · Target: ${targetText}`
            : locale === "el"
              ? `Τρέχουσα τιμή: ${currentText} USD · Στόχος: ${targetText}`
              : `Güncel: ${currentText} USD · Hedef: ${targetText}`;
        } else {
          const symbols = newlyTriggered.map((item) => item.alert.symbol).slice(0, 5).join(", ");
          update.pending_title = locale === "en"
            ? `${newlyTriggered.length} price alerts triggered`
            : locale === "el"
              ? `Ενεργοποιήθηκαν ${newlyTriggered.length} ειδοποιήσεις τιμής`
              : `${newlyTriggered.length} fiyat alarmı tetiklendi`;
          update.pending_body = locale === "en"
            ? `Targets reached: ${symbols}`
            : locale === "el"
              ? `Επιτεύχθηκαν στόχοι για: ${symbols}`
              : `Hedefe ulaşanlar: ${symbols}`;
        }
        update.pending_url = `/${locale}/alerts`;
      }
      await serviceRest(`push_subscriptions?id=eq.${subscription.id}`, { method: "PATCH", body: JSON.stringify(update) });
      if (newlyTriggered.length) {
        const pushResponse = await sendEmptyWebPush(subscription.endpoint);
        if (pushResponse.ok) {
          sent += 1;
        } else if ([404, 410].includes(pushResponse.status)) {
          await serviceRest(`push_subscriptions?id=eq.${subscription.id}`, { method: "DELETE" });
        } else {
          for (const item of newlyTriggered) nextState[item.alert.id] = false;
          await serviceRest(`push_subscriptions?id=eq.${subscription.id}`, {
            method: "PATCH",
            body: JSON.stringify({ last_triggered: nextState, updated_at: new Date().toISOString() })
          });
        }
      }
    }
    return NextResponse.json({ ok: true, subscriptions: subscriptions.length, sent });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Alert check failed" }, { status: 500 });
  }
}
