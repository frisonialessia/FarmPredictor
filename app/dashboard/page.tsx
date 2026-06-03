"use client";
import { useState } from "react";
import { AppProvider, useApp } from "@/lib/store";
import { Sidebar, NAV } from "@/components/Sidebar";
import { Overview } from "@/components/views/Overview";
import { ParcelMap } from "@/components/views/ParcelMap";
import { Planner } from "@/components/views/Planner";
import { Simulator } from "@/components/views/Simulator";
import { Financial } from "@/components/views/Financial";
import { Operations } from "@/components/views/Operations";
import { Activity } from "@/components/views/Activity";
import { Settings } from "@/components/views/Settings";

const TITLES: Record<string, [string, string]> = {
  overview: ["Overview", "Tuesday, June 9 · 08:14"],
  mapa: ["Parcel map", "Optimal-window time remaining"],
  planner: ["Planner", "Machinery & crews vs. optimal windows"],
  whatif: ["What-if simulator", "Pull the levers, watch the margin"],
  financial: ["Financial", "Margin, cash flow and profitability"],
  operations: ["Operations", "Machinery, crews, supplies & logistics"],
  activity: ["Activity log", "Decision journal"],
  settings: ["Settings", "Profile & preferences"],
};

function DashboardInner() {
  const [active, setActive] = useState("overview");
  const t = TITLES[active];
  return (
    <div className="flex min-h-screen">
      <Sidebar active={active} onNavigate={setActive} />
      <main className="flex-1 min-w-0">
        <div className="flex items-center justify-between px-6 py-4 border-b border-line bg-white sticky top-0 z-20">
          <div><h2 className="text-[17px] font-bold tracking-tight">{t[0]}</h2><p className="text-xs text-muted">{t[1]}</p></div>
          <div className="flex items-center gap-2">
            <span className="text-xs mono px-3 py-1.5 rounded-full hidden sm:block" style={{ background: "var(--mint)" }}>week of Jun 8</span>
            <button className="rounded-full px-4 py-2 text-xs font-semibold" style={{ background: "var(--green)", color: "var(--ink)" }}>Recommendations</button>
          </div>
        </div>
        <div className="p-6">
          {active === "overview" && <Overview />}
          {active === "mapa" && <ParcelMap />}
          {active === "planner" && <Planner />}
          {active === "whatif" && <Simulator />}
          {active === "financial" && <Financial />}
          {active === "operations" && <Operations />}
          {active === "activity" && <Activity />}
          {active === "settings" && <Settings />}
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AppProvider>
      <DashboardInner />
    </AppProvider>
  );
}
