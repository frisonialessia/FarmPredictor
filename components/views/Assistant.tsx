"use client";
import { useEffect, useRef, useState } from "react";
import { useApp, useFarm } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { Icon } from "@/components/Icon";
import { fetchWeather } from "@/lib/weather";
import { weatherRisks } from "@/lib/risk";
import { evaluatePlan, evaluateScenario } from "@/lib/engine";
import { evaluateHerd } from "@/lib/herd";
import { PENS } from "@/data/livestock";
import type { WeatherDay } from "@/lib/types";

interface Msg { role: "user" | "assistant"; text: string }

const SUGGESTIONS = [
  "What should I do today to protect my margin?",
  "Which weather risk costs me the most this week?",
  "Can I sell any pen right now?",
];

export function Assistant() {
  const { currency, lang, levers, delayDays, planner } = useApp();
  const farm = useFarm();
  const t = useT();
  const [weather, setWeather] = useState<WeatherDay[]>(farm.weather);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetchWeather(farm.lat, farm.lon).then((w) => { if (!cancelled && w.length) setWeather(w); }).catch(() => {});
    return () => { cancelled = true; };
  }, [farm.lat, farm.lon]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, busy]);

  function buildContext() {
    const planEval = evaluatePlan(planner.optimalPlan, planner.blocked);
    const scenario = evaluateScenario(planEval, planner.capacityConflicts, levers, delayDays, planner.delayPenalty);
    const herd = evaluateHerd(PENS);
    return {
      farm: farm.name,
      location: farm.location,
      currency,
      netMargin: scenario.net,
      conflicts: scenario.conflicts.map((c) => ({
        parcel: c.parcel,
        resource: c.resource,
        loss: c.loss,
        actionCost: c.actionCost,
        actionLabel: c.actionLabel || (c.actionKey === "rent" ? `Add capacity for ${c.parcel}` : `Re-book ${c.parcel}`),
      })),
      weatherRisks: weatherRisks(weather).map((r) => ({ kind: r.kind, day: r.day, impact: r.impact })),
      livestock: { marginAtRisk: herd.marginAtRisk, ready: herd.ready, underTreatment: herd.underTreatment },
    };
  }

  async function ask(question: string) {
    const q = question.trim();
    if (!q || busy) return;
    setMessages((m) => [...m, { role: "user", text: q }]);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, lang, context: buildContext() }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", text: data.answer || "…" }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", text: t("Sorry, I couldn't answer just now.") }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fade-in">
      <div className="card p-0 overflow-hidden" style={{ maxWidth: 820, margin: "0 auto" }}>
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-line">
          <span className="grid place-items-center h-9 w-9 rounded-xl" style={{ background: "var(--ink)", color: "var(--lime)" }}><Icon name="sparkles" size={18} /></span>
          <div>
            <h4 className="text-[15px] font-bold leading-tight">{t("Ask your farm")}</h4>
            <p className="text-xs text-muted">{t("Plain answers, in your currency — powered by your live data")}</p>
          </div>
        </div>

        <div className="p-5 space-y-4" style={{ minHeight: 320, maxHeight: 460, overflowY: "auto" }}>
          {messages.length === 0 && (
            <div className="text-sm text-muted">
              <p className="mb-3">{t("Ask anything about today's decisions. For example:")}</p>
              <div className="flex flex-col gap-2">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => ask(s)} className="text-left rounded-xl border border-line px-3 py-2 text-sm row-hover btn-press" style={{ background: "#fff" }}>{t(s)}</button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className="rounded-2xl px-4 py-2.5 text-sm" style={{ maxWidth: "85%", background: m.role === "user" ? "var(--ink)" : "var(--bg)", color: m.role === "user" ? "#fff" : "var(--ink)", border: m.role === "user" ? "none" : "1px solid var(--line)" }}>
                {m.text}
              </div>
            </div>
          ))}
          {busy && (
            <div className="flex justify-start"><div className="rounded-2xl px-4 py-2.5 text-sm flex items-center gap-1.5" style={{ background: "var(--bg)", border: "1px solid var(--line)" }}><span className="h-1.5 w-1.5 rounded-full pulse-dot" style={{ background: "var(--green)" }} />{t("Thinking…")}</div></div>
          )}
          <div ref={endRef} />
        </div>

        <div className="border-t border-line p-3 flex items-center gap-2">
          <input
            className="setinput"
            aria-label={t("Ask your farm")}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") ask(input); }}
            placeholder={t("Ask about your margin, weather, or herd…")}
          />
          <button onClick={() => ask(input)} disabled={busy} className="rounded-full px-4 py-2.5 text-sm font-semibold btn-press shrink-0 disabled:opacity-50" style={{ background: "var(--green)", color: "var(--ink)" }}>{t("Ask")}</button>
        </div>
      </div>
      <p className="text-[11px] text-muted text-center mt-3">{t("Demo: answers run on your simulated data. Connect an API key for full AI responses.")}</p>
    </div>
  );
}
