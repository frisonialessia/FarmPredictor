"use client";
import { useSyncExternalStore } from "react";
import type { Lang } from "./types";
import { translate } from "./i18n";

// Language store for pages OUTSIDE the dashboard's AppProvider (landing, auth,
// onboarding, pricing). Shares the same localStorage key ("fp_lang") as the
// dashboard, so the preference persists across the whole app.
let current: Lang = "en";
let initialized = false;
const listeners = new Set<() => void>();

export function setLang(l: Lang) {
  current = l;
  try { window.localStorage.setItem("fp_lang", l); } catch { /* ignore */ }
  listeners.forEach((fn) => fn());
}

export function initLang() {
  if (initialized) return;
  initialized = true;
  try {
    const s = window.localStorage.getItem("fp_lang");
    if (s === "en" || s === "es") {
      current = s;
      listeners.forEach((fn) => fn());
    }
  } catch { /* ignore */ }
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

// Server snapshot is always "en" → server + first client render match (no
// hydration mismatch); the persisted language loads after mount via initLang().
export function useLang(): Lang {
  return useSyncExternalStore(subscribe, () => current, () => "en");
}

export function useMarketingT() {
  const lang = useLang();
  return (s: string) => translate(lang, s);
}
