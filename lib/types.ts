// Core domain types for FarmPredictor.
// These are the single source of truth shared across all views.

export type Currency = "USD" | "EUR" | "MXN" | "CAD";
export type AreaUnit = "ac" | "ha";
export type TempUnit = "F" | "C";
export type Lang = "en" | "es";

export interface Parcel {
  id: string;
  name: string;
  crop: string;
  area: string;          // e.g. "180 ac"
  hoursToWindowClose: number;
  marginPerAcre: number; // USD base
  marginPct: number;     // 0-100, relative bar
  // schematic polygon geometry for the map
  polygon: string;       // SVG points
  cx: number;
  cy: number;
}

export interface WeatherDay {
  day: string;
  icon: "sun" | "cloudsun" | "rain";
  tempF: number;
  rainPct: number;
}

export interface KPI {
  label: string;
  value: string;
  sub: string;
  highlight?: boolean;
}

export type MemberRole =
  | "owner" | "manager" | "agronomist" | "foreman"
  | "planter" | "harvester" | "irrigator" | "caretaker"
  | "driver" | "mechanic" | "packer" | "accountant" | "viewer";

export interface Member {
  id: string;
  name: string;
  role: MemberRole;
}

export interface InventoryItem {
  id: string;
  name: string;
  qty: number;
  unit: string;
  category?: string;        // Packaging / Input / Produce / Fuel / Other
  location?: string;        // where it's stored
  unitCost?: number;        // $ per unit
  spoilagePct?: number;     // % that spoils per week
}

export interface Farm {
  id: string;
  name: string;
  location: string;
  lat: number;           // for live weather (Open-Meteo)
  lon: number;
  timezone?: string;
  plan: string;
  initials: string;
  kpis: KPI[];
  weather: WeatherDay[];
  parcels: Parcel[];
  members?: Member[];      // team & roles
  resources?: ResourceRow[]; // user's machines & crews (feeds the planner)
  inventory?: InventoryItem[];
}

export interface MarketRow {
  crop: string;
  spot: number;
  cost: number;
  unit: string;
  changePct: number;
}

// Planner domain
export interface Harvest {
  id: string;
  label: string;
  row: string;           // resource row id
  day: number;           // 0-6
  window: [number, number];
  value: number;
  conflict?: boolean;
  outOfWindow?: boolean;
}

export interface ResourceRow {
  id: string;
  label: string;
  icon: string;
  // Machine economics (optional)
  machineType?: string;
  year?: number;
  dieselGalPerHr?: number;
  downtimeCostPerDay?: number;
  // Crew (optional)
  workers?: number;
}

export interface BlockedSlot {
  row: string;
  day: number;
  len: number;
  label: string;
}

// Simulator domain
export interface Conflict {
  id: string;
  icon: string;
  parcel: string;
  resource: string;
  loss: number;
  actionLabel: string;
  actionCost: number;
}
