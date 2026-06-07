import type { Farm, MarketRow, Harvest, ResourceRow, BlockedSlot, Conflict } from "@/lib/types";

// Everything the Planner/Simulator need to evaluate a farm's plan.
export interface PlannerData {
  resources: ResourceRow[];
  optimalPlan: Harvest[];
  blocked: BlockedSlot[];
  capacityConflicts: Conflict[];
  delayPenalty: number[];
}

// The single contract the app reads domain data through.
// Today it's backed by in-memory simulated data; tomorrow by a Supabase
// implementation — we swap one file (lib/repo/index.ts) and the UI is unchanged.
// Methods are synchronous for the in-memory source; when we move to Supabase
// they become async and we update the handful of call sites then.
export interface DataRepository {
  listFarms(): Farm[];
  farmIds(): string[];
  getFarm(id: string): Farm | undefined;
  getMarketPrices(): MarketRow[];
  getPlanner(farmId: string): PlannerData;
}
