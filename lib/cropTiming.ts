// Crop-cycle timing — turns a real planting date into an estimated harvest date
// and optimal window, instead of guessing from a fixed template. Pure & typed;
// the dashboard/parcel-map read these so the "days to harvest" number reflects
// what the farmer actually entered. SIMULATED maturities (realistic) until a
// real agronomic feed is connected.
import { cropTemplate } from "@/data/crops";

const DAY = 86400000;
const HOUR = 3600000;
const DEFAULT_MATURITY = 100; // days, for crops without a template
const DEFAULT_WINDOW = 3;     // days

export function cropMaturity(crop: string): number {
  return cropTemplate(crop)?.daysToMaturity ?? DEFAULT_MATURITY;
}

export function cropWindowDays(crop: string): number {
  return cropTemplate(crop)?.windowDays ?? DEFAULT_WINDOW;
}

export type TimingStatus = "growing" | "ready" | "closing" | "missed";

export interface ParcelTiming {
  harvest: Date;              // estimated harvest = planting + days-to-maturity
  windowStart: Date;
  windowEnd: Date;            // window closes here (quality drops after)
  daysToHarvest: number;      // from `now` (negative once past)
  hoursToWindowClose: number; // hours from `now` until the window closes (>= 0)
  status: TimingStatus;
}

// Returns null for a missing/invalid planting date (caller falls back to the
// template assumption). `plantedOn` is an ISO date string (YYYY-MM-DD).
export function estimateTiming(crop: string, plantedOn: string | undefined, now: Date = new Date()): ParcelTiming | null {
  if (!plantedOn) return null;
  const planted = new Date(`${plantedOn}T00:00:00`);
  if (isNaN(planted.getTime())) return null;

  const harvest = new Date(planted.getTime() + cropMaturity(crop) * DAY);
  const windowStart = harvest;
  const windowEnd = new Date(harvest.getTime() + cropWindowDays(crop) * DAY);

  const daysToHarvest = Math.round((harvest.getTime() - now.getTime()) / DAY);
  const hoursToWindowClose = Math.max(0, Math.round((windowEnd.getTime() - now.getTime()) / HOUR));

  let status: TimingStatus;
  if (now < windowStart) status = daysToHarvest <= 7 ? "ready" : "growing";
  else if (now <= windowEnd) status = "closing";
  else status = "missed";

  return { harvest, windowStart, windowEnd, daysToHarvest, hoursToWindowClose, status };
}

// Short, localized date label, e.g. "Oct 14" / "14 oct".
export function fmtShortDate(d: Date, lang: string = "en"): string {
  return d.toLocaleDateString(lang === "es" ? "es-ES" : "en-US", { month: "short", day: "numeric" });
}
