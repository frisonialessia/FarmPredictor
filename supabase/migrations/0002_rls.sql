-- 0002_rls.sql — Row-Level Security: hard tenant isolation.
-- The golden rule: a user only ever sees rows for organizations they belong to.
-- Enforced in the database, never in app code.

-- ── Helper functions (SECURITY DEFINER to avoid RLS recursion) ───────
create or replace function public.is_org_member(target uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from memberships m
    where m.org_id = target and m.user_id = auth.uid()
  );
$$;

create or replace function public.is_org_editor(target uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from memberships m
    where m.org_id = target and m.user_id = auth.uid()
      and m.role in ('owner', 'manager')
  );
$$;

create or replace function public.is_org_owner(target uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from memberships m
    where m.org_id = target and m.user_id = auth.uid() and m.role = 'owner'
  );
$$;

-- Create an organization and make the caller its owner, atomically.
-- (RLS blocks a direct insert into organizations; signups call this instead.)
create or replace function public.create_organization(p_name text, p_slug text)
returns uuid language plpgsql security definer set search_path = public as $$
declare new_id uuid;
begin
  insert into organizations (name, slug) values (p_name, p_slug) returning id into new_id;
  insert into memberships (org_id, user_id, role) values (new_id, auth.uid(), 'owner');
  return new_id;
end;
$$;

-- ── organizations ────────────────────────────────────────────────────
alter table organizations enable row level security;
create policy org_select on organizations for select using (public.is_org_member(id));
create policy org_update on organizations for update using (public.is_org_owner(id)) with check (public.is_org_owner(id));
create policy org_delete on organizations for delete using (public.is_org_owner(id));
-- inserts go through create_organization() (definer), so no insert policy here.

-- ── memberships ──────────────────────────────────────────────────────
alter table memberships enable row level security;
create policy mem_select on memberships for select using (public.is_org_member(org_id));
create policy mem_insert on memberships for insert with check (public.is_org_owner(org_id));
create policy mem_update on memberships for update using (public.is_org_owner(org_id)) with check (public.is_org_owner(org_id));
create policy mem_delete on memberships for delete using (public.is_org_owner(org_id));

-- ── Standard tenant tables: member can read, editor can write ────────
do $$
declare t text;
begin
  foreach t in array array[
    'farms','parcels','resources','harvests','blocked_slots',
    'capacity_conflicts','invoices','contracts','activity_log','usage_events'
  ] loop
    execute format('alter table %I enable row level security;', t);
    execute format('create policy %I on %I for select using (public.is_org_member(org_id));', t || '_sel', t);
    execute format('create policy %I on %I for insert with check (public.is_org_editor(org_id));', t || '_ins', t);
    execute format('create policy %I on %I for update using (public.is_org_editor(org_id)) with check (public.is_org_editor(org_id));', t || '_upd', t);
    execute format('create policy %I on %I for delete using (public.is_org_editor(org_id));', t || '_del', t);
  end loop;
end $$;

-- ── market_prices: global rows (org_id null) readable by all; tenant rows scoped ──
alter table market_prices enable row level security;
create policy market_select on market_prices for select
  using (org_id is null or public.is_org_member(org_id));
create policy market_write on market_prices for all
  using (org_id is not null and public.is_org_editor(org_id))
  with check (org_id is not null and public.is_org_editor(org_id));

-- ── weather_cache & plans: read for authenticated, writes via service role ──
alter table weather_cache enable row level security;
create policy weather_select on weather_cache for select using (auth.uid() is not null);

alter table plans enable row level security;
create policy plans_select on plans for select using (auth.uid() is not null);

-- ── subscriptions: members read; writes only via service role (Stripe webhook) ──
alter table subscriptions enable row level security;
create policy subs_select on subscriptions for select using (public.is_org_member(org_id));

-- NOTE: the service_role key bypasses RLS entirely, so background jobs
-- (weather cron, Stripe webhooks, the server-side engine) can write freely.
