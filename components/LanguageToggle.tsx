"use client";
import { useApp } from "@/lib/store";
import type { Lang } from "@/lib/types";

// Compact EN/ES segmented toggle. English is primary, Spanish secondary.
export function LanguageToggle() {
  const { lang, setLang } = useApp();
  const opts: [Lang, string][] = [["en", "EN"], ["es", "ES"]];
  return (
    <div className="flex items-center rounded-full p-0.5 border border-line" style={{ background: "#fff" }} role="group" aria-label="Language">
      {opts.map(([code, label]) => (
        <button
          key={code}
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
          className="text-[11px] font-bold px-2.5 py-1 rounded-full transition-colors"
          style={{ background: lang === code ? "var(--ink)" : "transparent", color: lang === code ? "#fff" : "var(--muted)" }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
