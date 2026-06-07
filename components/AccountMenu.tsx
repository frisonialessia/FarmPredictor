"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { Icon } from "@/components/Icon";
import { getSession, clearSession } from "@/lib/session";
import type { Currency } from "@/lib/types";

const CURRENCIES: Currency[] = ["USD", "MXN", "EUR", "CAD"];

// Top-bar account menu: shows the signed-in user, lets them pick the currency
// they view data in, links to Settings, signs out.
export function AccountMenu({ onNavigate }: { onNavigate: (id: string) => void }) {
  const { userName, currency, setCurrency } = useApp();
  const t = useT();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  // Session lives in localStorage → read after mount (SSR-safe).
  useEffect(() => { setEmail(getSession()?.email ?? null); }, []);

  const initials = userName.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "U";

  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} className="h-9 w-9 rounded-full grid place-items-center text-xs font-bold btn-press" style={{ background: "var(--lime)", color: "var(--ink)" }} aria-label={t("Account")}>
        {initials}
      </button>
      {open && (
        <>
          <button className="fixed inset-0 z-30 cursor-default" aria-hidden onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-40 mt-2 bg-white border border-line rounded-xl overflow-hidden" style={{ width: 230, boxShadow: "var(--shadow-lg)" }}>
            <div className="px-4 py-3 border-b border-line">
              <p className="text-[10px] uppercase tracking-wider text-muted">{t("Signed in as")}</p>
              <p className="text-sm font-bold truncate">{userName}</p>
              {email && <p className="text-xs text-muted truncate">{email}</p>}
            </div>
            <div className="px-4 py-3 border-b border-line">
              <p className="text-[10px] uppercase tracking-wider text-muted mb-1.5">{t("Currency")}</p>
              <div className="flex gap-1">
                {CURRENCIES.map((c) => (
                  <button key={c} onClick={() => setCurrency(c)} className="flex-1 text-[11px] font-bold py-1.5 rounded-lg transition-colors" style={{ background: currency === c ? "var(--ink)" : "var(--bg)", color: currency === c ? "#fff" : "var(--muted)" }}>{c}</button>
                ))}
              </div>
            </div>
            <button onClick={() => { onNavigate("settings"); setOpen(false); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-bg text-left">
              <Icon name="settings" size={16} />{t("Settings")}
            </button>
            <button onClick={() => { clearSession(); router.push("/login"); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-bg text-left" style={{ color: "var(--warn)" }}>
              <Icon name="logout" size={16} />{t("Sign out")}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
