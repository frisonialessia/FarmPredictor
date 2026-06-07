import { describe, it, expect } from "vitest";
import { weatherRisks } from "@/lib/risk";
import type { WeatherDay } from "@/lib/types";

const day = (over: Partial<WeatherDay>): WeatherDay => ({ day: "Mon", icon: "sun", tempF: 80, rainPct: 0, ...over });

describe("weatherRisks", () => {
  it("flags heavy rain, heat and frost with a dollar impact", () => {
    const r = weatherRisks([day({ rainPct: 80 }), day({ tempF: 101 }), day({ tempF: 28 })]);
    const kinds = r.map((a) => a.kind).sort();
    expect(kinds).toEqual(["frost", "heat", "rain"]);
    expect(r.every((a) => a.impact > 0)).toBe(true);
  });

  it("stays quiet on a calm forecast", () => {
    expect(weatherRisks([day({}), day({ tempF: 85, rainPct: 10 })])).toEqual([]);
  });

  it("sorts by impact and caps at 4", () => {
    const many = Array.from({ length: 8 }).map((_, i) => day({ rainPct: 60 + i }));
    const r = weatherRisks(many);
    expect(r.length).toBe(4);
    for (let i = 1; i < r.length; i++) expect(r[i - 1].impact).toBeGreaterThanOrEqual(r[i].impact);
  });
});
