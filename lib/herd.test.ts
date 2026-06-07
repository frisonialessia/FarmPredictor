import { describe, it, expect } from "vitest";
import { evaluateHerd, type Pen } from "@/lib/herd";

const base: Pen = { id: "x", name: "X", head: 100, avgWeightLb: 1000, adgLb: 2.5, targetWeightLb: 1250, pricePerLb: 1.8, feedCostPerDay: 4 };

describe("evaluateHerd", () => {
  it("marks a pen ready near target and computes sale value", () => {
    const r = evaluateHerd([{ ...base, avgWeightLb: 1248 }]);
    expect(r.pens[0].status).toBe("ready");
    expect(r.pens[0].saleValue).toBe(Math.round(100 * 1250 * 1.8));
  });

  it("blocks a ready pen under a withdrawal window and prices the hold", () => {
    // ready now (avg≈target) but withdrawal until day 6 → 6 held days of feed
    const r = evaluateHerd([{ ...base, avgWeightLb: 1250, treatment: { name: "t", withdrawalUntilDay: 6 } }]);
    expect(r.pens[0].status).toBe("blocked");
    expect(r.pens[0].marginAtRisk).toBe(6 * 4 * 100);
    expect(r.underTreatment).toBe(1);
  });

  it("a growing pen carries no risk", () => {
    const r = evaluateHerd([{ ...base, avgWeightLb: 900 }]);
    expect(r.pens[0].status).toBe("growing");
    expect(r.marginAtRisk).toBe(0);
  });
});
