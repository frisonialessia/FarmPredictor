"use client";
import { useState, useMemo } from "react";
import { useApp } from "@/lib/store";
import { Icon } from "@/components/Icon";
import { formatMoney } from "@/lib/format";
import { CONFLICTS, BASE_MARGIN, DELAY_PENALTY } from "@/data/planner";

export function Simulator() {
  const { currency } = useApp();
  const [active, setActive] = useState<Record<string, boolean>>({});
  const [delay, setDelay] = useState(0);

  const calc = useMemo(() => {
    let rec = 0, cost = 0, res = 0;
    CONFLICTS.forEach((c) => { if (active[c.id]) { rec += c.loss; cost += c.actionCost; } else res += c.loss; });
    const dp = DELAY_PENALTY[delay];
    const net = BASE_MARGIN + rec - cost - res - dp;
    const doNothing = BASE_MARGIN - CONFLICTS.reduce((s, c) => s + c.loss, 0) - dp;
    return { rec, cost, res: res + dp, net, delta: net - doNothing };
  }, [active, delay]);

  return (
    <div className="fade-in">
      <div className="rounded-[24px] p-7 mb-5 text-white" style={{ background: "var(--ink)" }}>
        <div className="grid md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2">
            <span className="inline-block text-[11px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-3" style={{ background: "var(--lime)", color: "var(--ink)" }}>Live scenario</span>
            <h3 className="text-2xl font-extrabold">Weekly net margin</h3>
            <div className="flex items-end gap-6 mt-4">
              <div><p className="text-[11px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,.6)" }}>Projected</p><p className="mono text-5xl font-bold" style={{ color: "var(--lime)" }}>{formatMoney(calc.net, currency)}</p></div>
              <div className="pb-1"><p className="text-[11px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,.6)" }}>vs. doing nothing</p><p className="mono text-xl font-bold" style={{ color: calc.delta >= 0 ? "var(--lime)" : "#ff9f7a" }}>{calc.delta >= 0 ? "+" : "-"}{formatMoney(Math.abs(calc.delta), currency)}</p></div>
            </div>
          </div>
          <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.12)" }}>
            {[["Base", formatMoney(BASE_MARGIN, currency), "#fff"], ["Recovered", "+" + formatMoney(calc.rec, currency), "var(--lime)"], ["Action cost", "-" + formatMoney(calc.cost, currency), "#ff9f7a"], ["Residual loss", "-" + formatMoney(calc.res, currency), "#ff9f7a"]].map(([l, v, c]) => (
              <div key={l} className="flex justify-between text-xs mb-2"><span style={{ color: "rgba(255,255,255,.7)" }}>{l}</span><span className="mono font-semibold" style={{ color: c }}>{v}</span></div>
            ))}
            <div className="flex justify-between text-sm mt-3 pt-3 font-bold" style={{ borderTop: "1px solid rgba(255,255,255,.14)" }}><span>Net</span><span className="mono" style={{ color: "var(--lime)" }}>{formatMoney(calc.net, currency)}</span></div>
          </div>
        </div>
      </div>
      <div className="grid lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 card p-6">
          <h4 className="text-[15px] font-bold mb-1">Decision levers</h4>
          <p className="text-xs mb-4 text-muted">Each action has a cost and recovers margin</p>
          <div>
            {CONFLICTS.map((c, i) => (
              <div key={c.id} className={`flex items-center gap-3 py-4 ${i > 0 ? "border-t border-line" : ""}`}>
                <div className="grid place-items-center h-10 w-10 rounded-xl shrink-0" style={{ background: "var(--mint)" }}><Icon name={c.icon} /></div>
                <div className="flex-1"><p className="text-sm font-bold leading-tight">{c.actionLabel}</p><p className="text-xs mt-0.5 text-muted">{c.parcel} · recovers <span className="mono font-semibold text-green">{formatMoney(c.loss, currency)}</span> · costs <span className="mono">{formatMoney(c.actionCost, currency)}</span></p></div>
                <button onClick={() => setActive((p) => ({ ...p, [c.id]: !p[c.id] }))} className="relative h-7 w-12 rounded-full shrink-0" style={{ background: active[c.id] ? "var(--green)" : "var(--line)", transition: "background .2s" }}>
                  <span className="absolute top-1 h-5 w-5 rounded-full bg-white" style={{ left: active[c.id] ? 24 : 4, transition: "left .2s" }} />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-5 border-t border-line">
            <div className="flex items-center justify-between mb-3"><div><p className="text-sm font-bold">Accepted delay days</p><p className="text-xs text-muted">How far you tolerate shifting harvest</p></div><span className="mono text-lg font-bold px-3 py-1 rounded-lg" style={{ background: "var(--mint)" }}>{delay} d</span></div>
            <input type="range" min={0} max={5} value={delay} onChange={(e) => setDelay(+e.target.value)} className="w-full" />
          </div>
        </div>
        <div className="lg:col-span-2 card p-6">
          <h4 className="text-[15px] font-bold mb-1">Impact by conflict</h4>
          <p className="text-xs mb-4 text-muted">What your scenario resolves</p>
          <div className="space-y-4">
            {CONFLICTS.map((c) => {
              const on = !!active[c.id];
              return (
                <div key={c.id}>
                  <div className="flex items-center justify-between mb-1"><span className={`text-xs font-semibold ${on ? "" : "opacity-60"}`}>{c.parcel} · {c.resource}</span><span className="mono text-xs font-bold" style={{ color: on ? "var(--green)" : "var(--warn)" }}>{on ? "+" : "-"}{formatMoney(c.loss, currency)}</span></div>
                  <div className="h-2 rounded-full" style={{ background: "var(--mint)" }}><div className="h-full rounded-full" style={{ width: on ? "100%" : "0%", background: "var(--green)", transition: "width .4s" }} /></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
