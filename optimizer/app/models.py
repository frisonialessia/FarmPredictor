"""Pydantic schemas — deliberate 1:1 mirror of the TypeScript types in
`lib/types.ts`, so the JSON crossing the wire is identical on both sides.
Keeping these in lockstep is what makes the service a drop-in for the TS
heuristic instead of a parallel universe."""
from __future__ import annotations

from typing import List, Literal, Optional, Tuple

from pydantic import BaseModel, Field


class WeatherDay(BaseModel):
    """Mirror of lib/types.ts WeatherDay."""
    day: str
    icon: Literal["sun", "cloudsun", "rain"]
    tempF: float
    rainPct: float


class Harvest(BaseModel):
    """Mirror of lib/types.ts Harvest."""
    id: str
    label: str
    row: str
    day: int = Field(ge=0)
    window: Tuple[int, int]
    value: float
    conflict: Optional[bool] = None
    outOfWindow: Optional[bool] = None


TimingReason = Literal["storm", "frost", "degradation"]


class TimingRec(BaseModel):
    """Mirror of lib/timing.ts TimingRec."""
    id: str
    label: str
    currentDay: int
    bestDay: int
    delta: int
    reason: TimingReason


class TimingRequest(BaseModel):
    plan: List[Harvest]
    weather: List[WeatherDay]


class OptimizeRequest(BaseModel):
    plan: List[Harvest]
    weather: List[WeatherDay]
    # capacity: at most this many harvests can be worked on any single day
    # (machines/crews available). Defaults to "no limit" so /optimize reduces to
    # the per-harvest timing problem when capacity isn't a constraint.
    dailyCapacity: Optional[int] = Field(default=None, ge=1)


class ScheduledHarvest(BaseModel):
    id: str
    label: str
    currentDay: int
    assignedDay: int
    valueAtDay: int  # net value realised on the assigned day


class OptimizeResult(BaseModel):
    schedule: List[ScheduledHarvest]
    totalValue: int       # sum of net value across all harvests in this plan
    totalLoss: int        # grossOptimal - totalValue (degradation + weather)
    grossOptimal: int     # sum of harvest values with zero loss (the ceiling)
    status: str           # CP-SAT status: OPTIMAL / FEASIBLE / ...
