"use client";
import { useState, useEffect } from "react";
import { BrandMark } from "@/components/BrandMark";
import { Icon } from "@/components/Icon";
import { AreaChart } from "@/components/Charts";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { useMarketingT, useLang } from "@/lib/lang";

// Interactive, self-contained dashboard preview for the landing. Fully isolated
// local state — clicking here never touches the real app. Localized via the
// shared dictionary. The content area is a FIXED height (md+) and every tab fills
// it, so switching tabs never resizes the panel.
type View = "overview" | "planner" | "whatif";

const KPIS: [string, string, boolean][] = [
  ["Margin at risk", "$6,240", true],
  ["Avg. displacement", "2.3 d", false],
  ["In window", "4 / 6", false],
];
const DECISIONS: [string, string, string][] = [
  ["tractor", "North A", "Harvest before Thursday"],
  ["rain", "West 2", "Cover Wednesday rain"],
  ["box", "North A", "Order 620 crates today"],
];
const SEASON = [18, 24, 31, 28, 36, 42];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

const RAIL: { id: string; view?: View }[] = [
  { id: "overview", view: "overview" },
  { id: "planner", view: "planner" },
  { id: "whatif", view: "whatif" },
  { id: "map" },
  { id: "financial" },
];

const LEVERS = [
  { id: "maq", icon: "tractor", label: "Move up Harvester #2 maintenance", recover: 2940 },
  { id: "crew", icon: "crew", label: "Hire external crew (Wednesday)", recover: 2080 },
  { id: "box", icon: "box", label: "Rush order 620 crates (today)", recover: 1120 },
  { id: "reefer", icon: "truck", label: "Pre-cool reefer for Greenhouse 1", recover: 760 },
];
const CEILING = 34200;
const BASE = CEILING - LEVERS.reduce((s, l) => s + l.recover, 0);

const PLAN_ROWS: [string, string][] = [
  ["tractor", "Harvester #1"], ["tractor", "Harvester #2"], ["crew", "Crew A"], ["crew", "Crew B"],
];
const PLAN_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const PLAN_CHIPS: { r: number; d: number; label: string; kind: "ok" | "warn" | "out" }[] = [
  { r: 0, d: 1, label: "North A", kind: "ok" },
  { r: 0, d: 3, label: "G-house 1", kind: "out" },
  { r: 1, d: 2, label: "East 3", kind: "ok" },
  { r: 2, d: 2, label: "West 2", kind: "warn" },
  { r: 3, d: 4, label: "South B", kind: "ok" },
];

const fmt = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

export function DashboardMockup() {
  const t = useMarketingT();
  const lang = useLang();
  const [view, setView] = useState<View>("overview");
  const [on, setOn] = useState<Record<string, boolean>>({});
  const [delay, setDelay] = useState(0);
  const [pick, setPick] = useState<string | null>(null);

  const recovered = LEVERS.reduce((s, l) => s + (on[l.id] ? l.recover : 0), 0);
  const resolved = LEVERS.filter((l) => on[l.id]).length;
  const delayCost = delay * 380;
  const net = BASE + recovered - delayCost;
  // Computed after mount to avoid a hydration mismatch on the statically-rendered page.
  const [todayLabel, setTodayLabel] = useState("");
  useEffect(() => {
    setTodayLabel(new Date().toLocaleDateString(lang === "es" ? "es-ES" : "en-US", { weekday: "long", month: "long", day: "numeric" }));
  }, [lang]);

  const HEAD: Record<View, [string, string]> = {
    overview: ["Overview", todayLabel],
    planner: ["Planner", t("Machinery & crews vs. optimal windows")],
    whatif: ["What-if simulator", t("Pull the levers, watch the margin")],
  };

  const chipStyle = (kind: "ok" | "warn" | "out", active: boolean) =>
    kind === "warn"
      ? { background: "var(--warn)", color: "#fff" }
      : kind === "out"
      ? { background: "#fff", color: "var(--ink)", border: "1.5px dashed var(--green)" }
      : { background: "var(--ink)", color: "#fff", boxShadow: active ? "0 0 0 2px var(--lime)" : undefined };

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
        <div className="flex flex-col items-center gap-2 py-4 px-1.5 sm:px-2.5 border-r border-line shrink-0" style={{ width: 56 }}>
          <BrandMark size={26} />
          <div className="mt-2 flex flex-col gap-1.5">
            {RAIL.map((item) => {
              const active = item.view === view;
              const clickable = !!item.view;
              return (
                <button
                  key={item.id}
                  onClick={() => item.view && setView(item.view)}
                  title={clickable ? "" : t("More in the app")}
                  className="grid place-items-center h-9 w-9 rounded-xl transition-colors"
                  style={{ background: active ? "var(--ink)" : "transparent", color: active ? "var(--lime)" : "var(--ink)", cursor: clickable ? "pointer" : "default", opacity: clickable ? 1 : 0.35 }}
                >
                  <Icon name={item.id} size={17} />
                </button>
              );
            })}
          </div>
        </div>

        {/* content */}
        <div className="flex-1 min-w-0 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold tracking-tight">{t(HEAD[view][0])}</h4>
              <p className="text-[11px] text-muted capitalize">{HEAD[view][1]}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="pill hidden md:inline-flex"><span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--green)" }} />{t("Demo data")}</span>
              <button onClick={() => setView("whatif")} className="rounded-full px-3 py-1.5 text-[11px] font-semibold btn-press" style={{ background: "var(--green)", color: "var(--ink)" }}>{t("Recommendations")}</button>
            </div>
          </div>

          {/* fixed-height viewport (md+): every tab fills it, so nothing resizes */}
          <div className="md:h-[300px]">
            {view === "overview" && (
              <div className="md:h-full flex flex-col">
                <div className="grid grid-cols-3 gap-3 mb-3 shrink-0">
                  {KPIS.map(([label, value, hl]) => (
                    <div key={label} className="card p-3.5">
                      <p className="kpi-label">{t(label)}</p>
                      <p className={`mono text-lg font-bold mt-1.5 ${hl ? "text-green" : ""}`}>{value}</p>
                    </div>
                  ))}
                </div>
                <div className="grid md:grid-cols-3 gap-3 items-stretch flex-1 min-h-0">
                  <div className="card p-4 md:col-span-2 flex flex-col">
                    <h5 className="text-[13px] font-bold mb-0.5">{t("Today's decisions")}</h5>
                    <p className="text-[11px] mb-1 text-muted">{t("Sorted by margin impact")}</p>
                    <div className="flex-1 flex flex-col justify-center">
                      {DECISIONS.map(([icon, parcel, title], i) => (
                        <button key={i} onClick={() => setView("whatif")} className={`w-full flex gap-3 items-center py-2 text-left row-hover -mx-2 px-2 rounded-lg ${i > 0 ? "border-t border-line" : ""}`}>
                          <span className="grid place-items-center h-8 w-8 rounded-lg shrink-0" style={{ background: "rgba(194,65,12,.1)", color: "var(--warn)" }}><Icon name={icon} size={15} /></span>
                          <div className="flex-1 min-w-0"><span className="text-[12px] font-bold">{parcel}</span><p className="text-[12px] leading-tight">{t(title)}</p></div>
                          <span className="mono text-[12px] font-bold" style={{ color: "var(--warn)" }}>-{fmt(LEVERS[i].recover)}</span>
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-muted pt-2 flex items-center gap-1.5 shrink-0"><span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: "var(--warn)" }} />{t("Each amount is margin at risk if you don't act today.")}</p>
                  </div>
                  <div className="card p-4 flex flex-col">
                    <h5 className="text-[13px] font-bold mb-0.5">{t("Season margin")}</h5>
                    <p className="text-[11px] text-muted">{t("Recovered, by month")}</p>
                    <p className="mono text-xl font-bold text-green mt-2 leading-none">+$52,840</p>
                    <p className="text-[10px] text-muted mb-2">{t("recovered this season")}</p>
                    <div className="mt-auto"><AreaChart data={SEASON} labels={MONTHS.map((m) => t(m))} height={84} /></div>
                  </div>
                </div>
              </div>
            )}

            {view === "planner" && (
              <div className="card p-4 md:h-full flex flex-col">
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2 shrink-0">
                  <div>
                    <h5 className="text-[13px] font-bold">{t("This week's schedule")}</h5>
                    <p className="text-[11px] text-muted">{t("Tap a harvest. Conflicts show in red.")}</p>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-1 rounded-full" style={{ background: "rgba(194,65,12,.1)", color: "var(--warn)" }}>1 {t("conflict")}</span>
                </div>
                <div className="flex-1 flex flex-col justify-center min-h-0 overflow-x-auto no-scrollbar">
                  <div className="min-w-[360px]">
                  <div className="grid text-[9px] text-muted mb-1" style={{ gridTemplateColumns: "84px repeat(7,1fr)" }}>
                    <div />
                    {PLAN_DAYS.map((d, i) => <div key={i} className="text-center font-semibold">{t(d).slice(0, 1)}</div>)}
                  </div>
                  {PLAN_ROWS.map(([icon, label], ri) => (
                    <div key={label} className="grid items-center" style={{ gridTemplateColumns: "84px repeat(7,1fr)" }}>
                      <div className="flex items-center gap-1.5 pr-2 py-1 min-w-0"><Icon name={icon} size={12} /><span className="text-[10px] font-semibold truncate">{label}</span></div>
                      {Array.from({ length: 7 }).map((_, di) => {
                        const chip = PLAN_CHIPS.find((c) => c.r === ri && c.d === di);
                        const key = `${ri}-${di}`;
                        return (
                          <div key={di} className="px-0.5 py-1 border-l border-line" style={{ minHeight: 34 }}>
                            {chip && (
                              <button onClick={() => setPick(pick === key ? null : key)} className="w-full rounded-md text-[8px] font-bold text-center px-1 py-1.5 leading-tight truncate transition-shadow" style={chipStyle(chip.kind, pick === key)}>
                                {chip.label}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-[10px] text-muted shrink-0">
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded" style={{ background: "var(--ink)" }} />{t("Scheduled")}</span>
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded" style={{ background: "var(--warn)" }} />{t("Conflict")}</span>
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded" style={{ border: "1.5px dashed var(--green)" }} />{t("Out of window")}</span>
                </div>
              </div>
            )}

            {view === "whatif" && (
              <div className="grid md:grid-cols-5 gap-3 items-stretch md:h-full">
                <div className="rounded-2xl p-5 md:col-span-2 text-white flex flex-col" style={{ background: "var(--ink)" }}>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full" style={{ background: "var(--lime)", color: "var(--ink)" }}><span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--ink)" }} />{t("Live scenario")}</span>
                    <span className="text-[10px] font-semibold px-2 py-1 rounded-full" style={{ background: "rgba(255,255,255,.1)", color: "rgba(255,255,255,.7)" }}>{resolved}/{LEVERS.length} {t("fixed")}</span>
                  </div>
                  <div className="mt-4">
                    <span className="text-[11px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,.55)" }}>{t("Weekly net margin")}</span>
                    <AnimatedNumber value={net} format={fmt} className="mono text-4xl font-bold block mt-1" style={{ color: "var(--lime)" }} />
                    <span className="mono text-xs font-bold mt-1 block" style={{ color: recovered > 0 ? "var(--lime)" : "rgba(255,255,255,.45)" }}>
                      {recovered > 0 ? `+${fmt(recovered)} ${t("recovered")}` : t("Toggle a fix to recover margin")}
                    </span>
                  </div>
                  <div className="mt-auto pt-4">
                    <div className="flex items-center justify-between text-[10px] mb-1.5" style={{ color: "rgba(255,255,255,.55)" }}>
                      <span>{t("Now")}</span>
                      <span>{t("Optimal")} · {fmt(CEILING)}</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,.12)" }}>
                      <div className="h-full rounded-full" style={{ width: `${Math.max(0, Math.round((net / CEILING) * 100))}%`, background: "linear-gradient(90deg,var(--green),var(--lime))", transition: "width .4s ease" }} />
                    </div>
                    <span className="text-[11px] mt-2 block" style={{ color: "rgba(255,255,255,.55)" }}>
                      {net >= CEILING ? t("At the optimal ceiling") : <><span className="mono font-bold" style={{ color: "#fff" }}>{fmt(CEILING - net)}</span> {t("to optimal")}</>}
                    </span>
                  </div>
                </div>
                <div className="card p-4 md:col-span-3 flex flex-col">
                  <h5 className="text-[13px] font-bold mb-0.5 shrink-0">{t("Decision levers")}</h5>
                  <p className="text-[11px] mb-1 text-muted shrink-0">{t("Try it — toggle a fix")}</p>
                  <div className="flex-1 flex flex-col justify-center min-h-0">
                    {LEVERS.map((l, i) => (
                      <div key={l.id} className={`flex items-center gap-3 py-1.5 px-2 -mx-2 rounded-lg transition-colors ${i > 0 ? "border-t border-line" : ""}`} style={{ background: on[l.id] ? "rgba(82,200,113,.08)" : "transparent" }}>
                        <span className="grid place-items-center h-7 w-7 rounded-lg shrink-0 transition-colors" style={{ background: on[l.id] ? "var(--green)" : "var(--mint)", color: on[l.id] ? "#fff" : "var(--green-deep)" }}><Icon name={on[l.id] ? "check" : l.icon} size={14} /></span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-bold leading-tight truncate">{t(l.label)}</p>
                          <p className="text-[11px] text-muted">{t("recovers")} <span className="mono font-semibold text-green">{fmt(l.recover)}</span></p>
                        </div>
                        <button onClick={() => setOn((p) => ({ ...p, [l.id]: !p[l.id] }))} aria-label={t(l.label)} className="relative h-6 w-11 rounded-full shrink-0" style={{ background: on[l.id] ? "var(--green)" : "var(--line)", transition: "background .2s" }}>
                          <span className="absolute top-1 h-4 w-4 rounded-full bg-white" style={{ left: on[l.id] ? 24 : 4, transition: "left .2s" }} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="pt-3 border-t border-line shrink-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-semibold">{t("Tolerated delay")}</span>
                      <span className="text-[11px] mono" style={{ color: delay > 0 ? "var(--warn)" : "var(--muted)" }}>{delay} {t("days")} {delay > 0 ? `· -${fmt(delayCost)}` : ""}</span>
                    </div>
                    <input type="range" min={0} max={4} step={1} value={delay} onChange={(e) => setDelay(+e.target.value)} className="w-full" style={{ accentColor: "var(--green)" }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
