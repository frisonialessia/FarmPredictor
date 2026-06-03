// Core domain types for FarmPredictor.
// These are the single source of truth shared across all views.

export type Currency = "USD" | "EUR" | "MXN" | "CAD";
export type AreaUnit = "ac" | "ha";
export type TempUnit = "F" | "C";

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

export interface Farm {
  id: string;
  name: string;
  location: string;
  plan: string;
  initials: string;
  kpis: KPI[];
  weather: WeatherDay[];
  parcels: Parcel[];
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
