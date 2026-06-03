"use client";
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import type { Currency, AreaUnit, TempUnit, Lang, Harvest } from "./types";
import { FARMS } from "@/data/farms";
import { OPTIMAL_PLAN } from "@/data/planner";

interface Toast {
  id: number;
  msg: string;
}

const clonePlan = () => JSON.parse(JSON.stringify(OPTIMAL_PLAN)) as Harvest[];

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
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [farmId, setFarmId] = useState<string>("rio_verde");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [areaUnit, setAreaUnit] = useState<AreaUnit>("ac");
  const [tempUnit, setTempUnit] = useState<TempUnit>("F");
  const [userName, setUserName] = useState<string>("M. Alvarez");
  // English is the primary language; Spanish is the secondary option.
  const [lang, setLang] = useState<Lang>("en");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [plan, setPlan] = useState<Harvest[]>(clonePlan);
  const [levers, setLevers] = useState<Record<string, boolean>>({});
  const [delayDays, setDelayDays] = useState<number>(0);

  const moveHarvest = useCallback((id: string, row: string, day: number) => {
    setPlan((prev) => prev.map((h) => (h.id === id ? { ...h, row, day } : h)));
  }, []);
  const resetPlan = useCallback(() => setPlan(clonePlan()), []);
  const toggleLever = useCallback((id: string) => setLevers((p) => ({ ...p, [id]: !p[id] })), []);

  // Restore the saved language after mount (avoids SSR/hydration mismatch).
  useEffect(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem("fp_lang") : null;
    if (saved === "en" || saved === "es") setLang(saved);
  }, []);

  const changeLang = useCallback((l: Lang) => {
    setLang(l);
    if (typeof window !== "undefined") window.localStorage.setItem("fp_lang", l);
  }, []);

  const toast = useCallback((msg: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, msg }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2600);
  }, []);

  return (
    <Ctx.Provider value={{ farmId, setFarmId, currency, setCurrency, areaUnit, setAreaUnit, tempUnit, setTempUnit, userName, setUserName, lang, setLang: changeLang, toasts, toast, plan, moveHarvest, resetPlan, levers, toggleLever, setLevers, delayDays, setDelayDays }}>
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
  const { farmId } = useApp();
  return FARMS[farmId];
}
