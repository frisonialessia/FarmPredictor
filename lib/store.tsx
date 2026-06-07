"use client";
import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from "react";
import type { Currency, AreaUnit, TempUnit, Lang, Harvest, Farm } from "./types";
import { repo } from "@/lib/repo";

interface Toast {
  id: number;
  msg: string;
}

const clonePlan = (farmId: string) => JSON.parse(JSON.stringify(repo.getPlanner(farmId).optimalPlan)) as Harvest[];

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
  // Shared harvest plan + scenario — the single model the Planner and the
  // Simulator both read from and write to.
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

export function AppProvider({ children }: { children: ReactNode }) {
  const [farmId, setFarmId] = usePersisted<string>("fp_farm", "rio_verde");
  const [currency, setCurrency] = usePersisted<Currency>("fp_currency", "USD");
  const [areaUnit, setAreaUnit] = usePersisted<AreaUnit>("fp_area", "ac");
  const [tempUnit, setTempUnit] = usePersisted<TempUnit>("fp_temp", "F");
  const [userName, setUserNameRaw] = useState<string>("M. Alvarez");
  // English is the primary language; Spanish is the secondary option.
  const [lang, setLang] = usePersisted<Lang>("fp_lang", "en");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [plan, setPlan] = useState<Harvest[]>(() => clonePlan(farmId));
  const [levers, setLevers] = useState<Record<string, boolean>>({});
  const [delayDays, setDelayDays] = useState<number>(0);
  const [spotlight, setSpotlight] = useState<string | null>(null);
  // Loaded after mount (SSR-safe: server + first client render see seeded only).
  const [userFarms, setUserFarms] = useState<Farm[]>([]);

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

  // Create or update a user farm and persist it (demo farms stay read-only).
  const saveFarm = useCallback((updated: Farm) => {
    setUserFarms((prev) => {
      const next = prev.some((f) => f.id === updated.id) ? prev.map((f) => (f.id === updated.id ? updated : f)) : [...prev, updated];
      try { window.localStorage.setItem("fp_farms", JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);
  const setUserName = useCallback((n: string) => {
    setUserNameRaw(n);
    try { window.localStorage.setItem("fp_user", n); } catch { /* ignore */ }
  }, []);

  const moveHarvest = useCallback((id: string, row: string, day: number) => {
    setPlan((prev) => prev.map((h) => (h.id === id ? { ...h, row, day } : h)));
  }, []);
  const resetPlan = useCallback(() => setPlan(clonePlan(farmId)), [farmId]);
  const toggleLever = useCallback((id: string) => setLevers((p) => ({ ...p, [id]: !p[id] })), []);

  const toast = useCallback((msg: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, msg }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2600);
  }, []);

  return (
    <Ctx.Provider value={{ farmId, setFarmId, currency, setCurrency, areaUnit, setAreaUnit, tempUnit, setTempUnit, userName, setUserName, lang, setLang, toasts, toast, plan, moveHarvest, resetPlan, levers, toggleLever, setLevers, delayDays, setDelayDays, spotlight, setSpotlight, farms, farm, saveFarm }}>
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
