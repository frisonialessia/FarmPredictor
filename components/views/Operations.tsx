"use client";
import { Icon } from "@/components/Icon";

const MACH: [string, string, boolean, string][] = [
  ["Harvester #1", "Operational", true, "Service in 120 h"],
  ["Harvester #2", "Maintenance", false, "Back Sat 13"],
  ["Picker rig", "Operational", true, "Service in 300 h"],
  ["Grain truck", "Operational", true, "Service in 90 h"],
];
const CREW: [string, string, boolean][] = [["Crew A","6 workers",true],["Crew B","5 workers",true],["Crew C","External",false],["Seasonal H-2A","12 workers",true]];
const SUP: [string, number, number][] = [["Packing crates",350,800],["Labels",1200,1500],["Pallets",80,90],["Shrink film",45,40]];
const FUEL: [string, number][] = [["Diesel tank A",72],["Diesel tank B",38]];
const IRR: [string, number][] = [["North A",64],["West 2",38],["East 3",81],["South B",52]];
const TRANS: [string, string, string, boolean][] = [["Truck T-12","Sweet corn → Sysco DC","Today 14:00",true],["Truck T-08","Grapefruit → HEB","Thu 09:00",true],["Reefer R-3","Lettuce → cold storage","Pending",false]];

export function Operations() {
  return (
    <div className="fade-in">
      <div className="grid lg:grid-cols-3 gap-5 mb-5">
        <div className="card p-6"><h4 className="text-[15px] font-bold mb-1">Machinery</h4><p className="text-xs mb-4 text-muted">Status and next service</p>
          {MACH.map((m, i) => (<div key={i} className={`flex items-center gap-3 py-3 ${i > 0 ? "border-t border-line" : ""}`}><div className="grid place-items-center h-9 w-9 rounded-xl shrink-0" style={{ background: m[2] ? "var(--mint)" : "rgba(194,65,12,.1)", color: m[2] ? "var(--ink)" : "var(--warn)" }}><Icon name="tractor" /></div><div className="flex-1"><p className="text-sm font-semibold">{m[0]}</p><p className="text-xs text-muted">{m[3]}</p></div><span className="text-[11px] font-semibold px-2 py-1 rounded-full" style={{ background: m[2] ? "var(--mint)" : "rgba(194,65,12,.1)", color: m[2] ? "var(--ink)" : "var(--warn)" }}>{m[1]}</span></div>))}
        </div>
        <div className="card p-6"><h4 className="text-[15px] font-bold mb-1">Crews</h4><p className="text-xs mb-4 text-muted">Availability this week</p>
          {CREW.map((c, i) => (<div key={i} className={`flex items-center gap-3 py-3 ${i > 0 ? "border-t border-line" : ""}`}><div className="grid place-items-center h-9 w-9 rounded-xl shrink-0" style={{ background: "var(--mint)" }}><Icon name="crew" /></div><div className="flex-1"><p className="text-sm font-semibold">{c[0]}</p><p className="text-xs text-muted">{c[1]}</p></div><span className="text-[11px] font-semibold px-2 py-1 rounded-full" style={{ background: c[2] ? "var(--mint)" : "var(--bg)", color: c[2] ? "var(--ink)" : "var(--muted)" }}>{c[2] ? "Available" : "Not hired"}</span></div>))}
        </div>
        <div className="card p-6"><h4 className="text-[15px] font-bold mb-1">Supplies</h4><p className="text-xs mb-4 text-muted">Stock vs. projected need</p>
          <div className="space-y-4">{SUP.map(([n, have, need], i) => { const pct = Math.min(100, (have / need) * 100); const sh = have < need; return (<div key={i}><div className="flex items-center justify-between mb-1"><span className="text-sm font-medium">{n}</span><span className="mono text-xs" style={{ color: sh ? "var(--warn)" : "var(--muted)" }}>{have}/{need}</span></div><div className="h-2 rounded-full" style={{ background: "var(--mint)" }}><div className="h-full rounded-full" style={{ width: `${pct}%`, background: sh ? "var(--warn)" : "var(--green)" }} /></div></div>); })}</div>
        </div>
      </div>
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="card p-6"><h4 className="text-[15px] font-bold mb-1">Fuel &amp; diesel</h4><p className="text-xs mb-4 text-muted">Tank levels and weekly burn</p>
          <div className="space-y-4">{FUEL.map(([n, v], i) => { const low = v < 40; return (<div key={i}><div className="flex items-center justify-between mb-1"><span className="text-sm font-medium flex items-center gap-1.5"><Icon name="fuel" size={14} />{n}</span><span className="mono text-xs" style={{ color: low ? "var(--warn)" : "var(--muted)" }}>{v}%</span></div><div className="h-2 rounded-full" style={{ background: "var(--mint)" }}><div className="h-full rounded-full" style={{ width: `${v}%`, background: low ? "var(--warn)" : "var(--green)" }} /></div></div>); })}<div className="flex items-center justify-between pt-1"><span className="text-sm">Weekly burn</span><span className="mono text-sm font-bold">620 gal</span></div></div>
        </div>
        <div className="card p-6"><h4 className="text-[15px] font-bold mb-1">Irrigation</h4><p className="text-xs mb-4 text-muted">Soil moisture by parcel</p>
          <div className="space-y-4">{IRR.map(([n, v], i) => { const dry = v < 45; return (<div key={i}><div className="flex items-center justify-between mb-1"><span className="text-sm font-medium flex items-center gap-1.5"><Icon name="drop" size={14} />{n}</span><span className="mono text-xs" style={{ color: dry ? "var(--warn)" : "var(--muted)" }}>{v}%</span></div><div className="h-2 rounded-full" style={{ background: "var(--mint)" }}><div className="h-full rounded-full" style={{ width: `${v}%`, background: dry ? "var(--warn)" : "var(--green)" }} /></div></div>); })}</div>
        </div>
        <div className="card p-6"><h4 className="text-[15px] font-bold mb-1">Transport &amp; logistics</h4><p className="text-xs mb-4 text-muted">Scheduled shipments</p>
          {TRANS.map((t, i) => (<div key={i} className={`flex items-center gap-3 py-3 ${i > 0 ? "border-t border-line" : ""}`}><div className="grid place-items-center h-9 w-9 rounded-xl shrink-0" style={{ background: "var(--mint)" }}><Icon name="truck" /></div><div className="flex-1"><p className="text-sm font-semibold">{t[0]}</p><p className="text-xs text-muted">{t[1]}</p></div><span className="text-[11px] font-semibold px-2 py-1 rounded-full" style={{ background: t[3] ? "var(--mint)" : "var(--bg)", color: t[3] ? "var(--ink)" : "var(--muted)" }}>{t[2]}</span></div>))}
        </div>
      </div>
    </div>
  );
}
