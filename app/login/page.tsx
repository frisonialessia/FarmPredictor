"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthShell, Field } from "@/components/auth/AuthShell";
import { loginSchema, magicLinkSchema, fieldErrors } from "@/lib/schemas";
import { setSession } from "@/lib/session";
import { useMarketingT } from "@/lib/lang";

export default function LoginPage() {
  const router = useRouter();
  const t = useMarketingT();
  const [mode, setMode] = useState<"magic" | "password">("magic");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "magic") {
      const r = magicLinkSchema.safeParse({ email });
      if (!r.success) return setErrors(fieldErrors(r.error));
      setErrors({});
      // No real email auth yet: any valid email signs in straight to the demo —
      // zero friction. When Supabase lands, this becomes auth.signInWithOtp and
      // the user finishes via the emailed link instead of going direct.
      setSession({ name: email.split("@")[0], email });
      router.push("/dashboard");
      return;
    }
    const r = loginSchema.safeParse({ email, password });
    if (!r.success) return setErrors(fieldErrors(r.error));
    setErrors({});
    setSession({ name: email.split("@")[0], email });
    router.push("/dashboard");
  }

  return (
    <AuthShell title={t("Welcome back")} subtitle={t("Sign in to your FarmPredictor workspace.")}>
      <div className="flex p-1 rounded-full border border-line mb-6" style={{ background: "#fff" }}>
        {([["magic", t("Magic link")], ["password", t("Password")]] as const).map(([m, label]) => (
          <button key={m} onClick={() => { setMode(m); setErrors({}); }} className="flex-1 text-xs font-bold py-2 rounded-full transition-colors" style={{ background: mode === m ? "var(--ink)" : "transparent", color: mode === m ? "#fff" : "var(--muted)" }}>{label}</button>
        ))}
      </div>

      <form onSubmit={submit} noValidate>
        <Field label={t("Email")} error={errors.email}>
          <input className="setinput" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@farm.com" autoComplete="email" />
        </Field>
        {mode === "password" && (
          <Field label={t("Password")} error={errors.password}>
            <input className="setinput" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
          </Field>
        )}
        <button type="submit" className="w-full mt-2 rounded-full py-3 text-sm font-semibold btn-press" style={{ background: "var(--green)", color: "var(--ink)" }}>
          {mode === "magic" ? t("Continue to the demo →") : t("Sign in")}
        </button>
      </form>

      <p className="text-sm text-muted mt-6 text-center">
        {t("New here?")} <Link href="/signup" className="font-semibold" style={{ color: "var(--green-deep)" }}>{t("Create an account")}</Link>
      </p>
    </AuthShell>
  );
}
