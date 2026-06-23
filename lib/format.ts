export function formatCurrency(value: number, currency = "USD") {
  const absValue = Math.abs(value);
  const fractionDigits = absValue === 0 ? 2 : absValue < 1 ? 8 : absValue < 100 ? 6 : 4;

  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: fractionDigits
  }).format(value);
}

export function formatCurrencyFixed(value: number, currency = "USD", fractionDigits = 4) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits
  }).format(value);
}

export function formatCurrencyPrecise(value: number, currency = "USD") {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    minimumFractionDigits: 4,
    maximumFractionDigits: 12
  }).format(value);
}

export function formatCurrencyShort(value: number, currency = "USD") {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    minimumFractionDigits: Math.abs(value) >= 1 ? 2 : 0,
    maximumFractionDigits: 5
  }).format(value);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 8
  }).format(value);
}

export function formatRate(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 8
  }).format(value);
}

export function formatPercent(value: number) {
  return `${value >= 0 ? "+" : ""}${new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6
  }).format(value)}%`;
}
