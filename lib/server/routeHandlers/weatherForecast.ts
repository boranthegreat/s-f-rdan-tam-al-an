import { NextResponse } from "next/server";
import type { CitySearchResult } from "@/types";

type WeatherResponse = {
  current: {
    temperature_2m: number;
    wind_speed_10m: number;
    relative_humidity_2m: number;
    weather_code: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    precipitation_probability: number[];
    weather_code: number[];
    wind_speed_10m: number[];
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
    weather_code: number[];
  };
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city: CitySearchResult = {
    id: Number(searchParams.get("id") ?? "0"),
    name: searchParams.get("name") ?? "Unknown",
    country: searchParams.get("country") ?? "",
    latitude: Number(searchParams.get("latitude")),
    longitude: Number(searchParams.get("longitude")),
    admin1: searchParams.get("admin1") ?? undefined
  };

  if (!Number.isFinite(city.latitude) || !Number.isFinite(city.longitude)) {
    return NextResponse.json({ message: "Geçerli koordinat bulunamadı." }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&hourly=temperature_2m,precipitation_probability,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code&forecast_days=7&timezone=auto`,
      { next: { revalidate: 900 } }
    );

    if (!response.ok) {
      return NextResponse.json({ message: "Hava durumu verileri alınamadı." }, { status: response.status });
    }

    const data = (await response.json()) as WeatherResponse;
    return NextResponse.json({
      city,
      current: {
        temperature: data.current.temperature_2m,
        windSpeed: data.current.wind_speed_10m,
        humidity: data.current.relative_humidity_2m,
        precipitationProbability: data.hourly.precipitation_probability[0] ?? 0,
        weatherCode: data.current.weather_code
      },
      hourly: data.hourly.time.slice(0, 12).map((time, index) => ({
        time,
        temperature: data.hourly.temperature_2m[index],
        precipitationProbability: data.hourly.precipitation_probability[index],
        weatherCode: data.hourly.weather_code[index],
        windSpeed: data.hourly.wind_speed_10m[index]
      })),
      daily: data.daily.time.map((date, index) => ({
        date,
        min: data.daily.temperature_2m_min[index],
        max: data.daily.temperature_2m_max[index],
        precipitationProbability: data.daily.precipitation_probability_max[index],
        weatherCode: data.daily.weather_code[index]
      }))
    });
  } catch {
    return NextResponse.json({ message: "Open-Meteo servisine ulaşılamadı." }, { status: 502 });
  }
}
