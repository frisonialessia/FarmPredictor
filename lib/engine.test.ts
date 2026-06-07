import { describe, it, expect } from "vitest";
import { evaluatePlan, evaluateScenario, degradationFor } from "@/lib/engine";
import { OPTIMAL_PLAN, BLOCKED, CONFLICTS, DELAY_PENALTY, BASE_MARGIN } from "@/data/planner";
import type { Harvest } from "@/lib/types";

const clone = () => JSON.parse(JSON.stringify(OPTIMAL_PLAN)) as Harvest[];

describe("evaluatePlan", () => {
  it("the optimal plan hits the ceiling with no losses", () => {
    const r = evaluatePlan(clone(), BLOCKED);
    expect(r.grossOptimal).toBe(BASE_MARGIN); // $34,200 single source of truth
    expect(r.grossOptimal).toBe(34200);
    expect(r.planMargin).toBe(34200);
    expect(r.degradationLoss).toBe(0);
    expect(r.schedulingLoss).toBe(0);
    expect(r.conflictCount).toBe(0);
    expect(r.inWindow).toBe(6);
  });

  it("dragging North A onto a machine in maintenance creates a scheduling conflict", () => {
    const plan = clone();
    plan[0] = { ...plan[0], row: "m2", day: 0 }; // h1 North A onto blocked m2
    const r = evaluatePlan(plan, BLOCKED);
    expect(r.conflictCount).toBe(1);
    const c = r.conflicts[0];
    expect(c.id).toBe("sched-h1");
    expect(c.source).toBe("schedule");
    expect(c.resource).toBe("Machinery");
    expect(c.loss).toBe(Math.round(9800 * 0.18)); // 1764
    expect(r.planMargin).toBe(34200 - 1764);
  });

  it("harvesting off the optimal window costs non-linear degradation", () => {
    const plan = clone();
    plan[0] = { ...plan[0], day: 3 }; // h1 window [0,1] -> 2 days off
    const r = evaluatePlan(plan, BLOCKED);
    expect(r.conflictCount).toBe(0);
    expect(r.inWindow).toBe(5);
    expect(r.degradationLoss).toBe(degradationFor(2, 9800));
    expect(r.planMargin).toBe(34200 - degradationFor(2, 9800));
  });
});

describe("evaluateScenario", () => {
  it("doing nothing leaves the capacity conflicts as loss", () => {
    const pe = evaluatePlan(clone(), BLOCKED);
    const s = evaluateScenario(pe, CONFLICTS, {}, 0, DELAY_PENALTY);
    expect(s.base).toBe(34200);
    expect(s.unresolvedLoss).toBe(2940 + 2080 + 1120); // 6140
    expect(s.net).toBe(34200 - 6140);
    expect(s.vsDoNothing).toBe(0);
  });

  it("applying every fix recovers margin minus the action costs", () => {
    const pe = evaluatePlan(clone(), BLOCKED);
    const levers = { maq: true, crew: true, box: true };
    const s = evaluateScenario(pe, CONFLICTS, levers, 0, DELAY_PENALTY);
    expect(s.recovered).toBe(6140);
    expect(s.actionCost).toBe(620 + 870 + 250); // 1740
    expect(s.unresolvedLoss).toBe(0);
    expect(s.net).toBe(34200 - 1740);
    expect(s.vsDoNothing).toBe(6140 - 1740); // +4400
  });

  it("you can never exceed the optimal ceiling", () => {
    const pe = evaluatePlan(clone(), BLOCKED);
    const levers = { maq: true, crew: true, box: true };
    const s = evaluateScenario(pe, CONFLICTS, levers, 0, DELAY_PENALTY);
    expect(s.net).toBeLessThan(s.base);
  });
});

describe("degradationFor", () => {
  it("is zero in-window and grows non-linearly, capped at 60%", () => {
    expect(degradationFor(0, 9800)).toBe(0);
    expect(degradationFor(1, 9800)).toBeLessThan(degradationFor(2, 9800));
    expect(degradationFor(2, 9800)).toBeLessThan(degradationFor(3, 9800));
    expect(degradationFor(99, 9800)).toBe(Math.round(9800 * 0.6)); // cap
  });
});
