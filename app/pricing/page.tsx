"use client";
import { useState } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { Icon } from "@/components/Icon";

// Pricing reflects the plans seeded in supabase/seed.sql. Numbers are
// placeholders — adjust once you validate willingness to pay with design partners.
interface Tier {
  id: string;
  name: string;
  blurb: string;
  monthly: number | null; // null = custom
  features: string[];
  notIncluded: string[];
  highlight?: boolean;
  cta: string;
}

const TIERS: Tier[] = [
  {
    id: "starter", name: "Starter", blurb: "For a single farm getting started.",
    monthly: 0,
    features: ["1 farm", "Execution planner", "Up to 50 simulations / mo", "Live weather"],
    notIncluded: ["What-if simulator", "Scheduling optimizer"],
    cta: "Start free",
  },
  {
    id: "pro", name: "Pro", blurb: "For operations running multiple farms.",
    monthly: 149, highlight: true,
    features: ["Up to 10 farms", "Execution planner", "What-if simulator", "1,000 simulations / mo", "Live weather + market prices", "Email support"],
    notIncluded: ["Scheduling optimizer (ML)"],
    cta: "Start 14-day trial",
  },
  {
    id: "enterprise", name: "Enterprise", blurb: "For large operations & co-ops.",
    monthly: null,
    features: ["Unlimited farms", "Everything in Pro", "Scheduling optimizer (ML)", "Anonymous benchmarking", "SSO + audit logs", "Priority support & SLA"],
    notIncluded: [],
    cta: "Talk to us",
  },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(true);

  const price = (t: Tier) => {
    if (t.monthly === null) return "Custom";
    if (t.monthly === 0) return "$0";
    return annual ? `$${Math.round((t.monthly * 10) / 12)}` : `$${t.monthly}`;
  };

  return (
    <div style={{ background: "var(--bg)" }} className="min-h-screen">
      <nav className="border-b border-line bg-white">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5"><BrandMark size={28} /><span className="font-bold tracking-tight">FarmPredictor</span></Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-semibold text-muted hidden sm:block">Sign in</Link>
            <Link href="/signup" className="rounded-full px-5 py-2 text-sm font-semibold btn-press" style={{ background: "var(--green)", color: "var(--ink)" }}>Get started</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-sm font-semibold uppercase tracking-widest mb-3 text-green">Pricing</p>
          <h1 className="font-extrabold tracking-tight leading-tight" style={{ fontSize: "clamp(2rem,4vw,3rem)" }}>Priced on the margin you save.</h1>
          <p className="text-muted mt-4 text-lg">Start free, upgrade when a farm pays for itself. No credit card to begin.</p>
        </div>

        {/* billing toggle */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <span className="text-sm font-semibold" style={{ color: annual ? "var(--muted)" : "var(--ink)" }}>Monthly</span>
          <button onClick={() => setAnnual((a) => !a)} className="relative h-7 w-12 rounded-full" style={{ background: "var(--green)" }} aria-label="Toggle billing period">
            <span className="absolute top-1 h-5 w-5 rounded-full bg-white" style={{ left: annual ? 24 : 4, transition: "left .2s" }} />
          </button>
          <span className="text-sm font-semibold" style={{ color: annual ? "var(--ink)" : "var(--muted)" }}>Annual</span>
          <span className="pill pill-mint">2 months free</span>
        </div>

        <div className="grid md:grid-cols-3 gap-6 items-start">
          {TIERS.map((t) => (
            <div key={t.id} className="card p-7 relative" style={t.highlight ? { borderColor: "var(--green)", boxShadow: "var(--shadow-lg)" } : undefined}>
              {t.highlight && <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full" style={{ background: "var(--ink)", color: "var(--lime)" }}>Most popular</span>}
              <h3 className="text-lg font-extrabold">{t.name}</h3>
              <p className="text-xs text-muted mt-1 mb-5 min-h-[32px]">{t.blurb}</p>
              <div className="flex items-end gap-1.5 mb-1">
                <span className="mono text-4xl font-bold">{price(t)}</span>
                {t.monthly !== null && t.monthly > 0 && <span className="text-sm text-muted mb-1.5">/ mo</span>}
              </div>
              <p className="text-[11px] text-muted mb-6 min-h-[16px]">{t.monthly && t.monthly > 0 ? (annual ? "billed annually" : "billed monthly") : t.monthly === 0 ? "free forever" : "tailored to your operation"}</p>
              <Link href={t.id === "enterprise" ? "/signup" : "/signup"} className="block text-center rounded-full py-2.5 text-sm font-semibold btn-press mb-6" style={t.highlight ? { background: "var(--green)", color: "var(--ink)" } : { background: "var(--ink)", color: "#fff" }}>{t.cta}</Link>
              <ul className="space-y-2.5">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm"><span className="grid place-items-center h-5 w-5 rounded-full shrink-0 mt-px" style={{ background: "rgba(82,200,113,.14)", color: "var(--green-deep)" }}><Icon name="check" size={12} /></span>{f}</li>
                ))}
                {t.notIncluded.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-muted"><span className="grid place-items-center h-5 w-5 rounded-full shrink-0 mt-px" style={{ background: "var(--bg)" }}><Icon name="x" size={11} /></span>{f}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-muted mt-10 max-w-xl mx-auto">
          Heavy ML optimizer runs beyond your plan&apos;s monthly allowance are metered as add-on usage. Prototype · demo data — final pricing TBD with design partners.
        </p>
      </div>
    </div>
  );
}
