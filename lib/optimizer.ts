"use client";
// ── Phase 3 client: the bridge to the Python + OR-Tools microservice ──────
// This is the ONE place the app talks to the optimizer (see optimizer/). It is
// OFF by default: when NEXT_PUBLIC_OPTIMIZER_URL is unset, every call returns
// null and callers fall back to the built-in TypeScript heuristics — so the
// app behaves exactly as today. Deploy the service, set the env var, and
// scheduling becomes optimal with zero code changes. Same pattern as the
// assistant degrading to the free mock without ANTHROPIC_API_KEY.
import { useEffect, useState } from "react";
import type { Harvest, WeatherDay } from "./types";
import { harvestTiming, type TimingRec } from "./timing";
import { env } from "./env";

export const OPTIMIZER_URL = env.optimizerUrl;
export const optimizerEnabled = (): boolean => OPTIMIZER_URL.length > 0;

// Mirror of optimizer/app/models.py OptimizeResult.
export interface ScheduledHarvest {
  id: string;
  label: string;
  currentDay: number;
  assignedDay: number;
  valueAtDay: number;
}
export interface OptimizeResult {
  schedule: ScheduledHarvest[];
  totalValue: number;
  totalLoss: number;
  grossOptimal: number;
  status: string;
}

async function post<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${OPTIMIZER_URL}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok) throw new Error(`optimizer ${res.status}`);
  return (await res.json()) as T;
}

// Remote timing — identical shape to harvestTiming. null = disabled/unreachable.
export async function remoteTiming(
  plan: Harvest[],
  weather: WeatherDay[],
  signal?: AbortSignal,
): Promise<TimingRec[] | null> {
  if (!optimizerEnabled()) return null;
  try {
    return await post<TimingRec[]>("/timing", { plan, weather }, signal);
  } catch {
    return null;
  }
}

// Whole-plan, capacity-aware scheduler (the thing TS can't do). null on failure.
export async function remoteSchedule(
  plan: Harvest[],
  weather: WeatherDay[],
  dailyCapacity?: number,
  signal?: AbortSignal,
): Promise<OptimizeResult | null> {
  if (!optimizerEnabled()) return null;
  try {
    return await post<OptimizeResult>("/optimize", { plan, weather, dailyCapacity }, signal);
  } catch {
    return null;
  }
}

// Progressive enhancement: render the heuristic immediately (SSR-safe, same as
// today), then upgrade to the optimizer's answer if the service is configured
// and reachable. With the env var unset this returns the heuristic, unchanged.
export function useOptimizedTiming(plan: Harvest[], weather: WeatherDay[]): TimingRec[] {
  const heuristic = harvestTiming(plan, weather);
  const [remote, setRemote] = useState<TimingRec[] | null>(null);
  // Stable dependency: re-fetch only when the plan/weather meaningfully change.
  const key = JSON.stringify({
    p: plan.map((h) => [h.id, h.row, h.day, h.value, h.window]),
    w: weather.map((d) => [d.tempF, d.rainPct]),
  });
  useEffect(() => {
    if (!optimizerEnabled()) {
      setRemote(null);
      return;
    }
    const ctrl = new AbortController();
    remoteTiming(plan, weather, ctrl.signal).then((r) => {
      if (r) setRemote(r);
    });
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return remote ?? heuristic;
}
