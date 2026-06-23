"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { historyRanges, type HistoryPoint, type HistoryRange } from "@/lib/history";

function useMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return mounted;
}

export function AssetHistoryDialog({
  title,
  description,
  range,
  data,
  isLoading,
  error,
  onRangeChange,
  onClose
}: {
  title: string;
  description: string;
  range: HistoryRange;
  data: HistoryPoint[];
  isLoading?: boolean;
  error?: string;
  onRangeChange: (range: HistoryRange) => void;
  onClose: () => void;
}) {
  const mounted = useMounted();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/78 p-4 backdrop-blur-xl">
      <div className="glass-card w-full max-w-5xl p-5 shadow-[0_34px_120px_rgba(0,0,0,0.55)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-mint">Detay grafiği</p>
            <h2 className="mt-2 text-2xl font-black text-white">{title}</h2>
            <p className="mt-2 text-sm text-slate-400">{description}</p>
          </div>
          <button
            aria-label="Grafiği kapat"
            onClick={onClose}
            className="self-end rounded-xl border border-line bg-white/5 p-2 text-slate-300 transition hover:border-mint/40 hover:text-white sm:self-start"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {historyRanges.map((item) => (
            <button
              key={item.value}
              onClick={() => onRangeChange(item.value)}
              className={
                range === item.value
                  ? "rounded-lg bg-mint px-3 py-2 text-xs font-black text-slate-950"
                  : "rounded-lg border border-line bg-white/5 px-3 py-2 text-xs font-bold text-slate-300 transition hover:border-mint/40 hover:text-white"
              }
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-5 h-[24rem] min-h-[24rem] min-w-0">
          {isLoading ? (
            <div className="h-full animate-pulse rounded-xl border border-line bg-white/[0.04]" />
          ) : error ? (
            <div className="flex h-full items-center justify-center rounded-xl border border-rose-400/20 bg-rose-400/10 text-sm text-rose-200">
              {error}
            </div>
          ) : mounted ? (
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="historyFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#5eead4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#5eead4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(148, 163, 184, 0.14)" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 12 }} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} tickLine={false} width={72} />
                <Tooltip
                  contentStyle={{
                    background: "#0f172a",
                    border: "1px solid rgba(148, 163, 184, 0.2)",
                    borderRadius: 8
                  }}
                />
                <Area type="monotone" dataKey="value" stroke="#5eead4" strokeWidth={2.5} fill="url(#historyFill)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : null}
        </div>
      </div>
    </div>
  );
}
