import raw from "./dataset.json";
import type { Dataset } from "./types";

export const dataset = raw as unknown as Dataset;

export function fmtUSD(n: number, compact = true): string {
  if (compact) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(n);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function fmtPct(n: number, digits = 2): string {
  return `${n.toFixed(digits)}%`;
}
