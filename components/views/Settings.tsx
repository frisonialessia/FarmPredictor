"use client";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { formatMoney } from "@/lib/format";
import type { Currency, AreaUnit, TempUnit } from "@/lib/types";

const PREFS_DEFAULT = [["Weather alerts", true], ["Margin-at-risk push", true], ["Daily decision digest", true], ["Auto-irrigation triggers", false], ["Weekly summary email", true]] as [string, boolean][];

export function Settings() {
  const { currency, setCurrency, areaUnit, setAreaUnit, tempUnit, setTempUnit, userName, setUserName } = useApp();
  const [threshold, setThreshold] = useState(2000);
  const [prefs, setPrefs] = useState(PREFS_DEFAULT);
  const [saved, setSaved] = useState(false);
  const initials = userName.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 rounded-2xl grid place-items-center text-lg font-bold" style={{ background: "var(--lime)" }}>{initials}</div>
          <div><p className="text-lg font-bold">{userName}</p><p className="text-xs text-muted">Owner · Rio Verde Farms</p></div>
        </div>
        <div className="flex items-center gap-2">
          {saved && <span className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: "var(--mint)", color: "var(--ink)" }}>Saved</span>}
          <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 1800); }} className="rounded-full px-5 py-2 text-sm font-semibold" style={{ background: "var(--green)", color: "var(--ink)" }}>{saved ? "Saved ✓" : "Save changes"}</button>
        </div>
      </div>
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="card p-6">
          <h4 className="text-[15px] font-bold mb-1">Profile</h4><p className="text-xs mb-5 text-muted">Your account details</p>
          <label className="block text-xs font-medium mb-1 text-muted">Full name</label>
          <input className="setinput mb-4" value={userName} onChange={(e) => setUserName(e.target.value)} />
          <label className="block text-xs font-medium mb-1 text-muted">Email</label>
          <input type="email" className="setinput mb-4" defaultValue="m.alvarez@rioverde.ag" />
          <label className="block text-xs font-medium mb-1 text-muted">Role</label>
          <select className="setinput mb-4"><option>Owner</option><option>Farm manager</option><option>Agronomist</option></select>
          <label className="block text-xs font-medium mb-1 text-muted">Phone</label>
          <input className="setinput" defaultValue="+1 (956) 555-0142" />
        </div>
        <div className="card p-6">
          <h4 className="text-[15px] font-bold mb-1">Region &amp; units</h4><p className="text-xs mb-5 text-muted">Changing these updates the whole app</p>
          <label className="block text-xs font-medium mb-1 text-muted">Currency</label>
          <select className="setinput mb-4" value={currency} onChange={(e) => setCurrency(e.target.value as Currency)}><option value="USD">US Dollar ($)</option><option value="EUR">Euro (€)</option><option value="MXN">Mexican Peso (MX$)</option><option value="CAD">Canadian Dollar (C$)</option></select>
          <label className="block text-xs font-medium mb-1 text-muted">Area unit</label>
          <select className="setinput mb-4" value={areaUnit} onChange={(e) => setAreaUnit(e.target.value as AreaUnit)}><option value="ac">Acres</option><option value="ha">Hectares</option></select>
          <label className="block text-xs font-medium mb-1 text-muted">Temperature</label>
          <select className="setinput mb-4" value={tempUnit} onChange={(e) => setTempUnit(e.target.value as TempUnit)}><option value="F">Fahrenheit (°F)</option><option value="C">Celsius (°C)</option></select>
          <label className="block text-xs font-medium mb-1 text-muted">Region / timezone</label>
          <select className="setinput"><option>Texas, US (CT)</option><option>California, US (PT)</option><option>Sinaloa, MX (CT)</option></select>
        </div>
        <div className="card p-6">
          <h4 className="text-[15px] font-bold mb-1">Notifications</h4><p className="text-xs mb-5 text-muted">When should we alert you</p>
          <div className="space-y-4 mb-6">
            {prefs.map(([n, on], i) => (
              <div key={n} className="flex items-center justify-between"><span className="text-sm">{n}</span>
                <button onClick={() => setPrefs((p) => p.map((x, j) => (j === i ? [x[0], !x[1]] : x)))} className="relative h-6 w-11 rounded-full" style={{ background: on ? "var(--green)" : "var(--line)", transition: "background .2s" }}><span className="absolute top-1 h-4 w-4 rounded-full bg-white" style={{ left: on ? 24 : 4, transition: "left .2s" }} /></button>
              </div>
            ))}
          </div>
          <h4 className="text-[15px] font-bold mb-3 pt-4 border-t border-line">Alert threshold</h4>
          <label className="block text-xs font-medium mb-2 text-muted">Notify when margin at risk exceeds <span className="mono font-bold text-ink">{formatMoney(threshold, currency)}</span></label>
          <input type="range" min={500} max={10000} step={500} value={threshold} onChange={(e) => setThreshold(+e.target.value)} className="w-full" />
        </div>
      </div>
      <div className="card p-6 mt-5">
        <h4 className="text-[15px] font-bold mb-1">Data &amp; privacy</h4><p className="text-xs mb-4 text-muted">Manage your farm data</p>
        <div className="flex flex-wrap gap-3">
          <button className="rounded-full px-4 py-2 text-sm font-semibold border border-line">Export farm data (CSV)</button>
          <button className="rounded-full px-4 py-2 text-sm font-semibold border border-line">Download invoices</button>
          <button className="rounded-full px-4 py-2 text-sm font-semibold" style={{ background: "rgba(194,65,12,.1)", color: "var(--warn)" }}>Delete account</button>
        </div>
      </div>
    </div>
  );
}
