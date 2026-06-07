"use client";
// Route error boundary: catches render/data errors in any page segment and
// offers recovery instead of a blank screen. Errors are logged for the future
// observability hook (Tier 3 / Sentry).
import { useEffect } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // TODO(observability): forward to Sentry/log drain when enabled.
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen grid place-items-center px-6" style={{ background: "linear-gradient(135deg,#0B0F0C,#143b1f 60%,#1d5c2e)" }}>
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6"><BrandMark size={48} /></div>
        <p className="mono text-6xl font-bold" style={{ color: "var(--lime)" }}>!</p>
        <h1 className="text-white text-2xl font-extrabold tracking-tight mt-4">Something went sideways.</h1>
        <p className="mt-3" style={{ color: "rgba(255,255,255,.7)" }}>An unexpected error interrupted this page. Your saved data is safe — try again, or head back to the dashboard.</p>
        <div className="flex flex-wrap gap-3 justify-center mt-8">
          <button onClick={reset} className="rounded-full px-6 py-3 text-sm font-semibold btn-press" style={{ background: "var(--green)", color: "var(--ink)" }}>Try again</button>
          <Link href="/dashboard" className="rounded-full px-6 py-3 text-sm font-semibold border btn-press" style={{ borderColor: "rgba(255,255,255,.25)", color: "#fff" }}>Back to dashboard</Link>
        </div>
      </div>
    </div>
  );
}
