import type { Farm, Parcel, KPI } from "@/lib/types";

interface Draft {
  name: string;
  location: string;
  parcels: { name: string; crop: string; area: string }[];
}

// Turns the onboarding draft into a fully-formed Farm (with synthesized map
// geometry + KPIs) so user-created farms render everywhere the demo farms do.
// SIMULATED: coordinates default to central Texas and metrics are placeholders
// until real data is connected.
export function farmFromDraft(draft: Draft): Farm {
  const id = `user_${Date.now()}`;
  const initials =
    draft.name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase() ||
    draft.name.slice(0, 2).toUpperCase();

  const parcels: Parcel[] = draft.parcels.map((p, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 40 + col * 155;
    const y = 35 + row * 130;
    const w = 135;
    const h = 100;
    const area = Number(p.area) || 0;
    return {
      id: `p_${i}`,
      name: p.name,
      crop: p.crop,
      area: `${area} ac`,
      hoursToWindowClose: 48 + i * 24, // SIMULATED
      marginPerAcre: 90 + ((i * 17) % 60), // SIMULATED
      marginPct: Math.min(95, 50 + i * 9), // SIMULATED
      polygon: `${x},${y} ${x + w},${y + 5} ${x + w - 5},${y + h} ${x},${y + h - 5}`,
      cx: x + w / 2,
      cy: y + h / 2,
    };
  });

  const totalAc = draft.parcels.reduce((s, p) => s + (Number(p.area) || 0), 0);
  const crops = new Set(draft.parcels.map((p) => p.crop)).size;
  const kpis: KPI[] = [
    { label: "Parcels", value: String(parcels.length), sub: "in this farm" },
    { label: "Total area", value: `${totalAc} ac`, sub: "under management" },
    { label: "Crops", value: String(crops), sub: "tracked" },
    { label: "Margin at risk", value: "—", sub: "connect data to compute", highlight: true },
  ];

  return {
    id,
    name: draft.name,
    location: draft.location,
    lat: 31.0,
    lon: -100.0,
    plan: "Starter",
    initials,
    kpis,
    weather: [], // filled live by Open-Meteo
    parcels,
  };
}
