"use client";
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import type { Currency, AreaUnit, TempUnit, Lang } from "./types";
import { FARMS } from "@/data/farms";

interface Toast {
  id: number;
  msg: string;
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
    <Ctx.Provider value={{ farmId, setFarmId, currency, setCurrency, areaUnit, setAreaUnit, tempUnit, setTempUnit, userName, setUserName, lang, setLang: changeLang, toasts, toast }}>
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
