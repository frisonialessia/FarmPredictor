import { describe, it, expect } from "vitest";
import { estimateTiming, cropMaturity, cropWindowDays } from "./cropTiming";

// Real planting date → estimated harvest, instead of a fixed template guess.
describe("cropTiming", () => {
  it("returns null without a planting date (caller falls back to the template)", () => {
    expect(estimateTiming("Sweet corn", undefined)).toBeNull();
    expect(estimateTiming("Sweet corn", "")).toBeNull();
    expect(estimateTiming("Sweet corn", "not-a-date")).toBeNull();
  });

  it("estimates harvest = planting + days-to-maturity", () => {
    // Sweet corn matures in 75 days; planted Jun 1 → harvest ~ Aug 15.
    const now = new Date("2026-06-01T00:00:00");
    const tm = estimateTiming("Sweet corn", "2026-06-01", now)!;
    expect(tm).not.toBeNull();
    const days = Math.round((tm.harvest.getTime() - new Date("2026-06-01").getTime()) / 86400000);
    expect(days).toBe(cropMaturity("Sweet corn")); // 75
    expect(tm.daysToHarvest).toBe(75);
    // window length matches the crop template
    const winDays = Math.round((tm.windowEnd.getTime() - tm.windowStart.getTime()) / 86400000);
    expect(winDays).toBe(cropWindowDays("Sweet corn"));
  });

  it("flags status across the cycle", () => {
    const planted = "2026-01-01";
    // long before harvest → growing
    expect(estimateTiming("Peanuts", planted, new Date("2026-01-10"))!.status).toBe("growing");
    // within the window → closing
    const tm = estimateTiming("Peanuts", planted)!;
    expect(estimateTiming("Peanuts", planted, tm.windowStart)!.status).toBe("closing");
    // well past the window → missed
    const past = new Date(tm.windowEnd.getTime() + 5 * 86400000);
    expect(estimateTiming("Peanuts", planted, past)!.status).toBe("missed");
  });

  it("falls back to a generic maturity for untemplated crops", () => {
    expect(cropMaturity("Dragonfruit")).toBe(100);
  });
});
