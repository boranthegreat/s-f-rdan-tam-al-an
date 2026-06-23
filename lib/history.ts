export type HistoryRange = "1D" | "1W" | "1M" | "3M" | "6M" | "1Y";

export type HistoryPoint = {
  date: string;
  value: number;
};

export const historyRanges: Array<{ label: string; value: HistoryRange; days: number }> = [
  { label: "Günlük", value: "1D", days: 1 },
  { label: "Haftalık", value: "1W", days: 7 },
  { label: "Aylık", value: "1M", days: 30 },
  { label: "3 Aylık", value: "3M", days: 90 },
  { label: "6 Aylık", value: "6M", days: 180 },
  { label: "Yıllık", value: "1Y", days: 365 }
];

export function getRangeDays(range: HistoryRange) {
  return historyRanges.find((item) => item.value === range)?.days ?? 7;
}

export function createSyntheticHistory(currentValue: number, range: HistoryRange, seed = 1, sourcePrices?: number[]): HistoryPoint[] {
  const days = getRangeDays(range);
  const pointCount = range === "1D" ? 24 : Math.min(days, 120);

  if (sourcePrices?.length && range === "1W") {
    const step = Math.max(1, Math.floor(sourcePrices.length / pointCount));
    return sourcePrices
      .filter((_, index) => index % step === 0)
      .slice(-pointCount)
      .map((value, index, values) => ({
        date: formatRelativeLabel(index, values.length, range),
        value
      }));
  }

  const volatility = range === "1D" ? 0.012 : range === "1W" ? 0.035 : range === "1M" ? 0.08 : range === "3M" ? 0.14 : range === "6M" ? 0.2 : 0.28;
  const trend = Math.sin(seed * 1.7) * volatility * 0.55;

  return Array.from({ length: pointCount }, (_, index) => {
    const progress = pointCount === 1 ? 1 : index / (pointCount - 1);
    const wave = Math.sin(progress * Math.PI * 4 + seed) * volatility * 0.32;
    const pulse = Math.cos(progress * Math.PI * 9 + seed * 0.7) * volatility * 0.12;
    const startMultiplier = 1 - trend - wave * 0.4;
    const endMultiplier = 1;
    const multiplier = startMultiplier + (endMultiplier - startMultiplier) * progress + wave + pulse;

    return {
      date: formatRelativeLabel(index, pointCount, range),
      value: Math.max(0, currentValue * multiplier)
    };
  });
}

function formatRelativeLabel(index: number, total: number, range: HistoryRange) {
  if (range === "1D") {
    return `${String(index).padStart(2, "0")}:00`;
  }

  const date = new Date();
  const daysBack = total - index - 1;
  date.setDate(date.getDate() - daysBack);
  return date.toLocaleDateString("tr-TR", { day: "2-digit", month: "short" });
}
