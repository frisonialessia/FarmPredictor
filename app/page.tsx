import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { Icon } from "@/components/Icon";

export default function Landing() {
  return (
    <div>
      {/* Dark brand header — deliberate colour, not the old washed-out grey. */}
      <nav className="fixed top-0 left-0 right-0 z-50" style={{ background: "rgba(11,15,12,.72)", backdropFilter: "blur(14px)", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5"><BrandMark size={28} /><span className="font-bold tracking-tight text-white">FarmPredictor</span></div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ color: "rgba(255,255,255,.7)" }}>
            <a href="#problem" className="hover:text-white transition-colors">The problem</a>
            <a href="#how" className="hover:text-white transition-colors">How it works</a>
            <a href="#diff" className="hover:text-white transition-colors">Why us</a>
          </div>
          <Link href="/dashboard" className="rounded-full px-5 py-2 text-sm font-semibold btn-press" style={{ background: "var(--green)", color: "var(--ink)" }}>Open dashboard</Link>
        </div>
      </nav>

      <header className="relative overflow-hidden pt-36 pb-28">
        {/* Layer 0: gradient base (also the graceful fallback if the photo is absent). */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,#0B0F0C,#143b1f 58%,#1d5c2e)" }} />
        {/* Layer 1: aerial farm photo — drop your image at public/hero.jpg. */}
        <div className="absolute inset-0" style={{ backgroundImage: "url(/hero.jpg)", backgroundSize: "cover", backgroundPosition: "center" }} />
        {/* Layer 2: dark overlay so the headline always stays legible. */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(120deg,rgba(11,15,12,.92) 0%,rgba(11,15,12,.72) 38%,rgba(20,59,31,.55) 70%,rgba(29,92,46,.35) 100%)" }} />
        {/* subtle grain for depth */}
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />

        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full mb-6" style={{ background: "rgba(133,223,66,.16)", color: "var(--lime)", border: "1px solid rgba(133,223,66,.3)" }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--lime)" }} />For high-yield farms
            </span>
            <h1 className="text-white font-extrabold leading-[1.03] tracking-tight" style={{ fontSize: "clamp(2.6rem,6vw,5rem)" }}>It&apos;s not <span style={{ color: "var(--lime)" }}>when</span> you should harvest.<br />It&apos;s when you <span style={{ color: "var(--lime)" }}>can</span>.</h1>
            <p className="mt-6 text-lg max-w-xl" style={{ color: "rgba(255,255,255,.85)" }}>FarmPredictor crosses your optimal harvest windows with the machinery, crews, supplies and weather you actually have. The gap between the two is margin — and we help you close it.</p>
            <div className="flex flex-wrap gap-3 mt-9">
              <Link href="/dashboard" className="rounded-full px-7 py-3.5 text-sm font-semibold btn-press" style={{ background: "var(--green)", color: "var(--ink)" }}>See it live →</Link>
              <a href="#how" className="rounded-full px-7 py-3.5 text-sm font-semibold border grid place-items-center btn-press" style={{ borderColor: "rgba(255,255,255,.28)", color: "#fff" }}>How it works</a>
            </div>
            {/* trust band */}
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 mt-12">
              {[["$6,240", "recoverable this week"], ["2.3 d", "avg. optimal vs. actual"], ["1 engine", "plan + simulator, one truth"]].map(([n, l]) => (
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
          <div className="max-w-2xl mb-14"><p className="text-sm font-semibold uppercase tracking-widest mb-3 text-green">How it works</p><h2 className="font-extrabold tracking-tight leading-tight" style={{ fontSize: "clamp(2rem,4vw,3rem)" }}>Three layers. One question: what do I do today?</h2></div>
          <div className="grid md:grid-cols-3 gap-6">
            {[["whatif", "Projected Loss Engine", "Compares live market value against production cost and daily crop degradation to pinpoint the optimal harvest day."], ["planner", "Execution planner", "Drag harvests across days and machines. Conflicts with crews, rigs and supplies surface instantly — margin recalculates live."], ["financial", "Decisions in dollars", "No NDVI charts. No jargon. Every alert says what to do today and what it's worth: \"Order 620 crates now, save $1,120.\""]].map(([icon, title, desc]) => (
              <div key={title} className="rounded-2xl p-8 border border-line" style={{ background: "var(--bg)", boxShadow: "var(--shadow-sm)" }}>
                <div className="grid place-items-center h-12 w-12 rounded-xl mb-5" style={{ background: "#fff", border: "1px solid var(--line)", color: "var(--green-deep)" }}><Icon name={icon} /></div>
                <h3 className="font-bold text-lg mb-2">{title}</h3><p className="text-sm text-muted">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="diff" className="max-w-6xl mx-auto px-6 py-24">
        <div className="max-w-2xl mb-12"><p className="text-sm font-semibold uppercase tracking-widest mb-3 text-green">Why us</p><h2 className="font-extrabold tracking-tight leading-tight" style={{ fontSize: "clamp(2rem,4vw,3rem)" }}>Everyone else stops at &quot;the crop is ready.&quot;</h2></div>
        <div className="rounded-2xl overflow-hidden border border-line" style={{ boxShadow: "var(--shadow-md)" }}>
          <div className="grid md:grid-cols-2 text-sm">
            <div className="p-8 bg-white"><p className="font-semibold mb-5 text-muted">Typical ag SaaS</p><ul className="space-y-4">{["Tells you crop health (NDVI, soil)", "Records what already happened", "Leaves you to translate data into action", "Ignores whether you can actually execute"].map((t) => (<li key={t} className="flex gap-3"><span style={{ color: "var(--warn)" }}>✕</span><span className="text-muted">{t}</span></li>))}</ul></div>
            <div className="p-8 text-white" style={{ background: "var(--ink)" }}><p className="font-semibold mb-5" style={{ color: "var(--lime)" }}>FarmPredictor</p><ul className="space-y-4">{["Tells you what to do today, in dollars", "Crosses harvest timing with real capacity", "Detects the gap between optimal and possible", "Models machines, crews, supplies & weather together"].map((t) => (<li key={t} className="flex gap-3"><span style={{ color: "var(--lime)" }}>✓</span><span>{t}</span></li>))}</ul></div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="relative rounded-[28px] p-10 md:p-16 text-center overflow-hidden" style={{ background: "linear-gradient(135deg,#143b1f,#1d5c2e)" }}>
          <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "url(/hero.jpg)", backgroundSize: "cover", backgroundPosition: "center" }} />
          <div className="relative">
            <h2 className="text-white font-extrabold tracking-tight leading-tight" style={{ fontSize: "clamp(2rem,4.5vw,3.4rem)" }}>See your margin before<br />it walks off the field.</h2>
            <Link href="/dashboard" className="inline-block rounded-full px-8 py-4 text-sm font-semibold mt-8 btn-press" style={{ background: "var(--green)", color: "var(--ink)" }}>Open the live dashboard →</Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-line py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-between gap-4 text-sm text-muted">
          <div className="flex items-center gap-2.5"><BrandMark size={22} /><span className="font-semibold text-ink">FarmPredictor</span></div>
          <p>Prototype · demo data · built for Texas high-yield operations</p>
        </div>
      </footer>
    </div>
  );
}
