"use client";
// ── Route-guard seam ─────────────────────────────────────────────────────────
// Protects authenticated areas (/dashboard, /onboarding). Today it reads the
// mock localStorage session; a Middleware can't see localStorage, so the guard
// runs client-side. When Supabase Auth lands (cookie-based sessions), this moves
// to a server Middleware for true server-side protection — the call sites
// (RequireAuth wrappers) stay the same.
import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "./session";

type Status = "checking" | "authed";

function AuthSplash() {
  return (
    <div className="min-h-screen grid place-items-center" style={{ background: "var(--bg)" }} role="status" aria-label="Checking your session">
      <span aria-hidden="true" className="h-8 w-8 rounded-full animate-spin" style={{ border: "3px solid var(--line)", borderTopColor: "var(--green)" }} />
    </div>
  );
}

// Renders children only for a signed-in user; otherwise redirects to /login.
// Holds a splash while checking so protected content never flashes for guests.
export function RequireAuth({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    if (getSession()) setStatus("authed");
    else router.replace("/login");
  }, [router]);

  if (status !== "authed") return <AuthSplash />;
  return <>{children}</>;
}
