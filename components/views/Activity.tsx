"use client";
import { Icon } from "@/components/Icon";

const FEED = [
  { t: "08:02", icon: "tractor", title: "Harvest started — Greenhouse 1", desc: "Grapefruit, within optimal window", val: "+$640", warn: false },
  { t: "07:55", icon: "truck", title: "Shipment dispatched — T-12", desc: "Sweet corn to Sysco DC", val: "on time", warn: false },
  { t: "07:40", icon: "box", title: "620 crates ordered", desc: "ETA Thursday Jun 11", val: "+$1,120", warn: false },
  { t: "07:22", icon: "drop", title: "Irrigation triggered — West 2", desc: "Soil moisture dropped to 38%", val: "auto", warn: false },
  { t: "07:15", icon: "rain", title: "Weather alert — West 2", desc: "Wed rain compresses window to 2 days", val: "-$2,080", warn: true },
  { t: "06:50", icon: "clock", title: "North A entered critical window", desc: "38 h before grade drop", val: "risk", warn: true },
  { t: "06:30", icon: "check", title: "Harvester #2 maintenance confirmed", desc: "Moved up to Saturday", val: "+$1,180", warn: false },
];
const STATS: [string, number, string][] = [["Harvests", 3, "var(--ink)"], ["Alerts handled", 2, "var(--warn)"], ["Auto actions", 1, "var(--green)"]];

export function Activity() {
  return (
    <div className="fade-in grid lg:grid-cols-3 gap-5">
      <div className="lg:col-span-1">
        <div className="rounded-2xl p-5 mb-4" style={{ background: "var(--ink)", color: "#fff" }}>
          <p className="text-[11px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,.6)" }}>Margin saved today</p>
          <p className="mono text-4xl font-bold mt-1" style={{ color: "var(--lime)" }}>+$3,120</p>
          <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,.14)" }}><span className="text-xs" style={{ color: "rgba(255,255,255,.7)" }}>Decisions made</span><span className="mono font-bold">6</span></div>
        </div>
        <div className="card p-5 mb-4"><p className="text-xs mb-2 text-muted">Season to date</p><p className="mono text-2xl font-bold">+$52,840</p><p className="text-[11px] mt-1 text-muted">margin recovered since March</p></div>
        <div className="card p-5"><p className="text-xs mb-3 text-muted">Activity breakdown</p><div className="space-y-2">{STATS.map(([n, v, c]) => (<div key={n} className="flex items-center justify-between"><span className="text-sm">{n}</span><span className="mono text-sm font-bold" style={{ color: c }}>{v}</span></div>))}</div></div>
      </div>
      <div className="lg:col-span-2 card p-6">
        <h4 className="text-[15px] font-bold mb-4">Activity log</h4>
        <div>
          {FEED.map((f, i) => (
            <div key={i} className={`flex gap-3 py-3 ${i > 0 ? "border-t border-line" : ""}`}>
              <div className="grid place-items-center h-9 w-9 rounded-xl shrink-0" style={{ background: f.warn ? "rgba(194,65,12,.1)" : "var(--mint)", color: f.warn ? "var(--warn)" : "var(--ink)" }}><Icon name={f.icon} /></div>
              <div className="flex-1 min-w-0"><span className="text-[10px] mono text-muted">{f.t}</span><p className="text-sm font-semibold leading-tight mt-0.5">{f.title}</p><p className="text-xs mt-0.5 text-muted">{f.desc}</p></div>
              <span className="mono text-xs font-bold self-center shrink-0" style={{ color: f.warn ? "var(--warn)" : "var(--green)" }}>{f.val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
