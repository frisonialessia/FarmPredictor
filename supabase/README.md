# Supabase backend — FarmPredictor

Multi-tenant schema + Row-Level Security for the SaaS build. **Nothing here
touches the cloud until you apply it.**

## Files
- `migrations/0001_schema.sql` — tables (organizations → memberships → farms → …).
- `migrations/0002_rls.sql` — RLS policies (hard tenant isolation) + helpers.
- `seed.sql` — the current demo data (Rio Verde + Llano Seco) on the real schema.

## How to apply (when we're ready)
1. Create a project at supabase.com (region: US for now; EU later for GDPR).
2. With the Supabase CLI:
   ```bash
   supabase link --project-ref <ref>
   supabase db push        # runs migrations
   supabase db seed         # or: psql < supabase/seed.sql
   ```
   (Or paste each file into the SQL editor, in order.)

## Auth config (Supabase dashboard → Authentication)
- Enable **Email**: turn on **Magic Link** and **Email + Password** (both, per decision).
- Add the site URL + redirect URLs (Vercel domain + localhost).

## Env vars (Vercel → Settings → Environment Variables)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`  (public by design — safe because RLS guards data)
- `SUPABASE_SERVICE_ROLE_KEY`      (server-only; bypasses RLS — never expose to the client)

## Security model (why this is safe)
- Every tenant row has `org_id`; RLS only exposes rows for orgs the user belongs to.
- Writes require `owner`/`manager` role; `viewer` is read-only.
- Org creation is atomic via `create_organization()` (also makes the caller owner).
- Background jobs (weather cron, Stripe webhooks, server-side engine) use the
  service-role key, which bypasses RLS.

## Next steps after applying (Sprint B2/B3)
1. Scaffold the Supabase clients (`@supabase/ssr`) — browser + server.
2. Auth flow + middleware; on first signup, clone the `demo` org for the user.
3. Generate TS types (`supabase gen types typescript`) and swap the in-memory
   `store` for real queries.
4. Move `lib/engine.ts` server-side as the source of truth.
