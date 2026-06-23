"use client";

import { CloudRain, CloudSun, Cloudy, Search, Snowflake, Sun, Umbrella, Wind } from "lucide-react";
import Image, { type ImageLoaderProps } from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ErrorState } from "@/components/ErrorState";
import { FavoriteButton } from "@/components/FavoriteButton";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { defaultCities, worldCapitals } from "@/data/cities";
import { getCityImage, getWeatherForecast, searchCities } from "@/lib/api/weather";
import { useFavorites } from "@/lib/useFavorites";
import type { CityImage, CitySearchResult, WeatherForecast } from "@/types";

const cityImageLoader = ({ src }: ImageLoaderProps) => src;

export function WeatherPanel({ compact = false }: { compact?: boolean }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CitySearchResult[]>([]);
  const [selectedCity, setSelectedCity] = useState<CitySearchResult>(defaultCities[0]);
  const [forecast, setForecast] = useState<WeatherForecast | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");
  const [cityImage, setCityImage] = useState<CityImage | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [capitalForecasts, setCapitalForecasts] = useState<WeatherForecast[]>([]);
  const [capitalLoading, setCapitalLoading] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    async function loadWeather() {
      try {
        setIsLoading(true);
        setForecast(await getWeatherForecast(selectedCity));
        setError("");
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Hava durumu yüklenemedi.");
      } finally {
        setIsLoading(false);
      }
    }

    loadWeather();
  }, [selectedCity]);

  useEffect(() => {
    if (compact) {
      return;
    }

    async function loadImage() {
      try {
        setImageLoading(true);
        setCityImage(await getCityImage(selectedCity));
      } catch {
        setCityImage(null);
      } finally {
        setImageLoading(false);
      }
    }

    loadImage();
  }, [compact, selectedCity]);

  useEffect(() => {
    if (compact) {
      return;
    }

    async function loadCapitals() {
      setCapitalLoading(true);
      const featuredCapitals = worldCapitals.slice(0, 12);
      const responses = await Promise.allSettled(featuredCapitals.map((city) => getWeatherForecast(city)));
      setCapitalForecasts(
        responses
          .filter((response): response is PromiseFulfilledResult<WeatherForecast> => response.status === "fulfilled")
          .map((response) => response.value)
      );
      setCapitalLoading(false);
    }

    loadCapitals().catch(() => setCapitalLoading(false));
  }, [compact]);

  async function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setIsSearching(true);
      setResults(await searchCities(query));
      setError("");
    } catch (searchError) {
      setError(searchError instanceof Error ? searchError.message : "Şehir aranamadı.");
    } finally {
      setIsSearching(false);
    }
  }

  const daily = useMemo(() => (compact ? forecast?.daily.slice(0, 4) : forecast?.daily), [compact, forecast]);

  if (isLoading && !forecast) {
    return <LoadingSkeleton count={compact ? 2 : 4} />;
  }

  return (
    <div className="space-y-6">
      {error ? <ErrorState message={error} /> : null}

      {!compact ? (
        <div className="space-y-6">
          <section className="glass-card p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-mint">Dünya başkent radarı</p>
                <h2 className="mt-2 text-2xl font-black text-white">Canlı başkent hava durumu</h2>
                <p className="mt-2 max-w-3xl text-sm text-slate-400">
                  Öne çıkan başkentleri anlık izle; alttaki listeden dünyadaki başkentlerden birini seçip detaylı 7 günlük tahmini aç.
                </p>
              </div>
              <span className="rounded-full border border-mint/20 bg-mint/10 px-3 py-1 text-xs font-bold text-mint">
                {worldCapitals.length}+ başkent
              </span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {capitalLoading && capitalForecasts.length === 0 ? <LoadingSkeleton count={4} /> : null}
              {capitalForecasts.map((capital) => (
                <button
                  key={`capital-live-${capital.city.id}`}
                  type="button"
                  onClick={() => setSelectedCity(capital.city)}
                  className="rounded-lg border border-line bg-white/5 p-4 text-left transition hover:-translate-y-0.5 hover:border-mint/40 hover:bg-white/10"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-white">{capital.city.name}</p>
                      <p className="text-xs text-slate-400">{capital.city.country}</p>
                    </div>
                    <WeatherIcon code={capital.current.weatherCode} className="h-6 w-6 text-mint" />
                  </div>
                  <p className="mt-4 text-3xl font-black text-white">{Math.round(capital.current.temperature)} C</p>
                  <p className="mt-2 text-xs text-slate-400">
                    Nem %{capital.current.humidity} - Yağış %{capital.current.precipitationProbability}
                  </p>
                </button>
              ))}
            </div>
          </section>

          <section className="glass-card p-5">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-mint">Tüm başkentler</p>
                <h2 className="text-xl font-black text-white">Başkent seç ve canlı tahmini aç</h2>
              </div>
              <p className="text-sm text-slate-400">{worldCapitals.length} başkent listeleniyor</p>
            </div>
            <div className="grid max-h-80 gap-2 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {worldCapitals.map((city) => (
                <button
                  key={`capital-${city.id}-${city.name}`}
                  type="button"
                  onClick={() => setSelectedCity(city)}
                  className={
                    selectedCity.id === city.id
                      ? "rounded-lg border border-mint/50 bg-mint/10 p-3 text-left text-sm font-bold text-white"
                      : "rounded-lg border border-line bg-white/5 p-3 text-left text-sm text-slate-300 transition hover:border-mint/40 hover:bg-white/10 hover:text-white"
                  }
                >
                  {city.name}
                  <span className="block text-xs font-normal text-slate-500">{city.country}</span>
                </button>
              ))}
            </div>
          </section>

          <form onSubmit={handleSearch} className="glass-card grid gap-3 p-4 sm:grid-cols-[1fr_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                className="premium-input w-full pl-10"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Listede yoksa dünya genelinde şehir ara..."
              />
            </div>
            <button className="premium-button" type="submit" disabled={isSearching}>
              {isSearching ? "Aranıyor..." : "Ara"}
            </button>
            {results.length > 0 ? (
              <div className="grid gap-2 sm:col-span-2 sm:grid-cols-2 lg:grid-cols-3">
                {results.map((city) => (
                  <button
                    key={`${city.id}-${city.latitude}`}
                    type="button"
                    onClick={() => setSelectedCity(city)}
                    className="rounded-lg border border-line bg-white/5 p-3 text-left text-sm text-slate-300 transition hover:-translate-y-0.5 hover:border-mint/40 hover:bg-white/10 hover:text-white"
                  >
                    {city.name}, {city.admin1 ? `${city.admin1}, ` : ""}
                    {city.country}
                  </button>
                ))}
              </div>
            ) : null}
          </form>
          </div>
      ) : null}

      {forecast ? (
        <>
          <div className="glass-card p-6">
            <div className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
              <div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-5">
                <div className="grid h-24 w-24 shrink-0 place-items-center rounded-2xl border border-mint/20 bg-mint/10 shadow-[0_0_42px_rgba(94,234,212,0.16)]">
                  <WeatherIcon code={forecast.current.weatherCode} className="h-12 w-12 text-mint" />
                </div>
                <div>
                <p className="text-sm uppercase tracking-[0.24em] text-mint">Canlı hava durumu</p>
                <h2 className="shine-text mt-2 text-3xl font-black">
                  {forecast.city.name}, {forecast.city.country}
                </h2>
                  <p className="mt-2 text-sm text-slate-400">{weatherDescription(forecast.current.weatherCode)}</p>
                  <p className="mt-3 text-6xl font-black text-white">{Math.round(forecast.current.temperature)} C</p>
                </div>
              </div>
              <FavoriteButton
                label={`${forecast.city.name} favori`}
                isFavorite={isFavorite(`city:${forecast.city.id}`)}
                onClick={() =>
                  toggleFavorite({
                    id: `city:${forecast.city.id}`,
                    type: "city",
                    name: `${forecast.city.name}, ${forecast.city.country}`
                  })
                }
              />
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <WeatherMini label="Rüzgar" value={`${forecast.current.windSpeed} km/s`} />
              <WeatherMini label="Nem" value={`${forecast.current.humidity}%`} />
              <WeatherMini label="Yağış ihtimali" value={`${forecast.current.precipitationProbability}%`} />
            </div>
              </div>
              {!compact ? <CityVisualCard city={forecast.city} image={cityImage} isLoading={imageLoading} /> : null}
            </div>
          </div>

          {!compact ? (
            <div className="glass-card p-5">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-mint">Saatlik tahmin</p>
                  <h2 className="text-xl font-black text-white">Önümüzdeki 12 saat</h2>
                </div>
                <Wind className="h-5 w-5 text-mint" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
                {forecast.hourly.map((hour) => (
                  <div key={hour.time} className="rounded-lg border border-line bg-white/5 p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-white">
                        {new Intl.DateTimeFormat("tr-TR", { hour: "2-digit", minute: "2-digit" }).format(new Date(hour.time))}
                      </p>
                      <WeatherIcon code={hour.weatherCode} className="h-5 w-5 text-mint" />
                    </div>
                    <p className="mt-3 text-2xl font-black text-white">{Math.round(hour.temperature)} C</p>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-gradient-to-r from-mint to-skyglow" style={{ width: `${Math.min(100, Math.max(8, hour.precipitationProbability))}%` }} />
                    </div>
                    <p className="mt-2 text-xs text-slate-400">Yağış {hour.precipitationProbability}% - Rüzgar {hour.windSpeed} km/s</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {daily?.map((day) => (
              <div key={day.date} className="glass-card p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-slate-400">
                    {new Intl.DateTimeFormat("tr-TR", { weekday: "short", day: "numeric", month: "short" }).format(
                      new Date(day.date)
                    )}
                  </p>
                  <WeatherIcon code={day.weatherCode} className="h-5 w-5 text-mint" />
                </div>
                <p className="mt-4 text-2xl font-black text-white">
                  {Math.round(day.max)} / {Math.round(day.min)} C
                </p>
                <p className="mt-3 text-sm text-slate-400">Yağış {day.precipitationProbability}%</p>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

function CityVisualCard({ city, image, isLoading }: { city: CitySearchResult; image: CityImage | null; isLoading: boolean }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white/5">
      <div className="relative h-72">
        {image ? (
          <Image
            src={image.imageUrl}
            alt={`${city.name} şehir görseli`}
            fill
            sizes="(min-width: 1280px) 420px, 100vw"
            className="object-cover"
            loader={cityImageLoader}
            unoptimized
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="grid h-full place-items-center bg-[radial-gradient(circle_at_30%_20%,var(--accent-soft),transparent_18rem),linear-gradient(135deg,#020617,#111827)]">
            <div className="text-center">
              <CloudSun className="mx-auto h-12 w-12 text-mint" />
              <p className="mt-3 text-sm font-bold text-white">
                {isLoading ? "Şehir görseli doğrulanıyor..." : "Doğrulanmış görsel yok"}
              </p>
              {!isLoading ? (
                <p className="mx-auto mt-2 max-w-60 text-xs leading-5 text-slate-400">
                  Yanlış şehir fotoğrafı göstermemek için bu alan boş bırakıldı.
                </p>
              ) : null}
            </div>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/72 to-transparent p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-mint">
            {image?.verified ? "Doğrulanmış şehir görseli" : "Şehir görseli"}
          </p>
          <h3 className="mt-1 text-xl font-black text-white">{image?.title ?? `${city.name}, ${city.country}`}</h3>
          {image?.description ? <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-300">{image.description}</p> : null}
        </div>
      </div>
      {image?.sourceUrl ? (
        <a
          href={image.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="block border-t border-line px-4 py-3 text-xs font-semibold text-slate-400 transition hover:bg-white/5 hover:text-white"
        >
          Kaynak: Wikipedia - doğrulanmış sayfa eşleşmesi
        </a>
      ) : (
        <div className="border-t border-line px-4 py-3 text-xs text-slate-500">Seçilen şehir için tanıtıcı görsel alanı</div>
      )}
    </div>
  );
}

function weatherDescription(code: number) {
  if (code === 0) return "Açık ve güneşli";
  if ([1, 2].includes(code)) return "Parçalı bulutlu";
  if (code === 3) return "Bulutlu";
  if ([45, 48].includes(code)) return "Sisli";
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "Yağışlı";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Karli";
  if ([95, 96, 99].includes(code)) return "Gök gürültülü";
  return "Değişken hava";
}

function WeatherIcon({ code, className }: { code: number; className: string }) {
  if (code === 0) return <Sun className={className} />;
  if ([1, 2].includes(code)) return <CloudSun className={className} />;
  if (code === 3 || [45, 48].includes(code)) return <Cloudy className={className} />;
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return <CloudRain className={className} />;
  if ([71, 73, 75, 77, 85, 86].includes(code)) return <Snowflake className={className} />;
  if ([95, 96, 99].includes(code)) return <Umbrella className={className} />;
  return <CloudSun className={className} />;
}

function WeatherMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-white/5 p-4 transition hover:border-mint/30 hover:bg-white/10">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-bold text-white">{value}</p>
    </div>
  );
}
