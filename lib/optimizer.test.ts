import { describe, it, expect } from "vitest";
import { optimizerEnabled, remoteTiming, remoteSchedule } from "./optimizer";
import type { Harvest, WeatherDay } from "./types";

// With NEXT_PUBLIC_OPTIMIZER_URL unset (the default, and the test env), the
// optimizer is OFF and every remote call resolves to null so callers fall back
// to the TS heuristic. This guards the "zero behavior change when disabled"
// contract that lets us ship the Phase 3 wiring before deploying the service.
const plan: Harvest[] = [
  { id: "h1", label: "North A", row: "m1", day: 2, window: [0, 6], value: 10000 },
];
const weather: WeatherDay[] = [
  { day: "Mon", icon: "sun", tempF: 70, rainPct: 10 },
];

describe("optimizer client (disabled by default)", () => {
  it("is disabled when no URL is configured", () => {
    expect(optimizerEnabled()).toBe(false);
  });

  it("remoteTiming returns null so the caller uses the heuristic", async () => {
    expect(await remoteTiming(plan, weather)).toBeNull();
  });

  it("remoteSchedule returns null when disabled", async () => {
    expect(await remoteSchedule(plan, weather, 1)).toBeNull();
  });
});
