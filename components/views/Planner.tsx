"use client";
import { useState, useMemo } from "react";
import { useApp } from "@/lib/store";
import { Icon } from "@/components/Icon";
import { formatMoney } from "@/lib/format";
import { RESOURCE_ROWS, OPTIMAL_PLAN, BLOCKED, DAYS7 } from "@/data/planner";
import type { Harvest } from "@/lib/types";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const CAL_EVENTS: Record<number, { label: string; type: "harvest" | "window" | "alert" }[]> = {
  3: [{ label: "Greenhouse 1", type: "harvest" }], 8: [{ label: "North A window", type: "window" }],
  9: [{ label: "North A", type: "harvest" }, { label: "Greenhouse 1", type: "harvest" }],
  10: [{ label: "Rain alert", type: "alert" }], 11: [{ label: "West 2", type: "harvest" }],
  12: [{ label: "East 3 window", type: "window" }], 13: [{ label: "South B", type: "harvest" }],
  16: [{ label: "River C", type: "harvest" }], 18: [{ label: "Maint. #2", type: "alert" }],
  22: [{ label: "East 3", type: "harvest" }], 25: [{ label: "Contract delivery", type: "window" }],
};

export function Planner() {
  const { currency } = useApp();
  const [harvests, setHarvests] = useState<Harvest[]>(() => JSON.parse(JSON.stringify(OPTIMAL_PLAN)));
  const [dragId, setDragId] = useState<string | null>(null);
  const [calMonth, setCalMonth] = useState(5);
  const [calYear, setCalYear] = useState(2026);

  const computed = useMemo(() => {
    const occ: Record<string, number> = {};
    harvests.forEach((h) => { const k = `${h.row}:${h.day}`; occ[k] = (occ[k] || 0) + 1; });
    let penalty = 0, inWindow = 0;
    const list = harvests.map((h) => {
      let conflict = false, outOfWindow = false;
      if (occ[`${h.row}:${h.day}`] > 1) conflict = true;
      BLOCKED.forEach((b) => { if (b.row === h.row && h.day >= b.day && h.day < b.day + b.len) conflict = true; });
      if (h.day >= h.window[0] && h.day <= h.window[1]) inWindow++;
      else { outOfWindow = true; penalty += Math.min(Math.abs(h.day - h.window[0]), Math.abs(h.day - h.window[1])) * 420; }
      if (conflict) penalty += 900;
      return { ...h, conflict, outOfWindow };
    });
    const optTotal = OPTIMAL_PLAN.reduce((s, h) => s + h.value, 0);
    return { list, conflicts: list.filter((h) => h.conflict).length, inWindow, margin: optTotal - penalty, optTotal };
  }, [harvests]);

  const diff = computed.margin - computed.optTotal;

  function drop(row: string, day: number) {
    if (!dragId) return;
    setHarvests((prev) => prev.map((h) => (h.id === dragId ? { ...h, row, day } : h)));
    setDragId(null);
  }

  const first = new Date(calYear, calMonth, 1);
  const startDow = (first.getDay() + 6) % 7;
  const days = new Date(calYear, calMonth + 1, 0).getDate();

  return (
    <div className="fade-in">
      <div className="grid lg:grid-cols-4 gap-5 mb-5">
        <div className="card p-5"><p className="text-xs text-muted">Plan margin</p><p className="mono text-2xl font-bold mt-2 text-green">{formatMoney(computed.margin, currency)}</p><p className="text-xs mt-1" style={{ color: diff < 0 ? "var(--warn)" : "var(--muted)" }}>{diff === 0 ? "optimal plan" : `${formatMoney(diff, currency)} vs. optimal`}</p></div>
        <div className="card p-5"><p className="text-xs text-muted">Active conflicts</p><p className="mono text-2xl font-bold mt-2" style={{ color: computed.conflicts > 0 ? "var(--warn)" : "var(--ink)" }}>{computed.conflicts}</p><p className="text-xs mt-1 text-muted">resource overlaps</p></div>
        <div className="card p-5"><p className="text-xs text-muted">In window</p><p className="mono text-2xl font-bold mt-2">{computed.inWindow} / {harvests.length}</p><p className="text-xs mt-1 text-muted">at optimal point</p></div>
        <div className="card p-5 flex flex-col justify-center"><button onClick={() => setHarvests(JSON.parse(JSON.stringify(OPTIMAL_PLAN)))} className="rounded-full py-2 text-sm font-semibold border border-line">Restore optimal plan</button></div>
      </div>

      <div className="card p-6 mb-5">
        <p className="text-xs mb-4 text-muted"><b>Drag</b> any harvest to another day or machine. Conflicts and margin recalculate on drop.</p>
        <div className="overflow-x-auto"><div className="min-w-[820px]">
          <div className="grid items-center mb-2" style={{ gridTemplateColumns: "150px 1fr" }}>
            <div /><div className="grid grid-cols-7 text-xs text-muted">{DAYS7.map((d) => <div key={d}>{d}</div>)}</div>
          </div>
          {RESOURCE_ROWS.map((r) => (
            <div key={r.id} className="grid items-stretch" style={{ gridTemplateColumns: "150px 1fr" }}>
              <div className="flex items-center gap-2 pr-3 py-2"><Icon name={r.icon} size={15} /><span className="text-xs font-semibold">{r.label}</span></div>
              <div className="grid grid-cols-7">
                {Array.from({ length: 7 }).map((_, d) => {
                  const blk = BLOCKED.find((b) => b.row === r.id && d >= b.day && d < b.day + b.len);
                  const chip = computed.list.find((h) => h.row === r.id && h.day === d);
                  return (
                    <div key={d} onDragOver={(e) => e.preventDefault()} onDrop={() => drop(r.id, d)} className="border-l border-line relative" style={{ minHeight: 48, background: blk ? "repeating-linear-gradient(45deg,#f0e2dc,#f0e2dc 6px,#f6ece7 6px,#f6ece7 12px)" : undefined }}>
                      {blk && d === blk.day && <span className="text-[10px] font-semibold absolute top-1 left-1" style={{ color: "var(--warn)" }}>{blk.label}</span>}
                      {chip && (
                        <div draggable onDragStart={() => setDragId(chip.id)} className="absolute rounded-lg flex items-center justify-center text-[11px] font-bold text-center"
                          style={{ inset: 3, cursor: "grab", background: chip.conflict ? "var(--warn)" : chip.outOfWindow ? "#fff" : "var(--ink)", color: chip.outOfWindow ? "var(--ink)" : "#fff", border: chip.outOfWindow ? "2px dashed var(--green)" : "none", padding: "0 4px", lineHeight: 1.1 }}>
                          {chip.label}{chip.conflict ? " ⚠" : ""}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div></div>
        <p className="text-xs mt-4 px-1 text-muted">
          {computed.conflicts > 0 ? <><span style={{ color: "var(--warn)" }}>▲</span> {computed.conflicts} conflict(s): two tasks compete for the same resource or fall on maintenance.</>
            : diff < 0 ? <>No conflicts, but some harvests are outside their optimal window — that costs {formatMoney(Math.abs(diff), currency)} in degradation.</>
            : <><span style={{ color: "var(--green)" }}>●</span> Optimal plan: all in window, no conflicts.</>}
        </p>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div><h4 className="text-[15px] font-bold">Harvest calendar</h4><p className="text-xs text-muted">Scheduled harvests and optimal windows</p></div>
          <div className="flex items-center gap-2">
            <button onClick={() => { let m = calMonth - 1, y = calYear; if (m < 0) { m = 11; y--; } setCalMonth(m); setCalYear(y); }} className="h-8 w-8 rounded-lg border border-line grid place-items-center"><Icon name="chevron" size={14} style={{ transform: "rotate(90deg)" }} /></button>
            <span className="text-sm font-semibold w-32 text-center">{MONTHS[calMonth]} {calYear}</span>
            <button onClick={() => { let m = calMonth + 1, y = calYear; if (m > 11) { m = 0; y++; } setCalMonth(m); setCalYear(y); }} className="h-8 w-8 rounded-lg border border-line grid place-items-center"><Icon name="chevron" size={14} style={{ transform: "rotate(-90deg)" }} /></button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-[11px] font-semibold mb-1 text-muted">{["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => <div key={d}>{d}</div>)}</div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startDow }).map((_, i) => <div key={`e${i}`} className="rounded-lg" style={{ background: "var(--bg)", opacity: 0.4, minHeight: 74 }} />)}
          {Array.from({ length: days }).map((_, idx) => {
            const d = idx + 1;
            const ev = calMonth === 5 && calYear === 2026 ? CAL_EVENTS[d] || [] : [];
            const isToday = d === 9 && calMonth === 5 && calYear === 2026;
            return (
              <div key={d} className="rounded-lg p-1.5 border" style={{ minHeight: 74, borderColor: isToday ? "var(--green)" : "var(--line)", background: "#fff" }}>
                <span className="text-[11px] font-semibold" style={{ color: isToday ? "var(--green)" : "var(--ink)" }}>{d}</span>
                {ev.map((e, i) => {
                  const bg = e.type === "harvest" ? "var(--ink)" : e.type === "alert" ? "rgba(194,65,12,.12)" : "var(--mint)";
                  const col = e.type === "harvest" ? "#fff" : e.type === "alert" ? "var(--warn)" : "var(--ink)";
                  return <div key={i} className="text-[9px] font-semibold rounded px-1 py-0.5 mt-0.5 truncate" style={{ background: bg, color: col }}>{e.label}</div>;
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
