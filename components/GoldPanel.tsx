"use client";

import { Gem } from "lucide-react";
import { useState } from "react";
import { AssetHistoryDialog } from "@/components/AssetHistoryDialog";
import { ErrorState } from "@/components/ErrorState";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { LivePrice } from "@/components/live-market/LivePrice";
import { useLiveMarket } from "@/components/live-market/LiveMarketProvider";
import { formatCurrency } from "@/lib/format";
import { createSyntheticHistory, type HistoryRange } from "@/lib/history";

type GoldSelection = {
  label: string;
  value: number;
  detail: string;
  marketKey: string;
};

export function GoldPanel({ compact = false }: { compact?: boolean }) {
  const { gold: rate, isLoading, error } = useLiveMarket();
  const [selectedGold, setSelectedGold] = useState<GoldSelection | null>(null);
  const [historyRange, setHistoryRange] = useState<HistoryRange>("1W");

  if (isLoading && !rate) return <LoadingSkeleton count={compact ? 1 : 3} />;

  return (
    <div className="space-y-4">
      {error && !rate ? <ErrorState message={error} /> : null}
      {rate ? (
        compact ? (
          <GoldMetric
            label="Gram Altın"
            value={formatCurrency(rate.gramTry, "TRY")}
            numericValue={rate.gramTry}
            detail="TRY bazlı canlı yaklaşık gram fiyat"
            marketKey="GOLD_GRAM_TRY"
            onClick={() => setSelectedGold({ label: "Gram Altın", value: rate.gramTry, detail: "TRY bazlı gram fiyat", marketKey: "GOLD_GRAM_TRY" })}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            <GoldMetric
              label="Gram Altın"
              value={formatCurrency(rate.gramTry, "TRY")}
              numericValue={rate.gramTry}
              detail="TRY bazlı canlı yaklaşık gram fiyat"
              marketKey="GOLD_GRAM_TRY"
              onClick={() => setSelectedGold({ label: "Gram Altın", value: rate.gramTry, detail: "TRY bazlı gram fiyat", marketKey: "GOLD_GRAM_TRY" })}
            />
            <GoldMetric
              label="Ons Altın"
              value={formatCurrency(rate.ounceUsd)}
              numericValue={rate.ounceUsd}
              detail="PAXG/USDT bazlı yaklaşık ons fiyat"
              marketKey="GOLD_OUNCE_USD"
              onClick={() => setSelectedGold({ label: "Ons Altın", value: rate.ounceUsd, detail: "Yaklaşık ons fiyat", marketKey: "GOLD_OUNCE_USD" })}
            />
            <GoldMetric
              label="Gram USD"
              value={formatCurrency(rate.gramUsd)}
              numericValue={rate.gramUsd}
              detail={rate.source}
              marketKey="GOLD_GRAM_USD"
              onClick={() => setSelectedGold({ label: "Gram USD", value: rate.gramUsd, detail: rate.source, marketKey: "GOLD_GRAM_USD" })}
            />
          </div>
        )
      ) : null}
      {selectedGold ? (
        <AssetHistoryDialog
          title={selectedGold.label}
          description={`${selectedGold.detail} için ${historyRange} altın grafiği.`}
          range={historyRange}
          data={createSyntheticHistory(selectedGold.value, historyRange, selectedGold.value)}
          onRangeChange={setHistoryRange}
          onClose={() => setSelectedGold(null)}
        />
      ) : null}
    </div>
  );
}

function GoldMetric({
  label,
  value,
  numericValue,
  detail,
  marketKey,
  onClick
}: {
  label: string;
  value: string;
  numericValue: number;
  detail: string;
  marketKey: string;
  onClick?: () => void;
}) {
  return (
    <div
      className="glass-card group cursor-pointer p-5 transition hover:-translate-y-1 hover:border-amber-300/30"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (onClick && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          onClick();
        }
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-amber-200">{label}</p>
          <p className="mt-3 text-3xl font-black text-white"><LivePrice marketKey={marketKey} numericValue={numericValue}>{value}</LivePrice></p>
          <p className="mt-3 text-sm text-slate-400">{detail}</p>
        </div>
        <span className="grid h-11 w-11 place-items-center rounded-lg border border-amber-300/30 bg-amber-300/10 text-amber-200">
          <Gem className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
}
