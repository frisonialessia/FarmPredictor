import type { MarketRow } from "@/lib/types";

// Per-crop defaults (SIMULATED, realistic shape). Lets a user add a parcel by
// just picking a crop — margin, window and price are inferred from the template
// instead of asking the farmer to type everything. Swap for real USDA/SAGARPA
// feeds later without touching the UI.
export interface CropTemplate {
  unit: string;
  spot: number;          // market price per unit (USD base)
  cost: number;          // production cost per unit
  marginPerAcre: number; // typical net margin per acre
  windowDays: number;    // optimal harvest window length
  changePct: number;     // recent price move
}

export const CROP_TEMPLATES: Record<string, CropTemplate> = {
  "Grain sorghum": { unit: "bu", spot: 4.85, cost: 3.2, marginPerAcre: 142, windowDays: 2, changePct: 2.1 },
  "Upland cotton": { unit: "lb", spot: 0.72, cost: 0.58, marginPerAcre: 118, windowDays: 3, changePct: -1.4 },
  "Sweet corn": { unit: "crate", spot: 6.4, cost: 4.1, marginPerAcre: 96, windowDays: 2, changePct: 3.6 },
  Grapefruit: { unit: "box", spot: 18.5, cost: 11.0, marginPerAcre: 156, windowDays: 4, changePct: 0.8 },
  "Leaf lettuce": { unit: "crate", spot: 14.0, cost: 9.0, marginPerAcre: 74, windowDays: 1, changePct: 1.2 },
  Watermelon: { unit: "cwt", spot: 22.0, cost: 14.0, marginPerAcre: 88, windowDays: 3, changePct: 2.0 },
  "Winter wheat": { unit: "bu", spot: 6.2, cost: 4.3, marginPerAcre: 82, windowDays: 4, changePct: -0.6 },
  Peanuts: { unit: "ton", spot: 480, cost: 360, marginPerAcre: 133, windowDays: 5, changePct: 0.9 },
};

export function cropTemplate(crop: string): CropTemplate | undefined {
  return CROP_TEMPLATES[crop];
}

// A broad, worldwide list of crops for the picker (suggestions). Users can also
// type anything else — crop is free text. Templated crops get inferred margins;
// others fall back to generic defaults.
export const ALL_CROPS: string[] = [
  "Grain sorghum", "Field corn", "Sweet corn", "Upland cotton", "Winter wheat", "Spring wheat",
  "Barley", "Oats", "Rye", "Rice", "Soybeans", "Peanuts", "Alfalfa", "Hay", "Canola", "Sunflower",
  "Sugarcane", "Sugar beet", "Tobacco", "Dry beans", "Chickpeas", "Lentils",
  "Potato", "Sweet potato", "Tomato", "Onion", "Garlic", "Carrot", "Bell pepper", "Chili pepper",
  "Broccoli", "Cauliflower", "Cabbage", "Leaf lettuce", "Romaine lettuce", "Spinach", "Celery",
  "Asparagus", "Cucumber", "Squash", "Pumpkin", "Watermelon", "Cantaloupe",
  "Strawberry", "Blueberry", "Grapes", "Apple", "Pear", "Peach", "Cherry",
  "Orange", "Grapefruit", "Lemon", "Lime", "Avocado", "Mango", "Banana", "Pineapple", "Papaya",
  "Coffee", "Cacao", "Almonds", "Walnuts", "Pecans", "Pistachios", "Hazelnuts", "Olives",
];


// Market rows for a set of crops (de-duplicated, only those with a template).
export function marketRowsForCrops(crops: string[]): MarketRow[] {
  const seen = new Set<string>();
  const rows: MarketRow[] = [];
  for (const crop of crops) {
    if (seen.has(crop)) continue;
    const tpl = CROP_TEMPLATES[crop];
    if (!tpl) continue;
    seen.add(crop);
    rows.push({ crop, spot: tpl.spot, cost: tpl.cost, unit: tpl.unit, changePct: tpl.changePct });
  }
  return rows;
}
