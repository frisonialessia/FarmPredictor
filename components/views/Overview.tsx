"use client";
import { useEffect, useState } from "react";
import { useFarm, useApp } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { Icon } from "@/components/Icon";
import { AreaChart } from "@/components/Charts";
import { formatMoney, formatTemp } from "@/lib/format";
import { fetchWeather } from "@/lib/weather";
import { MARKET } from "@/data/farms";
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
  const { currency, tempUnit } = useApp();
  const t = useT();

  // Start with the simulated forecast (SSR-safe), then swap in a real one from
  // Open-Meteo once mounted. Falls back silently to demo data on any failure.
  const [weather, setWeather] = useState<WeatherDay[]>(farm.weather);
  const [live, setLive] = useState(false);
  useEffect(() => {
    setWeather(farm.weather);
    setLive(false);
    let cancelled = false;
    fetchWeather(farm.lat, farm.lon)
      .then((w) => { if (!cancelled && w.length) { setWeather(w); setLive(true); } })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [farm.id, farm.lat, farm.lon, farm.weather]);

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
            <span className={live ? "pill pill-mint" : "pill"}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: live ? "var(--green)" : "var(--muted)" }} />
              {live ? t("Live · Open-Meteo") : t("Demo")}
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
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="card p-6">
          <h4 className="text-[15px] font-bold mb-1">{t("Market prices")}</h4>
          <p className="text-xs mb-4 text-muted">{t("Live spot vs. your cost")}</p>
          <div className="space-y-3">
            {MARKET.map((m) => (
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
