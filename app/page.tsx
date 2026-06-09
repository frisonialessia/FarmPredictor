"use client";
import Link from "next/link";
import Image from "next/image";
import { BrandMark } from "@/components/BrandMark";
import { Icon } from "@/components/Icon";
import { DashboardMockup } from "@/components/DashboardMockup";
import { MarketingLangToggle } from "@/components/MarketingLangToggle";
import { useMarketingT } from "@/lib/lang";

export default function Landing() {
  const t = useMarketingT();
  return (
    <div>
      {/* Dark brand header — deliberate colour, not the old washed-out grey. */}
      <nav className="fixed top-0 left-0 right-0 z-50" style={{ background: "rgba(11,15,12,.72)", backdropFilter: "blur(14px)", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5"><BrandMark size={28} /><span className="font-bold tracking-tight text-white">FarmPredictor</span></div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ color: "rgba(255,255,255,.7)" }}>
            <a href="#how" className="hover:text-white transition-colors">{t("How it works")}</a>
            <a href="#diff" className="hover:text-white transition-colors">{t("Why us")}</a>
            <Link href="/pricing" className="hover:text-white transition-colors">{t("Pricing")}</Link>
          </div>
          <div className="flex items-center gap-3">
            <MarketingLangToggle dark />
            <Link href="/login" className="text-sm font-semibold hidden sm:block" style={{ color: "rgba(255,255,255,.8)" }}>{t("Sign in")}</Link>
            <Link href="/signup" className="rounded-full px-5 py-2 text-sm font-semibold btn-press" style={{ background: "var(--green)", color: "var(--ink)" }}>{t("Get started")}</Link>
          </div>
        </div>
      </nav>

      <header className="relative overflow-hidden pt-36 pb-28">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,#0B0F0C,#143b1f 58%,#1d5c2e)" }} />
        <Image src="/hero.jpg" alt="" fill priority quality={68} sizes="100vw" style={{ objectFit: "cover", objectPosition: "center 42%", filter: "saturate(0.82) brightness(0.82) contrast(1.06)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(11,15,12,.6) 0%, rgba(11,15,12,0) 42%), linear-gradient(110deg, rgba(11,15,12,.93) 0%, rgba(11,15,12,.66) 40%, rgba(11,15,12,.34) 70%, rgba(11,15,12,.16) 100%)" }} />
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />

        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full mb-6" style={{ background: "rgba(133,223,66,.16)", color: "var(--lime)", border: "1px solid rgba(133,223,66,.3)" }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--lime)" }} />{t("For high-yield farms")}
            </span>
            <h1 className="text-white font-extrabold leading-[1.03] tracking-tight" style={{ fontSize: "clamp(2.6rem,6vw,5rem)" }}>{t("It's not")} <span style={{ color: "var(--lime)" }}>{t("when")}</span> {t("you should harvest.")}<br />{t("It's when you")} <span style={{ color: "var(--lime)" }}>{t("can.")}</span></h1>
            <p className="mt-6 text-lg max-w-xl" style={{ color: "rgba(255,255,255,.85)" }}>{t("FarmPredictor crosses your optimal harvest windows with the machinery, crews, supplies and weather you actually have. The gap between the two is margin — and we help you close it.")}</p>
            <div className="flex flex-wrap gap-3 mt-9">
              <Link href="/login" className="rounded-full px-7 py-3.5 text-sm font-semibold btn-press" style={{ background: "var(--green)", color: "var(--ink)" }}>{t("Try the live demo →")}</Link>
              <a href="#how" className="rounded-full px-7 py-3.5 text-sm font-semibold border grid place-items-center btn-press" style={{ borderColor: "rgba(255,255,255,.28)", color: "#fff" }}>{t("How it works")}</a>
            </div>
            <p className="text-xs mt-3" style={{ color: "rgba(255,255,255,.55)" }}>{t("No sign-up needed — explore with sample data.")}</p>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 mt-12">
              {[["$6,240", t("recoverable this week")], ["2.3 d", t("avg. optimal vs. actual")], ["1 engine", t("plan + simulator, one truth")]].map(([n, l]) => (
                <div key={l} className="flex items-baseline gap-2">
                  <span className="mono text-xl font-bold" style={{ color: "var(--lime)" }}>{n}</span>
                  <span className="text-xs" style={{ color: "rgba(255,255,255,.6)" }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <section id="how" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mb-14"><p className="text-sm font-semibold uppercase tracking-widest mb-3 text-green">{t("How it works")}</p><h2 className="font-extrabold tracking-tight leading-tight" style={{ fontSize: "clamp(2rem,4vw,3rem)" }}>{t("Three layers. One question: what do I do today?")}</h2></div>
          <div className="grid md:grid-cols-3 gap-6">
            {[["whatif", "Projected Loss Engine", "Compares live market value against production cost and daily crop degradation to pinpoint the optimal harvest day."], ["planner", "Execution planner", "Drag harvests across days and machines. Conflicts with crews, rigs and supplies surface instantly — margin recalculates live."], ["financial", "Decisions in money", "No NDVI charts. No jargon. Every alert says what to do today and what it's worth: \"Order 620 crates now, save $1,120.\""]].map(([icon, title, desc]) => (
              <div key={title} className="rounded-2xl p-8 border border-line" style={{ background: "var(--bg)", boxShadow: "var(--shadow-sm)" }}>
                <div className="grid place-items-center h-12 w-12 rounded-xl mb-5" style={{ background: "#fff", border: "1px solid var(--line)", color: "var(--green-deep)" }}><Icon name={icon} /></div>
                <h3 className="font-bold text-lg mb-2">{t(title)}</h3><p className="text-sm text-muted">{t(desc)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="diff" className="max-w-6xl mx-auto px-6 py-24">
        <div className="max-w-2xl mb-12"><p className="text-sm font-semibold uppercase tracking-widest mb-3 text-green">{t("Why us")}</p><h2 className="font-extrabold tracking-tight leading-tight" style={{ fontSize: "clamp(2rem,4vw,3rem)" }}>{t("Everyone else stops at \"the crop is ready.\"")}</h2></div>
        <div className="rounded-2xl overflow-hidden border border-line" style={{ boxShadow: "var(--shadow-md)" }}>
          <div className="grid md:grid-cols-2 text-sm">
            <div className="p-8 bg-white"><p className="font-semibold mb-5 text-muted">{t("Typical ag SaaS")}</p><ul className="space-y-4">{["Tells you crop health (NDVI, soil)", "Records what already happened", "Leaves you to translate data into action", "Ignores whether you can actually execute"].map((s) => (<li key={s} className="flex gap-3"><span style={{ color: "var(--warn)" }}>✕</span><span className="text-muted">{t(s)}</span></li>))}</ul></div>
            <div className="p-8 text-white" style={{ background: "var(--ink)" }}><p className="font-semibold mb-5" style={{ color: "var(--lime)" }}>FarmPredictor</p><ul className="space-y-4">{["Tells you what to do today, in dollars", "Crosses harvest timing with real capacity", "Detects the gap between optimal and possible", "Models machines, crews, supplies & weather together"].map((s) => (<li key={s} className="flex gap-3"><span style={{ color: "var(--lime)" }}>✓</span><span>{t(s)}</span></li>))}</ul></div>
          </div>
        </div>
      </section>

      <section className="bg-white border-t border-line py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mb-10"><p className="text-sm font-semibold uppercase tracking-widest mb-3 text-green">{t("The product")}</p><h2 className="font-extrabold tracking-tight leading-tight" style={{ fontSize: "clamp(2rem,4vw,3rem)" }}>{t("Your whole operation, on one screen.")}</h2><p className="text-muted mt-4 text-lg">{t("Margin at risk, today's decisions and the season trend — in your currency, no jargon.")}</p></div>
          <DashboardMockup />
          <div className="text-center mt-10">
            <Link href="/login" className="inline-block rounded-full px-8 py-4 text-sm font-semibold btn-press" style={{ background: "var(--ink)", color: "#fff" }}>{t("Try the live demo →")}</Link>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="relative rounded-[28px] p-10 md:p-16 text-center overflow-hidden" style={{ background: "linear-gradient(135deg,#143b1f,#1d5c2e)" }}>
          {/* Lightweight noise texture (was a 3.2MB raw hero.jpg — perf). */}
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />
          <div className="relative">
            <h2 className="text-white font-extrabold tracking-tight leading-tight" style={{ fontSize: "clamp(2rem,4.5vw,3.4rem)" }}>{t("See your margin before")}<br />{t("it walks off the field.")}</h2>
            <div className="flex flex-wrap gap-3 justify-center mt-8">
              <Link href="/login" className="inline-block rounded-full px-8 py-4 text-sm font-semibold btn-press" style={{ background: "var(--green)", color: "var(--ink)" }}>{t("Try the live demo →")}</Link>
              <Link href="/signup" className="inline-block rounded-full px-8 py-4 text-sm font-semibold border btn-press" style={{ borderColor: "rgba(255,255,255,.3)", color: "#fff" }}>{t("Create your farm →")}</Link>
            </div>
            <p className="text-xs mt-4" style={{ color: "rgba(255,255,255,.7)" }}>{t("Explore with sample data, or build your own farm in 5 minutes.")}</p>
          </div>
        </div>
      </section>

      <footer className="border-t border-line py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-between gap-4 text-sm text-muted">
          <div className="flex items-center gap-2.5"><BrandMark size={22} /><span className="font-semibold text-ink">FarmPredictor</span></div>
          <p>{t("Prototype · demo data · built for Texas high-yield operations")}</p>
        </div>
      </footer>
    </div>
  );
}
