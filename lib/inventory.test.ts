import { describe, it, expect } from "vitest";
import { inventoryEconomics } from "@/lib/inventory";
import type { InventoryItem } from "@/lib/types";

describe("inventoryEconomics", () => {
  it("computes item value and weekly spoilage cost", () => {
    const items: InventoryItem[] = [
      { id: "i1", name: "Packing crates", qty: 800, unit: "units", unitCost: 2, spoilagePct: 5 },
      { id: "i2", name: "Labels", qty: 1000, unit: "units", unitCost: 0.1, spoilagePct: 0 },
    ];
    const e = inventoryEconomics(items);
    expect(e.items[0].value).toBe(1600); // 800*2
    expect(e.items[0].spoilageCost).toBe(80); // 1600*5%
    expect(e.totalValue).toBe(1700);
    expect(e.weeklySpoilage).toBe(80);
    expect(e.hasData).toBe(true);
  });

  it("is empty without cost data", () => {
    const e = inventoryEconomics([{ id: "i1", name: "Pallets", qty: 80, unit: "units" }]);
    expect(e.hasData).toBe(false);
    expect(e.weeklySpoilage).toBe(0);
  });
});
