"use client";
import { useEffect, useState } from "react";
import { useFarm, useApp } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { Icon } from "@/components/Icon";
import { AreaChart } from "@/components/Charts";
import { formatMoney, formatTemp } from "@/lib/format";
import { fetchWeather } from "@/lib/weather";
import { weatherRisks, RISK_META } from "@/lib/risk";
import { harvestTiming } from "@/lib/timing";
import { repo } from "@/lib/repo";
import { marketRowsForCrops } from "@/data/crops";
import { DAYS7 } from "@/data/planner";
import type { WeatherDay } from "@/lib/types";

const DECISIONS = [
  { icon: "tractor", parcel: "North A", title: "Harvest before Thursday", desc: "Harvester busy, execution shifts", loss: 2940 },
  { icon: "rain", parcel: "West 2", title: "Cover Wednesday rain", desc: "Only 1 crew free that day", loss: 2080 },
  { icon: "box", parcel: "North A", title: "Order 620 crates today", desc: "Supplier delivers in 48h", loss: 1120 },
];
const SEASON = [18, 24, 31, 28, 36, 42];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

export function Overview() {
  const farm = useFarm();
  const { currency, tempUnit, plan } = useApp();
  const t = useT();
  // Prices for this farm's actual crops (falls back to the global list).
  const farmMarket = marketRowsForCrops(farm.parcels.map((p) => p.crop));
  const market = farmMarket.length ? farmMarket : repo.getMarketPrices();

  // Start with the simulated forecast (SSR-safe), then swap in a real one from
  // Open-Meteo once mounted. Falls back silently to demo data on any failure.
  const [weather, setWeather] = useState<WeatherDay[]>(farm.weather);
  const [status, setStatus] = useState<"loading" | "live" | "demo">("loading");
  useEffect(() => {
    setWeather(farm.weather);
    setStatus("loading");
    let cancelled = false;
    fetchWeather(farm.lat, farm.lon)
      .then((w) => { if (!cancelled && w.length) { setWeather(w); setStatus("live"); } else if (!cancelled) setStatus("demo"); })
      .catch(() => { if (!cancelled) setStatus("demo"); });
    return () => { cancelled = true; };
  }, [farm.id, farm.lat, farm.lon, farm.weather]);

  const risks = weatherRisks(weather);
  const timing = harvestTiming(plan, weather);
  const dayLabel = (d: number) => t(DAYS7[d] ?? "");
  const reasonText = (r: string, currentDay: number) =>
    r === "storm" ? `${t("Storm risk on")} ${dayLabel(currentDay)}`
      : r === "frost" ? `${t("Frost risk on")} ${dayLabel(currentDay)}`
      : t("Slipping out of its window");

  return (
    <div className="fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {farm.kpis.map((k) => (
          <div key={k.label} className="card card-hover p-5">
            <p className="kpi-label">{t(k.label)}</p>
            <p className={`mono text-2xl font-bold mt-2 ${k.highlight ? "text-green" : ""}`}>{k.value}</p>
            <p className="text-xs mt-1 text-muted">{t(k.sub)}</p>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-5 mb-5">
        <div className="card p-6 lg:col-span-2">
          <h4 className="text-[15px] font-bold mb-1">{t("Today's decisions")}</h4>
          <p className="text-xs mb-4 text-muted">{t("Sorted by margin impact")}</p>
          <div>
            {DECISIONS.map((d, i) => (
              <div key={i} className={`flex gap-3 py-3 px-2 -mx-2 rounded-xl row-hover ${i > 0 ? "border-t border-line" : ""}`}>
                <div className="grid place-items-center h-9 w-9 rounded-xl shrink-0" style={{ background: "rgba(194,65,12,.1)", color: "var(--warn)" }}><Icon name={d.icon} /></div>
                <div className="flex-1"><span className="text-sm font-bold">{d.parcel}</span><p className="text-sm mt-0.5">{t(d.title)}</p><p className="text-xs mt-0.5 text-muted">{t(d.desc)}</p></div>
                <span className="mono text-sm font-bold self-center" style={{ color: "var(--warn)" }}>-{formatMoney(d.loss, currency)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[15px] font-bold">{t("Weather · 7 days")}</h4>
            <span className={status === "live" ? "pill pill-mint" : "pill"}>
              <span className={`h-1.5 w-1.5 rounded-full ${status === "loading" ? "pulse-dot" : ""}`} style={{ background: status === "live" ? "var(--green)" : status === "loading" ? "var(--green)" : "var(--muted)" }} />
              {status === "live" ? t("Live · Open-Meteo") : status === "loading" ? t("Updating…") : t("Demo")}
            </span>
          </div>
          <div className="space-y-2">
            {weather.map((w, i) => (
              <div key={`${w.day}-${i}`} className="flex items-center gap-3 py-1">
                <span className="text-sm w-9 font-medium text-muted">{t(w.day)}</span>
                <span className="w-7" style={{ color: w.rainPct > 50 ? "var(--warn)" : "var(--ink)" }}><Icon name={w.icon} size={22} /></span>
                <span className="mono text-sm font-semibold w-12">{formatTemp(w.tempF, tempUnit)}</span>
                <div className="flex-1 h-1.5 rounded-full" style={{ background: "var(--mint)" }}><div className="h-full rounded-full" style={{ width: `${w.rainPct}%`, background: w.rainPct > 50 ? "var(--warn)" : "var(--green)" }} /></div>
                <span className="mono text-[11px] w-9 text-right text-muted">{w.rainPct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-6 mb-5">
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-[15px] font-bold">{t("Weather risk radar")}</h4>
          {status === "live" && <span className="pill pill-mint"><span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--green)" }} />{t("Live · Open-Meteo")}</span>}
        </div>
        <p className="text-xs mb-4 text-muted">{t("What's coming this week — and what it's worth")}</p>
        {risks.length === 0 ? (
          <div className="flex items-center gap-2.5 text-sm text-muted py-2"><span className="h-2 w-2 rounded-full" style={{ background: "var(--green)" }} />{t("No weather risks in the next 7 days.")}</div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {risks.map((r) => {
              const meta = RISK_META[r.kind];
              const warn = r.severity === "high";
              return (
                <div key={r.id} className="flex items-center gap-3 rounded-xl p-3 border border-line">
                  <div className="grid place-items-center h-10 w-10 rounded-xl shrink-0" style={{ background: warn ? "rgba(194,65,12,.1)" : "var(--mint)", color: warn ? "var(--warn)" : "var(--ink)" }}><Icon name={meta.icon} /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold">{t(meta.title)} · <span className="font-medium text-muted">{t(r.day)}</span></p>
                    <p className="text-xs text-muted truncate">{t(meta.action)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="mono text-sm font-bold" style={{ color: "var(--warn)" }}>-{formatMoney(r.impact, currency)}</p>
                    <p className="text-[10px] text-muted">{t("at risk")}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="card p-6 mb-5">
        <h4 className="text-[15px] font-bold mb-1">{t("When to harvest")}</h4>
        <p className="text-xs mb-4 text-muted">{t("Dodge bad weather, stay in the optimal window")}</p>
        {timing.length === 0 ? (
          <div className="flex items-center gap-2.5 text-sm text-muted py-2"><span className="h-2 w-2 rounded-full" style={{ background: "var(--green)" }} />{t("Your harvest timing looks optimal this week.")}</div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {timing.map((r) => {
              const icon = r.reason === "storm" ? "rain" : r.reason === "frost" ? "drop" : "clock";
              return (
                <div key={r.id} className="flex items-center gap-3 rounded-xl p-3 border border-line">
                  <div className="grid place-items-center h-10 w-10 rounded-xl shrink-0" style={{ background: "rgba(194,65,12,.1)", color: "var(--warn)" }}><Icon name={icon} /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold">{r.label}</p>
                    <p className="text-xs text-muted truncate">{reasonText(r.reason, r.currentDay)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[11px] font-semibold" style={{ color: "var(--green-deep)" }}>{t("Harvest by")} {dayLabel(r.bestDay)}</p>
                    <p className="mono text-sm font-bold text-green">+{formatMoney(r.delta, currency)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="card p-6">
          <h4 className="text-[15px] font-bold mb-1">{t("Market prices")}</h4>
          <p className="text-xs mb-4 text-muted">{t("Live spot vs. your cost")}</p>
          <div className="space-y-3">
            {market.map((m) => (
              <div key={m.crop} className="flex items-center justify-between">
                <div><p className="text-sm font-medium">{t(m.crop)}</p><p className="text-[11px] text-muted">{t("cost")} {formatMoney(m.cost, currency)}/{m.unit}</p></div>
                <div className="text-right"><p className="mono text-sm font-bold">{formatMoney(m.spot, currency)}</p><p className="text-[11px] mono" style={{ color: m.changePct >= 0 ? "var(--green)" : "var(--warn)" }}>{m.changePct >= 0 ? "+" : ""}{m.changePct}%</p></div>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-6 lg:col-span-2">
          <h4 className="text-[15px] font-bold mb-1">{t("Season margin")}</h4>
          <p className="text-xs mb-4 text-muted">{t("Cumulative recovered, by month")}</p>
          <AreaChart data={SEASON} labels={MONTHS.map((m) => t(m))} height={150} />
        </div>
      </div>
    </div>
  );
}
