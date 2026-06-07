import type { Farm, MarketRow, Harvest, ResourceRow, BlockedSlot, Conflict } from "@/lib/types";

// Everything the Planner/Simulator need to evaluate a farm's plan. Produced by
// the planner service (lib/planGen.ts) from a Farm — the single source of truth
// for plan data, so there's no second, diverging copy.
export interface PlannerData {
  resources: ResourceRow[];
  optimalPlan: Harvest[];
  blocked: BlockedSlot[];
  capacityConflicts: Conflict[];
  delayPenalty: number[];
}

// The single contract the app reads domain data through.
//
// Async by design: the in-memory source resolves immediately, but the contract
// is asynchronous so moving to Supabase (real network I/O) is a one-file swap —
// replace the implementation in lib/repo/index.ts and every call site already
// awaits, with loading states already in place. Nothing in the UI changes.
export interface DataRepository {
  listFarms(): Promise<Farm[]>;
  getFarm(id: string): Promise<Farm | undefined>;
  getMarketPrices(): Promise<MarketRow[]>;
}
