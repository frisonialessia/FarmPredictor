"use client";
import { useT } from "@/lib/i18n";
import { Icon } from "@/components/Icon";
import { BrandMark } from "@/components/BrandMark";

// First-run welcome for the demo: sets the one idea, says it's sample data, and
// offers the 60-second tour or free exploration. Shown once (localStorage flag).
export function WelcomeModal({ onTour, onClose }: { onTour: () => void; onClose: () => void }) {
  const t = useT();
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center p-4" style={{ background: "rgba(11,15,12,.55)", backdropFilter: "blur(4px)" }}>
      <div className="toast-in w-full max-w-md rounded-3xl overflow-hidden bg-white" style={{ boxShadow: "var(--shadow-lg)" }}>
        <div className="relative p-7 text-white overflow-hidden" style={{ background: "linear-gradient(135deg,#0B0F0C,#143b1f 60%,#1d5c2e)" }}>
          <button onClick={onClose} aria-label={t("Close")} className="absolute top-4 right-4 text-white/60 hover:text-white"><Icon name="x" size={18} /></button>
          <div className="flex items-center gap-2.5 mb-5"><BrandMark size={28} /><span className="font-bold tracking-tight text-lg">FarmPredictor</span></div>
          <span className="inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full mb-3" style={{ background: "var(--lime)", color: "var(--ink)" }}>{t("Welcome to the demo")}</span>
          <h2 className="text-2xl font-extrabold leading-tight">{t("It's not")} <span style={{ color: "var(--lime)" }}>{t("when")}</span> {t("you should harvest.")}<br />{t("It's when you")} <span style={{ color: "var(--lime)" }}>{t("can.")}</span></h2>
          <p className="text-sm mt-3" style={{ color: "rgba(255,255,255,.8)" }}>{t("See the gap between your optimal plan and the one you can actually run — measured in money, and how to close it.")}</p>
        </div>
        <div className="p-6">
          <p className="text-xs text-muted mb-5 flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: "var(--green)" }} />{t("This is a sample farm. Nothing you do here is saved to a server.")}</p>
          <button onClick={onTour} className="w-full rounded-full py-3 text-sm font-bold btn-press flex items-center justify-center gap-2" style={{ background: "var(--green)", color: "var(--ink)" }}>
            <Icon name="play" size={14} />{t("Take the 60-second tour")}
          </button>
          <button onClick={onClose} className="w-full mt-3 rounded-full py-3 text-sm font-semibold btn-press border border-line hover:bg-bg">{t("Explore on my own")}</button>
        </div>
      </div>
    </div>
  );
}
