-- seed.sql — mirrors the current simulated data onto the real schema.
-- Runs as superuser (bypasses RLS). Creates a "Demo Farms Co" org with the two
-- farms. On first signup we'll clone this demo org into the new user's org.

-- Pricing tiers (Stripe price ids filled in later).
insert into plans (id, name, max_farms, monthly_sim_limit, features) values
  ('starter',    'Starter',     1,   50,   '{"planner":true,"simulator":false}'),
  ('pro',        'Pro',         10,  1000, '{"planner":true,"simulator":true,"weather":true}'),
  ('enterprise', 'Enterprise',  null, null,'{"planner":true,"simulator":true,"weather":true,"optimizer":true,"sso":true}')
on conflict (id) do nothing;

-- Global market prices.
insert into market_prices (org_id, crop, spot, cost, unit, change_pct) values
  (null, 'Grain sorghum', 4.85, 3.20, 'bu',    2.1),
  (null, 'Upland cotton', 0.72, 0.58, 'lb',   -1.4),
  (null, 'Sweet corn',    6.40, 4.10, 'crate', 3.6),
  (null, 'Grapefruit',    18.5, 11.0, 'box',   0.8);

do $$
declare
  org_id   uuid;
  rio_id   uuid;
  llano_id uuid;
begin
  insert into organizations (name, slug) values ('Demo Farms Co', 'demo') returning id into org_id;

  -- ── Rio Verde Farms ──────────────────────────────────────────────
  insert into farms (org_id, name, location, lat, lon, plan, initials)
    values (org_id, 'Rio Verde Farms', 'Hidalgo County, TX', 26.30, -98.16, 'Pro', 'RV')
    returning id into rio_id;

  insert into parcels (org_id, farm_id, name, crop, area_ac, hours_to_window_close, margin_per_acre, margin_pct, polygon, cx, cy) values
    (org_id, rio_id, 'North A',      'Grain sorghum', 180, 38,  142, 92, '60,40 220,30 230,130 70,145',  140, 85),
    (org_id, rio_id, 'West 2',       'Upland cotton', 240, 72,  118, 74, '60,160 200,150 210,275 70,290',132, 215),
    (org_id, rio_id, 'Greenhouse 1', 'Grapefruit',    40,  60,  156, 99, '250,30 410,35 405,140 240,135',320, 85),
    (org_id, rio_id, 'East 3',       'Sweet corn',    310, 144, 96,  60, '250,165 430,160 440,285 260,295',340, 220),
    (org_id, rio_id, 'South B',      'Leaf lettuce',  120, 216, 74,  46, '120,310 330,315 325,395 130,388',225, 352),
    (org_id, rio_id, 'River C',      'Watermelon',    95,  96,  88,  55, '350,310 470,315 475,395 360,400',415, 355);

  insert into resources (org_id, farm_id, ext_id, label, kind, icon) values
    (org_id, rio_id, 'm1', 'Harvester #1', 'machine', 'tractor'),
    (org_id, rio_id, 'm2', 'Harvester #2', 'machine', 'tractor'),
    (org_id, rio_id, 'm3', 'Picker rig',   'machine', 'tractor'),
    (org_id, rio_id, 'ca', 'Crew A',       'crew',    'crew'),
    (org_id, rio_id, 'cb', 'Crew B',       'crew',    'crew');

  insert into harvests (org_id, farm_id, ext_id, label, resource_ext, day, window_start, window_end, value) values
    (org_id, rio_id, 'h1', 'North A',      'm1', 0, 0, 1, 9800),
    (org_id, rio_id, 'h2', 'West 2',       'm1', 2, 2, 4, 6400),
    (org_id, rio_id, 'h3', 'Greenhouse 1', 'ca', 1, 1, 2, 5200),
    (org_id, rio_id, 'h4', 'South B',      'ca', 4, 4, 5, 3800),
    (org_id, rio_id, 'h5', 'East 3',       'cb', 5, 5, 6, 4800),
    (org_id, rio_id, 'h6', 'River C',      'm3', 3, 2, 4, 4200);

  insert into blocked_slots (org_id, farm_id, resource_ext, day, len, label) values
    (org_id, rio_id, 'm2', 0, 3, 'Maintenance');

  insert into capacity_conflicts (org_id, farm_id, ext_id, icon, parcel, resource, loss, action_label, action_cost) values
    (org_id, rio_id, 'maq',  'tractor', 'North A', 'Machinery', 2940, 'Move up Harvester #2 maintenance', 620),
    (org_id, rio_id, 'crew', 'crew',    'West 2',  'Labor',     2080, 'Hire external crew (Wednesday)',    870),
    (org_id, rio_id, 'box',  'box',     'North A', 'Packaging', 1120, 'Rush order 620 crates (today)',     250);

  -- ── Llano Seco Ranch ─────────────────────────────────────────────
  insert into farms (org_id, name, location, lat, lon, plan, initials)
    values (org_id, 'Llano Seco Ranch', 'Lubbock County, TX', 33.58, -101.85, 'Pro', 'LS')
    returning id into llano_id;

  insert into parcels (org_id, farm_id, name, crop, area_ac, hours_to_window_close, margin_per_acre, margin_pct, polygon, cx, cy) values
    (org_id, llano_id, 'Mesa 1',     'Upland cotton', 420, 120, 104, 65, '60,40 230,35 240,150 70,160',  150, 95),
    (org_id, llano_id, 'Mesa 2',     'Winter wheat',  380, 48,  82,  51, '260,40 440,45 435,155 250,150',345, 95),
    (org_id, llano_id, 'Draw North', 'Grain sorghum', 260, 168, 71,  44, '60,180 250,175 245,300 70,310',155, 240),
    (org_id, llano_id, 'Draw South', 'Peanuts',       150, 72,  133, 83, '280,180 450,185 455,305 290,310',365, 245);
end $$;
