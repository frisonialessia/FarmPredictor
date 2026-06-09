"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp, useFarm } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { Icon } from "@/components/Icon";
import { buildFarm, CROPS, type ParcelRow } from "@/lib/farmFactory";
import { ROLES, ROLE_LABEL } from "@/lib/roles";
import { MACHINE_TYPES } from "@/lib/machinery";
import { ITEM_CATEGORIES } from "@/lib/inventory";
import { canonCrop } from "@/lib/cropName";
import { num } from "@/lib/num";
import type { Member, MemberRole, ResourceRow, InventoryItem } from "@/lib/types";

const areaNum = (a: string) => a.replace(/[^0-9.]/g, "");
interface MemberRow { name: string; role: MemberRole }
interface MachineRow { name: string; machineType: string; year: string; diesel: string; downtime: string }
interface CrewRow { name: string; workers: string }
interface InvRow { name: string; qty: string; unit: string; category: string; location: string; unitCost: string; spoilage: string }

export function FarmEditor() {
  const farm = useFarm();
  const { saveFarm, toast, areaUnit } = useApp();
  const t = useT();
  const router = useRouter();
  const editable = farm.id.startsWith("user_");

  const [name, setName] = useState(farm.name);
  const [location, setLocation] = useState(farm.location);
  const [rows, setRows] = useState<ParcelRow[]>(farm.parcels.map((p) => ({ name: p.name, crop: p.crop, area: areaNum(p.area) })));
  const [members, setMembers] = useState<MemberRow[]>((farm.members ?? []).map((m) => ({ name: m.name, role: m.role })));
  const [machines, setMachines] = useState<MachineRow[]>((farm.resources ?? []).filter((r) => r.icon !== "crew").map((r) => ({ name: r.label, machineType: r.machineType ?? "Tractor", year: r.year ? String(r.year) : "", diesel: r.dieselGalPerHr ? String(r.dieselGalPerHr) : "", downtime: r.downtimeCostPerDay ? String(r.downtimeCostPerDay) : "" })));
  const [crews, setCrews] = useState<CrewRow[]>((farm.resources ?? []).filter((r) => r.icon === "crew").map((r) => ({ name: r.label, workers: r.workers ? String(r.workers) : "" })));
  const [inventory, setInventory] = useState<InvRow[]>((farm.inventory ?? []).map((x) => ({ name: x.name, qty: String(x.qty), unit: x.unit, category: x.category ?? "Packaging", location: x.location ?? "", unitCost: x.unitCost ? String(x.unitCost) : "", spoilage: x.spoilagePct ? String(x.spoilagePct) : "" })));

  function save() {
    const resources: ResourceRow[] = [
      ...machines.filter((m) => m.name.trim()).map((m, i) => ({ id: `m${i + 1}`, label: m.name.trim(), icon: "tractor", machineType: m.machineType, year: num(m.year), dieselGalPerHr: num(m.diesel), downtimeCostPerDay: num(m.downtime) })),
      ...crews.filter((c) => c.name.trim()).map((c, i) => ({ id: `c${i + 1}`, label: c.name.trim(), icon: "crew", workers: num(c.workers) })),
    ];
    const memberObjs: Member[] = members.filter((m) => m.name.trim()).map((m, i) => ({ id: `u${i + 1}`, name: m.name.trim(), role: m.role }));
    const invObjs: InventoryItem[] = inventory.filter((x) => x.name.trim()).map((x, i) => ({ id: `i${i + 1}`, name: x.name.trim(), qty: Number(x.qty) || 0, unit: x.unit.trim() || "units", category: x.category, location: x.location.trim() || undefined, unitCost: num(x.unitCost), spoilagePct: num(x.spoilage) }));
    const parcelRows = rows.filter((r) => r.name.trim()).map((r) => ({ ...r, crop: canonCrop(r.crop) }));
    const updated = buildFarm({ id: farm.id, name, location, lat: farm.lat, lon: farm.lon, plan: farm.plan, timezone: farm.timezone, areaUnit }, parcelRows, { members: memberObjs, resources, inventory: invObjs });
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

  const RowDelete = ({ onClick }: { onClick: () => void }) => (
    <button onClick={onClick} className="grid place-items-center h-9 rounded-lg hover:bg-bg btn-press" style={{ color: "var(--muted)" }} aria-label={t("Remove")}><Icon name="x" size={15} /></button>
  );

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-1">
        <h4 className="text-[15px] font-bold">{t("Your farm")}</h4>
        <button onClick={save} className="rounded-full px-4 py-2 text-sm font-semibold btn-press" style={{ background: "var(--green)", color: "var(--ink)" }}>{t("Save farm")}</button>
      </div>
      <p className="text-xs mb-5 text-muted">{t("Manage your farm and parcels")}</p>

      <datalist id="crops-edit">{CROPS.map((c) => <option key={c} value={t(c)} />)}</datalist>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div><label className="block text-xs font-medium mb-1 text-muted">{t("Farm name")}</label><input className="setinput" value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div><label className="block text-xs font-medium mb-1 text-muted">{t("Location (county, region)")}</label><input className="setinput" value={location} onChange={(e) => setLocation(e.target.value)} /></div>
      </div>

      {/* Parcels */}
      <label className="kpi-label">{t("Parcels")}</label>
      <div className="space-y-2 mt-2 mb-3">
        {rows.map((p, i) => (
          <div key={i} className="grid grid-cols-12 gap-2 items-center">
            <input className="setinput col-span-12 sm:col-span-4" value={p.name} onChange={(e) => setRows((r) => r.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} placeholder={t("Name")} />
            <input list="crops-edit" className="setinput col-span-6 sm:col-span-5" value={p.crop} onChange={(e) => setRows((r) => r.map((x, j) => j === i ? { ...x, crop: e.target.value } : x))} placeholder={t("Crop")} />
            <input className="setinput col-span-4 sm:col-span-2" value={p.area} onChange={(e) => setRows((r) => r.map((x, j) => j === i ? { ...x, area: e.target.value } : x))} placeholder="ac" inputMode="numeric" />
            <div className="col-span-2 sm:col-span-1"><RowDelete onClick={() => setRows((r) => r.length > 1 ? r.filter((_, j) => j !== i) : r)} /></div>
          </div>
        ))}
      </div>
      <button onClick={() => setRows((r) => [...r, { name: "", crop: "Grain sorghum", area: "" }])} className="text-sm font-semibold btn-press mb-6 block" style={{ color: "var(--green-deep)" }}>{t("+ Add parcel")}</button>

      {/* Team */}
      <label className="kpi-label">{t("Team")}</label>
      <div className="space-y-2 mt-2 mb-3">
        {members.map((m, i) => (
          <div key={i} className="grid grid-cols-12 gap-2 items-center">
            <input className="setinput col-span-12 sm:col-span-7" value={m.name} onChange={(e) => setMembers((r) => r.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} placeholder={t("Person")} />
            <select className="setinput col-span-10 sm:col-span-4" value={m.role} onChange={(e) => setMembers((r) => r.map((x, j) => j === i ? { ...x, role: e.target.value as MemberRole } : x))}>
              {ROLES.map((role) => <option key={role} value={role}>{t(ROLE_LABEL[role])}</option>)}
            </select>
            <div className="col-span-2 sm:col-span-1"><RowDelete onClick={() => setMembers((r) => r.filter((_, j) => j !== i))} /></div>
          </div>
        ))}
      </div>
      <button onClick={() => setMembers((r) => [...r, { name: "", role: "harvester" }])} className="text-sm font-semibold btn-press mb-6 block" style={{ color: "var(--green-deep)" }}>{t("+ Add person")}</button>

      {/* Machines */}
      <label className="kpi-label">{t("Machines")}</label>
      <div className="space-y-3 mt-2 mb-3">
        {machines.map((m, i) => (
          <div key={i} className="rounded-xl border border-line p-3">
            <div className="flex gap-2 items-center mb-2">
              <input className="setinput flex-1" value={m.name} onChange={(e) => setMachines((r) => r.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} placeholder="Harvester #1" />
              <RowDelete onClick={() => setMachines((r) => r.filter((_, j) => j !== i))} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <select className="setinput" value={m.machineType} onChange={(e) => setMachines((r) => r.map((x, j) => j === i ? { ...x, machineType: e.target.value } : x))} aria-label={t("Machine type")}>
                {MACHINE_TYPES.map((mt) => <option key={mt} value={mt}>{t(mt)}</option>)}
              </select>
              <input className="setinput" value={m.year} onChange={(e) => setMachines((r) => r.map((x, j) => j === i ? { ...x, year: e.target.value } : x))} placeholder={t("Year")} inputMode="numeric" />
              <input className="setinput" value={m.diesel} onChange={(e) => setMachines((r) => r.map((x, j) => j === i ? { ...x, diesel: e.target.value } : x))} placeholder={t("Diesel (gal/h)")} inputMode="decimal" />
              <input className="setinput" value={m.downtime} onChange={(e) => setMachines((r) => r.map((x, j) => j === i ? { ...x, downtime: e.target.value } : x))} placeholder={t("Downtime $/day")} inputMode="numeric" />
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => setMachines((r) => [...r, { name: "", machineType: "Tractor", year: "", diesel: "", downtime: "" }])} className="text-sm font-semibold btn-press mb-6 block" style={{ color: "var(--green-deep)" }}>{t("+ Add machine")}</button>

      {/* Crews */}
      <label className="kpi-label">{t("Crews")}</label>
      <div className="space-y-2 mt-2 mb-3">
        {crews.map((c, i) => (
          <div key={i} className="grid grid-cols-12 gap-2 items-center">
            <input className="setinput col-span-7 sm:col-span-8" value={c.name} onChange={(e) => setCrews((r) => r.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} placeholder="Crew A" />
            <input className="setinput col-span-4 sm:col-span-3" value={c.workers} onChange={(e) => setCrews((r) => r.map((x, j) => j === i ? { ...x, workers: e.target.value } : x))} placeholder={t("Workers")} inputMode="numeric" />
            <div className="col-span-1"><RowDelete onClick={() => setCrews((r) => r.filter((_, j) => j !== i))} /></div>
          </div>
        ))}
      </div>
      <button onClick={() => setCrews((r) => [...r, { name: "", workers: "" }])} className="text-sm font-semibold btn-press mb-6 block" style={{ color: "var(--green-deep)" }}>{t("+ Add crew")}</button>

      {/* Inventory */}
      <label className="kpi-label">{t("Inventory")}</label>
      <div className="space-y-3 mt-2">
        {inventory.map((x, i) => (
          <div key={i} className="rounded-xl border border-line p-3">
            <div className="flex gap-2 items-center mb-2">
              <input className="setinput flex-1" value={x.name} onChange={(e) => setInventory((r) => r.map((y, j) => j === i ? { ...y, name: e.target.value } : y))} placeholder={t("Item")} />
              <RowDelete onClick={() => setInventory((r) => r.filter((_, j) => j !== i))} />
            </div>
            <div className="grid grid-cols-3 gap-2 mb-2">
              <select className="setinput" value={x.category} onChange={(e) => setInventory((r) => r.map((y, j) => j === i ? { ...y, category: e.target.value } : y))} aria-label={t("Category")}>
                {ITEM_CATEGORIES.map((c) => <option key={c} value={c}>{t(c)}</option>)}
              </select>
              <input className="setinput" value={x.qty} onChange={(e) => setInventory((r) => r.map((y, j) => j === i ? { ...y, qty: e.target.value } : y))} placeholder={t("Qty")} inputMode="numeric" />
              <input className="setinput" value={x.unit} onChange={(e) => setInventory((r) => r.map((y, j) => j === i ? { ...y, unit: e.target.value } : y))} placeholder={t("Unit")} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input className="setinput" value={x.unitCost} onChange={(e) => setInventory((r) => r.map((y, j) => j === i ? { ...y, unitCost: e.target.value } : y))} placeholder={t("Unit cost")} inputMode="decimal" />
              <input className="setinput" value={x.spoilage} onChange={(e) => setInventory((r) => r.map((y, j) => j === i ? { ...y, spoilage: e.target.value } : y))} placeholder={t("Spoilage %/wk")} inputMode="decimal" />
              <input className="setinput" value={x.location} onChange={(e) => setInventory((r) => r.map((y, j) => j === i ? { ...y, location: e.target.value } : y))} placeholder={t("Location")} />
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => setInventory((r) => [...r, { name: "", qty: "", unit: "units", category: "Packaging", location: "", unitCost: "", spoilage: "" }])} className="mt-2 text-sm font-semibold btn-press" style={{ color: "var(--green-deep)" }}>{t("+ Add item")}</button>
    </div>
  );
}
