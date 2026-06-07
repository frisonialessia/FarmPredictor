"use client";
import { useEffect, useState } from "react";
import { useApp, useFarm } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { Icon } from "@/components/Icon";
import { formatMoney } from "@/lib/format";
import { fetchWeather } from "@/lib/weather";
import { weatherRisks, RISK_META } from "@/lib/risk";
import { repo } from "@/lib/repo";
import type { WeatherDay } from "@/lib/types";

// The daily decision digest: the day's actions in plain dollars, delivered to
// where the farmer already is. UI + live preview; real sending lands with a
// provider (Resend / WhatsApp) later.
export function Digest() {
  const { farmId, userName, currency, toast } = useApp();
  const farm = useFarm();
  const t = useT();
  const [channel, setChannel] = useState<"email" | "whatsapp">("whatsapp");
  const [freq, setFreq] = useState<"daily" | "weekly">("daily");
  const [weather, setWeather] = useState<WeatherDay[]>(farm.weather);

  useEffect(() => {
    let cancelled = false;
    fetchWeather(farm.lat, farm.lon).then((w) => { if (!cancelled && w.length) setWeather(w); }).catch(() => {});
    return () => { cancelled = true; };
  }, [farm.lat, farm.lon]);

  const conflicts = repo.getPlanner(farmId).capacityConflicts;
  const total = conflicts.reduce((s, c) => s + c.loss, 0);
  const risks = weatherRisks(weather);
  const firstName = userName.trim().split(/\s+/)[0];

  return (
    <div className="fade-in grid lg:grid-cols-5 gap-5">
      {/* settings */}
      <div className="lg:col-span-2 card p-6">
        <h4 className="text-[15px] font-bold mb-1">{t("Delivery")}</h4>
        <p className="text-xs mb-5 text-muted">{t("Get the day's decisions where you already are")}</p>

        <label className="kpi-label">{t("Channel")}</label>
        <div className="flex p-1 rounded-full border border-line mt-2 mb-5" style={{ background: "#fff" }}>
          {([["whatsapp", "WhatsApp"], ["email", "Email"]] as const).map(([c, label]) => (
            <button key={c} onClick={() => setChannel(c)} className="flex-1 text-xs font-bold py-2 rounded-full transition-colors" style={{ background: channel === c ? "var(--ink)" : "transparent", color: channel === c ? "#fff" : "var(--muted)" }}>{label}</button>
          ))}
        </div>

        <label className="kpi-label">{t("Frequency")}</label>
        <div className="flex gap-2 mt-2 mb-5">
          {([["daily", t("Daily")], ["weekly", t("Weekly")]] as const).map(([f, label]) => (
            <button key={f} onClick={() => setFreq(f)} className="flex-1 text-sm font-semibold py-2 rounded-xl border transition-colors" style={{ borderColor: freq === f ? "var(--green)" : "var(--line)", background: freq === f ? "rgba(82,200,113,.1)" : "#fff", color: freq === f ? "var(--green-deep)" : "var(--ink)" }}>{label}</button>
          ))}
        </div>

        <label className="kpi-label">{t("Send time")}</label>
        <select className="setinput mt-2 mb-6"><option>06:00</option><option>07:00</option><option>08:00</option></select>

        <button onClick={() => toast("Test digest sent (demo).")} className="w-full rounded-full py-2.5 text-sm font-semibold btn-press" style={{ background: "var(--green)", color: "var(--ink)" }}>{t("Send a test now")}</button>
        <p className="text-[11px] text-muted mt-3">{t("Demo: real delivery connects with a provider later.")}</p>
      </div>

      {/* live preview */}
      <div className="lg:col-span-3 card p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-[15px] font-bold">{t("Preview")}</h4>
          <span className="pill"><Icon name={channel === "whatsapp" ? "crew" : "box"} size={12} />{channel === "whatsapp" ? "WhatsApp" : "Email"}</span>
        </div>

        <div className="rounded-2xl p-5" style={{ background: channel === "whatsapp" ? "#e7f7ed" : "var(--bg)", border: "1px solid var(--line)" }}>
          <div className="rounded-2xl p-4 bg-white" style={{ boxShadow: "var(--shadow-sm)" }}>
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-line">
              <span className="grid place-items-center h-7 w-7 rounded-lg" style={{ background: "var(--ink)", color: "var(--lime)" }}><Icon name="planner" size={15} /></span>
              <span className="text-sm font-bold">FarmPredictor</span>
              <span className="text-[11px] text-muted ml-auto">{t("Daily digest")} · {farm.name}</span>
            </div>

            <p className="text-sm font-semibold">{t("Good morning")}, {firstName} 👋</p>
            <p className="text-sm mt-1">{t("You have")} <span className="mono font-bold" style={{ color: "var(--warn)" }}>{formatMoney(total, currency)}</span> {t("of margin at risk this week. Top moves:")}</p>

            <div className="mt-3 space-y-2">
              {conflicts.map((c) => (
                <div key={c.id} className="flex items-start gap-2 text-sm">
                  <span style={{ color: "var(--green)" }}>•</span>
                  <span className="flex-1"><b>{c.parcel}:</b> {t(c.actionLabel)} → {t("recover")} <span className="mono font-semibold" style={{ color: "var(--green-deep)" }}>{formatMoney(c.loss, currency)}</span></span>
                </div>
              ))}
              {risks[0] && (
                <div className="flex items-start gap-2 text-sm">
                  <span><Icon name={RISK_META[risks[0].kind].icon} size={14} /></span>
                  <span className="flex-1">{t(RISK_META[risks[0].kind].title)} {t(risks[0].day)} — {t(RISK_META[risks[0].kind].action)} (<span className="mono font-semibold" style={{ color: "var(--warn)" }}>{formatMoney(risks[0].impact, currency)}</span>)</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-line">
              <span className="text-xs font-semibold" style={{ color: "var(--green-deep)" }}>{t("Open dashboard")} →</span>
            </div>
          </div>
        </div>
        <p className="text-[11px] text-muted mt-3">{t("Compiled live from your plan and the weather forecast.")}</p>
      </div>
    </div>
  );
}
