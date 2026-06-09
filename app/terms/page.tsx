"use client";
import { LegalShell, LegalSection } from "@/components/LegalShell";
import { useMarketingT } from "@/lib/lang";

export default function TermsPage() {
  const t = useMarketingT();
  return (
    <LegalShell title="Terms" updated="2026-06-09">
      <p>{t("By using this prototype you agree to the following. It's short on purpose.")}</p>
      <LegalSection heading="A prototype, as-is">
        <p>{t("FarmPredictor is a proof of concept provided as-is, without warranties. Features may change or break while we build.")}</p>
      </LegalSection>
      <LegalSection heading="Not professional advice">
        <p>{t("Figures shown are simulated for demonstration. Do not rely on them for real financial or agronomic decisions yet — they illustrate how the product works, not your actual numbers.")}</p>
      </LegalSection>
      <LegalSection heading="Acceptable use">
        <p>{t("Use the demo for evaluation. Don't attempt to disrupt the service or misuse it.")}</p>
      </LegalSection>
      <LegalSection heading="Contact">
        <p>{t("Questions about these terms? Email")} <a href="mailto:frisonialessia@gmail.com" className="font-semibold" style={{ color: "var(--green-deep)" }}>frisonialessia@gmail.com</a>.</p>
      </LegalSection>
    </LegalShell>
  );
}
