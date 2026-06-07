import { FARMS, FARM_IDS, MARKET } from "@/data/farms";
import { RESOURCE_ROWS, OPTIMAL_PLAN, BLOCKED, CONFLICTS, DELAY_PENALTY } from "@/data/planner";
import type { DataRepository, PlannerData } from "./repository";

// In-memory implementation backed by the simulated data in /data.
// This is the only place that imports the raw seed data.
export class MemoryRepository implements DataRepository {
  listFarms() {
    return FARM_IDS.map((id) => FARMS[id]);
  }
  farmIds() {
    return FARM_IDS;
  }
  getFarm(id: string) {
    return FARMS[id];
  }
  getMarketPrices() {
    return MARKET;
  }
  getPlanner(_farmId: string): PlannerData {
    // PoC: the planner scenario is shared across farms. In Supabase this will
    // be per-farm (resources/harvests/blocked_slots scoped by farm_id).
    return {
      resources: RESOURCE_ROWS,
      optimalPlan: OPTIMAL_PLAN,
      blocked: BLOCKED,
      capacityConflicts: CONFLICTS,
      delayPenalty: DELAY_PENALTY,
    };
  }
}
