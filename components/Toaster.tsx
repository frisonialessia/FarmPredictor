"use client";
import { useApp } from "@/lib/store";
import { useT } from "@/lib/i18n";

// Renders transient confirmation toasts triggered via useApp().toast(...).
export function Toaster() {
  const { toasts } = useApp();
  const t = useT();
  return (
    <div className="fixed z-[60] bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="toast-in pointer-events-auto rounded-full px-4 py-2.5 text-sm font-semibold shadow-lg flex items-center gap-2"
          style={{ background: "var(--ink)", color: "#fff" }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--lime)" }} />
          {t(toast.msg)}
        </div>
      ))}
    </div>
  );
}
