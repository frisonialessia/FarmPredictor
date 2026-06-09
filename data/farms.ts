import type { Farm, MarketRow } from "@/lib/types";

export const FARMS: Record<string, Farm> = {
  rio_verde: {
    id: "rio_verde",
    name: "Demo Farm 1",
    location: "Hidalgo County, TX",
    lat: 26.30,
    lon: -98.16,
    plan: "Pro",
    initials: "D1",
    kpis: [
      { label: "Margin at risk", value: "$6,240", sub: "recoverable this week", highlight: true },
      { label: "Avg. displacement", value: "2.3 d", sub: "optimal vs. actual" },
      { label: "Harvests in window", value: "4 / 6", sub: "at optimal point" },
      { label: "Machinery use", value: "92%", sub: "1 in maintenance" },
    ],
    weather: [
      { day: "Mon", icon: "sun", tempF: 91, rainPct: 0 },
      { day: "Tue", icon: "cloudsun", tempF: 89, rainPct: 10 },
      { day: "Wed", icon: "rain", tempF: 78, rainPct: 80 },
      { day: "Thu", icon: "rain", tempF: 75, rainPct: 60 },
      { day: "Fri", icon: "cloudsun", tempF: 84, rainPct: 20 },
      { day: "Sat", icon: "sun", tempF: 93, rainPct: 0 },
      { day: "Sun", icon: "sun", tempF: 95, rainPct: 0 },
    ],
    parcels: [
      { id: "na", name: "North A", crop: "Grain sorghum", area: "180 ac", hoursToWindowClose: 38, marginPerAcre: 142, marginPct: 92, polygon: "60,40 220,30 230,130 70,145", cx: 140, cy: 85 },
      { id: "w2", name: "West 2", crop: "Upland cotton", area: "240 ac", hoursToWindowClose: 72, marginPerAcre: 118, marginPct: 74, polygon: "60,160 200,150 210,275 70,290", cx: 132, cy: 215 },
      { id: "g1", name: "Greenhouse 1", crop: "Grapefruit", area: "40 ac", hoursToWindowClose: 60, marginPerAcre: 156, marginPct: 99, polygon: "250,30 410,35 405,140 240,135", cx: 320, cy: 85 },
      { id: "e3", name: "East 3", crop: "Sweet corn", area: "310 ac", hoursToWindowClose: 144, marginPerAcre: 96, marginPct: 60, polygon: "250,165 430,160 440,285 260,295", cx: 340, cy: 220 },
      { id: "sb", name: "South B", crop: "Leaf lettuce", area: "120 ac", hoursToWindowClose: 216, marginPerAcre: 74, marginPct: 46, polygon: "120,310 330,315 325,395 130,388", cx: 225, cy: 352 },
      { id: "rc", name: "River C", crop: "Watermelon", area: "95 ac", hoursToWindowClose: 96, marginPerAcre: 88, marginPct: 55, polygon: "350,310 470,315 475,395 360,400", cx: 415, cy: 355 },
    ],
  },
  llano_seco: {
    id: "llano_seco",
    name: "Demo Farm 2",
    location: "Lubbock County, TX",
    lat: 33.58,
    lon: -101.85,
    plan: "Pro",
    initials: "D2",
    kpis: [
      { label: "Margin at risk", value: "$3,180", sub: "recoverable this week", highlight: true },
      { label: "Avg. displacement", value: "1.4 d", sub: "optimal vs. actual" },
      { label: "Harvests in window", value: "3 / 4", sub: "at optimal point" },
      { label: "Machinery use", value: "78%", sub: "all operational" },
    ],
    weather: [
      { day: "Mon", icon: "sun", tempF: 88, rainPct: 0 },
      { day: "Tue", icon: "sun", tempF: 90, rainPct: 0 },
      { day: "Wed", icon: "cloudsun", tempF: 85, rainPct: 20 },
      { day: "Thu", icon: "sun", tempF: 92, rainPct: 0 },
      { day: "Fri", icon: "sun", tempF: 94, rainPct: 0 },
      { day: "Sat", icon: "cloudsun", tempF: 87, rainPct: 30 },
      { day: "Sun", icon: "rain", tempF: 79, rainPct: 70 },
    ],
    parcels: [
      { id: "m1", name: "Mesa 1", crop: "Upland cotton", area: "420 ac", hoursToWindowClose: 120, marginPerAcre: 104, marginPct: 65, polygon: "60,40 230,35 240,150 70,160", cx: 150, cy: 95 },
      { id: "m2", name: "Mesa 2", crop: "Winter wheat", area: "380 ac", hoursToWindowClose: 48, marginPerAcre: 82, marginPct: 51, polygon: "260,40 440,45 435,155 250,150", cx: 345, cy: 95 },
      { id: "dn", name: "Draw North", crop: "Grain sorghum", area: "260 ac", hoursToWindowClose: 168, marginPerAcre: 71, marginPct: 44, polygon: "60,180 250,175 245,300 70,310", cx: 155, cy: 240 },
      { id: "ds", name: "Draw South", crop: "Peanuts", area: "150 ac", hoursToWindowClose: 72, marginPerAcre: 133, marginPct: 83, polygon: "280,180 450,185 455,305 290,310", cx: 365, cy: 245 },
    ],
  },
};

export const MARKET: MarketRow[] = [
  { crop: "Grain sorghum", spot: 4.85, cost: 3.2, unit: "bu", changePct: 2.1 },
  { crop: "Upland cotton", spot: 0.72, cost: 0.58, unit: "lb", changePct: -1.4 },
  { crop: "Sweet corn", spot: 6.4, cost: 4.1, unit: "crate", changePct: 3.6 },
  { crop: "Grapefruit", spot: 18.5, cost: 11.0, unit: "box", changePct: 0.8 },
];

export const FARM_IDS = Object.keys(FARMS);
