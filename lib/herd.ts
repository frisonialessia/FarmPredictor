// Livestock margin engine — the crop thesis applied to cattle: it's not when
// the pen is READY to sell, it's when you CAN (market window, feed cost, and
// veterinary withdrawal periods). Pure & typed, like lib/engine.ts.

export interface Treatment {
  name: string;
  withdrawalUntilDay: number; // can't sell meat/milk until this day
}

export interface Pen {
  id: string;
  name: string;
  head: number;
  avgWeightLb: number;
  adgLb: number;            // average daily gain
  targetWeightLb: number;
  pricePerLb: number;
  feedCostPerDay: number;   // per head
  treatment?: Treatment;
}

export type PenStatus = "ready" | "growing" | "blocked";

export interface PenEval extends Pen {
  daysToTarget: number;
  status: PenStatus;        // blocked = ready but under withdrawal
  marginAtRisk: number;     // $ lost to not being able to execute the optimal sale
  saleValue: number;        // gross at target
}

export interface HerdResult {
  pens: PenEval[];
  totalHead: number;
  ready: number;
  underTreatment: number;
  marginAtRisk: number;
}

export function evaluateHerd(pens: Pen[], today = 0): HerdResult {
  const evals: PenEval[] = pens.map((p) => {
    const daysToTarget = Math.max(0, Math.ceil((p.targetWeightLb - p.avgWeightLb) / p.adgLb));
    const readyDay = today + daysToTarget;
    const saleValue = Math.round(p.head * p.targetWeightLb * p.pricePerLb);

    let status: PenStatus = daysToTarget <= 2 ? "ready" : "growing";
    let marginAtRisk = 0;

    // Veterinary withdrawal: the pen may be ready but legally unsellable.
    if (p.treatment && p.treatment.withdrawalUntilDay > readyDay) {
      status = "blocked";
      const heldDays = p.treatment.withdrawalUntilDay - readyDay;
      marginAtRisk = Math.round(heldDays * p.feedCostPerDay * p.head);
    }

    return { ...p, daysToTarget, status, marginAtRisk, saleValue };
  });

  return {
    pens: evals,
    totalHead: pens.reduce((s, p) => s + p.head, 0),
    ready: evals.filter((p) => p.status === "ready").length,
    underTreatment: pens.filter((p) => p.treatment).length,
    marginAtRisk: evals.reduce((s, p) => s + p.marginAtRisk, 0),
  };
}
