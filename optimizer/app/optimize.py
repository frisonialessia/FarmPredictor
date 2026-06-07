"""The reason this service exists: a CP-SAT model that assigns every harvest to
a day so the WHOLE plan's net value is maximised at once — respecting daily
capacity (only so many machines/crews exist). The per-harvest heuristic in
engine.py is greedy and can pile everything onto the same "best" day; this
solver resolves those collisions optimally.

`value_at_day` reuses engine.day_score, so the optimizer speaks the exact same
dollars as the TS heuristic — it just searches the joint space the heuristic
can't."""
from __future__ import annotations

from ortools.sat.python import cp_model

from .engine import day_score
from .models import OptimizeRequest, OptimizeResult, ScheduledHarvest


def optimize(req: OptimizeRequest) -> OptimizeResult:
    plan = req.plan
    weather = req.weather
    max_day = min(6, (len(weather) or 7) - 1)
    days = list(range(0, max_day + 1))

    model = cp_model.CpModel()

    # x[i, d] = 1 if harvest i is worked on day d. Each harvest goes on exactly
    # one day; the objective sums the net value realised on the chosen days.
    x: dict[tuple[int, int], cp_model.IntVar] = {}
    for i, h in enumerate(plan):
        for d in days:
            x[i, d] = model.NewBoolVar(f"x_{i}_{d}")
        model.AddExactlyOne(x[i, d] for d in days)

    # Capacity: at most `dailyCapacity` harvests share any single day. When
    # unset, capacity isn't binding and /optimize matches the greedy heuristic.
    if req.dailyCapacity is not None:
        for d in days:
            model.Add(sum(x[i, d] for i in range(len(plan))) <= req.dailyCapacity)

    model.Maximize(
        sum(day_score(h, d, weather) * x[i, d] for i, h in enumerate(plan) for d in days)
    )

    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 5.0
    status = solver.Solve(model)
    status_name = solver.StatusName(status)

    schedule: list[ScheduledHarvest] = []
    total_value = 0
    gross_optimal = 0
    if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        for i, h in enumerate(plan):
            gross_optimal += round(h.value)
            assigned = next(d for d in days if solver.Value(x[i, d]) == 1)
            v = day_score(h, assigned, weather)
            total_value += v
            schedule.append(
                ScheduledHarvest(
                    id=h.id,
                    label=h.label,
                    currentDay=h.day,
                    assignedDay=assigned,
                    valueAtDay=v,
                )
            )

    return OptimizeResult(
        schedule=schedule,
        totalValue=total_value,
        totalLoss=gross_optimal - total_value,
        grossOptimal=gross_optimal,
        status=status_name,
    )
