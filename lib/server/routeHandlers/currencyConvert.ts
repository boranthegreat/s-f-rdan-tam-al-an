import { NextResponse } from "next/server";

type LatestRatesResponse = {
  rates: Record<string, number>;
};

const FRANKFURTER_URL = "https://api.frankfurter.app";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const amount = Number(searchParams.get("amount") ?? "0");
  const from = searchParams.get("from") ?? "USD";
  const to = searchParams.get("to") ?? "EUR";

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ value: 0 });
  }

  if (from === to) {
    return NextResponse.json({ value: amount });
  }

  try {
    const response = await fetch(`${FRANKFURTER_URL}/latest?amount=${amount}&from=${from}&to=${to}`, {
      next: { revalidate: 60 }
    });

    if (!response.ok) {
      return NextResponse.json({ message: "Döviz çevirisi yapılamadı." }, { status: response.status });
    }

    const data = (await response.json()) as LatestRatesResponse;
    const value = data.rates[to];

    if (typeof value !== "number") {
      return NextResponse.json({ message: "Döviz çevirisi sonucu alınamadı." }, { status: 502 });
    }

    return NextResponse.json({ value });
  } catch {
    return NextResponse.json({ message: "Döviz servisine ulaşılamadı." }, { status: 502 });
  }
}
