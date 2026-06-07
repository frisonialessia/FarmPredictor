"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
import { Icon } from "@/components/Icon";
import { Field } from "@/components/auth/AuthShell";
import { farmBasicsSchema, parcelSchema, fieldErrors } from "@/lib/schemas";
import { buildFarm, CROPS } from "@/lib/farmFactory";
import { MarketingLangToggle } from "@/components/MarketingLangToggle";
import { useMarketingT } from "@/lib/lang";
import { TIMEZONES } from "@/lib/timezones";
import { ROLES, ROLE_LABEL } from "@/lib/roles";
import { MACHINE_TYPES } from "@/lib/machinery";
import { canonCrop } from "@/lib/cropName";
import { num } from "@/lib/num";
import type { Farm, Member, MemberRole, ResourceRow, InventoryItem } from "@/lib/types";

const STEPS = ["Your farm", "Parcels", "Team", "Resources", "Review"];

interface ParcelRow { name: string; crop: string; area: string }
interface MemberRow { name: string; role: MemberRole }
interface MachineRow { name: string; machineType: string; year: string; diesel: string; downtime: string }
interface CrewRow { name: string; workers: string }
interface InvRow { name: string; qty: string; unit: string }

export default function OnboardingPage() {
  const router = useRouter();
  const t = useMarketingT();
  const [step, setStep] = useState(0);

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [areaUnit, setAreaUnit] = useState("ac");
  const [tempUnit, setTempUnit] = useState("F");
  const [timezone, setTimezone] = useState("America/Chicago");

  const [parcels, setParcels] = useState<ParcelRow[]>([{ name: "", crop: "Grain sorghum", area: "" }]);
  const [members, setMembers] = useState<MemberRow[]>([{ name: "", role: "owner" }]);
  const [machines, setMachines] = useState<MachineRow[]>([{ name: "Harvester #1", machineType: "Combine harvester", year: "", diesel: "", downtime: "" }]);
  const [crews, setCrews] = useState<CrewRow[]>([{ name: "Crew A", workers: "" }]);
  const [inventory, setInventory] = useState<InvRow[]>([{ name: "", qty: "", unit: "units" }]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function next() {
    if (step === 0) {
      const r = farmBasicsSchema.safeParse({ name, location });
      if (!r.success) return setErrors(fieldErrors(r.error));
    }
    if (step === 1) {
      for (const p of parcels) {
        const r = parcelSchema.safeParse(p);
        if (!r.success) return setErrors({ parcels: t("Complete every parcel (name, crop, area > 0).") });
      }
    }
    setErrors({});
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  }

  function finish() {
    try {
      const resources: ResourceRow[] = [
        ...machines.filter((m) => m.name.trim()).map((m, i) => ({ id: `m${i + 1}`, label: m.name.trim(), icon: "tractor", machineType: m.machineType, year: num(m.year), dieselGalPerHr: num(m.diesel), downtimeCostPerDay: num(m.downtime) })),
        ...crews.filter((c) => c.name.trim()).map((c, i) => ({ id: `c${i + 1}`, label: c.name.trim(), icon: "crew", workers: num(c.workers) })),
      ];
      const memberObjs: Member[] = members.filter((m) => m.name.trim()).map((m, i) => ({ id: `u${i + 1}`, name: m.name.trim(), role: m.role }));
      const invObjs: InventoryItem[] = inventory.filter((x) => x.name.trim()).map((x, i) => ({ id: `i${i + 1}`, name: x.name.trim(), qty: Number(x.qty) || 0, unit: x.unit.trim() || "units" }));
      const rows = parcels.filter((p) => p.name.trim()).map((p) => ({ ...p, crop: canonCrop(p.crop) }));

      const farm: Farm = buildFarm({ id: `user_${Date.now()}`, name, location, lat: 31.0, lon: -100.0, timezone }, rows, { members: memberObjs, resources, inventory: invObjs });
      const existing = JSON.parse(window.localStorage.getItem("fp_farms") || "[]") as Farm[];
      existing.push(farm);
      window.localStorage.setItem("fp_farms", JSON.stringify(existing));
      window.localStorage.setItem("fp_farm", farm.id);
      window.localStorage.setItem("fp_currency", currency);
      window.localStorage.setItem("fp_area", areaUnit);
      window.localStorage.setItem("fp_temp", tempUnit);
      window.localStorage.setItem("fp_tz", timezone);
    } catch { /* ignore */ }
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <div className="h-1" style={{ background: "var(--line)" }}>
        <div className="h-full" style={{ width: `${((step + 1) / STEPS.length) * 100}%`, background: "var(--green)", transition: "width .4s ease" }} />
      </div>

      <datalist id="crops">{CROPS.map((c) => <option key={c} value={t(c)} />)}</datalist>

      <div className="max-w-xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2.5"><BrandMark size={28} /><span className="font-bold tracking-tight text-lg">FarmPredictor</span></div>
          <MarketingLangToggle />
        </div>

        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <span className="grid place-items-center h-6 w-6 rounded-full text-[11px] font-bold" style={{ background: i <= step ? "var(--ink)" : "var(--line)", color: i <= step ? "#fff" : "var(--muted)" }}>{i < step ? "✓" : i + 1}</span>
              <span className="text-xs font-semibold hidden sm:block" style={{ color: i === step ? "var(--ink)" : "var(--muted)" }}>{t(s)}</span>
              {i < STEPS.length - 1 && <span className="w-4 h-px" style={{ background: "var(--line)" }} />}
            </div>
          ))}
        </div>

        <div className="card p-7">
          {step === 0 && (
            <>
              <h1 className="text-xl font-extrabold tracking-tight mb-1">{t("Let's set up your farm")}</h1>
              <p className="text-sm text-muted mb-6">{t("We use this to localize weather and decisions.")}</p>
              <Field label={t("Farm name")} error={errors.name}>
                <input className="setinput" value={name} onChange={(e) => setName(e.target.value)} placeholder="Rio Verde Farms" />
              </Field>
              <Field label={t("Location (county, region)")} error={errors.location}>
                <input className="setinput" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Hidalgo County, TX" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label={t("Currency")}>
                  <select className="setinput" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                    <option value="USD">{t("US Dollar ($)")}</option><option value="MXN">{t("Mexican Peso (MX$)")}</option>
                    <option value="EUR">{t("Euro (€)")}</option><option value="CAD">{t("Canadian Dollar (C$)")}</option>
                  </select>
                </Field>
                <Field label={t("Time zone")}>
                  <select className="setinput" value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                    {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
                  </select>
                </Field>
                <Field label={t("Area unit")}>
                  <select className="setinput" value={areaUnit} onChange={(e) => setAreaUnit(e.target.value)}>
                    <option value="ac">{t("Acres")}</option><option value="ha">{t("Hectares")}</option>
                  </select>
                </Field>
                <Field label={t("Temperature")}>
                  <select className="setinput" value={tempUnit} onChange={(e) => setTempUnit(e.target.value)}>
                    <option value="F">{t("Fahrenheit (°F)")}</option><option value="C">{t("Celsius (°C)")}</option>
                  </select>
                </Field>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <h1 className="text-xl font-extrabold tracking-tight mb-1">{t("Add your parcels")}</h1>
              <p className="text-sm text-muted mb-5">{t("Start with a few — you can refine later.")}</p>
              <div className="space-y-3">
                {parcels.map((p, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center">
                    <input className="setinput col-span-12 sm:col-span-4" value={p.name} onChange={(e) => setParcels((r) => r.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} placeholder={t("Name")} />
                    <input list="crops" className="setinput col-span-6 sm:col-span-5" value={p.crop} onChange={(e) => setParcels((r) => r.map((x, j) => j === i ? { ...x, crop: e.target.value } : x))} placeholder={t("Crop")} />
                    <input className="setinput col-span-4 sm:col-span-2" value={p.area} onChange={(e) => setParcels((r) => r.map((x, j) => j === i ? { ...x, area: e.target.value } : x))} placeholder="ac" inputMode="numeric" />
                    <button onClick={() => setParcels((r) => r.length > 1 ? r.filter((_, j) => j !== i) : r)} className="col-span-2 sm:col-span-1 grid place-items-center h-9 rounded-lg hover:bg-bg btn-press" style={{ color: "var(--muted)" }} aria-label={t("Remove")}><Icon name="x" size={15} /></button>
                  </div>
                ))}
              </div>
              {errors.parcels && <p className="text-xs mt-2" style={{ color: "var(--warn)" }}>{errors.parcels}</p>}
              <button onClick={() => setParcels((r) => [...r, { name: "", crop: "Grain sorghum", area: "" }])} className="mt-4 text-sm font-semibold btn-press" style={{ color: "var(--green-deep)" }}>{t("+ Add parcel")}</button>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="text-xl font-extrabold tracking-tight mb-1">{t("Add your team")}</h1>
              <p className="text-sm text-muted mb-5">{t("Who works this farm? Add people and their roles.")}</p>
              <div className="space-y-3">
                {members.map((m, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center">
                    <input className="setinput col-span-12 sm:col-span-7" value={m.name} onChange={(e) => setMembers((r) => r.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} placeholder={t("Person")} />
                    <select className="setinput col-span-10 sm:col-span-4" value={m.role} onChange={(e) => setMembers((r) => r.map((x, j) => j === i ? { ...x, role: e.target.value as MemberRole } : x))}>
                      {ROLES.map((role) => <option key={role} value={role}>{t(ROLE_LABEL[role])}</option>)}
                    </select>
                    <button onClick={() => setMembers((r) => r.length > 1 ? r.filter((_, j) => j !== i) : r)} className="col-span-2 sm:col-span-1 grid place-items-center h-9 rounded-lg hover:bg-bg btn-press" style={{ color: "var(--muted)" }} aria-label={t("Remove")}><Icon name="x" size={15} /></button>
                  </div>
                ))}
              </div>
              <button onClick={() => setMembers((r) => [...r, { name: "", role: "harvester" }])} className="mt-4 text-sm font-semibold btn-press" style={{ color: "var(--green-deep)" }}>{t("+ Add person")}</button>
            </>
          )}

          {step === 3 && (
            <>
              <h1 className="text-xl font-extrabold tracking-tight mb-1">{t("Machinery & supplies")}</h1>
              <p className="text-sm text-muted mb-5">{t("Add the machines, crews and stock you have.")}</p>

              <label className="kpi-label">{t("Machines")}</label>
              <div className="space-y-3 mt-2 mb-4">
                {machines.map((m, i) => (
                  <div key={i} className="rounded-xl border border-line p-3">
                    <div className="flex gap-2 items-center mb-2">
                      <input className="setinput flex-1" value={m.name} onChange={(e) => setMachines((r) => r.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} placeholder="Harvester #1" />
                      <button onClick={() => setMachines((r) => r.filter((_, j) => j !== i))} className="grid place-items-center h-9 w-9 rounded-lg hover:bg-bg btn-press shrink-0" style={{ color: "var(--muted)" }} aria-label={t("Remove")}><Icon name="x" size={15} /></button>
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
              <button onClick={() => setMachines((r) => [...r, { name: "", machineType: "Tractor", year: "", diesel: "", downtime: "" }])} className="text-sm font-semibold btn-press mb-5 block" style={{ color: "var(--green-deep)" }}>{t("+ Add machine")}</button>

              <label className="kpi-label">{t("Crews")}</label>
              <div className="space-y-2 mt-2 mb-4">
                {crews.map((c, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center">
                    <input className="setinput col-span-7 sm:col-span-8" value={c.name} onChange={(e) => setCrews((r) => r.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} placeholder="Crew A" />
                    <input className="setinput col-span-4 sm:col-span-3" value={c.workers} onChange={(e) => setCrews((r) => r.map((x, j) => j === i ? { ...x, workers: e.target.value } : x))} placeholder={t("Workers")} inputMode="numeric" />
                    <button onClick={() => setCrews((r) => r.filter((_, j) => j !== i))} className="col-span-1 grid place-items-center h-9 rounded-lg hover:bg-bg btn-press" style={{ color: "var(--muted)" }} aria-label={t("Remove")}><Icon name="x" size={15} /></button>
                  </div>
                ))}
              </div>
              <button onClick={() => setCrews((r) => [...r, { name: "", workers: "" }])} className="text-sm font-semibold btn-press mb-5 block" style={{ color: "var(--green-deep)" }}>{t("+ Add crew")}</button>

              <label className="kpi-label">{t("Inventory")}</label>
              <div className="space-y-2 mt-2">
                {inventory.map((x, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center">
                    <input className="setinput col-span-6" value={x.name} onChange={(e) => setInventory((r) => r.map((y, j) => j === i ? { ...y, name: e.target.value } : y))} placeholder={t("Item")} />
                    <input className="setinput col-span-3" value={x.qty} onChange={(e) => setInventory((r) => r.map((y, j) => j === i ? { ...y, qty: e.target.value } : y))} placeholder={t("Qty")} inputMode="numeric" />
                    <input className="setinput col-span-2" value={x.unit} onChange={(e) => setInventory((r) => r.map((y, j) => j === i ? { ...y, unit: e.target.value } : y))} placeholder={t("Unit")} />
                    <button onClick={() => setInventory((r) => r.filter((_, j) => j !== i))} className="col-span-1 grid place-items-center h-9 rounded-lg hover:bg-bg btn-press" style={{ color: "var(--muted)" }} aria-label={t("Remove")}><Icon name="x" size={15} /></button>
                  </div>
                ))}
              </div>
              <button onClick={() => setInventory((r) => [...r, { name: "", qty: "", unit: "units" }])} className="mt-3 text-sm font-semibold btn-press" style={{ color: "var(--green-deep)" }}>{t("+ Add item")}</button>
            </>
          )}

          {step === 4 && (
            <>
              <h1 className="text-xl font-extrabold tracking-tight mb-1">{t("Ready to go")}</h1>
              <p className="text-sm text-muted mb-6">{t("Here's your workspace. You can edit everything later.")}</p>
              <div className="rounded-xl border border-line p-4 space-y-3">
                <div><p className="kpi-label">{t("Farm")}</p><p className="font-bold mt-1">{name} <span className="text-muted font-normal">· {location} · {currency} · {timezone}</span></p></div>
                <div><p className="kpi-label">{t("Parcels")} ({parcels.filter((p) => p.name.trim()).length})</p>
                  <div className="mt-1 space-y-1">{parcels.filter((p) => p.name.trim()).map((p, i) => <div key={i} className="flex justify-between text-sm"><span className="font-medium">{p.name}</span><span className="text-muted">{t(canonCrop(p.crop))} · {p.area} ac</span></div>)}</div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div><p className="kpi-label">{t("Team")}</p><p className="font-bold mt-1">{members.filter((m) => m.name.trim()).length}</p></div>
                  <div><p className="kpi-label">{t("Machines")} + {t("Crews")}</p><p className="font-bold mt-1">{machines.filter((m) => m.name.trim()).length + crews.filter((c) => c.name.trim()).length}</p></div>
                  <div><p className="kpi-label">{t("Inventory")}</p><p className="font-bold mt-1">{inventory.filter((x) => x.name.trim()).length}</p></div>
                </div>
              </div>
              <p className="text-[11px] text-muted mt-3">{t("Demo: in production this creates your farm in your account. Today it opens the live demo dashboard.")}</p>
            </>
          )}

          <div className="flex items-center justify-between mt-7">
            <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="text-sm font-semibold px-4 py-2.5 rounded-full disabled:opacity-30 hover:bg-bg btn-press">{t("Back")}</button>
            {step < STEPS.length - 1
              ? <button onClick={next} className="text-sm font-bold px-6 py-2.5 rounded-full btn-press" style={{ background: "var(--green)", color: "var(--ink)" }}>{t("Continue")}</button>
              : <button onClick={finish} className="text-sm font-bold px-6 py-2.5 rounded-full btn-press" style={{ background: "var(--green)", color: "var(--ink)" }}>{t("Open my dashboard →")}</button>}
          </div>
        </div>
      </div>
    </div>
  );
}
