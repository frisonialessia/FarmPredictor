"use client";
import { useState } from "react";
import { useFarm } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { Icon } from "@/components/Icon";

function colorFor(hours: number) {
  if (hours < 48) return "#C2410C";
  if (hours < 120) return "#85df42";
  return "#52c871";
}
function label(hours: number) {
  if (hours < 48) return `${hours}h`;
  return `${Math.round(hours / 24)}d`;
}

export function ParcelMap() {
  const farm = useFarm();
  const t = useT();
  const [active, setActive] = useState(0);
  const w = 520, h = 440;
  const grid: string[] = [];
  for (let x = 0; x < w; x += 24) grid.push(`M${x} 0V${h}`);
  for (let y = 0; y < h; y += 24) grid.push(`M0 ${y}H${w}`);

  return (
    <div className="fade-in grid lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2">
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="flex gap-2">
              <button className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ background: "var(--ink)", color: "#fff" }}>{t("Schematic")}</button>
              <button disabled className="text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-not-allowed" style={{ background: "var(--bg)", color: "var(--muted)", border: "1px solid var(--line)" }}>
                <Icon name="map" size={14} /> {t("Satellite")}
                <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: "var(--mint)", color: "var(--ink)" }}>{t("Phase 2")}</span>
              </button>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-muted">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: "#C2410C" }} />&lt;48h</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: "#85df42" }} />2-5d</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: "#52c871" }} />&gt;5d</span>
            </div>
          </div>
          <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "auto", borderRadius: 16, display: "block" }}>
            <rect width={w} height={h} fill="#eef3ec" />
            <path d={`M0 152 H${w} M250 0 V${h} M0 300 H${w}`} stroke="#dfe7db" strokeWidth={11} fill="none" />
            <path d={grid.join(" ")} stroke="rgba(0,0,0,.025)" />
            {farm.parcels.map((p, idx) => {
              const on = active === idx;
              const r = p.hoursToWindowClose < 48 ? 27 : p.hoursToWindowClose < 120 ? 23 : 19;
              const circ = 2 * Math.PI * r;
              const frac = Math.max(0.08, Math.min(1, p.hoursToWindowClose / 240));
              const col = colorFor(p.hoursToWindowClose);
              return (
                <g key={p.id} style={{ cursor: "pointer" }} onClick={() => setActive(idx)}>
                  <polygon points={p.polygon} fill={col} fillOpacity={on ? 0.55 : 0.32} stroke={col} strokeWidth={on ? 3 : 2} />
                  <circle cx={p.cx} cy={p.cy} r={r} fill="rgba(11,15,12,.55)" />
                  <circle cx={p.cx} cy={p.cy} r={r} fill="none" stroke="rgba(255,255,255,.25)" strokeWidth={3.5} />
                  <circle cx={p.cx} cy={p.cy} r={r} fill="none" stroke={col} strokeWidth={3.5} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - frac)} transform={`rotate(-90 ${p.cx} ${p.cy})`} />
                  <text x={p.cx} y={p.cy - 1} textAnchor="middle" fill="#fff" fontSize={12} fontWeight={700} fontFamily="monospace">{label(p.hoursToWindowClose)}</text>
                  <text x={p.cx} y={p.cy + 11} textAnchor="middle" fill="rgba(255,255,255,.85)" fontSize={7.5}>{p.name}</text>
                </g>
              );
            })}
          </svg>
        </div>
        <p className="text-[11px] mt-2 px-1 text-muted">{t("Schematic parcel map. Color shows harvest urgency; the ring shows optimal-window hours remaining. Live satellite layer connects in Phase 2.")}</p>
      </div>
      <div className="card p-6">
        <h4 className="text-[15px] font-bold mb-1">{t("Parcels")}</h4>
        <p className="text-xs mb-4 text-muted">{t("Tap to highlight · sorted by urgency")}</p>
        <div>
          {farm.parcels.map((p, i) => (
            <div key={p.id} onClick={() => setActive(i)} className={`flex items-center gap-3 py-3 px-2 rounded-xl cursor-pointer row-hover ${i > 0 ? "border-t border-line" : ""}`} style={{ background: active === i ? "var(--bg)" : "transparent" }}>
              <span className="h-3 w-3 rounded-full shrink-0" style={{ background: colorFor(p.hoursToWindowClose) }} />
              <div className="flex-1"><p className="text-sm font-semibold">{p.name}</p><p className="text-xs text-muted">{t(p.crop)} · {p.area}</p></div>
              <span className="mono text-sm font-bold" style={{ color: colorFor(p.hoursToWindowClose) }}>{label(p.hoursToWindowClose)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
