import type { CityImage, CitySearchResult, WeatherForecast } from "@/types";
import { fetchJson } from "./http";

export async function searchCities(query: string): Promise<CitySearchResult[]> {
  if (!query.trim()) {
    return [];
  }

  return fetchJson<CitySearchResult[]>(
    `/api/weather/search?q=${encodeURIComponent(query)}`,
    "Sehir aramasi yapilamadi."
  );
}

export async function getWeatherForecast(city: CitySearchResult): Promise<WeatherForecast> {
  const params = new URLSearchParams({
    id: String(city.id),
    name: city.name,
    country: city.country,
    latitude: String(city.latitude),
    longitude: String(city.longitude)
  });

  if (city.admin1) {
    params.set("admin1", city.admin1);
  }

  return fetchJson<WeatherForecast>(`/api/weather/forecast?${params.toString()}`, "Hava durumu verileri alinamadi.");
}

export async function getCityImage(city: CitySearchResult): Promise<CityImage> {
  const params = new URLSearchParams({
    id: String(city.id),
    name: city.name,
    country: city.country
  });

  if (city.admin1) {
    params.set("admin1", city.admin1);
  }

  return fetchJson<CityImage>(`/api/weather/image?${params.toString()}`, "Sehir gorseli alinamadi.");
}
