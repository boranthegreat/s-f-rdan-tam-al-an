import { NextResponse } from "next/server";

type HistoricalRatesResponse = {
  rates: Record<string, Record<string, number>>;
};

const FRANKFURTER_URL = "https://api.frankfurter.app";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from") ?? "USD";
  const to = searchParams.get("to") ?? "EUR";
  const days = Math.min(365, Math.max(1, Number(searchParams.get("days") ?? 14)));
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days);
  const format = (date: Date) => date.toISOString().slice(0, 10);

  try {
    const response = await fetch(`${FRANKFURTER_URL}/${format(start)}..${format(end)}?from=${from}&to=${to}`, {
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      return NextResponse.json({ message: "Döviz geçmiş verileri alınamadı." }, { status: response.status });
    }

    const data = (await response.json()) as HistoricalRatesResponse;
    const history = Object.entries(data.rates).map(([date, rates]) => ({
      date,
      value: rates[to]
    }));

    return NextResponse.json(history);
  } catch {
    return NextResponse.json({ message: "Döviz servisine ulaşılamadı." }, { status: 502 });
  }
}
