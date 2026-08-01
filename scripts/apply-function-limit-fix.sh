#!/usr/bin/env bash
set -euo pipefail

copy_handler() {
  local source="$1"
  local target="$2"
  mkdir -p "$(dirname "$target")"

  if [[ -f "$source" ]]; then
    cp "$source" "$target"
  elif [[ ! -f "$target" ]]; then
    echo "Required route is missing: $source" >&2
    exit 1
  fi
}

# Move existing route logic outside app/api so it no longer creates one
# Vercel Function per endpoint.
copy_handler "app/api/coins/route.ts" "lib/server/routeHandlers/coins.ts"
copy_handler "app/api/coins/[id]/route.ts" "lib/server/routeHandlers/coinDetail.ts"
copy_handler "app/api/currency/rates/route.ts" "lib/server/routeHandlers/currencyRates.ts"
copy_handler "app/api/currency/convert/route.ts" "lib/server/routeHandlers/currencyConvert.ts"
copy_handler "app/api/currency/history/route.ts" "lib/server/routeHandlers/currencyHistory.ts"
copy_handler "app/api/economic-calendar/route.ts" "lib/server/routeHandlers/economicCalendar.ts"
copy_handler "app/api/gold/route.ts" "lib/server/routeHandlers/gold.ts"
copy_handler "app/api/news/route.ts" "lib/server/routeHandlers/news.ts"
copy_handler "app/api/weather/search/route.ts" "lib/server/routeHandlers/weatherSearch.ts"
copy_handler "app/api/weather/forecast/route.ts" "lib/server/routeHandlers/weatherForecast.ts"
copy_handler "app/api/weather/image/route.ts" "lib/server/routeHandlers/weatherImage.ts"
copy_handler "app/api/push/public-key/route.ts" "lib/server/routeHandlers/pushPublicKey.ts"
copy_handler "app/api/push/pending/route.ts" "lib/server/routeHandlers/pushPending.ts"
copy_handler "app/api/push/subscribe/route.ts" "lib/server/routeHandlers/pushSubscribe.ts"

# Replace eleven public-data endpoints with one catch-all Vercel Function.
mkdir -p 'app/api/[...path]'
cat > 'app/api/[...path]/route.ts' <<'TS'
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
TS

# Replace three push endpoints with one Vercel Function.
mkdir -p 'app/api/push/[action]'
cat > 'app/api/push/[action]/route.ts' <<'TS'
import { NextResponse } from "next/server";
import { GET as getPublicKey } from "@/lib/server/routeHandlers/pushPublicKey";
import { GET as getPending } from "@/lib/server/routeHandlers/pushPending";
import {
  POST as subscribe,
  DELETE as unsubscribe
} from "@/lib/server/routeHandlers/pushSubscribe";

type RouteContext = {
  params: Promise<{ action: string }>;
};

async function actionFrom(context: RouteContext) {
  return (await context.params).action;
}

export async function GET(request: Request, context: RouteContext) {
  const action = await actionFrom(context);
  if (action === "public-key") return getPublicKey();
  if (action === "pending") return getPending(request);
  return NextResponse.json({ error: "Push route not found" }, { status: 404 });
}

export async function POST(request: Request, context: RouteContext) {
  const action = await actionFrom(context);
  if (action === "subscribe") return subscribe(request);
  return NextResponse.json({ error: "Push route not found" }, { status: 404 });
}

export async function DELETE(request: Request, context: RouteContext) {
  const action = await actionFrom(context);
  if (action === "subscribe") return unsubscribe(request);
  return NextResponse.json({ error: "Push route not found" }, { status: 404 });
}
TS

# Remove old route entry points after their logic has been copied.
rm -rf \
  app/api/coins \
  app/api/currency \
  app/api/economic-calendar \
  app/api/gold \
  app/api/news \
  app/api/weather \
  app/api/push/public-key \
  app/api/push/pending \
  app/api/push/subscribe

# Earlier browser uploads accidentally placed an extra Vercel /api directory
# and App Router files in the repository root. They must not be deployed.
rm -rf api alerts auth coins currency favorites news offline portfolio search settings weather
rm -f globals.css icon.svg layout.tsx manifest.ts opengraph-image.tsx page.tsx robots.ts sitemap.ts

# Remove root-level duplicate component files while preserving components/.
if [[ -d components ]]; then
  while IFS= read -r component; do
    rm -f "$(basename "$component")"
  done < <(find components -maxdepth 1 -type f \( -name '*.tsx' -o -name '*.ts' \) -print)
fi

function_count=$(find app/api -type f -name 'route.ts' | wc -l | tr -d ' ')
echo "app/api Vercel Function entry points: $function_count"

if (( function_count > 12 )); then
  echo "Function limit is still exceeded." >&2
  find app/api -type f -name 'route.ts' -print >&2
  exit 1
fi

if [[ -d api ]]; then
  echo "Unexpected root api directory still exists." >&2
  exit 1
fi

# The expected result is four API entry points:
# assistant, cron, public-data catch-all, and push catch-all.
if (( function_count != 4 )); then
  echo "Expected 4 app/api entry points, found $function_count." >&2
  find app/api -type f -name 'route.ts' -print >&2
  exit 1
fi

find app/api -type f -name 'route.ts' -print | sort
