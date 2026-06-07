"use client";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { Icon } from "@/components/Icon";
import { BrandMark } from "@/components/BrandMark";

export const NAV: [string, string, string][] = [
  ["overview", "Overview", "overview"],
  ["assistant", "Assistant", "sparkles"],
  ["mapa", "Parcel map", "map"],
  ["planner", "Planner", "planner"],
  ["whatif", "What-if", "whatif"],
  ["financial", "Financial", "financial"],
  ["operations", "Operations", "operations"],
  ["livestock", "Livestock", "cattle"],
  ["activity", "Activity", "activity"],
  ["digest", "Digest", "bell"],
];

export function Sidebar({ active, onNavigate }: { active: string; onNavigate: (id: string) => void }) {
  const { setFarmId, farms, farm } = useApp();
  const t = useT();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <aside className="hidden md:flex shrink-0 bg-white border-r border-line py-4 flex-col items-center gap-2" style={{ width: 92, minWidth: 92, maxWidth: 92, position: "sticky", top: 0, height: "100vh", overflowY: "auto", alignSelf: "flex-start" }}>
      <a href="/" className="grid place-items-center mb-2 mt-1 rounded-xl p-1.5 hover:bg-bg transition-colors" title={t("Home")}><BrandMark size={30} /></a>
      <div className="w-full px-2 flex flex-col gap-1">
        {NAV.map(([id, label, icon]) => (
          <button key={id} onClick={() => onNavigate(id)} title={t(label)}
            className={`flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl transition-colors ${active === id ? "bg-ink text-white" : "hover:bg-bg"}`}>
            <span style={{ color: active === id ? "var(--lime)" : "var(--ink)" }}><Icon name={icon} size={19} /></span>
            <span className="text-[9px] font-semibold leading-none text-center">{t(label)}</span>
          </button>
        ))}
      </div>
      <div className="mt-auto pt-3 border-t border-line w-full px-2 flex flex-col gap-1.5">
        <div className="relative">
          <button onClick={() => setMenuOpen((o) => !o)} className="w-full flex flex-col items-center gap-1 py-2 rounded-xl hover:bg-bg transition-colors" title={t("Switch farm")}>
            <span className="h-9 w-9 rounded-lg grid place-items-center text-xs font-bold" style={{ background: "var(--lime)" }}>{farm.initials}</span>
            <span className="flex items-center gap-0.5"><span className="text-[9px] font-semibold text-muted">{t("Farm")}</span><Icon name="chevron" size={11} /></span>
          </button>
          {menuOpen && (
            <>
              {/* close on outside click */}
              <button className="fixed inset-0 z-40 cursor-default" aria-hidden onClick={() => setMenuOpen(false)} />
              {/* fixed so it escapes the 92px rail's overflow clipping (flyout to the right) */}
              <div className="fixed z-50 bg-white border border-line rounded-xl overflow-hidden" style={{ width: 224, left: 86, bottom: 76, boxShadow: "var(--shadow-lg)" }}>
                {farms.map((f) => (
                  <button key={f.id} onClick={() => { setFarmId(f.id); setMenuOpen(false); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-bg text-left">
                    <span className="h-8 w-8 rounded-lg grid place-items-center text-xs font-bold shrink-0" style={{ background: "var(--lime)" }}>{f.initials}</span>
                    <span className="min-w-0"><p className="text-xs font-semibold truncate">{f.name}</p><p className="text-[10px] text-muted truncate">{f.location}</p></span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        <button onClick={() => onNavigate("settings")} title={t("Settings")}
          className={`flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl transition-colors ${active === "settings" ? "bg-ink text-white" : "hover:bg-bg"}`}>
          <span style={{ color: active === "settings" ? "var(--lime)" : "var(--ink)" }}><Icon name="settings" size={19} /></span>
          <span className="text-[9px] font-semibold leading-none">{t("Settings")}</span>
        </button>
      </div>
    </aside>
  );
}
