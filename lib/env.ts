import { z } from "zod";

// ── Validated, client-safe environment (NEXT_PUBLIC_*) ───────────────────────
// One typed place for public config, validated at startup so a misconfigured
// deploy fails fast and loudly instead of breaking silently in production.
// Server-only secrets (e.g. ANTHROPIC_API_KEY) are intentionally NOT here —
// they're read server-side only, never bundled to the client.
const schema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  NEXT_PUBLIC_OPTIMIZER_URL: z.string().url().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
});

// Reference each var explicitly: Next.js only inlines NEXT_PUBLIC_* values that
// are written as static `process.env.X` accesses into the client bundle.
const parsed = schema.safeParse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_OPTIMIZER_URL: process.env.NEXT_PUBLIC_OPTIMIZER_URL,
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
});

if (!parsed.success) {
  const detail = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
  throw new Error(`Invalid environment configuration:\n${detail}`);
}

export const env = {
  // Absolute site URL: explicit override, else Vercel's injected URLs, else local.
  siteUrl:
    parsed.data.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
    "http://localhost:3000",
  // Phase 3 optimizer service. Empty = use the built-in TS heuristic.
  optimizerUrl: parsed.data.NEXT_PUBLIC_OPTIMIZER_URL ?? "",
  // Observability sink (Sentry). Empty = errors are logged locally only.
  sentryDsn: parsed.data.NEXT_PUBLIC_SENTRY_DSN ?? "",
} as const;
