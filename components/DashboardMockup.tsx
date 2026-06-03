"use client";
import { BrandMark } from "@/components/BrandMark";
import { Icon } from "@/components/Icon";
import { AreaChart } from "@/components/Charts";

// A faithful, non-interactive preview of the real dashboard for the landing —
// same tokens, cards and chart as the product, framed in a browser window.
const KPIS: [string, string, boolean][] = [
  ["Margin at risk", "$6,240", true],
  ["Avg. displacement", "2.3 d", false],
  ["Harvests in window", "4 / 6", false],
  ["Machinery use", "92%", false],
];
const DECISIONS: [string, string, string, string][] = [
  ["tractor", "North A", "Harvest before Thursday", "-$2,940"],
  ["rain", "West 2", "Cover Wednesday rain", "-$2,080"],
  ["box", "North A", "Order 620 crates today", "-$1,120"],
];
const RAIL = ["overview", "map", "planner", "whatif", "financial"];

export function DashboardMockup() {
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
            {RAIL.map((ic, i) => (
              <span key={ic} className="grid place-items-center h-9 w-9 rounded-xl" style={{ background: i === 0 ? "var(--ink)" : "transparent", color: i === 0 ? "var(--lime)" : "var(--ink)" }}>
                <Icon name={ic} size={17} />
              </span>
            ))}
          </div>
        </div>

        {/* content */}
        <div className="flex-1 min-w-0 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold tracking-tight">Overview</h4>
              <p className="text-[11px] text-muted">Tuesday, June 9 · 08:14</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="pill hidden md:inline-flex"><span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--green)" }} />Demo data</span>
              <span className="rounded-full px-3 py-1.5 text-[11px] font-semibold" style={{ background: "var(--green)", color: "var(--ink)" }}>Recommendations</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            {KPIS.map(([label, value, hl]) => (
              <div key={label} className="card p-3.5">
                <p className="kpi-label">{label}</p>
                <p className={`mono text-lg font-bold mt-1.5 ${hl ? "text-green" : ""}`}>{value}</p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            <div className="card p-4 md:col-span-2">
              <h5 className="text-[13px] font-bold mb-0.5">Today&apos;s decisions</h5>
              <p className="text-[11px] mb-3 text-muted">Sorted by margin impact</p>
              <div>
                {DECISIONS.map(([icon, parcel, title, loss], i) => (
                  <div key={i} className={`flex gap-3 items-center py-2.5 ${i > 0 ? "border-t border-line" : ""}`}>
                    <span className="grid place-items-center h-8 w-8 rounded-lg shrink-0" style={{ background: "rgba(194,65,12,.1)", color: "var(--warn)" }}><Icon name={icon} size={15} /></span>
                    <div className="flex-1 min-w-0"><span className="text-[12px] font-bold">{parcel}</span><p className="text-[12px] leading-tight">{title}</p></div>
                    <span className="mono text-[12px] font-bold" style={{ color: "var(--warn)" }}>{loss}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card p-4">
              <h5 className="text-[13px] font-bold mb-0.5">Season margin</h5>
              <p className="text-[11px] mb-3 text-muted">Recovered, by month</p>
              <AreaChart data={[18, 24, 31, 28, 36, 42]} labels={["Jan", "Feb", "Mar", "Apr", "May", "Jun"]} height={104} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
