import { NextResponse } from "next/server";
import type { EconomicEvent } from "@/types";

function dateString(date: Date) {
  return date.toISOString().slice(0, 10);
}

function fallbackEvents(): EconomicEvent[] {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const later = new Date(today);
  later.setDate(today.getDate() + 3);
  return [
    { id: "fallback-us", date: dateString(today), country: "US", title: "ABD makro veri akışı", impact: "high", source: "Demo fallback" },
    { id: "fallback-eu", date: dateString(tomorrow), country: "EU", title: "Avrupa ekonomik veri akışı", impact: "medium", source: "Demo fallback" },
    { id: "fallback-tr", date: dateString(later), country: "TR", title: "Türkiye piyasa gündemi", impact: "medium", source: "Demo fallback" }
  ];
}

type FinnhubItem = {
  country?: string;
  event?: string;
  time?: string;
  impact?: string;
  actual?: number | string | null;
  estimate?: number | string | null;
  prev?: number | string | null;
  unit?: string;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from") ?? dateString(new Date());
  const toDate = new Date();
  toDate.setDate(toDate.getDate() + 14);
  const to = searchParams.get("to") ?? dateString(toDate);
  const token = process.env.FINNHUB_API_KEY;

  if (!token) {
    return NextResponse.json({ items: fallbackEvents(), live: false, provider: "setup-required" });
  }

  try {
    const url = new URL("https://finnhub.io/api/v1/calendar/economic");
    url.searchParams.set("from", from);
    url.searchParams.set("to", to);
    url.searchParams.set("token", token);
    const response = await fetch(url, { next: { revalidate: 1800 } });
    if (!response.ok) throw new Error("Finnhub unavailable");
    const data = (await response.json()) as { economicCalendar?: FinnhubItem[] };
    const items: EconomicEvent[] = (data.economicCalendar ?? []).slice(0, 40).map((item, index) => {
      const candidate = item.time ? new Date(item.time) : new Date(from);
      const date = Number.isNaN(candidate.getTime()) ? new Date(from) : candidate;
      const impactValue = String(item.impact ?? "medium").toLowerCase();
      const impact: EconomicEvent["impact"] = impactValue.includes("high") ? "high" : impactValue.includes("low") ? "low" : "medium";
      const unit = item.unit ? ` ${item.unit}` : "";
      const addUnit = (value: number | string | null | undefined) => value === null || value === undefined ? null : `${value}${unit}`;
      return {
        id: `${date.toISOString()}-${index}`,
        date: dateString(date),
        time: date.toISOString().slice(11, 16),
        country: item.country ?? "Global",
        title: item.event ?? "Economic event",
        impact,
        actual: addUnit(item.actual),
        estimate: addUnit(item.estimate),
        previous: addUnit(item.prev),
        source: "Finnhub"
      };
    });
    return NextResponse.json({ items, live: true, provider: "Finnhub" });
  } catch {
    return NextResponse.json({ items: fallbackEvents(), live: false, provider: "fallback" });
  }
}
