"use client";
import { Icon } from "@/components/Icon";
import { useT } from "@/lib/i18n";
import { NAV } from "@/components/Sidebar";

// Bottom tab bar shown only on small screens (the left rail is hidden there).
// Horizontally scrollable so every destination stays reachable on a phone.
export function MobileNav({ active, onNavigate }: { active: string; onNavigate: (id: string) => void }) {
  const t = useT();
  const items: [string, string, string][] = [...NAV, ["settings", "Settings", "settings"]];
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-line"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex overflow-x-auto no-scrollbar px-1.5 py-1.5 gap-1">
        {items.map(([id, label, icon]) => {
          const on = active === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl shrink-0 min-w-[64px] transition-colors ${on ? "bg-ink text-white" : "text-ink"}`}
            >
              <span style={{ color: on ? "var(--lime)" : "var(--ink)" }}>
                <Icon name={icon} size={19} />
              </span>
              <span className="text-[9px] font-semibold leading-none whitespace-nowrap">{t(label)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
