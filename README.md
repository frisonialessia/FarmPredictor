# FarmPredictor

Operations Intelligence for high-yield farms. Crosses optimal harvest windows with the machinery, crews, supplies and weather a farm actually has — and surfaces the gap in dollars.

Built with **Next.js 14 (App Router) + TypeScript + Tailwind CSS**.

## What's inside

- **Landing** (`/`) — product story, animated, links into the app.
- **Dashboard** (`/dashboard`) — 8 views:
  - Overview, Parcel map (interactive SVG), Planner (drag & drop + monthly calendar), What-if simulator (live margin), Financial, Operations, Activity, Settings (currency/units propagate app-wide).
- Multi-farm switcher (Rio Verde Farms / Llano Seco Ranch), USD/EUR/MXN/CAD currencies, Texas-based demo data.

> All data is **simulated** for the prototype. The architecture is ready to connect real data (market prices, weather, Supabase) in a later phase.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Build

```bash
npm run build
npm start
```

## Deploy to Vercel

1. Push this repo to GitHub.
2. In Vercel, "Add New Project" → import the GitHub repo.
3. Framework preset: **Next.js** (auto-detected). No env vars needed for the prototype.
4. Deploy.

## Project structure

```
app/
  layout.tsx          Root layout, fonts, metadata
  page.tsx            Landing
  dashboard/page.tsx  Dashboard shell + view switching
  globals.css
components/
  Sidebar.tsx, Icon.tsx, BrandMark.tsx
  views/              Overview, ParcelMap, Planner, Simulator, Financial, Operations, Activity, Settings
data/
  farms.ts            Typed farm + market data
  planner.ts          Planner & simulator seed data
lib/
  types.ts            Domain types (single source of truth)
  store.tsx           Shared app state (farm, currency, units)
  format.ts           Currency & temperature formatters
  icons.ts            Icon path set
public/
  favicon.svg
```

## Roadmap (next phases)

- Shared state between Planner and Simulator (move a harvest → simulator margin updates).
- Guided tour animating the execution-displacement story.
- Real data: Supabase (Postgres + RLS), live market prices, weather API, Sentinel-2 satellite layer.
