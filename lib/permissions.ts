// ── Role-based access control ────────────────────────────────────────────────
// Four access tiers gate what each member sees. The owner sees everything; each
// step down loses the most sensitive areas (finances, the scenario simulator,
// team management). Enforced in the UI today; when Supabase lands the role comes
// from the user's membership row and the same checks apply server-side.
import type { MemberRole } from "./types";

export type AccessRole = "owner" | "manager" | "agronomist" | "harvester";

export const ACCESS_ROLES: AccessRole[] = ["owner", "manager", "agronomist", "harvester"];

export const ACCESS_ROLE_LABEL: Record<AccessRole, string> = {
  owner: "Owner",
  manager: "Farm manager",
  agronomist: "Agronomist",
  harvester: "Harvester",
};

export type ViewKey =
  | "overview" | "assistant" | "mapa" | "planner" | "whatif"
  | "financial" | "operations" | "livestock" | "activity" | "digest" | "settings";

const ALL_VIEWS: ViewKey[] = [
  "overview", "assistant", "mapa", "planner", "whatif",
  "financial", "operations", "livestock", "activity", "digest", "settings",
];

// Financial + the what-if simulator are hidden for the lower roles.
const RESTRICTED: ViewKey[] = ["financial", "whatif"];
const operationalOnly = ALL_VIEWS.filter((v) => !RESTRICTED.includes(v));

export interface Capabilities {
  views: Set<ViewKey>;
  canEditPlan: boolean;    // drag harvests in the Planner
  canManageTeam: boolean;  // invite, assign roles, edit the farm
  canManageBilling: boolean;
}

function build(views: ViewKey[], rest: Omit<Capabilities, "views">): Capabilities {
  return { views: new Set(views), ...rest };
}

export const ACCESS: Record<AccessRole, Capabilities> = {
  owner: build(ALL_VIEWS, { canEditPlan: true, canManageTeam: true, canManageBilling: true }),
  manager: build(ALL_VIEWS, { canEditPlan: true, canManageTeam: true, canManageBilling: false }),
  agronomist: build(operationalOnly, { canEditPlan: true, canManageTeam: false, canManageBilling: false }),
  harvester: build(operationalOnly, { canEditPlan: false, canManageTeam: false, canManageBilling: false }),
};

export function caps(role: AccessRole): Capabilities {
  return ACCESS[role] ?? ACCESS.harvester;
}

export function canView(role: AccessRole, view: string): boolean {
  return caps(role).views.has(view as ViewKey);
}

// Collapse any of the 13 onboarding roles onto one of the 4 access tiers.
export function toAccessRole(role: MemberRole | AccessRole | undefined): AccessRole {
  switch (role) {
    case "owner": return "owner";
    case "manager":
    case "accountant": return "manager";
    case "agronomist":
    case "foreman":
    case "irrigator":
    case "caretaker":
    case "planter": return "agronomist";
    default: return "harvester"; // harvester, driver, mechanic, packer, viewer
  }
}
