import type { Pen } from "@/lib/herd";

// SIMULATED livestock data (per farm in Supabase later).
export const PENS: Pen[] = [
  { id: "p1", name: "North Pen", head: 120, avgWeightLb: 980, adgLb: 2.8, targetWeightLb: 1250, pricePerLb: 1.85, feedCostPerDay: 4.2 },
  { id: "p2", name: "South Pen", head: 90, avgWeightLb: 1190, adgLb: 2.5, targetWeightLb: 1250, pricePerLb: 1.85, feedCostPerDay: 4.5, treatment: { name: "Antibiotic (resp.)", withdrawalUntilDay: 11 } },
  { id: "p3", name: "Feedlot A", head: 200, avgWeightLb: 1240, adgLb: 2.2, targetWeightLb: 1260, pricePerLb: 1.82, feedCostPerDay: 4.8 },
  { id: "p4", name: "Heifers 2", head: 60, avgWeightLb: 760, adgLb: 2.1, targetWeightLb: 1100, pricePerLb: 1.9, feedCostPerDay: 3.8 },
];
