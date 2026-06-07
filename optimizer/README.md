# 🐍 FarmPredictor Optimizer (Phase 3 — not yet deployed)

An **isolated Python microservice** that does the math the TypeScript app can't
do well: combinatorial harvest scheduling. The Next.js app stays the product;
this service is just a calculator it can call over HTTP.

> **Status: skeleton.** This runs and returns correct results today, but it is
> **not wired into the app and not deployed**. It exists so Phase 3 is a swap,
> not a rewrite. See the root `README.md` roadmap.

## Why this is a separate service

- The app's engines (`lib/timing.ts`, `engine.ts`) use **heuristics** — fast,
  free, good enough for a few parcels.
- Real farms with many parcels + few machines + limited crews + changing
  weather turn "what day do I harvest?" into an **NP-hard assignment problem**.
  [Google OR-Tools](https://developers.google.com/optimization) (Python) solves
  exactly that — so it lives here, not in the TS bundle.

## What it exposes

```
GET  /health              → { "status": "ok" }
POST /timing              → mirrors lib/timing.ts (parity check, identical I/O)
POST /optimize            → CP-SAT assignment: harvest → day, minimizing total loss
```

`/timing` exists on purpose: it returns the **exact same numbers** as the TS
heuristic, so you can prove the service is correct before trusting `/optimize`
(which can only ever do as well or better).

## Run it locally

```bash
cd optimizer
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000   # http://localhost:8000/docs
pytest                                        # parity test vs the TS engine
```

Open http://localhost:8000/docs for the interactive API (FastAPI/Swagger).

## How the TS app will call it (later)

A new `OrToolsPlanner` in `lib/` implements the same shape as `plannerForFarm`,
`fetch`es `POST /optimize`, and **falls back to the TS heuristic if the service
is unreachable** — exactly like the assistant falls back to the free mock when
`ANTHROPIC_API_KEY` is unset. Zero downtime, zero lock-in.

```
Next.js (Vercel)  ──POST /optimize──▶  this service (Fly.io / Railway / Render)
   lib/repo        ◀──schedule, loss──   FastAPI + OR-Tools
```

## Deploying (when demand justifies it)

- **Not Vercel** (that's for JS). Use Fly.io / Railway / Render — all have a
  cheap/free tier. A `Dockerfile` is included.
- Add per-call usage metering (this burns CPU) → feeds the subscription/token
  billing model.

## Layout

```
optimizer/
  app/
    main.py        FastAPI app + routes
    models.py      pydantic schemas (mirror lib/types.ts: Harvest, WeatherDay)
    engine.py      degradation + weather penalty (ports lib/engine.ts & timing.ts)
    optimize.py    OR-Tools CP-SAT scheduling model
  tests/
    test_parity.py parity with the TS heuristic on a known case
  requirements.txt
  Dockerfile
```
