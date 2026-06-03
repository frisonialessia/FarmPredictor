"use client";
import { useMemo } from "react";
import { useApp } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { Icon } from "@/components/Icon";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { formatMoney } from "@/lib/format";
import { evaluatePlan, evaluateScenario, type EngineConflict } from "@/lib/engine";
import { CONFLICTS, BLOCKED, DELAY_PENALTY } from "@/data/planner";

export function Simulator() {
  // Reads the SAME shared plan as the Planner. Editing a harvest there flows
  // straight into this margin through the unified engine.
  const { currency, plan, levers, toggleLever, delayDays, setDelayDays } = useApp();
  const t = useT();

  const planEval = useMemo(() => evaluatePlan(plan, BLOCKED), [plan]);
  const scenario = useMemo(
    () => evaluateScenario(planEval, CONFLICTS, levers, delayDays, DELAY_PENALTY),
    [planEval, levers, delayDays],
  );

  const leverLabel = (c: EngineConflict) =>
    c.source === "capacity"
      ? t(c.actionLabel || "")
      : c.actionKey === "rent"
        ? `${t("Add capacity for")} ${c.parcel}`
        : `${t("Re-book")} ${c.parcel}`;

  const breakdown: [string, string, string][] = [
    [t("Optimal ceiling"), formatMoney(scenario.base, currency), "#fff"],
    [t("Timing degradation"), "-" + formatMoney(scenario.degradationLoss, currency), "#ff9f7a"],
    [t("Unresolved conflicts"), "-" + formatMoney(scenario.unresolvedLoss, currency), "#ff9f7a"],
    [t("Action cost"), "-" + formatMoney(scenario.actionCost, currency), "#ff9f7a"],
    [t("Delay buffer"), "-" + formatMoney(scenario.delayPenalty, currency), "#ff9f7a"],
  ];

  return (
    <div className="fade-in">
      <div className="rounded-[24px] p-7 mb-5 text-white" style={{ background: "var(--ink)" }}>
        <div className="grid md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2">
            <span className="inline-block text-[11px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-3" style={{ background: "var(--lime)", color: "var(--ink)" }}>{t("Live scenario")}</span>
            <h3 className="text-2xl font-extrabold">{t("Weekly net margin")}</h3>
            <div className="flex items-end gap-6 mt-4">
              <div><p className="text-[11px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,.6)" }}>{t("Projected")}</p><AnimatedNumber value={scenario.net} format={(n) => formatMoney(n, currency)} className="mono text-5xl font-bold block" style={{ color: "var(--lime)" }} /></div>
              <div className="pb-1"><p className="text-[11px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,.6)" }}>{t("vs. doing nothing")}</p><p className="mono text-xl font-bold" style={{ color: scenario.vsDoNothing >= 0 ? "var(--lime)" : "#ff9f7a" }}>{scenario.vsDoNothing >= 0 ? "+" : "-"}{formatMoney(Math.abs(scenario.vsDoNothing), currency)}</p></div>
            </div>
            {planEval.conflictCount > 0 && (
              <p className="text-[11px] mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: "rgba(194,65,12,.18)", color: "#ffb59a" }}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#ff9f7a" }} />{planEval.conflictCount} {t("new conflict(s) from your Planner edits")}
              </p>
            )}
          </div>
          <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.12)" }}>
            {breakdown.map(([l, v, c]) => (
              <div key={l} className="flex justify-between text-xs mb-2"><span style={{ color: "rgba(255,255,255,.7)" }}>{l}</span><span className="mono font-semibold" style={{ color: c }}>{v}</span></div>
            ))}
            <div className="flex justify-between text-sm mt-3 pt-3 font-bold" style={{ borderTop: "1px solid rgba(255,255,255,.14)" }}><span>{t("Net")}</span><span className="mono" style={{ color: "var(--lime)" }}>{formatMoney(scenario.net, currency)}</span></div>
          </div>
        </div>
      </div>
      <div className="grid lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 card p-6">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-[15px] font-bold">{t("Decision levers")}</h4>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "var(--mint)", color: "var(--ink)" }}>{t("From Planner")}</span>
          </div>
          <p className="text-xs mb-4 text-muted">{t("Each action has a cost and recovers margin")}</p>
          <div>
            {scenario.conflicts.map((c, i) => (
              <div key={c.id} className={`flex items-center gap-3 py-4 ${i > 0 ? "border-t border-line" : ""}`}>
                <div className="grid place-items-center h-10 w-10 rounded-xl shrink-0" style={{ background: c.source === "schedule" ? "rgba(194,65,12,.12)" : "var(--mint)", color: c.source === "schedule" ? "var(--warn)" : "var(--ink)" }}><Icon name={c.icon} /></div>
                <div className="flex-1"><p className="text-sm font-bold leading-tight">{leverLabel(c)}</p><p className="text-xs mt-0.5 text-muted">{c.parcel} · {t("recovers")} <span className="mono font-semibold text-green">{formatMoney(c.loss, currency)}</span> · {t("costs")} <span className="mono">{formatMoney(c.actionCost, currency)}</span></p></div>
                <button onClick={() => toggleLever(c.id)} className="relative h-7 w-12 rounded-full shrink-0" style={{ background: levers[c.id] ? "var(--green)" : "var(--line)", transition: "background .2s" }}>
                  <span className="absolute top-1 h-5 w-5 rounded-full bg-white" style={{ left: levers[c.id] ? 24 : 4, transition: "left .2s" }} />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-5 border-t border-line">
            <div className="flex items-center justify-between mb-3"><div><p className="text-sm font-bold">{t("Accepted delay days")}</p><p className="text-xs text-muted">{t("How far you tolerate shifting harvest")}</p></div><span className="mono text-lg font-bold px-3 py-1 rounded-lg" style={{ background: "var(--mint)" }}>{delayDays} d</span></div>
            <input type="range" min={0} max={5} value={delayDays} onChange={(e) => setDelayDays(+e.target.value)} className="w-full" />
          </div>
        </div>
        <div className="lg:col-span-2 card p-6">
          <h4 className="text-[15px] font-bold mb-1">{t("Impact by conflict")}</h4>
          <p className="text-xs mb-4 text-muted">{t("What your scenario resolves")}</p>
          <div className="space-y-4">
            {scenario.conflicts.map((c) => {
              const on = !!levers[c.id];
              return (
                <div key={c.id}>
                  <div className="flex items-center justify-between mb-1"><span className={`text-xs font-semibold ${on ? "" : "opacity-60"}`}>{c.parcel} · {t(c.resource)}</span><span className="mono text-xs font-bold" style={{ color: on ? "var(--green)" : "var(--warn)" }}>{on ? "+" : "-"}{formatMoney(c.loss, currency)}</span></div>
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
