"""FastAPI entrypoint. Three routes:
  GET  /health   — liveness for the host (Fly.io/Railway/Render)
  POST /timing   — parity mirror of lib/timing.ts (same numbers as the TS app)
  POST /optimize — the OR-Tools value-maximising scheduler

CORS is open here for local dev; lock it to the app's origin before deploying."""
from __future__ import annotations

from typing import List

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .engine import harvest_timing
from .models import OptimizeRequest, OptimizeResult, TimingRec, TimingRequest
from .optimize import optimize

app = FastAPI(
    title="FarmPredictor Optimizer",
    version="0.1.0",
    description="Phase 3 math muscle: harvest scheduling with OR-Tools. Skeleton — not deployed.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: restrict to the app origin before deploy
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/timing", response_model=List[TimingRec])
def timing(req: TimingRequest) -> List[TimingRec]:
    """Returns the exact same recommendations as lib/timing.ts. Used to prove
    parity before trusting /optimize."""
    return harvest_timing(req.plan, req.weather)


@app.post("/optimize", response_model=OptimizeResult)
def optimize_route(req: OptimizeRequest) -> OptimizeResult:
    """Assigns every harvest to a day, maximising total net value subject to
    daily capacity. This is what the heuristic can't do."""
    return optimize(req)
