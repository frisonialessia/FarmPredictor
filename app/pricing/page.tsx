"use client";
import { useState } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { Icon } from "@/components/Icon";
import { MarketingLangToggle } from "@/components/MarketingLangToggle";
import { useMarketingT } from "@/lib/lang";

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
  const tr = useMarketingT();

  const price = (tier: Tier) => {
    if (tier.monthly === null) return tr("Custom");
    if (tier.monthly === 0) return "$0";
    return annual ? `$${Math.round((tier.monthly * 10) / 12)}` : `$${tier.monthly}`;
  };

  return (
    <div style={{ background: "var(--bg)" }} className="min-h-screen">
      <nav className="border-b border-line bg-white">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5"><BrandMark size={28} /><span className="font-bold tracking-tight">FarmPredictor</span></Link>
          <div className="flex items-center gap-3">
            <MarketingLangToggle />
            <Link href="/login" className="text-sm font-semibold text-muted hidden sm:block">{tr("Sign in")}</Link>
            <Link href="/signup" className="rounded-full px-5 py-2 text-sm font-semibold btn-press" style={{ background: "var(--green)", color: "var(--ink)" }}>{tr("Get started")}</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-sm font-semibold uppercase tracking-widest mb-3 text-green">{tr("Pricing")}</p>
          <h1 className="font-extrabold tracking-tight leading-tight" style={{ fontSize: "clamp(2rem,4vw,3rem)" }}>{tr("Priced on the margin you save.")}</h1>
          <p className="text-muted mt-4 text-lg">{tr("Start free, upgrade when a farm pays for itself. No credit card to begin.")}</p>
        </div>

        {/* billing toggle */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <span className="text-sm font-semibold" style={{ color: annual ? "var(--muted)" : "var(--ink)" }}>{tr("Monthly")}</span>
          <button onClick={() => setAnnual((a) => !a)} className="relative h-7 w-12 rounded-full" style={{ background: "var(--green)" }} aria-label="Toggle billing period">
            <span className="absolute top-1 h-5 w-5 rounded-full bg-white" style={{ left: annual ? 24 : 4, transition: "left .2s" }} />
          </button>
          <span className="text-sm font-semibold" style={{ color: annual ? "var(--ink)" : "var(--muted)" }}>{tr("Annual")}</span>
          <span className="pill pill-mint">{tr("2 months free")}</span>
        </div>

        <div className="grid md:grid-cols-3 gap-6 items-start">
          {TIERS.map((tier) => (
            <div key={tier.id} className="card p-7 relative" style={tier.highlight ? { borderColor: "var(--green)", boxShadow: "var(--shadow-lg)" } : undefined}>
              {tier.highlight && <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full" style={{ background: "var(--ink)", color: "var(--lime)" }}>{tr("Most popular")}</span>}
              <h3 className="text-lg font-extrabold">{tier.name}</h3>
              <p className="text-xs text-muted mt-1 mb-5 min-h-[32px]">{tr(tier.blurb)}</p>
              <div className="flex items-end gap-1.5 mb-1">
                <span className="mono text-4xl font-bold">{price(tier)}</span>
                {tier.monthly !== null && tier.monthly > 0 && <span className="text-sm text-muted mb-1.5">/ {tr("mo")}</span>}
              </div>
              <p className="text-[11px] text-muted mb-6 min-h-[16px]">{tier.monthly && tier.monthly > 0 ? (annual ? tr("billed annually") : tr("billed monthly")) : tier.monthly === 0 ? tr("free forever") : tr("tailored to your operation")}</p>
              <Link href="/signup" className="block text-center rounded-full py-2.5 text-sm font-semibold btn-press mb-6" style={tier.highlight ? { background: "var(--green)", color: "var(--ink)" } : { background: "var(--ink)", color: "#fff" }}>{tr(tier.cta)}</Link>
              <ul className="space-y-2.5">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm"><span className="grid place-items-center h-5 w-5 rounded-full shrink-0 mt-px" style={{ background: "rgba(82,200,113,.14)", color: "var(--green-deep)" }}><Icon name="check" size={12} /></span>{tr(f)}</li>
                ))}
                {tier.notIncluded.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-muted"><span className="grid place-items-center h-5 w-5 rounded-full shrink-0 mt-px" style={{ background: "var(--bg)" }}><Icon name="x" size={11} /></span>{tr(f)}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-muted mt-10 max-w-xl mx-auto">
          {tr("Heavy ML optimizer runs beyond your plan's monthly allowance are metered as add-on usage. Prototype · demo data — final pricing TBD with design partners.")}
        </p>
      </div>
    </div>
  );
}
