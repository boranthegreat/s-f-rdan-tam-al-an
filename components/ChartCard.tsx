"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

type ChartDatum = Record<string, string | number>;

function useMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return mounted;
}

export function AreaChartCard({
  title,
  data,
  dataKey
}: {
  title: string;
  data: ChartDatum[];
  dataKey: string;
}) {
  const mounted = useMounted();

  return (
    <div className="glass-card p-5">
      <h2 className="text-lg font-bold text-white">{title}</h2>
      <div className="mt-4 h-72 min-h-72 min-w-0">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="mintFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#5eead4" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#5eead4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(148, 163, 184, 0.14)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 12 }} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} tickLine={false} width={44} />
              <Tooltip
                contentStyle={{
                  background: "#0f172a",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                  borderRadius: 8
                }}
              />
              <Area type="monotone" dataKey={dataKey} stroke="#5eead4" fill="url(#mintFill)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : null}
      </div>
    </div>
  );
}

export function BarChartCard({
  title,
  data,
  dataKey
}: {
  title: string;
  data: ChartDatum[];
  dataKey: string;
}) {
  const mounted = useMounted();

  return (
    <div className="glass-card p-5">
      <h2 className="text-lg font-bold text-white">{title}</h2>
      <div className="mt-4 h-72 min-h-72 min-w-0">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart data={data}>
              <CartesianGrid stroke="rgba(148, 163, 184, 0.14)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} tickLine={false} width={44} />
              <Tooltip
                contentStyle={{
                  background: "#0f172a",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                  borderRadius: 8
                }}
              />
              <Bar dataKey={dataKey} fill="#38bdf8" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : null}
      </div>
    </div>
  );
}
