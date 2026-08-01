export type FavoriteType = "currency" | "coin" | "city";

export type FavoriteItem = {
  id: string;
  name: string;
  type: FavoriteType;
  symbol?: string;
};

export type CurrencyRate = {
  code: string;
  name: string;
  rate: number;
};

export type CurrencyTimePoint = {
  date: string;
  value: number;
};

export type CoinMarket = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  price_change_percentage_24h: number;
  sparkline_in_7d?: {
    price: number[];
  };
};

export type CitySearchResult = {
  id: number;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  admin1?: string;
};

export type WeatherForecast = {
  city: CitySearchResult;
  current: {
    temperature: number;
    windSpeed: number;
    humidity: number;
    precipitationProbability: number;
    weatherCode: number;
  };
  hourly: Array<{
    time: string;
    temperature: number;
    precipitationProbability: number;
    weatherCode: number;
    windSpeed: number;
  }>;
  daily: Array<{
    date: string;
    min: number;
    max: number;
    precipitationProbability: number;
    weatherCode: number;
  }>;
};

export type CityImage = {
  title: string;
  imageUrl: string;
  sourceUrl: string;
  description?: string;
  verified?: boolean;
};

export type GoldRate = {
  ounceUsd: number;
  gramUsd: number;
  gramTry: number;
  source: string;
  updatedAt: string;
};

export type PortfolioAssetType = "coin" | "currency" | "gold";

export type PortfolioAsset = {
  id: string;
  type: PortfolioAssetType;
  symbol: string;
  amount: number;
};

export type PriceAlert = {
  id: string;
  targetType: "coin" | "currency" | "gold";
  symbol: string;
  direction: "above" | "below";
  target: number;
  createdAt: string;
};

export type AssistantMessage = {
  role: "user" | "assistant";
  content: string;
};

export type AssistantResponse = {
  answer: string;
  mode: "ai" | "local";
  suggestions: string[];
};

export type CoinDetail = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  description: string;
  homepage?: string;
  currentPrice: number;
  marketCap: number;
  totalVolume: number;
  high24h: number;
  low24h: number;
  ath: number;
  circulatingSupply: number;
  totalSupply: number | null;
  change24h: number;
  change7d: number;
  change30d: number;
  lastUpdated: string;
  history: Array<{ date: string; value: number }>;
  history24h: Array<{ date: string; value: number }>;
};

export type MarketNewsItem = {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  image?: string;
  category: "crypto" | "forex" | "economy" | "world";
};

export type EconomicEvent = {
  id: string;
  date: string;
  time?: string;
  country: string;
  title: string;
  impact: "low" | "medium" | "high";
  actual?: string | number | null;
  estimate?: string | number | null;
  previous?: string | number | null;
  source?: string;
};
