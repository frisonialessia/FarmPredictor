import { MemoryRepository } from "./memory";
import type { DataRepository } from "./repository";

// ── The single swap point ────────────────────────────────────────────
// Today: simulated, in-memory. To go live, replace this one line with:
//   export const repo: DataRepository = new SupabaseRepository();
// Nothing else in the UI has to change.
export const repo: DataRepository = new MemoryRepository();

export type { DataRepository, PlannerData } from "./repository";
