-- 0001_schema.sql — FarmPredictor multi-tenant schema
-- Tenancy: organizations -> memberships(user, role) -> farms -> {parcels,
-- resources, harvests, ...}. Every tenant row carries org_id for RLS.

create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- ── Tenancy ──────────────────────────────────────────────────────────
create table organizations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text unique not null,
  created_at  timestamptz not null default now()
);

create type member_role as enum ('owner', 'manager', 'viewer');

create table memberships (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references organizations(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        member_role not null default 'owner',
  created_at  timestamptz not null default now(),
  unique (org_id, user_id)
);
create index on memberships(user_id);
create index on memberships(org_id);

-- ── Farms & agronomy ────────────────────────────────────────────────
create table farms (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references organizations(id) on delete cascade,
  name        text not null,
  location    text,
  lat         double precision,
  lon         double precision,
  plan        text default 'Pro',
  initials    text,
  created_at  timestamptz not null default now()
);
create index on farms(org_id);

create table parcels (
  id                    uuid primary key default gen_random_uuid(),
  org_id                uuid not null references organizations(id) on delete cascade,
  farm_id               uuid not null references farms(id) on delete cascade,
  name                  text not null,
  crop                  text,
  area_ac               numeric,
  hours_to_window_close int,
  margin_per_acre       numeric,
  margin_pct            int,
  polygon               text,
  cx                    numeric,
  cy                    numeric,
  created_at            timestamptz not null default now()
);
create index on parcels(farm_id);
create index on parcels(org_id);

create type resource_kind as enum ('machine', 'crew');

create table resources (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references organizations(id) on delete cascade,
  farm_id     uuid not null references farms(id) on delete cascade,
  ext_id      text,                 -- engine row id, e.g. "m1", "ca"
  label       text not null,
  kind        resource_kind not null,
  icon        text,
  created_at  timestamptz default now()
);
create index on resources(farm_id);

-- The harvest plan (what the engine consumes).
create table harvests (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references organizations(id) on delete cascade,
  farm_id       uuid not null references farms(id) on delete cascade,
  ext_id        text,               -- engine id, e.g. "h1"
  label         text not null,
  resource_ext  text,               -- engine row id this harvest sits on
  day           int not null,
  window_start  int not null,
  window_end    int not null,
  value         numeric not null,
  created_at    timestamptz default now()
);
create index on harvests(farm_id);

create table blocked_slots (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references organizations(id) on delete cascade,
  farm_id       uuid not null references farms(id) on delete cascade,
  resource_ext  text not null,
  day           int not null,
  len           int not null,
  label         text
);
create index on blocked_slots(farm_id);

-- Seeded "capacity" conflicts (this week's executable gap).
create table capacity_conflicts (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references organizations(id) on delete cascade,
  farm_id       uuid not null references farms(id) on delete cascade,
  ext_id        text,
  icon          text,
  parcel        text,
  resource      text,
  loss          numeric,
  action_label  text,
  action_cost   numeric
);
create index on capacity_conflicts(farm_id);

-- ── Market & weather ────────────────────────────────────────────────
-- org_id null = global price (shared); non-null = tenant override.
create table market_prices (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid references organizations(id) on delete cascade,
  crop        text not null,
  spot        numeric,
  cost        numeric,
  unit        text,
  change_pct  numeric,
  as_of       date default current_date
);

-- Shared weather cache keyed by coordinates (filled by a cron, not per user).
create table weather_cache (
  id          uuid primary key default gen_random_uuid(),
  lat         double precision not null,
  lon         double precision not null,
  payload     jsonb not null,
  fetched_at  timestamptz not null default now(),
  unique (lat, lon)
);

-- ── Financials (sensitive) ──────────────────────────────────────────
create table invoices (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references organizations(id) on delete cascade,
  farm_id       uuid references farms(id) on delete cascade,
  number        text,
  counterparty  text,
  amount        numeric,
  currency      text default 'USD',
  status        text,
  issued_at     date,
  created_at    timestamptz default now()
);
create index on invoices(org_id);

create table contracts (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references organizations(id) on delete cascade,
  farm_id       uuid references farms(id) on delete cascade,
  buyer         text,
  crop          text,
  volume        text,
  committed_pct int
);
create index on contracts(org_id);

-- ── Activity / audit journal ────────────────────────────────────────
create table activity_log (
  id        uuid primary key default gen_random_uuid(),
  org_id    uuid not null references organizations(id) on delete cascade,
  farm_id   uuid references farms(id) on delete cascade,
  user_id   uuid references auth.users(id),
  at        timestamptz default now(),
  icon      text,
  title     text,
  descr     text,
  value     text,
  warn      boolean default false
);
create index on activity_log(org_id, at desc);

-- ── Billing (Stripe) ────────────────────────────────────────────────
create table plans (
  id                text primary key,        -- 'starter','pro','enterprise'
  name              text not null,
  stripe_price_id   text,
  max_farms         int,
  monthly_sim_limit int,
  features          jsonb default '{}'::jsonb
);

create table subscriptions (
  id                      uuid primary key default gen_random_uuid(),
  org_id                  uuid not null unique references organizations(id) on delete cascade,
  plan_id                 text references plans(id),
  stripe_customer_id      text,
  stripe_subscription_id  text,
  status                  text,
  current_period_end      timestamptz,
  updated_at              timestamptz default now()
);

-- Usage metering for the "interactions" part of pricing (sims, optimizer runs).
create table usage_events (
  id      uuid primary key default gen_random_uuid(),
  org_id  uuid not null references organizations(id) on delete cascade,
  kind    text not null,
  qty     int default 1,
  at      timestamptz default now()
);
create index on usage_events(org_id, at);
