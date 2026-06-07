"use client";
import { useEffect } from "react";
import { useLang, setLang, initLang } from "@/lib/lang";
import type { Lang } from "@/lib/types";

// EN/ES toggle for the marketing/auth pages. `dark` styles it for dark backgrounds.
export function MarketingLangToggle({ dark = false }: { dark?: boolean }) {
  const lang = useLang();
  useEffect(() => { initLang(); }, []);
  const opts: [Lang, string][] = [["en", "EN"], ["es", "ES"]];
  return (
    <div
      className="flex items-center rounded-full p-0.5 border"
      style={{ borderColor: dark ? "rgba(255,255,255,.25)" : "var(--line)", background: dark ? "rgba(255,255,255,.08)" : "#fff" }}
      role="group"
      aria-label="Language"
    >
      {opts.map(([code, label]) => (
        <button
          key={code}
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
          className="text-[11px] font-bold px-2.5 py-1 rounded-full transition-colors"
          style={{
            background: lang === code ? (dark ? "#fff" : "var(--ink)") : "transparent",
            color: lang === code ? (dark ? "var(--ink)" : "#fff") : (dark ? "rgba(255,255,255,.7)" : "var(--muted)"),
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
