# Supabase connection runbook (Phase 2)

A step-by-step plan to take FarmPredictor from **offline/simulated** to a real
multi-tenant backend — **without rewriting the UI**. The architecture was built
for this: data already flows through an async repository, routes are guarded,
env is validated, and errors report through one seam. Connecting Supabase is
mostly *filling in implementations behind interfaces that already exist*.

> **Nothing here runs automatically.** This is a checklist to execute by hand
> when you decide to start paying for infrastructure. Until then the app runs
> fully free on simulated data.

The schema is already written:
- `migrations/0001_schema.sql` — tables (organizations → memberships → farms → parcels/resources/harvests/…).
- `migrations/0002_rls.sql` — Row-Level Security (hard tenant isolation) + helpers (`is_org_member`, `is_org_editor`, `create_organization`).
- `seed.sql` — the demo farms (Rio Verde + Llano Seco) on the real schema.

---

## Cost & region (decide first)
- **Supabase Free** covers the PoC and first users; **Pro (~$25/mo)** when you need backups, more rows and no project pausing.
- Region: **US** to start (Mexico/USA latency). Add an **EU** project later for GDPR if you take EU customers.
- This is the first recurring cost. Everything below is reversible (see *Rollback*).

---

## Step 1 — Create the project & link the CLI
```bash
# Install the CLI once: https://supabase.com/docs/guides/cli
supabase login
supabase link --project-ref <your-project-ref>
```
Grab from **Dashboard → Project Settings → API**: the **Project URL**, the
**anon** key, and the **service_role** key (keep this one secret).

## Step 2 — Apply schema, RLS and seed
```bash
supabase db push                 # runs migrations/0001 + 0002 in order
psql "$DATABASE_URL" -f supabase/seed.sql   # or paste seed.sql in the SQL editor
```
Verify in **Dashboard → Authentication → Policies** that every tenant table
shows RLS **enabled**. Sanity check with the SQL editor:
```sql
select tablename, rowsecurity from pg_tables where schemaname='public';
```

## Step 3 — Configure Auth (matches the current UI)
**Dashboard → Authentication → Providers → Email:**
- Enable **Magic Link** *and* **Email + Password** (the login page already offers both).
- **URL Configuration → Site URL + Redirect URLs:** add `http://localhost:3000`
  and your Vercel domain(s), including `/login` and `/dashboard`.

## Step 4 — Environment variables
Add to `.env.local` (and **Vercel → Settings → Environment Variables**):
```
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>   # public by design — RLS guards the data
SUPABASE_SERVICE_ROLE_KEY=<service role>    # SERVER ONLY — bypasses RLS, never ship to client
```
Then register them in the typed env (`lib/env.ts`) so a misconfigured deploy
fails fast — add to the schema and the exported `env`:
```ts
NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
```

## Step 5 — Scaffold the Supabase clients
```bash
npm install @supabase/supabase-js @supabase/ssr
```
Create `lib/supabase/client.ts` (browser) and `lib/supabase/server.ts`
(server components / route handlers, cookie-based), per the
[@supabase/ssr guide](https://supabase.com/docs/guides/auth/server-side/nextjs).
A `lib/supabase/admin.ts` using the service-role key is for server-only jobs
(cron, Stripe webhooks) — never imported by a client component.

## Step 6 — Swap the data boundary (the payoff)
This is the one-file change the whole architecture was built around. The app
already `await`s every repository call, so **no call sites change**.

1. Implement `lib/repo/supabase.ts`:
   ```ts
   export class SupabaseRepository implements DataRepository {
     async listFarms() { /* select * from farms (+parcels) for the user's orgs */ }
     async getFarm(id) { /* select … where id = $1 */ }
     async getMarketPrices() { /* select … from market_prices */ }
   }
   ```
   Map DB rows → the existing `Farm` / `MarketRow` types (snake_case → camelCase).
2. Flip the single export in `lib/repo/index.ts`:
   ```ts
   // export const repo: DataRepository = new MemoryRepository();
   export const repo: DataRepository = new SupabaseRepository();
   ```
3. **Planner data** (`resources/harvests/blocked_slots/capacity_conflicts`):
   keep `plannerForFarm` as the single source, but feed it the farm's stored
   rows instead of generating them. The loading gate in `lib/store.tsx` already
   absorbs the network latency — no UI work.

## Step 7 — Real auth (replace the mock)
The mock lives behind one module, so this is contained:
- `lib/session.ts` → wrap `supabase.auth.getUser()` / `signInWithOtp` / `signInWithPassword` / `signOut`. The shape (`{ name, email }`) stays, so `AccountMenu` and the login/signup pages keep working.
- **Signup** (`app/signup/page.tsx`): after `auth.signUp`, call the
  `create_organization(name, slug)` RPC (it atomically makes the user the owner),
  then go to `/onboarding`.
- **Route guard:** move protection server-side. The current `RequireAuth`
  (`lib/auth.tsx`) is client-side because the mock uses localStorage. With
  cookie-based sessions, add `middleware.ts` that refreshes the session and
  redirects unauthenticated users away from `/dashboard` and `/onboarding`.
  The `RequireAuth` wrappers can stay as a client fallback or be removed.

## Step 8 — Generate types & tighten
```bash
supabase gen types typescript --linked > lib/supabase/types.ts
```
Use these in `SupabaseRepository` for end-to-end type safety from DB to UI.

## Step 9 — Background data (optional, after the core works)
- **Weather:** a scheduled function fills `weather_cache` by coordinates (shared,
  not per-user) so the client reads the cache instead of hitting Open-Meteo each load.
- **Market prices:** a job upserts global rows (`org_id = null`) from USDA/SAGARPA.
- Both use the **service-role** client (bypasses RLS).

## Step 10 — Billing & metering (later, with Stripe)
- `plans` / `subscriptions` / `usage_events` tables already exist.
- Stripe webhook (server route, service-role) writes `subscriptions`.
- Log a `usage_events` row per simulator run / optimizer call to enforce limits —
  this is also how Phase 3 (OR-Tools) gets metered.

---

## Verification checklist
- [ ] Two users in **different orgs cannot see each other's farms** (RLS works — test by signing in as each).
- [ ] A `viewer` can read but not write; an `owner`/`manager` can write.
- [ ] Sign-up creates an org and lands in onboarding; the new farm persists across reload and devices.
- [ ] `npm run lint && npm run typecheck && npm test && npm run build` all pass.
- [ ] Unauthenticated requests to `/dashboard` redirect to `/login` (now server-side).
- [ ] No secret in the client bundle (`SUPABASE_SERVICE_ROLE_KEY` never referenced in a client component).

## Rollback
Connecting is reversible: revert `lib/repo/index.ts` to `new MemoryRepository()`
and unset the Supabase env vars. The app returns to free/offline mode with no
other changes — because everything else only depends on the interfaces.

## Why this is low-risk (architecture recap)
| Seam (already built) | What Phase 2 does to it |
|---|---|
| `DataRepository` (async) | Add `SupabaseRepository`, flip one export |
| `lib/store.tsx` loading gate | Absorbs real latency — no change |
| `lib/env.ts` (validated) | Add 2–3 vars to the schema |
| `lib/auth.tsx` `RequireAuth` | Promote to `middleware.ts` (cookies) |
| `lib/observability.ts` | Already the place to wire Sentry |
| RLS in `migrations/0002` | Enforces tenant isolation in the DB, not app code |
