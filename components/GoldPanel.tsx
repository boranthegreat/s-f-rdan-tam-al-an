"use client";

import { Gem } from "lucide-react";
import { useEffect, useState } from "react";
import { AssetHistoryDialog } from "@/components/AssetHistoryDialog";
import { ErrorState } from "@/components/ErrorState";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { getGoldRate } from "@/lib/api/gold";
import { formatCurrency } from "@/lib/format";
import { createSyntheticHistory, type HistoryRange } from "@/lib/history";
import type { GoldRate } from "@/types";

type GoldSelection = {
  label: string;
  value: number;
  detail: string;
};

export function GoldPanel({ compact = false }: { compact?: boolean }) {
  const [rate, setRate] = useState<GoldRate | null>(null);
  const [error, setError] = useState("");
  const [selectedGold, setSelectedGold] = useState<GoldSelection | null>(null);
  const [historyRange, setHistoryRange] = useState<HistoryRange>("1W");

  useEffect(() => {
    getGoldRate()
      .then((data) => {
        setRate(data);
        setError("");
      })
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Altın kuru yüklenemedi."));
  }, []);

  if (!rate && !error) {
    return <LoadingSkeleton count={compact ? 1 : 3} />;
  }

  return (
    <div className="space-y-4">
      {error ? <ErrorState message={error} /> : null}
      {rate ? (
        compact ? (
          <GoldMetric
            label="Gram Altın"
            value={formatCurrency(rate.gramTry, "TRY")}
            detail="TRY bazlı gram fiyat"
            onClick={() => setSelectedGold({ label: "Gram Altın", value: rate.gramTry, detail: "TRY bazlı gram fiyat" })}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            <GoldMetric
              label="Gram Altın"
              value={formatCurrency(rate.gramTry, "TRY")}
              detail="TRY bazlı gram fiyat"
              onClick={() => setSelectedGold({ label: "Gram Altın", value: rate.gramTry, detail: "TRY bazlı gram fiyat" })}
            />
            <GoldMetric
              label="Ons Altın"
              value={formatCurrency(rate.ounceUsd)}
              detail="XAU/USD yaklaşık ons fiyat"
              onClick={() => setSelectedGold({ label: "Ons Altın", value: rate.ounceUsd, detail: "XAU/USD yaklaşık ons fiyat" })}
            />
            <GoldMetric
              label="Gram USD"
              value={formatCurrency(rate.gramUsd)}
              detail={rate.source}
              onClick={() => setSelectedGold({ label: "Gram USD", value: rate.gramUsd, detail: rate.source })}
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

function GoldMetric({ label, value, detail, onClick }: { label: string; value: string; detail: string; onClick?: () => void }) {
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
          <p className="mt-3 text-3xl font-black text-white">{value}</p>
          <p className="mt-3 text-sm text-slate-400">{detail}</p>
        </div>
        <span className="grid h-11 w-11 place-items-center rounded-lg border border-amber-300/30 bg-amber-300/10 text-amber-200">
          <Gem className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
}
