"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import type { Currency, AreaUnit, TempUnit } from "./types";
import { FARMS } from "@/data/farms";

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
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [farmId, setFarmId] = useState<string>("rio_verde");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [areaUnit, setAreaUnit] = useState<AreaUnit>("ac");
  const [tempUnit, setTempUnit] = useState<TempUnit>("F");
  const [userName, setUserName] = useState<string>("M. Alvarez");

  return (
    <Ctx.Provider value={{ farmId, setFarmId, currency, setCurrency, areaUnit, setAreaUnit, tempUnit, setTempUnit, userName, setUserName }}>
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
