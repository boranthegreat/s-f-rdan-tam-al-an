"use client";

import { useMemo, useState } from "react";
import { LivePrice } from "@/components/live-market/LivePrice";
import { coinMarketKey, currencyMarketKey, useLiveMarket } from "@/components/live-market/LiveMarketProvider";
import { formatCurrency, formatNumber } from "@/lib/format";
import { usePortfolio } from "@/lib/usePortfolio";
import type { PortfolioAssetType } from "@/types";

const assetSymbols: Record<PortfolioAssetType, string[]> = {
  coin: ["BTC", "ETH", "SOL", "BNB", "XRP", "TRX"],
  currency: ["USD", "EUR", "GBP", "TRY"],
  gold: ["GOLD"]
};

export function PortfolioPanel({ compact = false }: { compact?: boolean }) {
  const { assets, upsertAsset, removeAsset, clearPortfolio } = usePortfolio();
  const { coins, gold, convert } = useLiveMarket();
  const [type, setType] = useState<PortfolioAssetType>("coin");
  const [symbol, setSymbol] = useState("BTC");
  const [amount, setAmount] = useState(1);

  const coinBySymbol = useMemo(() => new Map(coins.map((coin) => [coin.symbol.toUpperCase(), coin])), [coins]);
  const selectableSymbols = assetSymbols[type];
  const rows = assets.map((asset) => {
    const price =
      asset.type === "coin"
        ? (coinBySymbol.get(asset.symbol)?.current_price ?? 0)
        : asset.type === "gold"
          ? (gold?.gramUsd ?? 0)
          : (convert(1, asset.symbol, "USD") ?? 0);
    const marketKey = asset.type === "coin" ? coinMarketKey(asset.symbol) : asset.type === "gold" ? "GOLD_GRAM_USD" : currencyMarketKey(asset.symbol);
    return { ...asset, price, value: price * asset.amount, marketKey };
  });
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  const totalMarketKey = rows[0]?.marketKey ?? "PORTFOLIO";

  if (compact) {
    return (
      <div className="glass-card p-5">
        <p className="text-xs uppercase tracking-[0.24em] text-mint">Portföy</p>
        <p className="mt-3 text-3xl font-black text-white"><LivePrice marketKey={totalMarketKey} numericValue={total}>{formatCurrency(total)}</LivePrice></p>
        <p className="mt-2 text-sm text-slate-400">{assets.length} varlık takipte</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass-card grid gap-3 p-5 md:grid-cols-[1fr_1fr_1fr_auto]">
        <select
          className="premium-input"
          value={type}
          onChange={(event) => {
            const nextType = event.target.value as PortfolioAssetType;
            setType(nextType);
            setSymbol(assetSymbols[nextType][0]);
          }}
        >
          <option value="coin">Coin</option>
          <option value="currency">Döviz</option>
          <option value="gold">Altın</option>
        </select>
        <select className="premium-input" value={symbol} onChange={(event) => setSymbol(event.target.value)}>
          {selectableSymbols.map((item) => <option key={item}>{item}</option>)}
        </select>
        <input className="premium-input" type="number" min={0} step="any" value={amount} onChange={(event) => setAmount(Number(event.target.value))} />
        <button className="premium-button" onClick={() => upsertAsset({ type, symbol, amount })}>Ekle / Güncelle</button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="glass-card p-6">
          <p className="text-sm text-slate-400">Toplam portföy değeri</p>
          <p className="mt-3 text-4xl font-black text-white"><LivePrice marketKey={totalMarketKey} numericValue={total}>{formatCurrency(total)}</LivePrice></p>
          <p className="mt-3 text-sm text-slate-400">{formatNumber(assets.length)} pozisyon</p>
          <button className="mt-5 text-sm font-semibold text-rose-300" onClick={clearPortfolio}>Portföyü temizle</button>
        </div>

        <div className="grid gap-3">
          {rows.map((row) => (
            <div key={row.id} className="glass-card flex items-center justify-between gap-4 p-4">
              <div>
                <p className="font-bold text-white">{row.symbol}</p>
                <p className="text-sm text-slate-400">
                  {row.amount} adet x <LivePrice marketKey={row.marketKey} numericValue={row.price}>{row.price ? formatCurrency(row.price) : "N/A"}</LivePrice>
                </p>
              </div>
              <div className="text-right">
                <p className="font-black text-white"><LivePrice marketKey={row.marketKey} numericValue={row.value}>{formatCurrency(row.value)}</LivePrice></p>
                <button className="text-xs font-semibold text-rose-300" onClick={() => removeAsset(row.id)}>Kaldır</button>
              </div>
            </div>
          ))}
          {rows.length === 0 ? <div className="glass-card p-6 text-sm text-slate-400">Henüz portföy varlığı eklenmedi.</div> : null}
        </div>
      </div>
    </div>
  );
}
