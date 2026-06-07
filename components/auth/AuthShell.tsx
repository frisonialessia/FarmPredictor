"use client";
import Link from "next/link";
import Image from "next/image";
import { BrandMark } from "@/components/BrandMark";
import { MarketingLangToggle } from "@/components/MarketingLangToggle";
import { useMarketingT } from "@/lib/lang";

// Split-screen auth layout: brand panel (photo) on the left, form on the right.
export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  const t = useMarketingT();
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,#0B0F0C,#143b1f 58%,#1d5c2e)" }} />
        <Image src="/hero.jpg" alt="" fill priority sizes="50vw" style={{ objectFit: "cover", objectPosition: "center 42%", filter: "saturate(0.82) brightness(0.7) contrast(1.05)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(120deg,rgba(11,15,12,.92),rgba(11,15,12,.55) 70%,rgba(20,59,31,.4))" }} />
        <Link href="/" className="relative flex items-center gap-2.5"><BrandMark size={30} /><span className="font-bold tracking-tight text-white text-lg">FarmPredictor</span></Link>
        <div className="relative">
          <h2 className="text-white font-extrabold tracking-tight leading-[1.1]" style={{ fontSize: "clamp(1.8rem,2.6vw,2.6rem)" }}>{t("Harvest when you")}<br />{t("actually")} <span style={{ color: "var(--lime)" }}>{t("can")}</span>.</h2>
          <ul className="mt-6 space-y-2.5">
            {["Plan and simulator on one engine", "The gap to optimal, measured in dollars", "Live weather, no jargon"].map((s) => (
              <li key={s} className="flex items-center gap-2.5 text-sm" style={{ color: "rgba(255,255,255,.82)" }}>
                <span className="grid place-items-center h-5 w-5 rounded-full shrink-0" style={{ background: "rgba(133,223,66,.2)", color: "var(--lime)" }}>✓</span>{t(s)}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs" style={{ color: "rgba(255,255,255,.5)" }}>{t("Prototype · demo data")}</p>
      </div>

      {/* form panel */}
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16" style={{ background: "var(--bg)" }}>
        <div className="w-full max-w-sm mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Link href="/" className="lg:hidden flex items-center gap-2.5"><BrandMark size={28} /><span className="font-bold tracking-tight text-lg">FarmPredictor</span></Link>
            <div className="ml-auto"><MarketingLangToggle /></div>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
          <p className="text-sm text-muted mt-1.5 mb-7">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

export function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  const t = useMarketingT();
  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold mb-1.5" style={{ color: error ? "var(--warn)" : "var(--muted)" }}>{label}</label>
      {children}
      {error && <p className="text-xs mt-1" style={{ color: "var(--warn)" }}>{t(error)}</p>}
    </div>
  );
}
