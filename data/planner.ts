import type { Harvest, ResourceRow, BlockedSlot, Conflict } from "@/lib/types";

export const RESOURCE_ROWS: ResourceRow[] = [
  { id: "m1", label: "Harvester #1", icon: "tractor" },
  { id: "m2", label: "Harvester #2", icon: "tractor" },
  { id: "m3", label: "Picker rig", icon: "tractor" },
  { id: "ca", label: "Crew A", icon: "crew" },
  { id: "cb", label: "Crew B", icon: "crew" },
];

// Harvest values are calibrated so the optimal plan sums to BASE_MARGIN
// ($34,200) — the single weekly ceiling shared by the Planner and Simulator.
// The Planner grid never shows these figures; they only feed the engine.
export const OPTIMAL_PLAN: Harvest[] = [
  { id: "h1", label: "North A", row: "m1", day: 0, window: [0, 1], value: 9800 },
  { id: "h2", label: "West 2", row: "m1", day: 2, window: [2, 4], value: 6400 },
  { id: "h3", label: "Greenhouse 1", row: "ca", day: 1, window: [1, 2], value: 5200 },
  { id: "h4", label: "South B", row: "ca", day: 4, window: [4, 5], value: 3800 },
  { id: "h5", label: "East 3", row: "cb", day: 5, window: [5, 6], value: 4800 },
  { id: "h6", label: "River C", row: "m3", day: 3, window: [2, 4], value: 4200 },
];

export const BLOCKED: BlockedSlot[] = [
  { row: "m2", day: 0, len: 3, label: "Maintenance" },
];

export const BASE_MARGIN = 34200;

export const CONFLICTS: Conflict[] = [
  { id: "maq", icon: "tractor", parcel: "North A", resource: "Machinery", loss: 2940, actionLabel: "Move up Harvester #2 maintenance", actionCost: 620 },
  { id: "crew", icon: "crew", parcel: "West 2", resource: "Labor", loss: 2080, actionLabel: "Hire external crew (Wednesday)", actionCost: 870 },
  { id: "box", icon: "box", parcel: "North A", resource: "Packaging", loss: 1120, actionLabel: "Rush order 620 crates (today)", actionCost: 250 },
];

export const DELAY_PENALTY = [0, 300, 760, 1480, 2400, 3500];
export const DAYS7 = ["Mon 8", "Tue 9", "Wed 10", "Thu 11", "Fri 12", "Sat 13", "Sun 14"];
