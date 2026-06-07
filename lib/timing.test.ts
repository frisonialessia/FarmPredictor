import { describe, it, expect } from "vitest";
import { harvestTiming } from "@/lib/timing";
import type { Harvest, WeatherDay } from "@/lib/types";

const day = (over: Partial<WeatherDay>): WeatherDay => ({ day: "Mon", icon: "sun", tempF: 80, rainPct: 0, ...over });
const calm = Array.from({ length: 7 }).map(() => day({}));

describe("harvestTiming", () => {
  it("recommends moving a harvest off a storm day", () => {
    const weather = [...calm];
    weather[1] = day({ rainPct: 90 }); // storm on day 1
    // Harvest scheduled on day 1 with a window allowing day 0 too.
    const plan: Harvest[] = [{ id: "h1", label: "North A", row: "m1", day: 1, window: [0, 1], value: 10000 }];
    const rec = harvestTiming(plan, weather);
    expect(rec).toHaveLength(1);
    expect(rec[0].reason).toBe("storm");
    expect(rec[0].bestDay).toBe(0);
    expect(rec[0].delta).toBeGreaterThan(0);
  });

  it("stays quiet when the current day is already best", () => {
    const plan: Harvest[] = [{ id: "h1", label: "North A", row: "m1", day: 0, window: [0, 1], value: 10000 }];
    expect(harvestTiming(plan, calm)).toEqual([]);
  });
});
