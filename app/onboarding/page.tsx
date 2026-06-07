"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
import { Icon } from "@/components/Icon";
import { Field } from "@/components/auth/AuthShell";
import { farmBasicsSchema, parcelSchema, fieldErrors } from "@/lib/schemas";
import { farmFromDraft } from "@/lib/farmFactory";
import { MarketingLangToggle } from "@/components/MarketingLangToggle";
import { useMarketingT } from "@/lib/lang";
import type { Farm } from "@/lib/types";

const CROPS = ["Grain sorghum", "Upland cotton", "Sweet corn", "Grapefruit", "Leaf lettuce", "Watermelon", "Winter wheat", "Peanuts"];
const STEPS = ["Your farm", "Parcels", "Review"];

interface ParcelRow { name: string; crop: string; area: string }

export default function OnboardingPage() {
  const router = useRouter();
  const t = useMarketingT();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [parcels, setParcels] = useState<ParcelRow[]>([{ name: "", crop: CROPS[0], area: "" }]);
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
    // Build a real Farm and persist it locally (the contract for
    // repo.createFarm() once Supabase lands), then make it the active farm.
    try {
      const farm = farmFromDraft({ name, location, parcels });
      const existing = JSON.parse(window.localStorage.getItem("fp_farms") || "[]") as Farm[];
      existing.push(farm);
      window.localStorage.setItem("fp_farms", JSON.stringify(existing));
      window.localStorage.setItem("fp_farm", farm.id); // open straight into it
    } catch { /* ignore */ }
    router.push("/dashboard");
  }

  function setParcel(i: number, patch: Partial<ParcelRow>) {
    setParcels((p) => p.map((row, j) => (j === i ? { ...row, ...patch } : row)));
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <div className="h-1" style={{ background: "var(--line)" }}>
        <div className="h-full" style={{ width: `${((step + 1) / STEPS.length) * 100}%`, background: "var(--green)", transition: "width .4s ease" }} />
      </div>

      <div className="max-w-xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2.5"><BrandMark size={28} /><span className="font-bold tracking-tight text-lg">FarmPredictor</span></div>
          <MarketingLangToggle />
        </div>

        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <span className="grid place-items-center h-6 w-6 rounded-full text-[11px] font-bold" style={{ background: i <= step ? "var(--ink)" : "var(--line)", color: i <= step ? "#fff" : "var(--muted)" }}>{i < step ? "✓" : i + 1}</span>
              <span className="text-xs font-semibold" style={{ color: i === step ? "var(--ink)" : "var(--muted)" }}>{t(s)}</span>
              {i < STEPS.length - 1 && <span className="w-6 h-px" style={{ background: "var(--line)" }} />}
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
            </>
          )}

          {step === 1 && (
            <>
              <h1 className="text-xl font-extrabold tracking-tight mb-1">{t("Add your parcels")}</h1>
              <p className="text-sm text-muted mb-5">{t("Start with a few — you can refine later.")}</p>
              <div className="space-y-3">
                {parcels.map((p, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center">
                    <input className="setinput col-span-12 sm:col-span-4" value={p.name} onChange={(e) => setParcel(i, { name: e.target.value })} placeholder="North A" />
                    <select className="setinput col-span-6 sm:col-span-5" value={p.crop} onChange={(e) => setParcel(i, { crop: e.target.value })}>
                      {CROPS.map((c) => <option key={c} value={c}>{t(c)}</option>)}
                    </select>
                    <input className="setinput col-span-4 sm:col-span-2" value={p.area} onChange={(e) => setParcel(i, { area: e.target.value })} placeholder="ac" inputMode="numeric" />
                    <button onClick={() => setParcels((pp) => pp.length > 1 ? pp.filter((_, j) => j !== i) : pp)} className="col-span-2 sm:col-span-1 grid place-items-center h-9 rounded-lg hover:bg-bg btn-press" style={{ color: "var(--muted)" }} aria-label={t("Remove")}><Icon name="x" size={15} /></button>
                  </div>
                ))}
              </div>
              {errors.parcels && <p className="text-xs mt-2" style={{ color: "var(--warn)" }}>{errors.parcels}</p>}
              <button onClick={() => setParcels((p) => [...p, { name: "", crop: CROPS[0], area: "" }])} className="mt-4 text-sm font-semibold btn-press" style={{ color: "var(--green-deep)" }}>{t("+ Add parcel")}</button>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="text-xl font-extrabold tracking-tight mb-1">{t("Ready to go")}</h1>
              <p className="text-sm text-muted mb-6">{t("Here's your workspace. You can edit everything later.")}</p>
              <div className="rounded-xl border border-line p-4 mb-2">
                <p className="kpi-label">{t("Farm")}</p>
                <p className="font-bold mt-1">{name} <span className="text-muted font-normal">· {location}</span></p>
                <p className="kpi-label mt-4">{t("Parcels")} ({parcels.length})</p>
                <div className="mt-2 space-y-1.5">
                  {parcels.map((p, i) => (
                    <div key={i} className="flex justify-between text-sm"><span className="font-medium">{p.name || "—"}</span><span className="text-muted">{t(p.crop)} · {p.area} ac</span></div>
                  ))}
                </div>
              </div>
              <p className="text-[11px] text-muted">{t("Demo: in production this creates your farm in your account. Today it opens the live demo dashboard.")}</p>
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
