"""Faithful Python port of the scoring rules in `lib/engine.ts` and
`lib/timing.ts`. These MUST stay numerically identical to the TS side — the
parity test in tests/test_parity.py guards that. The OR-Tools model in
optimize.py reuses `day_score` so the optimizer and the heuristic agree on what
a day is worth."""
from __future__ import annotations

from typing import List, Optional, Tuple

from .models import Harvest, TimingRec, TimingReason, WeatherDay


def degradation_for(days_off: int, value: float) -> int:
    """Port of degradationFor: non-linear rot the further a harvest slips from
    its window, capped at 60% of the harvest's own value."""
    if days_off <= 0:
        return 0
    factor = min(0.6, 0.06 * days_off + 0.02 * days_off * days_off)
    return round(value * factor)


def weather_penalty(w: Optional[WeatherDay], value: float) -> Tuple[int, Optional[TimingReason]]:
    """Port of timing.ts weatherPenalty: storm (rain >= 60%) hurts field access
    and quality; hard frost (temp <= 34F) damages the crop."""
    if w is None:
        return 0, None
    if w.rainPct >= 60:
        return round(value * (w.rainPct / 100) * 0.18), "storm"
    if w.tempF <= 34:
        return round(value * 0.1), "frost"
    return 0, None


def _days_off(h: Harvest, day: int) -> int:
    lo, hi = h.window
    if lo <= day <= hi:
        return 0
    return min(abs(day - lo), abs(day - hi))


def day_score(h: Harvest, day: int, weather: List[WeatherDay]) -> int:
    """Port of timing.ts dayScore: full value minus timing degradation minus the
    weather penalty for that day. Integer-valued, matching the rounded TS path."""
    deg = degradation_for(_days_off(h, day), h.value)
    w = weather[day] if 0 <= day < len(weather) else None
    pen, _ = weather_penalty(w, h.value)
    return round(h.value - deg - pen)


def harvest_timing(plan: List[Harvest], weather: List[WeatherDay]) -> List[TimingRec]:
    """Port of timing.ts harvestTiming: per harvest, find the best day in the
    week and recommend the move if it beats the current day. Top 4 by gain."""
    recs: List[TimingRec] = []
    max_day = min(6, (len(weather) or 7) - 1)
    for h in plan:
        current = day_score(h, h.day, weather)
        best_day, best = h.day, current
        for d in range(0, max_day + 1):
            s = day_score(h, d, weather)
            if s > best:
                best, best_day = s, d
        delta = round(best - current)
        if best_day != h.day and delta > 0:
            w = weather[h.day] if 0 <= h.day < len(weather) else None
            _, reason = weather_penalty(w, h.value)
            recs.append(
                TimingRec(
                    id=h.id,
                    label=h.label,
                    currentDay=h.day,
                    bestDay=best_day,
                    delta=delta,
                    reason=reason or "degradation",
                )
            )
    recs.sort(key=lambda r: r.delta, reverse=True)
    return recs[:4]
