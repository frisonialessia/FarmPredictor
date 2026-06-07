"use client";
import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from "react";
import type { Currency, AreaUnit, TempUnit, Lang, Harvest, Farm } from "./types";
import { repo } from "@/lib/repo";
import { plannerForFarm } from "@/lib/planGen";
import type { PlannerData } from "@/lib/repo";

interface Toast {
  id: number;
  msg: string;
}

const clonePlan = (farm: Farm) => JSON.parse(JSON.stringify(plannerForFarm(farm).optimalPlan)) as Harvest[];
const persist = (key: string, val: unknown) => { try { window.localStorage.setItem(key, JSON.stringify(val)); } catch { /* ignore */ } };

// Persisted preference state: starts at a default (SSR-safe), hydrates from
// localStorage after mount, and writes back on every change.
function usePersisted<T extends string>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  useEffect(() => {
    try {
      const s = window.localStorage.getItem(key);
      if (s != null) setValue(s as T);
    } catch { /* ignore */ }
  }, [key]);
  const set = useCallback((v: T) => {
    setValue(v);
    try { window.localStorage.setItem(key, v); } catch { /* ignore */ }
  }, [key]);
  return [value, set] as const;
}

interface AppState {
  farmId: string;
  setFarmId: (id: string) => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  areaUnit: AreaUnit;
  setAreaUnit: (a: AreaUnit) => void;
  tempUnit: TempUnit;
  setTempUnit: (t: TempUnit) => void;
  userName: string;
  setUserName: (n: string) => void;
  lang: Lang;
  setLang: (l: Lang) => void;
  toasts: Toast[];
  toast: (msg: string) => void;
  // The active farm's planner data (curated for the demo farm, generated from
  // the user's parcels otherwise).
  planner: PlannerData;
  // Shared, per-farm harvest plan + scenario (persisted to localStorage).
  plan: Harvest[];
  moveHarvest: (id: string, row: string, day: number) => void;
  resetPlan: () => void;
  levers: Record<string, boolean>;
  toggleLever: (id: string) => void;
  setLevers: (l: Record<string, boolean>) => void;
  delayDays: number;
  setDelayDays: (d: number) => void;
  // Guided-tour spotlight target, e.g. "harvest:h1", "lever:sched-h1", "net".
  spotlight: string | null;
  setSpotlight: (s: string | null) => void;
  // Seeded (demo) farms + any farm the user created in onboarding.
  farms: Farm[];
  farm: Farm;
  saveFarm: (farm: Farm) => void;
}

const Ctx = createContext<AppState | null>(null);
const DEMO_FARM = repo.getFarm("rio_verde")!;

export function AppProvider({ children }: { children: ReactNode }) {
  const [farmId, setFarmId] = usePersisted<string>("fp_farm", "rio_verde");
  const [currency, setCurrency] = usePersisted<Currency>("fp_currency", "USD");
  const [areaUnit, setAreaUnit] = usePersisted<AreaUnit>("fp_area", "ac");
  const [tempUnit, setTempUnit] = usePersisted<TempUnit>("fp_temp", "F");
  const [userName, setUserNameRaw] = useState<string>("M. Alvarez");
  const [lang, setLang] = usePersisted<Lang>("fp_lang", "en");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [spotlight, setSpotlight] = useState<string | null>(null);
  // Loaded after mount (SSR-safe: server + first client render see seeded only).
  const [userFarms, setUserFarms] = useState<Farm[]>([]);

  // Scenario state (per-farm). Initialized to the demo farm's plan for a
  // deterministic first render; the load effect swaps in the active farm's.
  const [plan, setPlan] = useState<Harvest[]>(() => clonePlan(DEMO_FARM));
  const [levers, setLeversState] = useState<Record<string, boolean>>({});
  const [delayDays, setDelayState] = useState<number>(0);

  useEffect(() => {
    try {
      const s = window.localStorage.getItem("fp_user");
      if (s) setUserNameRaw(s);
    } catch { /* ignore */ }
    try {
      const f = window.localStorage.getItem("fp_farms");
      if (f) setUserFarms(JSON.parse(f) as Farm[]);
    } catch { /* ignore */ }
  }, []);

  const farms = useMemo(() => [...repo.listFarms(), ...userFarms], [userFarms]);
  const farm = useMemo(() => farms.find((f) => f.id === farmId) ?? farms[0], [farms, farmId]);
  const planner = useMemo(() => plannerForFarm(farm), [farm]);

  // Load this farm's saved scenario (or generate a fresh one) whenever the
  // active farm changes — including after the user edits its parcels.
  useEffect(() => {
    try {
      const sp = window.localStorage.getItem(`fp_plan_${farm.id}`);
      if (sp) setPlan(JSON.parse(sp));
      else { const fresh = clonePlan(farm); setPlan(fresh); persist(`fp_plan_${farm.id}`, fresh); }
      const sl = window.localStorage.getItem(`fp_levers_${farm.id}`);
      setLeversState(sl ? JSON.parse(sl) : {});
      const sd = window.localStorage.getItem(`fp_delay_${farm.id}`);
      setDelayState(sd ? Number(sd) : 0);
    } catch {
      setPlan(clonePlan(farm));
      setLeversState({});
      setDelayState(0);
    }
  }, [farm]);

  // Create or update a user farm; clear its saved plan so it regenerates from
  // the new parcels on next load. Demo farms stay read-only.
  const saveFarm = useCallback((updated: Farm) => {
    setUserFarms((prev) => {
      const next = prev.some((f) => f.id === updated.id) ? prev.map((f) => (f.id === updated.id ? updated : f)) : [...prev, updated];
      persist("fp_farms", next);
      return next;
    });
    try { window.localStorage.removeItem(`fp_plan_${updated.id}`); } catch { /* ignore */ }
  }, []);

  const setUserName = useCallback((n: string) => {
    setUserNameRaw(n);
    try { window.localStorage.setItem("fp_user", n); } catch { /* ignore */ }
  }, []);

  // Mutators persist under the current farm (no farm-switch race — these only
  // fire on user actions).
  const moveHarvest = useCallback((id: string, row: string, day: number) => {
    setPlan((prev) => {
      const next = prev.map((h) => (h.id === id ? { ...h, row, day } : h));
      persist(`fp_plan_${farmId}`, next);
      return next;
    });
  }, [farmId]);
  const resetPlan = useCallback(() => {
    const fresh = clonePlan(farm);
    setPlan(fresh); persist(`fp_plan_${farm.id}`, fresh);
    setLeversState({}); persist(`fp_levers_${farm.id}`, {});
    setDelayState(0); persist(`fp_delay_${farm.id}`, 0);
  }, [farm]);
  const toggleLever = useCallback((id: string) => {
    setLeversState((p) => { const next = { ...p, [id]: !p[id] }; persist(`fp_levers_${farmId}`, next); return next; });
  }, [farmId]);
  const setLevers = useCallback((l: Record<string, boolean>) => { setLeversState(l); persist(`fp_levers_${farmId}`, l); }, [farmId]);
  const setDelayDays = useCallback((d: number) => { setDelayState(d); persist(`fp_delay_${farmId}`, d); }, [farmId]);

  const toast = useCallback((msg: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, msg }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2600);
  }, []);

  return (
    <Ctx.Provider value={{ farmId, setFarmId, currency, setCurrency, areaUnit, setAreaUnit, tempUnit, setTempUnit, userName, setUserName, lang, setLang, toasts, toast, planner, plan, moveHarvest, resetPlan, levers, toggleLever, setLevers, delayDays, setDelayDays, spotlight, setSpotlight, farms, farm, saveFarm }}>
      {children}
    </Ctx.Provider>
  );
}

export function useApp() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useApp must be used within AppProvider");
  return c;
}

export function useFarm() {
  return useApp().farm;
}
