"use client";
import { LegalShell, LegalSection } from "@/components/LegalShell";
import { useMarketingT } from "@/lib/lang";

export default function PrivacyPage() {
  const t = useMarketingT();
  return (
    <LegalShell title="Privacy" updated="2026-06-09">
      <p>{t("FarmPredictor is an early prototype. This notice explains, in plain language, what data we handle and how.")}</p>
      <LegalSection heading="What we collect">
        <p>{t("Your email (to sign you in) and the farm details you choose to enter — parcels, crops, team, machinery and inventory.")}</p>
      </LegalSection>
      <LegalSection heading="Where it's stored">
        <p>{t("Today the data you enter is stored locally in your browser, not on our servers. Clearing your browser data removes it. When we connect a secure backend, this notice will be updated first.")}</p>
      </LegalSection>
      <LegalSection heading="How we use it">
        <p>{t("Only to run the app for you. We do not sell or share your data. We use privacy-friendly, anonymous usage analytics to understand what's useful and improve the product.")}</p>
      </LegalSection>
      <LegalSection heading="Your choices">
        <p>{t("You can clear your local data at any time from your browser, and you can ask us to delete anything we hold by contacting us.")}</p>
      </LegalSection>
      <LegalSection heading="Contact">
        <p>{t("Questions about privacy? Email")} <a href="mailto:frisonialessia@gmail.com" className="font-semibold" style={{ color: "var(--green-deep)" }}>frisonialessia@gmail.com</a>.</p>
      </LegalSection>
    </LegalShell>
  );
}
