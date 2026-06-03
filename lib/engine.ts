// Unified margin engine — the single brain shared by the Planner and the
// What-if Simulator. Pure & typed: it receives the plan + capacity + simulated
// data by parameter and returns margin, conflicts and a breakdown. No data is
// hardcoded here, so tomorrow it can be fed real data without touching the UI.
import type { Harvest, BlockedSlot, Conflict } from "./types";

// A harvest after evaluation against its window and the resource grid.
export interface HarvestEval extends Harvest {
  inWindow: boolean;
  conflict: boolean;
  outOfWindow: boolean;
  daysOff: number;
  degradationLoss: number; // $ lost to harvesting off the optimal day
  conflictLoss: number;    // $ at risk from a resource clash
}

// A unified conflict — either a known capacity gap this week ("capacity") or a
// scheduling clash the user just created by dragging in the Planner ("schedule").
export interface EngineConflict {
  id: string;
  source: "capacity" | "schedule";
  harvestId?: string;
  icon: string;
  parcel: string;
  resource: string;       // already human-facing: "Machinery", "Labor"...
  loss: number;           // margin at risk if left unresolved
  actionLabel?: string;   // capacity conflicts carry a ready-made label
  actionKey?: "rent" | "rebook"; // schedule conflicts compose a localized label
  actionCost: number;
}

export interface PlanEval {
  grossOptimal: number;     // ceiling: sum of harvest values at their optimum
  degradationLoss: number;  // total lost to bad timing
  schedulingLoss: number;   // total at risk from scheduling clashes
  planMargin: number;       // grossOptimal - degradation - schedulingLoss
  harvests: HarvestEval[];
  conflicts: EngineConflict[]; // scheduling conflicts derived from the plan
  inWindow: number;
  conflictCount: number;
}

export interface ScenarioResult {
  base: number;            // optimal ceiling
  degradationLoss: number;
  unresolvedLoss: number;  // conflicts left untouched
  actionCost: number;      // cost of the fixes you applied
  delayPenalty: number;
  recovered: number;       // losses you avoided by applying fixes
  net: number;
  vsDoNothing: number;
  conflicts: EngineConflict[]; // capacity + scheduling, in display order
}

// Non-linear timing degradation: the further a harvest slips from its window,
// the more value rots — proportional to the harvest's own worth.
export function degradationFor(daysOff: number, value: number): number {
  if (daysOff <= 0) return 0;
  const factor = Math.min(0.6, 0.06 * daysOff + 0.02 * daysOff * daysOff);
  return Math.round(value * factor);
}

// Margin at risk when a harvest collides with a busy/maintenance resource.
function schedulingConflictLoss(value: number): number {
  return Math.round(value * 0.18);
}

export function evaluatePlan(plan: Harvest[], blocked: BlockedSlot[]): PlanEval {
  const occ: Record<string, number> = {};
  plan.forEach((h) => {
    const k = `${h.row}:${h.day}`;
    occ[k] = (occ[k] || 0) + 1;
  });

  let degradationLoss = 0;
  let schedulingLoss = 0;
  let inWindow = 0;
  const harvests: HarvestEval[] = [];
  const conflicts: EngineConflict[] = [];

  for (const h of plan) {
    const overlap = occ[`${h.row}:${h.day}`] > 1;
    const onBlocked = blocked.some((b) => b.row === h.row && h.day >= b.day && h.day < b.day + b.len);
    const conflict = overlap || onBlocked;
    const outOfWindow = h.day < h.window[0] || h.day > h.window[1];
    const daysOff = outOfWindow ? Math.min(Math.abs(h.day - h.window[0]), Math.abs(h.day - h.window[1])) : 0;
    const degradationLossH = degradationFor(daysOff, h.value);
    const conflictLossH = conflict ? schedulingConflictLoss(h.value) : 0;

    degradationLoss += degradationLossH;
    schedulingLoss += conflictLossH;
    if (!outOfWindow) inWindow++;

    harvests.push({ ...h, inWindow: !outOfWindow, conflict, outOfWindow, daysOff, degradationLoss: degradationLossH, conflictLoss: conflictLossH });

    if (conflict) {
      const machinery = h.row.startsWith("m");
      conflicts.push({
        id: `sched-${h.id}`,
        source: "schedule",
        harvestId: h.id,
        icon: machinery ? "tractor" : "crew",
        parcel: h.label,
        resource: machinery ? "Machinery" : "Labor",
        loss: conflictLossH,
        actionKey: onBlocked ? "rent" : "rebook",
        actionCost: Math.round(conflictLossH * 0.32),
      });
    }
  }

  const grossOptimal = plan.reduce((s, h) => s + h.value, 0);
  return {
    grossOptimal,
    degradationLoss,
    schedulingLoss,
    planMargin: grossOptimal - degradationLoss - schedulingLoss,
    harvests,
    conflicts,
    inWindow,
    conflictCount: conflicts.length,
  };
}

// Adapts a seeded capacity conflict (from simulated data) into the unified shape.
export function fromCapacity(c: Conflict): EngineConflict {
  return {
    id: c.id,
    source: "capacity",
    icon: c.icon,
    parcel: c.parcel,
    resource: c.resource,
    loss: c.loss,
    actionLabel: c.actionLabel,
    actionCost: c.actionCost,
  };
}

// Combines the plan's scheduling conflicts with this week's capacity conflicts,
// applies the user's chosen fixes + tolerated delay, and returns the net margin.
// You can only ever lose from the optimal ceiling — the gap is the thesis.
export function evaluateScenario(
  planEval: PlanEval,
  capacityConflicts: Conflict[],
  levers: Record<string, boolean>,
  delayDays: number,
  delayTable: number[],
): ScenarioResult {
  const conflicts: EngineConflict[] = [...capacityConflicts.map(fromCapacity), ...planEval.conflicts];

  let recovered = 0;
  let actionCost = 0;
  let unresolvedLoss = 0;
  conflicts.forEach((c) => {
    if (levers[c.id]) {
      recovered += c.loss;
      actionCost += c.actionCost;
    } else {
      unresolvedLoss += c.loss;
    }
  });

  const delayPenalty = delayTable[Math.min(delayDays, delayTable.length - 1)] || 0;
  const base = planEval.grossOptimal;
  const net = base - planEval.degradationLoss - unresolvedLoss - actionCost - delayPenalty;
  const doNothing = base - planEval.degradationLoss - conflicts.reduce((s, c) => s + c.loss, 0) - delayPenalty;

  return {
    base,
    degradationLoss: planEval.degradationLoss,
    unresolvedLoss,
    actionCost,
    delayPenalty,
    recovered,
    net,
    vsDoNothing: net - doNothing,
    conflicts,
  };
}
