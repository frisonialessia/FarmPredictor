import type { ResourceRow } from "./types";

export const MACHINE_TYPES = [
  "Combine harvester", "Tractor", "Picker rig", "Sprayer", "Seeder",
  "Grain truck", "Baler", "Forklift", "Irrigation rig", "Other",
];

export interface MachineEconomics {
  id: string;
  label: string;
  machineType?: string;
  year?: number;
  ageYears: number;
  fuelCostPerDay: number;
  breakdownProb: number;     // 0–1 chance this week
  breakdownRiskCost: number; // expected $ cost of a breakdown
}

export interface FleetEconomics {
  machines: MachineEconomics[];
  weeklyFuelCost: number;
  weeklyBreakdownRisk: number;
  hasData: boolean;
}

const round = (n: number) => Math.round(n);

// Turns machine specs into money: diesel burn per day and an expected
// breakdown cost that rises with age. Pure & typed. SIMULATED coefficients —
// swap for real telematics/maintenance history later.
export function fleetEconomics(
  resources: ResourceRow[],
  opts: { dieselPrice?: number; hoursPerDay?: number; daysPerWeek?: number; refYear?: number } = {},
): FleetEconomics {
  const dieselPrice = opts.dieselPrice ?? 3.8;
  const hoursPerDay = opts.hoursPerDay ?? 8;
  const daysPerWeek = opts.daysPerWeek ?? 5;
  const refYear = opts.refYear ?? new Date().getFullYear();

  const machines = resources
    .filter((r) => r.icon !== "crew")
    .map((m): MachineEconomics => {
      const ageYears = m.year ? Math.max(0, refYear - m.year) : 0;
      const fuelCostPerDay = round((m.dieselGalPerHr ?? 0) * hoursPerDay * dieselPrice);
      const breakdownProb = Math.min(0.45, 0.03 + ageYears * 0.012);
      const breakdownRiskCost = round(breakdownProb * (m.downtimeCostPerDay ?? 800) * 2);
      return { id: m.id, label: m.label, machineType: m.machineType, year: m.year, ageYears, fuelCostPerDay, breakdownProb, breakdownRiskCost };
    });

  return {
    machines,
    weeklyFuelCost: machines.reduce((s, m) => s + m.fuelCostPerDay * daysPerWeek, 0),
    weeklyBreakdownRisk: machines.reduce((s, m) => s + m.breakdownRiskCost, 0),
    hasData: machines.some((m) => m.fuelCostPerDay > 0 || m.year),
  };
}
