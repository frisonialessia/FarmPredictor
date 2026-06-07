"use client";
import { useState } from "react";
import { AppProvider, useApp } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { LanguageToggle } from "@/components/LanguageToggle";
import { AccountMenu } from "@/components/AccountMenu";
import { Toaster } from "@/components/Toaster";
import { GuidedTour } from "@/components/GuidedTour";
import { BrandMark } from "@/components/BrandMark";
import { Icon } from "@/components/Icon";
import { Overview } from "@/components/views/Overview";
import { Assistant } from "@/components/views/Assistant";
import { ParcelMap } from "@/components/views/ParcelMap";
import { Planner } from "@/components/views/Planner";
import { Simulator } from "@/components/views/Simulator";
import { Financial } from "@/components/views/Financial";
import { Operations } from "@/components/views/Operations";
import { Activity } from "@/components/views/Activity";
import { Livestock } from "@/components/views/Livestock";
import { Digest } from "@/components/views/Digest";
import { Settings } from "@/components/views/Settings";

const TITLES: Record<string, [string, string]> = {
  overview: ["Overview", "Tuesday, June 9 · 08:14"],
  assistant: ["Ask your farm", "Your data, in plain answers"],
  mapa: ["Parcel map", "Optimal-window time remaining"],
  planner: ["Planner", "Machinery & crews vs. optimal windows"],
  whatif: ["What-if simulator", "Pull the levers, watch the margin"],
  financial: ["Financial", "Margin, cash flow and profitability"],
  operations: ["Operations", "Machinery, crews, supplies & logistics"],
  activity: ["Activity log", "Decision journal"],
  livestock: ["Livestock", "Herd margin & vet windows"],
  digest: ["Digest", "Today's decisions, delivered"],
  settings: ["Settings", "Profile & preferences"],
};

// Compact farm switcher for the top bar — visible only on mobile, where the
// left rail (which carries the desktop switcher) is hidden.
function MobileFarmSwitcher() {
  const { setFarmId, farms, farm } = useApp();
  const [open, setOpen] = useState(false);
  return (
    <div className="relative md:hidden">
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-1" aria-label="Switch farm">
        <span className="h-7 w-7 rounded-lg grid place-items-center text-[11px] font-bold" style={{ background: "var(--lime)" }}>{farm.initials}</span>
        <Icon name="chevron" size={12} />
      </button>
      {open && (
        <div className="absolute right-0 z-50 bg-white border border-line rounded-xl shadow-lg overflow-hidden mt-2" style={{ width: 200 }}>
          {farms.map((f) => (
            <button key={f.id} onClick={() => { setFarmId(f.id); setOpen(false); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-bg text-left">
              <span className="h-8 w-8 rounded-lg grid place-items-center text-xs font-bold shrink-0" style={{ background: "var(--lime)" }}>{f.initials}</span>
              <span><p className="text-xs font-semibold">{f.name}</p><p className="text-[10px] text-muted">{f.location}</p></span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function DashboardInner() {
  const [active, setActive] = useState("overview");
  const [tourOpen, setTourOpen] = useState(false);
  const { toast } = useApp();
  const t = useT();
  const title = TITLES[active];
  return (
    <div className="flex min-h-screen">
      <Sidebar active={active} onNavigate={setActive} />
      <main className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4 border-b border-line bg-white sticky top-0 z-20">
          <div className="flex items-center gap-3 min-w-0">
            <a href="/" className="md:hidden shrink-0" title={t("Home")}><BrandMark size={26} /></a>
            <div className="min-w-0">
              <h2 className="text-[15px] sm:text-[17px] font-bold tracking-tight truncate">{t(title[0])}</h2>
              <p className="text-xs text-muted truncate">{t(title[1])}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-semibold px-2 py-1 rounded-full hidden lg:flex items-center gap-1.5" style={{ background: "var(--bg)", color: "var(--muted)" }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--green)" }} />{t("Demo data")}
            </span>
            <span className="text-xs mono px-3 py-1.5 rounded-full hidden sm:block" style={{ background: "var(--mint)" }}>{t("week of Jun 8")}</span>
            <LanguageToggle />
            <MobileFarmSwitcher />
            <button onClick={() => setTourOpen(true)} className="rounded-full px-3 sm:px-4 py-2 text-xs font-semibold whitespace-nowrap btn-press flex items-center gap-1.5" style={{ background: "var(--ink)", color: "#fff" }}>
              <Icon name="play" size={12} style={{ color: "var(--lime)" }} /><span className="hidden sm:inline">{t("60-sec tour")}</span>
            </button>
            <button onClick={() => { setActive("overview"); toast("Showing today's recommendations."); }} className="rounded-full px-3 sm:px-4 py-2 text-xs font-semibold whitespace-nowrap btn-press hidden sm:block" style={{ background: "var(--green)", color: "var(--ink)" }}>{t("Recommendations")}</button>
            <AccountMenu onNavigate={setActive} />
          </div>
        </div>
        <div className="p-4 sm:p-6 pb-24 md:pb-6">
          {active === "overview" && <Overview />}
          {active === "assistant" && <Assistant />}
          {active === "mapa" && <ParcelMap />}
          {active === "planner" && <Planner />}
          {active === "whatif" && <Simulator />}
          {active === "financial" && <Financial />}
          {active === "operations" && <Operations />}
          {active === "activity" && <Activity />}
          {active === "livestock" && <Livestock />}
          {active === "digest" && <Digest />}
          {active === "settings" && <Settings />}
        </div>
      </main>
      <MobileNav active={active} onNavigate={setActive} />
      <Toaster />
      {tourOpen && <GuidedTour setView={setActive} onExit={() => setTourOpen(false)} />}
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
