import type { InventoryItem } from "./types";

export const ITEM_CATEGORIES = ["Packaging", "Input", "Produce", "Fuel", "Other"];

export interface ItemEconomics extends InventoryItem {
  value: number;        // qty × unitCost
  spoilageCost: number; // $ lost per week to spoilage
}

export interface InventoryEconomics {
  items: ItemEconomics[];
  totalValue: number;
  weeklySpoilage: number;
  hasData: boolean;
}

const round = (n: number) => Math.round(n);

// What inventory is worth and what it bleeds to spoilage each week. Pure & typed.
// Spoilage of boxes/produce/inputs is margin that quietly disappears in storage.
export function inventoryEconomics(items: InventoryItem[]): InventoryEconomics {
  const out = items.map((it): ItemEconomics => {
    const value = round((it.qty || 0) * (it.unitCost ?? 0));
    const spoilageCost = round(value * ((it.spoilagePct ?? 0) / 100));
    return { ...it, value, spoilageCost };
  });
  return {
    items: out,
    totalValue: out.reduce((s, i) => s + i.value, 0),
    weeklySpoilage: out.reduce((s, i) => s + i.spoilageCost, 0),
    hasData: out.some((i) => i.value > 0 || i.spoilageCost > 0),
  };
}
