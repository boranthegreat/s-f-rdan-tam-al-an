import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();

  if (!query) {
    return NextResponse.json([]);
  }

  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        query
      )}&count=6&language=en&format=json`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) {
      return NextResponse.json({ message: "Şehir araması yapılamadı." }, { status: response.status });
    }

    const data = (await response.json()) as { results?: unknown[] };
    return NextResponse.json(data.results ?? []);
  } catch {
    return NextResponse.json({ message: "Open-Meteo arama servisine ulaşılamadı." }, { status: 502 });
  }
}
