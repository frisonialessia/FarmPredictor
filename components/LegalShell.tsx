"use client";
import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { MarketingLangToggle } from "@/components/MarketingLangToggle";
import { useMarketingT } from "@/lib/lang";
import type { ReactNode } from "react";

// Simple, on-brand shell for the legal pages (privacy, terms). Bilingual.
export function LegalShell({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  const t = useMarketingT();
  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <nav className="border-b border-line bg-white">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5"><BrandMark size={26} /><span className="font-bold tracking-tight">FarmPredictor</span></Link>
          <MarketingLangToggle />
        </div>
      </nav>
      <main className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/" className="text-sm font-semibold" style={{ color: "var(--green-deep)" }}>← {t("Back home")}</Link>
        <h1 className="text-3xl font-extrabold tracking-tight mt-4 mb-1">{t(title)}</h1>
        <p className="text-xs text-muted mb-8">{t("Last updated")}: {updated}</p>
        <div className="space-y-6 text-sm leading-relaxed" style={{ color: "var(--ink)" }}>{children}</div>
        <p className="text-xs text-muted mt-12 pt-6 border-t border-line">{t("Prototype · demo data · built for high-yield operations")}</p>
      </main>
    </div>
  );
}

export function LegalSection({ heading, children }: { heading: string; children: ReactNode }) {
  const t = useMarketingT();
  return (
    <section>
      <h2 className="text-base font-bold mb-1.5">{t(heading)}</h2>
      <div className="text-muted">{children}</div>
    </section>
  );
}
