// Which farms are the curated demo (Demo Farm 1/2). Their views carry a scripted
// story; a user's own farm shows data derived from what they entered instead.
export const DEMO_FARM_IDS = ["rio_verde", "llano_seco"];

export function isDemoFarm(id: string): boolean {
  return DEMO_FARM_IDS.includes(id);
}

// Deterministic pseudo-value in [min,max] from a string seed — lets a user farm
// show stable, plausible figures (e.g. soil moisture) without hardcoding parcels.
export function seededValue(seed: string, min: number, max: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 100000;
  return min + (h % (max - min + 1));
}
