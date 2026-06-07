// ── Observability seam ───────────────────────────────────────────────────────
// One vendor-agnostic place to report errors. Today it logs locally; when
// NEXT_PUBLIC_SENTRY_DSN is set and a provider is wired in here, it forwards.
// Swapping in Sentry (or any sink) is a one-file change — the call sites that
// use captureError don't move. Off by default: no DSN, no external calls.
import { env } from "./env";

export type ErrorContext = Record<string, unknown>;

export function captureError(error: unknown, context?: ErrorContext): void {
  if (env.sentryDsn) {
    // TODO(observability): forward to Sentry/log drain here once the SDK is added,
    // e.g. Sentry.captureException(error, { extra: context }).
  }
  // Always keep a local trace so nothing is lost while the sink is off.
  console.error("[FarmPredictor]", error, context ?? "");
}
