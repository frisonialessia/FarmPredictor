"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp, useFarm } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { formatMoney } from "@/lib/format";
import { FarmEditor } from "@/components/FarmEditor";
import { clearSession } from "@/lib/session";
import { TIMEZONES } from "@/lib/timezones";
import type { Currency, AreaUnit, TempUnit, Lang } from "@/lib/types";

const PREFS_DEFAULT = [["Weather alerts", true], ["Margin-at-risk push", true], ["Daily decision digest", true], ["Auto-irrigation triggers", false], ["Weekly summary email", true]] as [string, boolean][];

export function Settings() {
  const { currency, setCurrency, areaUnit, setAreaUnit, tempUnit, setTempUnit, timezone, setTimezone, userName, setUserName, lang, setLang, toast } = useApp();
  const farm = useFarm();
  const t = useT();
  const router = useRouter();
  const [threshold, setThreshold] = useState(2000);
  const [prefs, setPrefs] = useState(PREFS_DEFAULT);
  const [saved, setSaved] = useState(false);
  const initials = userName.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  // SIMULATED export: builds a CSV from the current farm's parcels in-browser.
  function exportCsv() {
    const header = "Parcel,Crop,Area,Hours to window close,Margin per acre (USD)";
    const rows = farm.parcels.map((p) => `${p.name},${p.crop},${p.area},${p.hoursToWindowClose},${p.marginPerAcre}`);
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${farm.id}_parcels.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Exported demo farm data to CSV.");
  }

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 rounded-2xl grid place-items-center text-lg font-bold" style={{ background: "var(--lime)" }}>{initials}</div>
          <div><p className="text-lg font-bold">{userName}</p><p className="text-xs text-muted">{t("Owner")} · {farm.name}</p></div>
        </div>
        <div className="flex items-center gap-2">
          {saved && <span className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: "var(--mint)", color: "var(--ink)" }}>{t("Saved")}</span>}
          <button onClick={() => { setSaved(true); toast("Preferences saved (demo)."); setTimeout(() => setSaved(false), 1800); }} className="rounded-full px-5 py-2 text-sm font-semibold btn-press" style={{ background: "var(--green)", color: "var(--ink)" }}>{saved ? t("Saved ✓") : t("Save changes")}</button>
        </div>
      </div>
      <div className="mb-5"><FarmEditor /></div>
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="card p-6">
          <h4 className="text-[15px] font-bold mb-1">{t("Profile")}</h4><p className="text-xs mb-5 text-muted">{t("Your account details")}</p>
          <label className="block text-xs font-medium mb-1 text-muted">{t("Full name")}</label>
          <input className="setinput mb-4" value={userName} onChange={(e) => setUserName(e.target.value)} />
          <label className="block text-xs font-medium mb-1 text-muted">{t("Email")}</label>
          <input type="email" className="setinput mb-4" defaultValue="m.alvarez@rioverde.ag" />
          <label className="block text-xs font-medium mb-1 text-muted">{t("Role")}</label>
          <select className="setinput mb-4"><option>{t("Owner")}</option><option>{t("Farm manager")}</option><option>{t("Agronomist")}</option></select>
          <label className="block text-xs font-medium mb-1 text-muted">{t("Phone")}</label>
          <input className="setinput" defaultValue="+1 (956) 555-0142" />
        </div>
        <div className="card p-6">
          <h4 className="text-[15px] font-bold mb-1">{t("Region & units")}</h4><p className="text-xs mb-5 text-muted">{t("Changing these updates the whole app")}</p>
          <label className="block text-xs font-medium mb-1 text-muted">{t("Language")}</label>
          <select className="setinput mb-4" value={lang} onChange={(e) => setLang(e.target.value as Lang)}><option value="en">{t("English")}</option><option value="es">{t("Español")}</option></select>
          <label className="block text-xs font-medium mb-1 text-muted">{t("Currency")}</label>
          <select className="setinput mb-4" value={currency} onChange={(e) => setCurrency(e.target.value as Currency)}><option value="USD">{t("US Dollar ($)")}</option><option value="EUR">{t("Euro (€)")}</option><option value="MXN">{t("Mexican Peso (MX$)")}</option><option value="CAD">{t("Canadian Dollar (C$)")}</option></select>
          <label className="block text-xs font-medium mb-1 text-muted">{t("Area unit")}</label>
          <select className="setinput mb-4" value={areaUnit} onChange={(e) => setAreaUnit(e.target.value as AreaUnit)}><option value="ac">{t("Acres")}</option><option value="ha">{t("Hectares")}</option></select>
          <label className="block text-xs font-medium mb-1 text-muted">{t("Temperature")}</label>
          <select className="setinput mb-4" value={tempUnit} onChange={(e) => setTempUnit(e.target.value as TempUnit)}><option value="F">{t("Fahrenheit (°F)")}</option><option value="C">{t("Celsius (°C)")}</option></select>
          <label className="block text-xs font-medium mb-1 text-muted">{t("Region / timezone")}</label>
          <select className="setinput" value={timezone} onChange={(e) => setTimezone(e.target.value)}>{TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}</select>
        </div>
        <div className="card p-6">
          <h4 className="text-[15px] font-bold mb-1">{t("Notifications")}</h4><p className="text-xs mb-5 text-muted">{t("When should we alert you")}</p>
          <div className="space-y-4 mb-6">
            {prefs.map(([n, on], i) => (
              <div key={n} className="flex items-center justify-between"><span className="text-sm">{t(n)}</span>
                <button onClick={() => setPrefs((p) => p.map((x, j) => (j === i ? [x[0], !x[1]] : x)))} className="relative h-6 w-11 rounded-full" style={{ background: on ? "var(--green)" : "var(--line)", transition: "background .2s" }}><span className="absolute top-1 h-4 w-4 rounded-full bg-white" style={{ left: on ? 24 : 4, transition: "left .2s" }} /></button>
              </div>
            ))}
          </div>
          <h4 className="text-[15px] font-bold mb-3 pt-4 border-t border-line">{t("Alert threshold")}</h4>
          <label className="block text-xs font-medium mb-2 text-muted">{t("Notify when margin at risk exceeds")} <span className="mono font-bold text-ink">{formatMoney(threshold, currency)}</span></label>
          <input type="range" min={500} max={10000} step={500} value={threshold} onChange={(e) => setThreshold(+e.target.value)} className="w-full" />
        </div>
      </div>
      <div className="card p-6 mt-5">
        <h4 className="text-[15px] font-bold mb-1">{t("Data & privacy")}</h4><p className="text-xs mb-4 text-muted">{t("Manage your farm data")}</p>
        <div className="flex flex-wrap gap-3">
          <button onClick={exportCsv} className="rounded-full px-4 py-2 text-sm font-semibold border border-line btn-press hover:bg-bg">{t("Export farm data (CSV)")}</button>
          <button onClick={() => toast("Demo prototype — this action isn't wired up yet.")} className="rounded-full px-4 py-2 text-sm font-semibold border border-line btn-press hover:bg-bg">{t("Download invoices")}</button>
          <button onClick={() => toast("Demo prototype — this action isn't wired up yet.")} className="rounded-full px-4 py-2 text-sm font-semibold btn-press" style={{ background: "rgba(194,65,12,.1)", color: "var(--warn)" }}>{t("Delete account")}</button>
          <button onClick={() => { clearSession(); router.push("/login"); }} className="rounded-full px-4 py-2 text-sm font-semibold border border-line btn-press hover:bg-bg">{t("Sign out")}</button>
        </div>
      </div>
    </div>
  );
}
