"use client";
import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { Icon } from "@/components/Icon";
import { formatMoney } from "@/lib/format";
import { evaluatePlan, evaluateScenario } from "@/lib/engine";
import { repo } from "@/lib/repo";

interface Actions {
  resetPlan: () => void;
  moveHarvest: (id: string, row: string, day: number) => void;
  setLevers: (l: Record<string, boolean>) => void;
  setDelayDays: (d: number) => void;
  setSpotlight: (s: string | null) => void;
}

type MetricKind = "planMargin" | "net" | "vsDoNothing" | null;

interface Step {
  view: string;
  title: string;
  body: string;
  metric: MetricKind;
  apply: (a: Actions) => void;
}

// The 60-second story: optimal → can't execute → the cost appears in the
// Simulator on its own → close the gap. Each step sets a deterministic world
// state, so stepping back and forth is always consistent.
const STEPS: Step[] = [
  {
    view: "overview",
    title: "Your week, in dollars",
    body: "FarmPredictor turns every harvest decision into margin. This week, thousands are recoverable — let's see how.",
    metric: null,
    apply: (a) => { a.resetPlan(); a.setLevers({}); a.setDelayDays(0); a.setSpotlight(null); },
  },
  {
    view: "planner",
    title: "Your optimal plan",
    body: "Every harvest sits inside its window, on a free machine. This is the ceiling — the most you can make.",
    metric: "planMargin",
    apply: (a) => { a.resetPlan(); a.setLevers({}); a.setDelayDays(0); a.setSpotlight("kpi:planMargin"); },
  },
  {
    view: "planner",
    title: "But it's not when you should — it's when you can",
    body: "Harvester #1 is overbooked, so North A lands on a rig in maintenance. Watch the plan margin drop the moment you move it.",
    metric: "planMargin",
    apply: (a) => { a.resetPlan(); a.moveHarvest("h1", "m2", 0); a.setLevers({}); a.setSpotlight("harvest:h1"); },
  },
  {
    view: "whatif",
    title: "The cost shows up on its own",
    body: "Same plan, one engine. The Simulator's net margin already fell — and the new conflict appeared here automatically, no clicks needed.",
    metric: "net",
    apply: (a) => { a.resetPlan(); a.moveHarvest("h1", "m2", 0); a.setLevers({}); a.setSpotlight("net"); },
  },
  {
    view: "whatif",
    title: "Close the gap",
    body: "Spend a little to move the maintenance up, and you recover the margin North A was bleeding. The number climbs back.",
    metric: "net",
    apply: (a) => { a.resetPlan(); a.moveHarvest("h1", "m2", 0); a.setLevers({ "sched-h1": true }); a.setSpotlight("lever:sched-h1"); },
  },
  {
    view: "whatif",
    title: "Optimal vs. executable",
    body: "The gap between the perfect plan and the one you can actually run is real money. FarmPredictor measures it — and helps you close it.",
    metric: "vsDoNothing",
    apply: (a) => { a.resetPlan(); a.moveHarvest("h1", "m2", 0); a.setLevers({ "sched-h1": true }); a.setSpotlight("net"); },
  },
];

const AUTO_MS = 4200;

export function GuidedTour({ setView, onExit }: { setView: (v: string) => void; onExit: () => void }) {
  const { currency, plan, levers, delayDays, resetPlan, moveHarvest, setLevers, setDelayDays, setSpotlight, farmId } = useApp();
  const t = useT();
  const { blocked, capacityConflicts, delayPenalty } = repo.getPlanner(farmId);
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);

  const step = STEPS[i];

  // Apply the step's world state and switch to its view whenever the step changes.
  useEffect(() => {
    setView(step.view);
    step.apply({ resetPlan, moveHarvest, setLevers, setDelayDays, setSpotlight });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  // Auto-advance while playing; stop on the final step.
  useEffect(() => {
    if (!playing || i >= STEPS.length - 1) return;
    const id = setTimeout(() => setI((n) => Math.min(STEPS.length - 1, n + 1)), AUTO_MS);
    return () => clearTimeout(id);
  }, [playing, i]);

  const scenario = useMemo(() => {
    const pe = evaluatePlan(plan, blocked);
    return { pe, sc: evaluateScenario(pe, capacityConflicts, levers, delayDays, delayPenalty) };
  }, [plan, blocked, capacityConflicts, levers, delayDays, delayPenalty]);

  const metricValue = (): string | null => {
    if (step.metric === "planMargin") return formatMoney(scenario.pe.planMargin, currency);
    if (step.metric === "net") return formatMoney(scenario.sc.net, currency);
    if (step.metric === "vsDoNothing") return (scenario.sc.vsDoNothing >= 0 ? "+" : "-") + formatMoney(Math.abs(scenario.sc.vsDoNothing), currency);
    return null;
  };

  function close() {
    resetPlan();
    setLevers({});
    setDelayDays(0);
    setSpotlight(null);
    onExit();
  }

  const last = i === STEPS.length - 1;
  const mv = metricValue();

  return (
    <>
      {/* slim progress bar pinned to the very top */}
      <div className="fixed top-0 left-0 right-0 z-[70] h-1" style={{ background: "rgba(11,15,12,.08)" }}>
        <div className="h-full" style={{ width: `${((i + 1) / STEPS.length) * 100}%`, background: "var(--green)", transition: "width .4s ease" }} />
      </div>

      <div className="fixed z-[65] left-1/2 -translate-x-1/2 bottom-24 md:bottom-6 w-[calc(100%-2rem)] max-w-xl">
        <div className="toast-in rounded-2xl p-5 shadow-2xl text-white" style={{ background: "var(--ink)", border: "1px solid rgba(255,255,255,.1)" }}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full" style={{ background: "var(--lime)", color: "var(--ink)" }}>{t("Guided tour")}</span>
              <span className="text-[11px] mono" style={{ color: "rgba(255,255,255,.5)" }}>{i + 1} / {STEPS.length}</span>
            </div>
            <button onClick={close} aria-label={t("Close")} className="text-white/60 hover:text-white"><Icon name="x" size={16} /></button>
          </div>

          <div className="mt-3 flex items-start gap-4">
            <div className="flex-1">
              <h4 className="text-base font-extrabold leading-tight">{t(step.title)}</h4>
              <p className="text-sm mt-1.5" style={{ color: "rgba(255,255,255,.78)" }}>{t(step.body)}</p>
            </div>
            {mv && (
              <div className="text-right shrink-0">
                <p className="text-[10px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,.5)" }}>{t(step.metric === "vsDoNothing" ? "vs. doing nothing" : step.metric === "net" ? "Net" : "Plan margin")}</p>
                <p className="mono text-xl font-bold" style={{ color: "var(--lime)" }}>{mv}</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-4">
            <button onClick={() => setPlaying((p) => !p)} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: "rgba(255,255,255,.1)" }}>
              <Icon name={playing ? "pause" : "play"} size={13} />{playing ? t("Pause") : t("Play")}
            </button>
            <div className="flex items-center gap-2">
              <button onClick={() => { setPlaying(false); setI((n) => Math.max(0, n - 1)); }} disabled={i === 0} className="text-xs font-semibold px-3 py-1.5 rounded-full disabled:opacity-30" style={{ background: "rgba(255,255,255,.1)" }}>{t("Back")}</button>
              {last
                ? <button onClick={close} className="text-xs font-bold px-4 py-1.5 rounded-full btn-press" style={{ background: "var(--green)", color: "var(--ink)" }}>{t("Done")}</button>
                : <button onClick={() => { setPlaying(false); setI((n) => Math.min(STEPS.length - 1, n + 1)); }} className="text-xs font-bold px-4 py-1.5 rounded-full btn-press" style={{ background: "var(--green)", color: "var(--ink)" }}>{t("Next")}</button>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
