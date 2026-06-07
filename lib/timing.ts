import type { WeatherDay, Harvest } from "./types";
import { degradationFor } from "./engine";

export type TimingReason = "storm" | "frost" | "degradation";

export interface TimingRec {
  id: string;
  label: string;
  currentDay: number;
  bestDay: number;
  delta: number; // $ gained by harvesting on bestDay instead of the current day
  reason: TimingReason;
}

// What a given harvest day costs in weather terms (storm = field access + quality
// loss; frost = damage). Bonus weather (rain that helps a crop) is crop-specific
// and left for later — this models the clear, defensible downside cases.
function weatherPenalty(w: WeatherDay | undefined, value: number): { pen: number; reason: TimingReason | null } {
  if (!w) return { pen: 0, reason: null };
  if (w.rainPct >= 60) return { pen: Math.round(value * (w.rainPct / 100) * 0.18), reason: "storm" };
  if (w.tempF <= 34) return { pen: Math.round(value * 0.1), reason: "frost" };
  return { pen: 0, reason: null };
}

// Net value of harvesting `h` on `day`: full value minus timing degradation
// (out of window) minus the weather penalty for that day.
function dayScore(h: Harvest, day: number, weather: WeatherDay[]): number {
  const outOfWindow = day < h.window[0] || day > h.window[1];
  const daysOff = outOfWindow ? Math.min(Math.abs(day - h.window[0]), Math.abs(day - h.window[1])) : 0;
  const deg = degradationFor(daysOff, h.value);
  const { pen } = weatherPenalty(weather[day], h.value);
  return h.value - deg - pen;
}

// For each harvest, find the best day in the week and, if it beats the current
// day, recommend the move with its dollar gain and the reason the current day
// is worse. Pure & typed.
export function harvestTiming(plan: Harvest[], weather: WeatherDay[]): TimingRec[] {
  const recs: TimingRec[] = [];
  const maxDay = Math.min(6, (weather.length || 7) - 1);
  for (const h of plan) {
    const currentScore = dayScore(h, h.day, weather);
    let bestDay = h.day;
    let bestScore = currentScore;
    for (let d = 0; d <= maxDay; d++) {
      const s = dayScore(h, d, weather);
      if (s > bestScore) { bestScore = s; bestDay = d; }
    }
    const delta = Math.round(bestScore - currentScore);
    if (bestDay !== h.day && delta > 0) {
      const cur = weatherPenalty(weather[h.day], h.value);
      const reason: TimingReason = cur.reason ?? "degradation";
      recs.push({ id: h.id, label: h.label, currentDay: h.day, bestDay, delta, reason });
    }
  }
  return recs.sort((a, b) => b.delta - a.delta).slice(0, 4);
}
