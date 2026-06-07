import type { MemberRole } from "@/lib/types";

export const ROLES: MemberRole[] = [
  "owner", "manager", "agronomist", "foreman", "planter", "harvester",
  "irrigator", "caretaker", "driver", "mechanic", "packer", "accountant", "viewer",
];

// English labels — localized at render time via the dictionary.
export const ROLE_LABEL: Record<MemberRole, string> = {
  owner: "Owner", manager: "Manager", agronomist: "Agronomist", foreman: "Foreman",
  planter: "Planter", harvester: "Harvester", irrigator: "Irrigator", caretaker: "Caretaker",
  driver: "Driver", mechanic: "Mechanic", packer: "Packer", accountant: "Accountant", viewer: "Viewer",
};
