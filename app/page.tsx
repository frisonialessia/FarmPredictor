import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { Icon } from "@/components/Icon";

export default function Landing() {
  return (
    <div>
      <nav className="fixed top-0 left-0 right-0 z-50" style={{ background: "rgba(243,246,242,.8)", backdropFilter: "blur(12px)", borderBottom: "1px solid var(--line)" }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5"><BrandMark size={28} /><span className="font-bold tracking-tight">FarmPredictor</span></div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted">
            <a href="#problem" className="hover:text-ink transition-colors">The problem</a>
            <a href="#how" className="hover:text-ink transition-colors">How it works</a>
            <a href="#diff" className="hover:text-ink transition-colors">Why us</a>
          </div>
          <Link href="/dashboard" className="rounded-full px-5 py-2 text-sm font-semibold" style={{ background: "var(--green)", color: "var(--ink)" }}>Open dashboard</Link>
        </div>
      </nav>

      <header className="relative overflow-hidden pt-36 pb-24" style={{ background: "linear-gradient(135deg,#0B0F0C,#143b1f 60%,#1d5c2e)" }}>
        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="max-w-3xl">
            <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full mb-6" style={{ background: "var(--lime)", color: "var(--ink)" }}>For high-yield farms</span>
            <h1 className="text-white font-extrabold leading-[1.03] tracking-tight" style={{ fontSize: "clamp(2.6rem,6vw,5rem)" }}>It&apos;s not <span style={{ color: "var(--lime)" }}>when</span> you should harvest.<br />It&apos;s when you <span style={{ color: "var(--lime)" }}>can</span>.</h1>
            <p className="mt-6 text-lg max-w-xl" style={{ color: "rgba(255,255,255,.82)" }}>FarmPredictor crosses your optimal harvest windows with the machinery, crews, supplies and weather you actually have. The gap between the two is margin — and we help you close it.</p>
            <div className="flex flex-wrap gap-3 mt-9">
              <Link href="/dashboard" className="rounded-full px-7 py-3.5 text-sm font-semibold" style={{ background: "var(--green)", color: "var(--ink)" }}>See it live →</Link>
              <a href="#how" className="rounded-full px-7 py-3.5 text-sm font-semibold border grid place-items-center" style={{ borderColor: "rgba(255,255,255,.25)", color: "#fff" }}>How it works</a>
            </div>
          </div>
        </div>
      </header>

      <section id="how" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mb-14"><p className="text-sm font-semibold uppercase tracking-widest mb-3 text-green">How it works</p><h2 className="font-extrabold tracking-tight leading-tight" style={{ fontSize: "clamp(2rem,4vw,3rem)" }}>Three layers. One question: what do I do today?</h2></div>
          <div className="grid md:grid-cols-3 gap-6">
            {[["whatif", "Projected Loss Engine", "Compares live market value against production cost and daily crop degradation to pinpoint the optimal harvest day."], ["planner", "Execution planner", "Drag harvests across days and machines. Conflicts with crews, rigs and supplies surface instantly — margin recalculates live."], ["financial", "Decisions in dollars", "No NDVI charts. No jargon. Every alert says what to do today and what it's worth: \"Order 620 crates now, save $1,120.\""]].map(([icon, title, desc]) => (
              <div key={title} className="rounded-[24px] p-8" style={{ background: "var(--bg)" }}>
                <div className="grid place-items-center h-12 w-12 rounded-xl mb-5" style={{ background: "var(--mint)" }}><Icon name={icon} /></div>
                <h3 className="font-bold text-lg mb-2">{title}</h3><p className="text-sm text-muted">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="diff" className="max-w-6xl mx-auto px-6 py-24">
        <div className="max-w-2xl mb-12"><p className="text-sm font-semibold uppercase tracking-widest mb-3 text-green">Why us</p><h2 className="font-extrabold tracking-tight leading-tight" style={{ fontSize: "clamp(2rem,4vw,3rem)" }}>Everyone else stops at &quot;the crop is ready.&quot;</h2></div>
        <div className="rounded-[24px] overflow-hidden border border-line">
          <div className="grid md:grid-cols-2 text-sm">
            <div className="p-8 bg-white"><p className="font-semibold mb-5 text-muted">Typical ag SaaS</p><ul className="space-y-4">{["Tells you crop health (NDVI, soil)", "Records what already happened", "Leaves you to translate data into action", "Ignores whether you can actually execute"].map((t) => (<li key={t} className="flex gap-3"><span style={{ color: "var(--warn)" }}>✕</span><span className="text-muted">{t}</span></li>))}</ul></div>
            <div className="p-8 text-white" style={{ background: "var(--ink)" }}><p className="font-semibold mb-5" style={{ color: "var(--lime)" }}>FarmPredictor</p><ul className="space-y-4">{["Tells you what to do today, in dollars", "Crosses harvest timing with real capacity", "Detects the gap between optimal and possible", "Models machines, crews, supplies & weather together"].map((t) => (<li key={t} className="flex gap-3"><span style={{ color: "var(--lime)" }}>✓</span><span>{t}</span></li>))}</ul></div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="rounded-[28px] p-10 md:p-16 text-center" style={{ background: "linear-gradient(135deg,#143b1f,#1d5c2e)" }}>
          <h2 className="text-white font-extrabold tracking-tight leading-tight" style={{ fontSize: "clamp(2rem,4.5vw,3.4rem)" }}>See your margin before<br />it walks off the field.</h2>
          <Link href="/dashboard" className="inline-block rounded-full px-8 py-4 text-sm font-semibold mt-8" style={{ background: "var(--green)", color: "var(--ink)" }}>Open the live dashboard →</Link>
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
