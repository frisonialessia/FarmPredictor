import { FARMS, FARM_IDS, MARKET } from "@/data/farms";
import type { DataRepository } from "./repository";

// In-memory implementation backed by the simulated data in /data.
// This is the only place that imports the raw seed data. Methods are async to
// match the contract (see repository.ts) — they resolve immediately here, and
// become real queries in the future SupabaseRepository with no call-site churn.
export class MemoryRepository implements DataRepository {
  async listFarms() {
    return FARM_IDS.map((id) => FARMS[id]);
  }
  async getFarm(id: string) {
    return FARMS[id];
  }
  async getMarketPrices() {
    return MARKET;
  }
}
