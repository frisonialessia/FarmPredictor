"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp, useFarm } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { Icon } from "@/components/Icon";
import { buildFarm, CROPS, type ParcelRow } from "@/lib/farmFactory";

const areaNum = (a: string) => a.replace(/[^0-9.]/g, "");

export function FarmEditor() {
  const farm = useFarm();
  const { saveFarm, toast } = useApp();
  const t = useT();
  const router = useRouter();
  const editable = farm.id.startsWith("user_");

  const [name, setName] = useState(farm.name);
  const [location, setLocation] = useState(farm.location);
  const [rows, setRows] = useState<ParcelRow[]>(
    farm.parcels.map((p) => ({ name: p.name, crop: p.crop, area: areaNum(p.area) })),
  );

  function setRow(i: number, patch: Partial<ParcelRow>) {
    setRows((r) => r.map((row, j) => (j === i ? { ...row, ...patch } : row)));
  }

  function save() {
    const updated = buildFarm({ id: farm.id, name, location, lat: farm.lat, lon: farm.lon, plan: farm.plan }, rows.filter((r) => r.name.trim()));
    saveFarm(updated);
    toast("Farm saved.");
  }

  if (!editable) {
    return (
      <div className="card p-6">
        <h4 className="text-[15px] font-bold mb-1">{t("Your farm")}</h4>
        <p className="text-xs mb-4 text-muted">{t("This is a demo farm — create your own to edit it.")}</p>
        <button onClick={() => router.push("/onboarding")} className="rounded-full px-5 py-2 text-sm font-semibold btn-press" style={{ background: "var(--green)", color: "var(--ink)" }}>{t("Create your farm")}</button>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-1">
        <h4 className="text-[15px] font-bold">{t("Your farm")}</h4>
        <button onClick={save} className="rounded-full px-4 py-2 text-sm font-semibold btn-press" style={{ background: "var(--green)", color: "var(--ink)" }}>{t("Save farm")}</button>
      </div>
      <p className="text-xs mb-5 text-muted">{t("Manage your farm and parcels")}</p>

      <div className="grid sm:grid-cols-2 gap-4 mb-5">
        <div><label className="block text-xs font-medium mb-1 text-muted">{t("Farm name")}</label><input className="setinput" value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div><label className="block text-xs font-medium mb-1 text-muted">{t("Location (county, region)")}</label><input className="setinput" value={location} onChange={(e) => setLocation(e.target.value)} /></div>
      </div>

      <label className="kpi-label">{t("Parcels")}</label>
      <div className="space-y-2 mt-2">
        {rows.map((p, i) => (
          <div key={i} className="grid grid-cols-12 gap-2 items-center">
            <input className="setinput col-span-12 sm:col-span-4" value={p.name} onChange={(e) => setRow(i, { name: e.target.value })} placeholder={t("Name")} />
            <select className="setinput col-span-6 sm:col-span-5" value={p.crop} onChange={(e) => setRow(i, { crop: e.target.value })}>
              {CROPS.map((c) => <option key={c} value={c}>{t(c)}</option>)}
            </select>
            <input className="setinput col-span-4 sm:col-span-2" value={p.area} onChange={(e) => setRow(i, { area: e.target.value })} placeholder="ac" inputMode="numeric" />
            <button onClick={() => setRows((r) => (r.length > 1 ? r.filter((_, j) => j !== i) : r))} className="col-span-2 sm:col-span-1 grid place-items-center h-9 rounded-lg hover:bg-bg btn-press" style={{ color: "var(--muted)" }} aria-label={t("Remove")}><Icon name="x" size={15} /></button>
          </div>
        ))}
      </div>
      <button onClick={() => setRows((r) => [...r, { name: "", crop: CROPS[0], area: "" }])} className="mt-3 text-sm font-semibold btn-press" style={{ color: "var(--green-deep)" }}>{t("+ Add parcel")}</button>
    </div>
  );
}
