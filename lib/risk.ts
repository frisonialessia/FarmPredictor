import type { WeatherDay } from "./types";

export type RiskKind = "rain" | "heat" | "frost";

export interface RiskAlert {
  id: string;
  kind: RiskKind;
  day: string;
  severity: "high" | "med";
  impact: number; // $ at risk — SIMULATED heuristic
}

// Turns a forecast into actionable, dollar-tagged risk alerts. Pure & typed
// so it can run anywhere and be unit-tested. The thesis applied to weather:
// what's coming, what to do, and what it's worth.
export function weatherRisks(weather: WeatherDay[]): RiskAlert[] {
  const alerts: RiskAlert[] = [];
  weather.forEach((w, i) => {
    if (w.rainPct >= 60) {
      alerts.push({ id: `rain-${i}`, kind: "rain", day: w.day, severity: w.rainPct >= 75 ? "high" : "med", impact: Math.round(w.rainPct * 28) });
    }
    if (w.tempF >= 96) {
      alerts.push({ id: `heat-${i}`, kind: "heat", day: w.day, severity: w.tempF >= 100 ? "high" : "med", impact: Math.round((w.tempF - 92) * 240) });
    }
    if (w.tempF <= 36) {
      alerts.push({ id: `frost-${i}`, kind: "frost", day: w.day, severity: w.tempF <= 30 ? "high" : "med", impact: Math.round((38 - w.tempF) * 320) });
    }
  });
  // Most expensive first; cap to keep the UI focused.
  return alerts.sort((a, b) => b.impact - a.impact).slice(0, 4);
}

// Presentation metadata per risk kind (the component localizes title/action).
export const RISK_META: Record<RiskKind, { icon: string; title: string; action: string }> = {
  rain: { icon: "rain", title: "Heavy rain", action: "Harvest at-risk parcels before it hits" },
  heat: { icon: "sun", title: "Heat stress", action: "Irrigate & shift fieldwork to early morning" },
  frost: { icon: "drop", title: "Frost risk", action: "Protect sensitive crops & delay cutting" },
};
