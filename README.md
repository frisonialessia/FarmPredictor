# 🌾 FarmPredictor

**Operations intelligence for high-yield farms.** It answers one question:
**what decision do I make *today* to maximize my net margin *tomorrow*?**

> The thesis: **it's not *when* you should harvest — it's when you *can*.**
> An optimal harvest you can't execute (machine busy, crew short, no crates,
> a storm coming) is **margin that walks off the field**. FarmPredictor
> measures that gap in dollars and helps you close it.

Built for **non-technical farm owners** — every alert is in plain language and
money, never jargon (no NDVI, no scores). *“Harvest North A before Thursday or
lose $2,940.”*

---

## ✨ What it does

- **Unified plan ↔ simulator** — drag a harvest in the Planner and watch the
  net margin move in the What-if Simulator, live, through **one shared engine**.
- **Weather-aware timing** — “harvest today vs. wait”: the best day per harvest
  from the live forecast + crop degradation, in dollars.
- **Machinery economics** — diesel cost/day and an age-based breakdown risk per
  machine.
- **Packaging & spoilage** — inventory value and weekly spoilage cost (“if the
  boxes/produce spoil, what does it cost us?”).
- **Livestock + vet** — herd margin and veterinary withdrawal windows (“ready,
  but you can’t sell until day X”).
- **“Ask your farm” assistant** — plain answers in your currency from your live
  data (Claude API, with a free deterministic fallback).
- **Full farm setup** — onboarding for farm, parcels (free-text crops), team &
  roles, machinery and inventory; preferences for currency, units and a
  worldwide time zone.
- **Bilingual (EN/ES)**, currency conversion, daily decision digest, weather
  risk radar, parcel map, financials and activity log.

---

## 🛠️ Tech stack

- **Next.js 14 (App Router) · TypeScript · Tailwind CSS** — deployed on **Vercel**.
- **Live weather** via [Open-Meteo](https://open-meteo.com) (free, no API key).
- **Claude API** (`@anthropic-ai/sdk`) for the assistant — optional, degrades to
  a free mock when `ANTHROPIC_API_KEY` is unset.
- **Vitest** + **GitHub Actions** CI · **next/og** for social images · **Zod**
  for validation · **Supabase** schema designed (not yet connected).

Python enters later — only as an isolated microservice when real ML/optimization
is justified (see Roadmap).

---

## 🧠 Architecture

The design keeps a **clean boundary between calculation engines and data
sources**, so today’s simulated data can be swapped for real data without
rewriting the UI.

- **Pure, typed engines** (`lib/`): `engine.ts` (unified margin),
  `risk.ts` (weather → $), `timing.ts` (harvest-day optimizer),
  `herd.ts` (livestock), `machinery.ts` (fleet economics),
  `inventory.ts` (spoilage). All take data by parameter and are unit-tested.
- **Repository pattern** (`lib/repo`): the UI reads domain data through a
  `DataRepository` interface. Today it’s an in-memory implementation; going live
  is a one-file swap to a `SupabaseRepository`.
- **Per-farm state**: the active farm’s parcels generate its harvest plan and
  drive the planner/operations; edits persist locally per farm.

---

## 🚀 Getting started

**It runs with zero configuration** — no keys, no database. You get the full
demo on simulated data, with **real weather** and the **free assistant mock**.

```bash
git clone https://github.com/frisonialessia/farmpredictor.git
cd farmpredictor
npm install
cp .env.example .env.local   # optional — every var can stay empty
npm run dev                  # → http://localhost:3000
```

Other scripts:

```bash
npm run build       # production build
npm test            # engine unit tests (Vitest)
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
```

The environment variables below only **upgrade** parts of the app — none are
required to run it (see `.env.example`):

| Variable | What it turns on | If unset |
|---|---|---|
| `ANTHROPIC_API_KEY` | real Claude answers in the assistant | free deterministic mock |
| `NEXT_PUBLIC_OPTIMIZER_URL` | the Python/OR-Tools optimizer (`optimizer/`) | built-in TS heuristic |
| `NEXT_PUBLIC_SITE_URL` | absolute URL for Open Graph / sitemap | Vercel URL, else `localhost` |
| `NEXT_PUBLIC_SENTRY_DSN` | forwards errors to Sentry | local console only |

---

## 📁 Project structure

```
app/            routes — landing, /dashboard, /login, /signup, /onboarding,
                /pricing, opengraph-image, sitemap, robots, /api/assistant
components/     Sidebar, views/ (Overview, Planner, Simulator, Operations,
                Livestock, Financial, Activity, Digest, Assistant, …), charts
lib/            engines (engine, risk, timing, herd, machinery, inventory,
                cropTiming), repo/ (data boundary), permissions (RBAC), auth,
                env, observability, store, i18n, weather, farmFactory, planGen
data/           simulated, typed data (farms, planner, crops, livestock)
supabase/       multi-tenant schema + RLS + seed + CONNECT.md (not yet connected)
optimizer/      Python FastAPI + OR-Tools microservice (Phase 3, not deployed)
```

---

## 📊 Status

This is a **proof of concept with simulated data** — deliberately, to prove one
claim convincingly: *an optimal harvest you can’t execute costs measurable
money.* The calculation engines are pure functions, ready to receive real data
without UI changes.

---

## 🔌 What’s live vs. what’s still to connect

Everything works **today, offline and free** on simulated data. Here’s exactly
what’s real, what’s mocked, and how to wire each part for production:

| Capability | Today | How to connect for real |
|---|---|---|
| **Weather** | 🟢 **Live** (Open-Meteo, no key) | already real |
| **Margin / timing / economics engines** | 🟢 **Real logic** on simulated inputs | feed real data via the repository (below) |
| **AI assistant** | 🟡 Free deterministic mock | set `ANTHROPIC_API_KEY` → Claude |
| **Farm / parcel / market data** | 🟡 In-memory (`data/`) + your browser | swap `MemoryRepository` → `SupabaseRepository` — one file (`lib/repo/index.ts`) |
| **Accounts & auth** | 🟡 Mock (localStorage; any email signs in) | Supabase Auth (cookie sessions + middleware) |
| **Data persistence** | 🟡 Per-browser `localStorage` | Supabase Postgres (multi-tenant + **RLS**) |
| **Scheduling optimizer** | 🟡 TypeScript heuristic | deploy [`optimizer/`](optimizer/) (Python + OR-Tools), set `NEXT_PUBLIC_OPTIMIZER_URL` |
| **Payments / billing** | 🔴 UI + DB schema only | Stripe (tables already in `supabase/`) |
| **Error tracking** | 🔴 Console only | set `NEXT_PUBLIC_SENTRY_DSN` + wire `lib/observability.ts` |

**The backend is the next step, and it’s low-risk by design:** the app reads all
domain data through one async `DataRepository` interface, so going live is mostly
implementing `SupabaseRepository`. Follow the step-by-step
**[Supabase connection runbook →](supabase/CONNECT.md)** (schema, RLS, auth and
env are already written).

---

## 🗺️ Roadmap

- **Phase 1 — the brain (done):** unified engine; weather/timing/machinery/
  inventory economics; guided tour; EN/ES; full farm setup.
- **Phase 2 — real backend:** connect **Supabase** (Postgres + Auth + RLS,
  multi-tenant) — schema and migrations already live in `supabase/`, with a
  step-by-step [connection runbook](supabase/CONNECT.md). Real market prices
  (USDA/SAGARPA).
- **Phase 3 — the math muscle:** an isolated **Python microservice (FastAPI +
  Google OR-Tools)** for crop-degradation ML and combinatorial scheduling
  optimization. The skeleton already lives in [`optimizer/`](optimizer/) (runs,
  tested) and the app is already wired to it behind a flag: set
  `NEXT_PUBLIC_OPTIMIZER_URL` and scheduling upgrades from heuristic to optimal
  with no code changes (it falls back to the heuristic when unset/unreachable).

---

## 📄 License

Prototype · demo data · built for high-yield operations. All rights reserved.
