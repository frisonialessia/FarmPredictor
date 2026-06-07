"use client";
// Mock session for the offline build. When Supabase lands, these become
// supabase.auth.* calls — the UI that uses them won't change.
export interface Session {
  name: string;
  email: string;
}

const KEY = "fp_session";

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const s = window.localStorage.getItem(KEY);
    return s ? (JSON.parse(s) as Session) : null;
  } catch {
    return null;
  }
}

export function setSession(s: Session) {
  try { window.localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* ignore */ }
}

export function clearSession() {
  try { window.localStorage.removeItem(KEY); } catch { /* ignore */ }
}
