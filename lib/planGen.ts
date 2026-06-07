import type { Farm, Harvest, ResourceRow, Conflict } from "@/lib/types";
import type { PlannerData } from "@/lib/repo";
import { RESOURCE_ROWS, OPTIMAL_PLAN, BLOCKED, CONFLICTS, DELAY_PENALTY } from "@/data/planner";

// The curated demo story lives on Rio Verde (matches the guided tour + images).
const DEMO_FARM_ID = "rio_verde";

// Default resources for a generated (user) farm.
const GEN_RESOURCES: ResourceRow[] = [
  { id: "m1", label: "Harvester #1", icon: "tractor" },
  { id: "m2", label: "Harvester #2", icon: "tractor" },
  { id: "ca", label: "Crew A", icon: "crew" },
  { id: "cb", label: "Crew B", icon: "crew" },
];

const acres = (s: string) => Number(String(s).replace(/[^0-9.]/g, "")) || 0;

// Builds a harvest plan from a farm's own parcels: one harvest per parcel,
// value = margin/acre × area, placed in-window across the week on distinct
// resource/day slots (so it starts optimal, 0 conflicts), plus a couple of
// capacity conflicts derived from the highest-value harvests.
function generateFromParcels(farm: Farm): PlannerData {
  const R = GEN_RESOURCES.length;
  const optimalPlan: Harvest[] = farm.parcels.map((p, i) => {
    const day = Math.min(6, Math.floor(i / R));
    const value = Math.max(200, Math.round(p.marginPerAcre * acres(p.area)));
    return { id: `h${i + 1}`, label: p.name, row: GEN_RESOURCES[i % R].id, day, window: [day, Math.min(6, day + 1)], value };
  });

  const top = [...optimalPlan].sort((a, b) => b.value - a.value).slice(0, Math.min(2, optimalPlan.length));
  const capacityConflicts: Conflict[] = top.map((h, k) => {
    const loss = Math.round(h.value * 0.12);
    return {
      id: k === 0 ? "maq" : "crew",
      icon: k === 0 ? "tractor" : "crew",
      parcel: h.label,
      resource: k === 0 ? "Machinery" : "Labor",
      loss,
      actionLabel: k === 0 ? "Add machine capacity" : "Hire extra crew",
      actionCost: Math.round(loss * 0.32),
    };
  });

  return { resources: GEN_RESOURCES, optimalPlan, blocked: [], capacityConflicts, delayPenalty: DELAY_PENALTY };
}

// Planner data for the active farm: the curated story for the demo farm,
// otherwise generated from the farm's real parcels.
export function plannerForFarm(farm: Farm): PlannerData {
  if (farm.id === DEMO_FARM_ID) {
    return { resources: RESOURCE_ROWS, optimalPlan: OPTIMAL_PLAN, blocked: BLOCKED, capacityConflicts: CONFLICTS, delayPenalty: DELAY_PENALTY };
  }
  return generateFromParcels(farm);
}
