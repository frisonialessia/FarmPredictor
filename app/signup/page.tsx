"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthShell, Field } from "@/components/auth/AuthShell";
import { signupSchema, fieldErrors } from "@/lib/schemas";
import { setSession } from "@/lib/session";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const r = signupSchema.safeParse({ name, email, password });
    if (!r.success) return setErrors(fieldErrors(r.error));
    setErrors({});
    setSession({ name, email });
    router.push("/onboarding"); // new users go straight to the setup wizard
  }

  return (
    <AuthShell title="Start free" subtitle="Set up your farm in under 5 minutes.">
      <form onSubmit={submit} noValidate>
        <Field label="Full name" error={errors.name}>
          <input className="setinput" value={name} onChange={(e) => setName(e.target.value)} placeholder="M. Alvarez" autoComplete="name" />
        </Field>
        <Field label="Email" error={errors.email}>
          <input className="setinput" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@farm.com" autoComplete="email" />
        </Field>
        <Field label="Password" error={errors.password}>
          <input className="setinput" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" autoComplete="new-password" />
        </Field>
        <button type="submit" className="w-full mt-2 rounded-full py-3 text-sm font-semibold btn-press" style={{ background: "var(--green)", color: "var(--ink)" }}>Create account</button>
      </form>
      <p className="text-[11px] text-muted mt-3 text-center">No credit card. Demo data to start.</p>
      <p className="text-sm text-muted mt-6 text-center">
        Already have an account? <Link href="/login" className="font-semibold" style={{ color: "var(--green-deep)" }}>Sign in</Link>
      </p>
    </AuthShell>
  );
}
