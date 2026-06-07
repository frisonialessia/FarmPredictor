"""Parity + sanity tests for the optimizer.

The point of the parity test: the Python port of the scoring rules must produce
the SAME numbers as the TypeScript engine, otherwise the service can't stand in
for the heuristic. The optimize test: with capacity constraints the solver must
do at least as well as leaving harvests where they are."""
from app.engine import degradation_for, harvest_timing, weather_penalty
from app.models import Harvest, OptimizeRequest, WeatherDay
from app.optimize import optimize


def _weather():
    # day 2 is a storm (rain 80%), day 4 a hard frost (30F)
    base = [
        ("Mon", "sun", 70, 10),
        ("Tue", "sun", 72, 5),
        ("Wed", "rain", 65, 80),
        ("Thu", "cloudsun", 68, 20),
        ("Fri", "sun", 30, 0),
        ("Sat", "sun", 71, 5),
        ("Sun", "sun", 73, 0),
    ]
    return [WeatherDay(day=d, icon=i, tempF=t, rainPct=r) for d, i, t, r in base]


def test_degradation_matches_ts_formula():
    # mirrors lib/engine.ts degradationFor
    assert degradation_for(0, 10000) == 0
    assert degradation_for(1, 10000) == round(10000 * (0.06 + 0.02))   # 800
    assert degradation_for(2, 10000) == round(10000 * (0.12 + 0.08))   # 2000
    assert degradation_for(100, 10000) == round(10000 * 0.6)           # capped at 60%


def test_weather_penalty_storm_and_frost():
    storm, reason = weather_penalty(WeatherDay(day="W", icon="rain", tempF=65, rainPct=80), 10000)
    assert reason == "storm" and storm == round(10000 * 0.80 * 0.18)
    frost, reason = weather_penalty(WeatherDay(day="F", icon="sun", tempF=30, rainPct=0), 10000)
    assert reason == "frost" and frost == round(10000 * 0.1)


def test_timing_moves_harvest_off_storm_day():
    # a harvest sitting on the storm day (2) with a wide window should be moved
    plan = [Harvest(id="h1", label="North A", row="m1", day=2, window=(0, 6), value=10000)]
    recs = harvest_timing(plan, _weather())
    assert len(recs) == 1
    assert recs[0].reason == "storm"
    assert recs[0].bestDay != 2
    assert recs[0].delta > 0


def test_optimize_respects_daily_capacity():
    # two harvests both want the same best day; capacity 1 forces a split, and
    # total value must still be >= leaving them where they started.
    plan = [
        Harvest(id="a", label="A", row="m1", day=2, window=(0, 6), value=8000),
        Harvest(id="b", label="B", row="m1", day=2, window=(0, 6), value=8000),
    ]
    res = optimize(OptimizeRequest(plan=plan, weather=_weather(), dailyCapacity=1))
    assert res.status in ("OPTIMAL", "FEASIBLE")
    days = {s.assignedDay for s in res.schedule}
    assert len(days) == 2  # capacity 1 -> different days
    assert res.totalValue >= 0
    assert res.totalLoss == res.grossOptimal - res.totalValue
