"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
import { Icon } from "@/components/Icon";
import { Field } from "@/components/auth/AuthShell";
import { farmBasicsSchema, parcelSchema, fieldErrors } from "@/lib/schemas";

const CROPS = ["Grain sorghum", "Upland cotton", "Sweet corn", "Grapefruit", "Leaf lettuce", "Watermelon", "Winter wheat", "Peanuts"];
const STEPS = ["Your farm", "Parcels", "Review"];

interface ParcelRow { name: string; crop: string; area: string }

export default function OnboardingPage() {
  const router = useRouter();
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
        if (!r.success) return setErrors({ parcels: "Complete every parcel (name, crop, area > 0)." });
      }
    }
    setErrors({});
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  }

  function finish() {
    // Mock persistence — the contract for repo.createFarm() once Supabase lands.
    try {
      window.localStorage.setItem("fp_onboarding", JSON.stringify({ name, location, parcels }));
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
        <div className="flex items-center gap-2.5 mb-8"><BrandMark size={28} /><span className="font-bold tracking-tight text-lg">FarmPredictor</span></div>

        <div className="flex items-center gap-2 mb-6">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <span className="grid place-items-center h-6 w-6 rounded-full text-[11px] font-bold" style={{ background: i <= step ? "var(--ink)" : "var(--line)", color: i <= step ? "#fff" : "var(--muted)" }}>{i < step ? "✓" : i + 1}</span>
              <span className="text-xs font-semibold" style={{ color: i === step ? "var(--ink)" : "var(--muted)" }}>{s}</span>
              {i < STEPS.length - 1 && <span className="w-6 h-px" style={{ background: "var(--line)" }} />}
            </div>
          ))}
        </div>

        <div className="card p-7">
          {step === 0 && (
            <>
              <h1 className="text-xl font-extrabold tracking-tight mb-1">Let&apos;s set up your farm</h1>
              <p className="text-sm text-muted mb-6">We use this to localize weather and decisions.</p>
              <Field label="Farm name" error={errors.name}>
                <input className="setinput" value={name} onChange={(e) => setName(e.target.value)} placeholder="Rio Verde Farms" />
              </Field>
              <Field label="Location (county, region)" error={errors.location}>
                <input className="setinput" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Hidalgo County, TX" />
              </Field>
            </>
          )}

          {step === 1 && (
            <>
              <h1 className="text-xl font-extrabold tracking-tight mb-1">Add your parcels</h1>
              <p className="text-sm text-muted mb-5">Start with a few — you can refine later.</p>
              <div className="space-y-3">
                {parcels.map((p, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center">
                    <input className="setinput col-span-4" value={p.name} onChange={(e) => setParcel(i, { name: e.target.value })} placeholder="North A" />
                    <select className="setinput col-span-5" value={p.crop} onChange={(e) => setParcel(i, { crop: e.target.value })}>
                      {CROPS.map((c) => <option key={c}>{c}</option>)}
                    </select>
                    <input className="setinput col-span-2" value={p.area} onChange={(e) => setParcel(i, { area: e.target.value })} placeholder="ac" inputMode="numeric" />
                    <button onClick={() => setParcels((pp) => pp.length > 1 ? pp.filter((_, j) => j !== i) : pp)} className="col-span-1 grid place-items-center h-9 rounded-lg hover:bg-bg" style={{ color: "var(--muted)" }} aria-label="Remove"><Icon name="x" size={15} /></button>
                  </div>
                ))}
              </div>
              {errors.parcels && <p className="text-xs mt-2" style={{ color: "var(--warn)" }}>{errors.parcels}</p>}
              <button onClick={() => setParcels((p) => [...p, { name: "", crop: CROPS[0], area: "" }])} className="mt-4 text-sm font-semibold btn-press" style={{ color: "var(--green-deep)" }}>+ Add parcel</button>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="text-xl font-extrabold tracking-tight mb-1">Ready to go</h1>
              <p className="text-sm text-muted mb-6">Here&apos;s your workspace. You can edit everything later.</p>
              <div className="rounded-xl border border-line p-4 mb-2">
                <p className="kpi-label">Farm</p>
                <p className="font-bold mt-1">{name} <span className="text-muted font-normal">· {location}</span></p>
                <p className="kpi-label mt-4">Parcels ({parcels.length})</p>
                <div className="mt-2 space-y-1.5">
                  {parcels.map((p, i) => (
                    <div key={i} className="flex justify-between text-sm"><span className="font-medium">{p.name || "—"}</span><span className="text-muted">{p.crop} · {p.area} ac</span></div>
                  ))}
                </div>
              </div>
              <p className="text-[11px] text-muted">Demo: in production this creates your farm in your account. Today it opens the live demo dashboard.</p>
            </>
          )}

          <div className="flex items-center justify-between mt-7">
            <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="text-sm font-semibold px-4 py-2.5 rounded-full disabled:opacity-30 hover:bg-bg btn-press">Back</button>
            {step < STEPS.length - 1
              ? <button onClick={next} className="text-sm font-bold px-6 py-2.5 rounded-full btn-press" style={{ background: "var(--green)", color: "var(--ink)" }}>Continue</button>
              : <button onClick={finish} className="text-sm font-bold px-6 py-2.5 rounded-full btn-press" style={{ background: "var(--green)", color: "var(--ink)" }}>Open my dashboard →</button>}
          </div>
        </div>
      </div>
    </div>
  );
}
