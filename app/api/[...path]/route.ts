import { NextResponse } from "next/server";
import { GET as getCoins } from "@/lib/server/routeHandlers/coins";
import { GET as getCoinDetail } from "@/lib/server/routeHandlers/coinDetail";
import { GET as getCurrencyRates } from "@/lib/server/routeHandlers/currencyRates";
import { GET as getCurrencyConvert } from "@/lib/server/routeHandlers/currencyConvert";
import { GET as getCurrencyHistory } from "@/lib/server/routeHandlers/currencyHistory";
import { GET as getEconomicCalendar } from "@/lib/server/routeHandlers/economicCalendar";
import { GET as getGold } from "@/lib/server/routeHandlers/gold";
import { GET as getNews } from "@/lib/server/routeHandlers/news";
import { GET as getWeatherSearch } from "@/lib/server/routeHandlers/weatherSearch";
import { GET as getWeatherForecast } from "@/lib/server/routeHandlers/weatherForecast";
import { GET as getWeatherImage } from "@/lib/server/routeHandlers/weatherImage";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { path = [] } = await context.params;
  const [section, action, ...rest] = path;

  if (section === "coins") {
    if (!action) return getCoins();
    return getCoinDetail(request, {
      params: Promise.resolve({ id: decodeURIComponent([action, ...rest].join("/")) })
    });
  }

  if (section === "currency") {
    if (action === "rates") return getCurrencyRates(request);
    if (action === "convert") return getCurrencyConvert(request);
    if (action === "history") return getCurrencyHistory(request);
  }

  if (section === "economic-calendar" && !action) return getEconomicCalendar(request);
  if (section === "gold" && !action) return getGold();
  if (section === "news" && !action) return getNews(request);

  if (section === "weather") {
    if (action === "search") return getWeatherSearch(request);
    if (action === "forecast") return getWeatherForecast(request);
    if (action === "image") return getWeatherImage(request);
  }

  return NextResponse.json({ error: "API route not found" }, { status: 404 });
}
