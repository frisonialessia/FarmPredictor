import { describe, it, expect } from "vitest";
import { fleetEconomics } from "@/lib/machinery";
import type { ResourceRow } from "@/lib/types";

describe("fleetEconomics", () => {
  it("computes diesel cost and an age-based breakdown risk", () => {
    const machines: ResourceRow[] = [
      { id: "m1", label: "Combine", icon: "tractor", year: 2010, dieselGalPerHr: 6, downtimeCostPerDay: 1000 },
    ];
    const f = fleetEconomics(machines, { dieselPrice: 4, hoursPerDay: 8, daysPerWeek: 5, refYear: 2026 });
    expect(f.machines[0].fuelCostPerDay).toBe(192); // 6*8*4
    expect(f.machines[0].ageYears).toBe(16);
    expect(f.weeklyFuelCost).toBe(960); // 192*5
    expect(f.weeklyBreakdownRisk).toBeGreaterThan(0);
    expect(f.hasData).toBe(true);
  });

  it("ignores crews and is empty without machine data", () => {
    const f = fleetEconomics([{ id: "c1", label: "Crew A", icon: "crew", workers: 5 }]);
    expect(f.machines).toEqual([]);
    expect(f.hasData).toBe(false);
  });
});
