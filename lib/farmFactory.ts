import type { Farm, Parcel, KPI, Member, ResourceRow, InventoryItem } from "@/lib/types";
import { cropTemplate, ALL_CROPS } from "@/data/crops";

export interface ParcelRow { name: string; crop: string; area: string }

export const CROPS = ALL_CROPS;

// Lays out parcel rows into full Parcel objects with schematic map geometry.
// SIMULATED metrics (margin/window) until real data is connected. `unit` is the
// user's chosen area unit (ac/ha) so the stored area string matches what they entered.
export function parcelsFromRows(rows: ParcelRow[], unit: string = "ac"): Parcel[] {
  return rows.map((p, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 40 + col * 155;
    const y = 35 + row * 130;
    const w = 135;
    const h = 100;
    const area = Number(p.area) || 0;
    // Pull realistic margin/window from the crop template; fall back to generic.
    const tpl = cropTemplate(p.crop);
    const marginPerAcre = tpl ? tpl.marginPerAcre : 90 + ((i * 17) % 60);
    return {
      id: `p_${i}`,
      name: p.name,
      crop: p.crop,
      area: `${area} ${unit}`,
      hoursToWindowClose: tpl ? tpl.windowDays * 24 + 24 : 48 + i * 24,
      marginPerAcre,
      marginPct: Math.min(95, Math.round((marginPerAcre / 160) * 100)),
      polygon: `${x},${y} ${x + w},${y + 5} ${x + w - 5},${y + h} ${x},${y + h - 5}`,
      cx: x + w / 2,
      cy: y + h / 2,
    };
  });
}

function initialsOf(name: string): string {
  return name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || name.slice(0, 2).toUpperCase();
}

function kpisFromParcels(parcels: Parcel[], rows: ParcelRow[], unit: string = "ac"): KPI[] {
  const totalAc = rows.reduce((s, p) => s + (Number(p.area) || 0), 0);
  const crops = new Set(rows.map((p) => p.crop)).size;
  return [
    { label: "Parcels", value: String(parcels.length), sub: "in this farm" },
    { label: "Total area", value: `${totalAc} ${unit}`, sub: "under management" },
    { label: "Crops", value: String(crops), sub: "tracked" },
    { label: "Margin at risk", value: "—", sub: "connect data to compute", highlight: true },
  ];
}

interface FarmMeta {
  id: string;
  name: string;
  location: string;
  lat: number;
  lon: number;
  plan?: string;
  timezone?: string;
  areaUnit?: string;
}

interface FarmExtras {
  members?: Member[];
  resources?: ResourceRow[];
  inventory?: InventoryItem[];
}

// Builds a complete, valid Farm from metadata + parcel rows (+ optional team,
// resources and inventory). Used to create a farm in onboarding and edit later.
export function buildFarm(meta: FarmMeta, rows: ParcelRow[], extras: FarmExtras = {}): Farm {
  const parcels = parcelsFromRows(rows, meta.areaUnit);
  return {
    id: meta.id,
    name: meta.name,
    location: meta.location,
    lat: meta.lat,
    lon: meta.lon,
    timezone: meta.timezone,
    plan: meta.plan ?? "Starter",
    initials: initialsOf(meta.name),
    kpis: kpisFromParcels(parcels, rows, meta.areaUnit),
    weather: [],
    parcels,
    members: extras.members,
    resources: extras.resources && extras.resources.length ? extras.resources : undefined,
    inventory: extras.inventory,
  };
}

// Onboarding entry point — new id + default (central Texas) coordinates.
export function farmFromDraft(draft: { name: string; location: string; parcels: ParcelRow[] }): Farm {
  return buildFarm({ id: `user_${Date.now()}`, name: draft.name, location: draft.location, lat: 31.0, lon: -100.0 }, draft.parcels);
}
