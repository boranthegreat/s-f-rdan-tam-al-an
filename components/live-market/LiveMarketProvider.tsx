"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { getCoinMarkets } from "@/lib/api/coins";
import { getCurrencyRates } from "@/lib/api/currency";
import { getGoldRate } from "@/lib/api/gold";
import type { CoinMarket, CurrencyRate, GoldRate } from "@/types";
import { trackedCurrencies } from "@/data/currencies";

export type LiveDirection = "up" | "down" | "same";
export type LiveConnectionStatus = "connecting" | "live" | "reconnecting" | "fallback" | "offline";

export type LiveMovement = {
  direction: LiveDirection;
  sequence: number;
};

type LiveMarketContextValue = {
  coins: CoinMarket[];
  rates: CurrencyRate[];
  gold: GoldRate | null;
  status: LiveConnectionStatus;
  updatedAt: Date | null;
  isLoading: boolean;
  error: string;
  getRate: (code: string) => number;
  convert: (amount: number, from: string, to: string) => number | null;
  getMovement: (marketKey: string) => LiveMovement;
  hasLivePrice: (marketKey: string) => boolean;
};

type BinanceBookTicker = {
  s?: string;
  b?: string;
  a?: string;
};

type BinanceCombinedMessage = {
  stream?: string;
  data?: BinanceBookTicker;
};

const TROY_OUNCE_GRAMS = 31.1034768;

const COIN_SYMBOL_TO_ID: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
  BNB: "binancecoin",
  XRP: "ripple",
  TRX: "tron"
};

const LIVE_COIN_DEFAULTS: CoinMarket[] = [
  { id: "bitcoin", symbol: "btc", name: "Bitcoin", image: "/icon-192.png", current_price: 0, market_cap: 0, total_volume: 0, price_change_percentage_24h: 0 },
  { id: "ethereum", symbol: "eth", name: "Ethereum", image: "/icon-192.png", current_price: 0, market_cap: 0, total_volume: 0, price_change_percentage_24h: 0 },
  { id: "solana", symbol: "sol", name: "Solana", image: "/icon-192.png", current_price: 0, market_cap: 0, total_volume: 0, price_change_percentage_24h: 0 },
  { id: "binancecoin", symbol: "bnb", name: "BNB", image: "/icon-192.png", current_price: 0, market_cap: 0, total_volume: 0, price_change_percentage_24h: 0 },
  { id: "ripple", symbol: "xrp", name: "XRP", image: "/icon-192.png", current_price: 0, market_cap: 0, total_volume: 0, price_change_percentage_24h: 0 },
  { id: "tron", symbol: "trx", name: "TRON", image: "/icon-192.png", current_price: 0, market_cap: 0, total_volume: 0, price_change_percentage_24h: 0 }
];

const STREAM_SYMBOLS = [
  "btcusdt",
  "ethusdt",
  "solusdt",
  "bnbusdt",
  "xrpusdt",
  "trxusdt",
  "usdttry",
  "btctry",
  "ethtry",
  "eurusdt",
  "gbpusdt",
  "audusdt",
  "paxgusdt"
];

const STREAM_ENDPOINTS = [
  "wss://data-stream.binance.vision:443",
  "wss://stream.binance.com:443",
  "wss://stream.binance.com:9443"
];

const defaultMovement: LiveMovement = { direction: "same", sequence: 0 };
const LiveMarketContext = createContext<LiveMarketContextValue | null>(null);

function averageBookPrice(data: BinanceBookTicker) {
  const bid = Number(data.b);
  const ask = Number(data.a);

  if (Number.isFinite(bid) && Number.isFinite(ask) && bid > 0 && ask > 0) {
    return (bid + ask) / 2;
  }

  if (Number.isFinite(bid) && bid > 0) return bid;
  if (Number.isFinite(ask) && ask > 0) return ask;
  return 0;
}

function buildLogicalPrices(raw: Record<string, number>) {
  const logical: Record<string, number> = {};

  for (const symbol of Object.keys(COIN_SYMBOL_TO_ID)) {
    const value = raw[`${symbol}USDT`];
    if (Number.isFinite(value) && value > 0) logical[symbol] = value;
  }

  let usdTry = raw.USDTTRY;
  if ((!Number.isFinite(usdTry) || usdTry <= 0) && raw.BTCTRY && raw.BTCUSDT) usdTry = raw.BTCTRY / raw.BTCUSDT;
  if ((!Number.isFinite(usdTry) || usdTry <= 0) && raw.ETHTRY && raw.ETHUSDT) usdTry = raw.ETHTRY / raw.ETHUSDT;
  if (Number.isFinite(usdTry) && usdTry > 0) logical.USDTRY = usdTry;

  const eurUsd = raw.EURUSDT;
  if (Number.isFinite(eurUsd) && eurUsd > 0) logical.USDEUR = 1 / eurUsd;

  const gbpUsd = raw.GBPUSDT;
  if (Number.isFinite(gbpUsd) && gbpUsd > 0) logical.USDGBP = 1 / gbpUsd;

  const audUsd = raw.AUDUSDT;
  if (Number.isFinite(audUsd) && audUsd > 0) logical.USDAUD = 1 / audUsd;

  const paxgUsd = raw.PAXGUSDT;
  if (Number.isFinite(paxgUsd) && paxgUsd > 0) {
    logical.GOLD_OUNCE_USD = paxgUsd;
    logical.GOLD_GRAM_USD = paxgUsd / TROY_OUNCE_GRAMS;
    if (Number.isFinite(usdTry) && usdTry > 0) {
      logical.GOLD_GRAM_TRY = (paxgUsd * usdTry) / TROY_OUNCE_GRAMS;
    }
  }

  return logical;
}

export function LiveMarketProvider({ children }: { children: React.ReactNode }) {
  const [baseCoins, setBaseCoins] = useState<CoinMarket[]>([]);
  const [baseRates, setBaseRates] = useState<CurrencyRate[]>([]);
  const [baseGold, setBaseGold] = useState<GoldRate | null>(null);
  const [livePrices, setLivePrices] = useState<Record<string, number>>({});
  const [movements, setMovements] = useState<Record<string, LiveMovement>>({});
  const [status, setStatus] = useState<LiveConnectionStatus>("connecting");
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const socketRef = useRef<WebSocket | null>(null);
  const rawPricesRef = useRef<Record<string, number>>({});
  const publishedPricesRef = useRef<Record<string, number>>({});
  const reconnectTimerRef = useRef<number | null>(null);
  const reconnectAttemptRef = useRef(0);
  const endpointIndexRef = useRef(0);
  const stoppedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function loadFallbackData() {
      const [coinResult, rateResult, goldResult] = await Promise.allSettled([
        getCoinMarkets(),
        getCurrencyRates("USD"),
        getGoldRate()
      ]);

      if (cancelled) return;

      if (coinResult.status === "fulfilled") setBaseCoins(coinResult.value);
      if (rateResult.status === "fulfilled") {
        const withUsd = rateResult.value.some((rate) => rate.code === "USD")
          ? rateResult.value
          : [{ code: "USD", name: "US Dollar", rate: 1 }, ...rateResult.value];
        setBaseRates(withUsd);
      }
      if (goldResult.status === "fulfilled") setBaseGold(goldResult.value);

      const failures = [coinResult, rateResult, goldResult].filter((item) => item.status === "rejected").length;
      setError(failures === 3 ? "Piyasa verileri şu anda alınamıyor." : "");
      setIsLoading(false);
    }

    loadFallbackData().catch(() => {
      if (!cancelled) {
        setError("Piyasa verileri şu anda alınamıyor.");
        setIsLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    stoppedRef.current = false;
    const streamPath = STREAM_SYMBOLS.map((symbol) => `${symbol}@bookTicker`).join("/");
    let hasReceivedMessage = false;

    function publishPrices() {
      const nextLogical = buildLogicalPrices(rawPricesRef.current);
      const changed: Record<string, number> = {};
      const previousPrices: Record<string, number | undefined> = {};

      for (const [marketKey, nextPrice] of Object.entries(nextLogical)) {
        const previousPrice = publishedPricesRef.current[marketKey];
        if (previousPrice === nextPrice) continue;
        previousPrices[marketKey] = previousPrice;
        changed[marketKey] = nextPrice;
        publishedPricesRef.current[marketKey] = nextPrice;
      }

      if (!Object.keys(changed).length) return;

      setLivePrices((current) => ({ ...current, ...changed }));
      setMovements((current) => {
        const next = { ...current };
        for (const [marketKey, nextPrice] of Object.entries(changed)) {
          const previous = previousPrices[marketKey];
          const currentMovement = current[marketKey] ?? defaultMovement;
          const direction: LiveDirection =
            typeof previous === "number" && Number.isFinite(previous) && previous > 0
              ? nextPrice > previous
                ? "up"
                : nextPrice < previous
                  ? "down"
                  : "same"
              : "same";
          next[marketKey] = {
            direction,
            sequence: direction === "same" ? currentMovement.sequence : currentMovement.sequence + 1
          };
        }
        return next;
      });
      setUpdatedAt(new Date());
    }

    const publishTimer = window.setInterval(publishPrices, 140);

    function clearReconnectTimer() {
      if (reconnectTimerRef.current !== null) {
        window.clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    }

    function scheduleReconnect() {
      if (stoppedRef.current) return;
      clearReconnectTimer();
      reconnectAttemptRef.current += 1;
      endpointIndexRef.current = (endpointIndexRef.current + 1) % STREAM_ENDPOINTS.length;
      setStatus(navigator.onLine ? "reconnecting" : "offline");
      const delay = Math.min(15000, 750 * 2 ** Math.min(reconnectAttemptRef.current, 5));
      reconnectTimerRef.current = window.setTimeout(connect, delay);
    }

    function connect() {
      if (stoppedRef.current) return;
      clearReconnectTimer();
      hasReceivedMessage = false;

      if (!navigator.onLine) {
        setStatus("offline");
        scheduleReconnect();
        return;
      }

      try {
        setStatus(reconnectAttemptRef.current ? "reconnecting" : "connecting");
        const endpoint = STREAM_ENDPOINTS[endpointIndexRef.current];
        const socket = new WebSocket(`${endpoint}/stream?streams=${streamPath}`);
        socketRef.current = socket;

        socket.onopen = () => {
          reconnectAttemptRef.current = 0;
        };

        socket.onmessage = (event) => {
          try {
            const message = JSON.parse(String(event.data)) as BinanceCombinedMessage;
            const data = message.data;
            const symbol = data?.s?.toUpperCase();
            if (!data || !symbol) return;

            const price = averageBookPrice(data);
            if (!price) return;

            rawPricesRef.current[symbol] = price;
            if (!hasReceivedMessage) {
              hasReceivedMessage = true;
              setStatus("live");
            }
          } catch {
            // Ignore malformed third-party stream messages and keep the last good values.
          }
        };

        socket.onerror = () => {
          socket.close();
        };

        socket.onclose = () => {
          if (socketRef.current === socket) socketRef.current = null;
          if (!stoppedRef.current) scheduleReconnect();
        };
      } catch {
        scheduleReconnect();
      }
    }

    function handleOnline() {
      reconnectAttemptRef.current = 0;
      connect();
    }

    function handleOffline() {
      setStatus("offline");
      socketRef.current?.close();
    }

    connect();
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      stoppedRef.current = true;
      window.clearInterval(publishTimer);
      clearReconnectTimer();
      socketRef.current?.close();
      socketRef.current = null;
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const coins = useMemo(() => {
    const source = baseCoins.length ? baseCoins : LIVE_COIN_DEFAULTS;
    return source.map((coin) => {
      const livePrice = livePrices[coin.symbol.toUpperCase()];
      return livePrice ? { ...coin, current_price: livePrice } : coin;
    });
  }, [baseCoins, livePrices]);

  const rates = useMemo(() => {
    const source = baseRates.length
      ? baseRates
      : trackedCurrencies.map((currency) => ({ ...currency, rate: currency.code === "USD" ? 1 : 0 }));
    const liveRateByCode: Record<string, number | undefined> = {
      USD: 1,
      TRY: livePrices.USDTRY,
      EUR: livePrices.USDEUR,
      GBP: livePrices.USDGBP,
      AUD: livePrices.USDAUD
    };

    return source.map((rate) => {
      const nextRate = liveRateByCode[rate.code];
      return nextRate && Number.isFinite(nextRate) ? { ...rate, rate: nextRate } : rate;
    });
  }, [baseRates, livePrices]);

  const gold = useMemo<GoldRate | null>(() => {
    if (!baseGold && !livePrices.GOLD_OUNCE_USD) return null;

    return {
      ounceUsd: livePrices.GOLD_OUNCE_USD ?? baseGold?.ounceUsd ?? 0,
      gramUsd: livePrices.GOLD_GRAM_USD ?? baseGold?.gramUsd ?? 0,
      gramTry: livePrices.GOLD_GRAM_TRY ?? baseGold?.gramTry ?? 0,
      source: livePrices.GOLD_OUNCE_USD
        ? "Binance PAXG/USDT + TRY çapraz akışıyla canlı yaklaşık değer"
        : baseGold?.source ?? "Altın verisi",
      updatedAt: updatedAt?.toISOString() ?? baseGold?.updatedAt ?? new Date().toISOString()
    };
  }, [baseGold, livePrices, updatedAt]);

  const rateMap = useMemo(() => new Map(rates.map((rate) => [rate.code.toUpperCase(), rate.rate])), [rates]);

  const getRate = useCallback(
    (code: string) => {
      if (code.toUpperCase() === "USD") return 1;
      return rateMap.get(code.toUpperCase()) ?? 0;
    },
    [rateMap]
  );

  const convert = useCallback(
    (amount: number, from: string, to: string) => {
      const fromRate = getRate(from);
      const toRate = getRate(to);
      if (!Number.isFinite(amount) || !fromRate || !toRate) return null;
      return (amount / fromRate) * toRate;
    },
    [getRate]
  );

  const getMovement = useCallback((marketKey: string) => movements[marketKey] ?? defaultMovement, [movements]);
  const hasLivePrice = useCallback((marketKey: string) => Boolean(livePrices[marketKey]), [livePrices]);

  const value = useMemo<LiveMarketContextValue>(
    () => ({
      coins,
      rates,
      gold,
      status: status === "connecting" && !isLoading && !Object.keys(livePrices).length ? "fallback" : status,
      updatedAt,
      isLoading,
      error,
      getRate,
      convert,
      getMovement,
      hasLivePrice
    }),
    [coins, rates, gold, status, updatedAt, isLoading, error, getRate, convert, getMovement, hasLivePrice, livePrices]
  );

  return <LiveMarketContext.Provider value={value}>{children}</LiveMarketContext.Provider>;
}

export function useLiveMarket() {
  const context = useContext(LiveMarketContext);
  if (!context) throw new Error("useLiveMarket must be used inside LiveMarketProvider.");
  return context;
}

export function coinMarketKey(symbol: string) {
  return symbol.toUpperCase();
}

export function currencyMarketKey(code: string) {
  return code.toUpperCase() === "USD" ? "USD" : `USD${code.toUpperCase()}`;
}
