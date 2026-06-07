"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthShell, Field } from "@/components/auth/AuthShell";
import { loginSchema, magicLinkSchema, fieldErrors } from "@/lib/schemas";
import { setSession } from "@/lib/session";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"magic" | "password">("magic");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "magic") {
      const r = magicLinkSchema.safeParse({ email });
      if (!r.success) return setErrors(fieldErrors(r.error));
      setErrors({});
      setSent(true); // mock: pretend we emailed a link
      return;
    }
    const r = loginSchema.safeParse({ email, password });
    if (!r.success) return setErrors(fieldErrors(r.error));
    setErrors({});
    setSession({ name: email.split("@")[0], email });
    router.push("/dashboard");
  }

  if (sent) {
    return (
      <AuthShell title="Check your inbox" subtitle={`We sent a sign-in link to ${email}.`}>
        <div className="rounded-xl p-4 text-sm" style={{ background: "rgba(82,200,113,.1)", border: "1px solid rgba(82,200,113,.25)", color: "var(--green-deep)" }}>
          Open the link on this device to continue. <span className="text-muted">(Demo: no email is actually sent.)</span>
        </div>
        <button onClick={() => router.push("/dashboard")} className="w-full mt-5 rounded-full py-3 text-sm font-semibold btn-press" style={{ background: "var(--green)", color: "var(--ink)" }}>Continue to the demo →</button>
        <button onClick={() => setSent(false)} className="w-full mt-3 text-sm font-semibold text-muted">Use a different email</button>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your FarmPredictor workspace.">
      <div className="flex p-1 rounded-full border border-line mb-6" style={{ background: "#fff" }}>
        {([["magic", "Magic link"], ["password", "Password"]] as const).map(([m, label]) => (
          <button key={m} onClick={() => { setMode(m); setErrors({}); }} className="flex-1 text-xs font-bold py-2 rounded-full transition-colors" style={{ background: mode === m ? "var(--ink)" : "transparent", color: mode === m ? "#fff" : "var(--muted)" }}>{label}</button>
        ))}
      </div>

      <form onSubmit={submit} noValidate>
        <Field label="Email" error={errors.email}>
          <input className="setinput" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@farm.com" autoComplete="email" />
        </Field>
        {mode === "password" && (
          <Field label="Password" error={errors.password}>
            <input className="setinput" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
          </Field>
        )}
        <button type="submit" className="w-full mt-2 rounded-full py-3 text-sm font-semibold btn-press" style={{ background: "var(--green)", color: "var(--ink)" }}>
          {mode === "magic" ? "Send magic link" : "Sign in"}
        </button>
      </form>

      <p className="text-sm text-muted mt-6 text-center">
        New here? <Link href="/signup" className="font-semibold" style={{ color: "var(--green-deep)" }}>Create an account</Link>
      </p>
    </AuthShell>
  );
}
