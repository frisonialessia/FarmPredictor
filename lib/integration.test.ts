import { describe, it, expect } from "vitest";
import { FARMS } from "@/data/farms";
import { farmFromDraft } from "./farmFactory";
import { plannerForFarm } from "./planGen";
import { evaluatePlan, evaluateScenario } from "./engine";

// Integration tests: exercise whole flows across modules (not single units),
// the way the app strings them together. No DOM — these cover the logic the UI
// renders, so they're fast and deterministic.

describe("onboarding → dashboard flow", () => {
  it("turns a draft into a valid farm that generates a coherent plan", () => {
    const farm = farmFromDraft({
      name: "Green Valley",
      location: "Iowa, USA",
      parcels: [
        { name: "North A", crop: "Corn", area: "120" },
        { name: "South B", crop: "Wheat", area: "80" },
        { name: "East C", crop: "Soybean", area: "60" },
      ],
    });

    expect(farm.id).toMatch(/^user_/);
    expect(farm.initials).toBe("GV");
    expect(farm.parcels).toHaveLength(3);

    // The active farm's parcels drive its planner data (per-farm, not the demo).
    const planner = plannerForFarm(farm);
    expect(planner.optimalPlan).toHaveLength(3);
    expect(planner.optimalPlan.every((h) => h.value > 0)).toBe(true);

    // A freshly generated plan is executable: in-window and conflict-free.
    const evalPlan = evaluatePlan(planner.optimalPlan, planner.blocked);
    expect(evalPlan.conflictCount).toBe(0);
    expect(evalPlan.inWindow).toBe(planner.optimalPlan.length);
  });
});

describe("planner → simulator flow (demo farm)", () => {
  const demo = FARMS["rio_verde"];
  const planner = plannerForFarm(demo);
  const planEval = evaluatePlan(planner.optimalPlan, planner.blocked);

  it("never lets net margin exceed the optimal ceiling (the thesis)", () => {
    const scenario = evaluateScenario(planEval, planner.capacityConflicts, {}, 0, planner.delayPenalty);
    expect(scenario.net).toBeLessThanOrEqual(scenario.base);
  });

  it("resolving conflicts via levers raises net margin (recovered > action cost)", () => {
    const noFix = evaluateScenario(planEval, planner.capacityConflicts, {}, 0, planner.delayPenalty);
    expect(noFix.conflicts.length).toBeGreaterThan(0);

    const allOn = Object.fromEntries(noFix.conflicts.map((c) => [c.id, true]));
    const fixed = evaluateScenario(planEval, planner.capacityConflicts, allOn, 0, planner.delayPenalty);

    expect(fixed.net).toBeGreaterThan(noFix.net);
    expect(fixed.recovered).toBeGreaterThan(0);
    expect(fixed.vsDoNothing).toBeGreaterThanOrEqual(0);
  });

  it("tolerating delay reduces net margin", () => {
    const onTime = evaluateScenario(planEval, planner.capacityConflicts, {}, 0, planner.delayPenalty);
    const delayed = evaluateScenario(planEval, planner.capacityConflicts, {}, 3, planner.delayPenalty);
    expect(delayed.net).toBeLessThanOrEqual(onTime.net);
  });
});
