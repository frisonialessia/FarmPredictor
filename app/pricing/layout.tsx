import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — FarmPredictor",
  description: "Start free, upgrade when a farm pays for itself. Starter, Pro and Enterprise plans for high-yield operations.",
  alternates: { canonical: "/pricing" },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
