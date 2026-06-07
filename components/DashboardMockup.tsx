"use client";
import { useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { Icon } from "@/components/Icon";
import { AreaChart } from "@/components/Charts";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { useMarketingT } from "@/lib/lang";

// Interactive, self-contained dashboard preview for the landing. Fully isolated
// local state — clicking here never touches the real app. Localized via the
// shared dictionary, so it matches the page language.
const KPIS: [string, string, boolean][] = [
  ["Margin at risk", "$6,240", true],
  ["Avg. displacement", "2.3 d", false],
  ["In window", "4 / 6", false],
  ["Machinery use", "92%", false],
];
const DECISIONS: [string, string, string][] = [
  ["tractor", "North A", "Harvest before Thursday"],
  ["rain", "West 2", "Cover Wednesday rain"],
  ["box", "North A", "Order 620 crates today"],
];
const SEASON = [18, 24, 31, 28, 36, 42];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const RAIL = ["overview", "whatif", "map", "planner", "financial"];

// The three recoverable conflicts (mirror the real engine's seed).
const LEVERS = [
  { id: "maq", label: "Move up Harvester #2 maintenance", recover: 2940 },
  { id: "crew", label: "Hire external crew (Wednesday)", recover: 2080 },
  { id: "box", label: "Rush order 620 crates (today)", recover: 1120 },
];
const BASE = 28060; // "do nothing" net; applying all three reaches $34,200.

const fmt = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

export function DashboardMockup() {
  const t = useMarketingT();
  const [view, setView] = useState<"overview" | "whatif">("overview");
  const [on, setOn] = useState<Record<string, boolean>>({});

  const recovered = LEVERS.reduce((s, l) => s + (on[l.id] ? l.recover : 0), 0);
  const net = BASE + recovered;

  return (
    <div className="rounded-2xl overflow-hidden border border-line bg-white" style={{ boxShadow: "var(--shadow-lg)" }}>
      {/* window chrome */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-line" style={{ background: "var(--bg)" }}>
        <span className="h-3 w-3 rounded-full" style={{ background: "#ff5f57" }} />
        <span className="h-3 w-3 rounded-full" style={{ background: "#febc2e" }} />
        <span className="h-3 w-3 rounded-full" style={{ background: "#28c840" }} />
        <span className="mx-auto mono text-[11px] px-3 py-1 rounded-md hidden sm:block" style={{ background: "#fff", border: "1px solid var(--line)", color: "var(--muted)" }}>farmpredictor.app/dashboard</span>
      </div>

      <div className="flex">
        {/* mini rail */}
        <div className="hidden sm:flex flex-col items-center gap-2 py-4 px-2.5 border-r border-line shrink-0" style={{ width: 64 }}>
          <BrandMark size={26} />
          <div className="mt-2 flex flex-col gap-1.5">
            {RAIL.map((ic) => {
              const active = (ic === "overview" && view === "overview") || (ic === "whatif" && view === "whatif");
              const clickable = ic === "overview" || ic === "whatif";
              return (
                <button
                  key={ic}
                  onClick={() => clickable && setView(ic === "whatif" ? "whatif" : "overview")}
                  className="grid place-items-center h-9 w-9 rounded-xl transition-colors"
                  style={{ background: active ? "var(--ink)" : "transparent", color: active ? "var(--lime)" : "var(--ink)", cursor: clickable ? "pointer" : "default", opacity: clickable ? 1 : 0.5 }}
                >
                  <Icon name={ic} size={17} />
                </button>
              );
            })}
          </div>
        </div>

        {/* content */}
        <div className="flex-1 min-w-0 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold tracking-tight">{view === "overview" ? t("Overview") : t("What-if simulator")}</h4>
              <p className="text-[11px] text-muted">{view === "overview" ? t("Tuesday, June 9 · 08:14") : t("Pull the levers, watch the margin")}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="pill hidden md:inline-flex"><span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--green)" }} />{t("Demo data")}</span>
              <button onClick={() => setView("whatif")} className="rounded-full px-3 py-1.5 text-[11px] font-semibold btn-press" style={{ background: "var(--green)", color: "var(--ink)" }}>{t("Recommendations")}</button>
            </div>
          </div>

          {view === "overview" ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                {KPIS.map(([label, value, hl]) => (
                  <div key={label} className="card p-3.5">
                    <p className="kpi-label">{t(label)}</p>
                    <p className={`mono text-lg font-bold mt-1.5 ${hl ? "text-green" : ""}`}>{value}</p>
                  </div>
                ))}
              </div>
              <div className="grid md:grid-cols-3 gap-3">
                <div className="card p-4 md:col-span-2">
                  <h5 className="text-[13px] font-bold mb-0.5">{t("Today's decisions")}</h5>
                  <p className="text-[11px] mb-3 text-muted">{t("Sorted by margin impact")}</p>
                  {DECISIONS.map(([icon, parcel, title], i) => (
                    <button key={i} onClick={() => setView("whatif")} className={`w-full flex gap-3 items-center py-2.5 text-left row-hover -mx-2 px-2 rounded-lg ${i > 0 ? "border-t border-line" : ""}`}>
                      <span className="grid place-items-center h-8 w-8 rounded-lg shrink-0" style={{ background: "rgba(194,65,12,.1)", color: "var(--warn)" }}><Icon name={icon} size={15} /></span>
                      <div className="flex-1 min-w-0"><span className="text-[12px] font-bold">{parcel}</span><p className="text-[12px] leading-tight">{t(title)}</p></div>
                      <span className="mono text-[12px] font-bold" style={{ color: "var(--warn)" }}>-{fmt(LEVERS[i].recover)}</span>
                    </button>
                  ))}
                </div>
                <div className="card p-4">
                  <h5 className="text-[13px] font-bold mb-0.5">{t("Season margin")}</h5>
                  <p className="text-[11px] mb-3 text-muted">{t("Recovered, by month")}</p>
                  <AreaChart data={SEASON} labels={MONTHS.map((m) => t(m))} height={104} />
                </div>
              </div>
            </>
          ) : (
            <div className="grid md:grid-cols-5 gap-3">
              <div className="rounded-2xl p-5 md:col-span-2 text-white flex flex-col justify-center" style={{ background: "var(--ink)" }}>
                <span className="inline-block self-start text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full mb-3" style={{ background: "var(--lime)", color: "var(--ink)" }}>{t("Live scenario")}</span>
                <span className="text-[11px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,.6)" }}>{t("Weekly net margin")}</span>
                <AnimatedNumber value={net} format={fmt} className="mono text-4xl font-bold block mt-1" style={{ color: "var(--lime)" }} />
                <span className="mono text-xs font-bold mt-1" style={{ color: "var(--lime)" }}>+{fmt(recovered)} {t("vs. doing nothing")}</span>
              </div>
              <div className="card p-4 md:col-span-3">
                <h5 className="text-[13px] font-bold mb-0.5">{t("Decision levers")}</h5>
                <p className="text-[11px] mb-3 text-muted">{t("Try it — toggle a fix")}</p>
                {LEVERS.map((l, i) => (
                  <div key={l.id} className={`flex items-center gap-3 py-2.5 ${i > 0 ? "border-t border-line" : ""}`}>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-bold leading-tight">{t(l.label)}</p>
                      <p className="text-[11px] text-muted">{t("recovers")} <span className="mono font-semibold text-green">{fmt(l.recover)}</span></p>
                    </div>
                    <button onClick={() => setOn((p) => ({ ...p, [l.id]: !p[l.id] }))} className="relative h-6 w-11 rounded-full shrink-0" style={{ background: on[l.id] ? "var(--green)" : "var(--line)", transition: "background .2s" }}>
                      <span className="absolute top-1 h-4 w-4 rounded-full bg-white" style={{ left: on[l.id] ? 24 : 4, transition: "left .2s" }} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
