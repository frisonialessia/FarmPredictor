# FarmPredictor — project context for Claude

Read this first. Then skim `README.md` (has a "What's live vs. what's still to
connect" table), `supabase/CONNECT.md`, `optimizer/README.md`, `lib/store.tsx`,
`lib/repo/` and `lib/engine.ts` to get oriented before coding.

## What it is
Operations intelligence for high-yield farms. Thesis: **it's not _when_ you
should harvest — it's when you _can_.** It measures, in money, the gap between
the optimal harvest and the one you can actually execute (machine busy, crew
short, no crates, a storm coming) and helps close it. Built for **non-technical
farmers**: plain language and dollars, never jargon (no NDVI/scores). Bilingual
EN/ES.

## Working conventions
- **Work directly on `main`** and merge without asking (founder's preference).
  Do **not** open PRs unless explicitly asked.
- **Commits:** end every message with the Claude session URL. **Never** put
  model IDs in commits, code, or docs.
- **Before every push:** `npm run lint && npm run typecheck && npm test && npm run build`.
- When adding UI text, add its **ES translation** too (`lib/i18n.ts` for the
  dashboard, `lib/i18n.ts` dictionary is shared with marketing via `translate`)
  or it shows English in Spanish.

## Stack & deploy
- Next.js 14 (App Router) · TypeScript · Tailwind.
- Repo: `frisonialessia/farmpredictor`.
- Vercel: team **realiti**, project **farmpredictor** (`farmpredictor.vercel.app`),
  auto-deploys on push to `main`.
  ⚠️ **Never touch the `realiti-saas` project** — it's a different app.

## Architecture (the important part)
- **Pure, typed engines** in `lib/` (`engine`, `risk`, `timing`, `cropTiming`,
  `herd`, `machinery`, `inventory`) — unit-tested (Vitest, ~30 tests). They take
  data by parameter; no hardcoded data inside.
- **Repository pattern** (`lib/repo/`): async `DataRepository` interface. Today
  `MemoryRepository` (simulated data in `data/`). Going live = implement
  `SupabaseRepository` and change **one line** in `lib/repo/index.ts`.
- **Per-farm state** in `lib/store.tsx` (`AppProvider`), persisted to
  localStorage, with a loading gate. A farm's real parcels generate its plan
  (`lib/planGen.ts`).
- **i18n:** `lib/i18n.ts` (ES dict + `useT` for the dashboard) and `lib/lang.ts`
  (`useMarketingT`/`useLang` for marketing pages outside the provider). Both
  share the `fp_lang` key.
- **RBAC:** `lib/permissions.ts` — 4 roles (owner, manager, agronomist,
  harvester) gating views/actions. Mock auth in `lib/auth.tsx` (`RequireAuth`) +
  `lib/session.ts`.
- Validated env in `lib/env.ts` (zod). Observability seam in
  `lib/observability.ts` (off by default). Error/loading boundaries in `app/`.
- Demo farms ("Demo Farm 1/2", `data/farms.ts`) carry a curated story (incl. a
  storm so the timing wow always shows). User-created farms use data derived from
  their own parcels — `lib/demo.ts` (`isDemoFarm`) gates demo-only content so a
  user's farm never shows another farm's data.

## What's connected today (runs offline & free)
- 🟢 **Real:** weather (Open-Meteo, no key); the calculation engines (real logic).
- 🟡 **Mock:** AI assistant (free deterministic mock; Claude with
  `ANTHROPIC_API_KEY`); accounts/auth (localStorage, any email signs in);
  data + persistence (per-browser localStorage); scheduling optimizer (TS heuristic).
- 🔴 **Not built:** payments (UI + DB schema only); error tracking (off).

Optional env vars (all unset = full free demo): `ANTHROPIC_API_KEY`,
`NEXT_PUBLIC_OPTIMIZER_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SENTRY_DSN`
(see `.env.example`).

## What's left for a real SaaS (future, in order)
1. **Phase 2 — Supabase backend** (Postgres + Auth + RLS, multi-tenant). Schema,
   RLS policies and a step-by-step runbook are already in `supabase/`
   (`CONNECT.md`). Implies: `SupabaseRepository`, real auth (signup → RPC
   `create_organization`; `RequireAuth` → cookie-based middleware), real
   persistence, real market prices (USDA/SAGARPA).
2. **Phase 3 — Optimizer:** deploy `optimizer/` (Python FastAPI + Google OR-Tools)
   to Fly.io/Railway and set `NEXT_PUBLIC_OPTIMIZER_URL`. The app already falls
   back to the TS heuristic if it's unset/unreachable.
3. **Payments:** Stripe (tables `plans`/`subscriptions`/`usage_events` already in
   the schema) + webhook + usage metering.
4. **Observability:** Sentry (`NEXT_PUBLIC_SENTRY_DSN` + wire `lib/observability.ts`).
5. **Custom domain** + `NEXT_PUBLIC_SITE_URL` (for clean OG previews).
6. **Other:** real data ingestion (sensors/market feeds), real digest delivery
   (Resend/WhatsApp), UI/integration tests, accessibility audit.

## Constraints to respect
- It's a **PoC with simulated data on purpose.** Don't connect paid APIs or
  Supabase unless asked (we're keeping costs at zero for now).
- Keep the **green brand identity** and **EN/ES** bilingual support.
- Hold the "first-class SaaS" bar: flawless on mobile, no dead buttons, and no
  one farm's data bleeding into another's.
