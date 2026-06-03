import type { Currency, TempUnit } from "./types";

export const CURRENCIES: Record<Currency, { sym: string; loc: string; rate: number }> = {
  USD: { sym: "$", loc: "en-US", rate: 1 },
  EUR: { sym: "\u20ac", loc: "de-DE", rate: 0.92 },
  MXN: { sym: "MX$", loc: "es-MX", rate: 17.1 },
  CAD: { sym: "C$", loc: "en-CA", rate: 1.36 },
};

export function formatMoney(n: number, cur: Currency): string {
  const c = CURRENCIES[cur];
  return c.sym + Math.round(n * c.rate).toLocaleString(c.loc);
}

export function formatTemp(tempF: number, unit: TempUnit): string {
  const t = unit === "C" ? Math.round(((tempF - 32) * 5) / 9) : tempF;
  return `${t}\u00b0${unit}`;
}
