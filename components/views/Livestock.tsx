"use client";
import { useApp } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { Icon } from "@/components/Icon";
import { formatMoney } from "@/lib/format";
import { evaluateHerd } from "@/lib/herd";
import { PENS } from "@/data/livestock";

export function Livestock() {
  const { currency } = useApp();
  const t = useT();
  const herd = evaluateHerd(PENS);
  const treated = herd.pens.filter((p) => p.treatment);

  const kpis: [string, string, string, boolean][] = [
    ["Total head", String(herd.totalHead), "in the herd", false],
    ["Ready to ship", String(herd.ready), "pens at market weight", false],
    ["Margin at risk", formatMoney(herd.marginAtRisk, currency), "recoverable this week", true],
    ["Under treatment", String(herd.underTreatment), "withdrawal windows", false],
  ];

  return (
    <div className="fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {kpis.map(([label, value, sub, hl]) => (
          <div key={label} className="card card-hover p-5">
            <p className="kpi-label">{t(label)}</p>
            <p className={`mono text-2xl font-bold mt-2 ${hl ? "text-green" : ""}`} style={hl && herd.marginAtRisk > 0 ? { color: "var(--warn)" } : undefined}>{value}</p>
            <p className="text-xs mt-1 text-muted">{t(sub)}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* pens */}
        <div className="lg:col-span-2 card p-6">
          <h4 className="text-[15px] font-bold mb-1">{t("Pens")}</h4>
          <p className="text-xs mb-4 text-muted">{t("Sell at the optimal window — when you can, not just when they're ready")}</p>
          <div>
            {herd.pens.map((p, i) => {
              const pct = Math.min(100, (p.avgWeightLb / p.targetWeightLb) * 100);
              const badge = p.status === "ready" ? { bg: "var(--mint)", col: "var(--ink)", label: t("Ready to ship") }
                : p.status === "blocked" ? { bg: "rgba(194,65,12,.1)", col: "var(--warn)", label: t("Withdrawal") }
                : { bg: "var(--bg)", col: "var(--muted)", label: `${p.daysToTarget}${t("d to target")}` };
              const action = p.status === "ready" ? t("Ship this week")
                : p.status === "blocked" ? `${t("Can't sell until day")} ${p.treatment!.withdrawalUntilDay} — ${t("schedule after")}`
                : t("On track");
              return (
                <div key={p.id} className={`flex items-center gap-4 py-3 ${i > 0 ? "border-t border-line" : ""}`}>
                  <div className="grid place-items-center h-10 w-10 rounded-xl shrink-0" style={{ background: "var(--mint)" }}><Icon name="cattle" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2"><span className="text-sm font-bold">{p.name}</span><span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: badge.bg, color: badge.col }}>{badge.label}</span></div>
                    <p className="text-xs text-muted mt-0.5">{p.head} {t("head")} · {action}</p>
                    <div className="h-1.5 rounded-full mt-1.5 overflow-hidden" style={{ background: "var(--line-soft)", maxWidth: 260 }}><div className="h-full rounded-full" style={{ width: `${pct}%`, background: "linear-gradient(90deg,var(--green-deep),var(--green))" }} /></div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="mono text-sm font-bold">{p.avgWeightLb}<span className="text-muted">/{p.targetWeightLb} lb</span></p>
                    {p.marginAtRisk > 0 && <p className="mono text-xs font-bold" style={{ color: "var(--warn)" }}>-{formatMoney(p.marginAtRisk, currency)}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* vet withdrawal */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-1"><Icon name="vial" size={16} /><h4 className="text-[15px] font-bold">{t("Vet & withdrawal")}</h4></div>
          <p className="text-xs mb-4 text-muted">{t("Treatments that block a sale")}</p>
          {treated.length === 0 ? (
            <p className="text-sm text-muted">{t("No active treatments.")}</p>
          ) : (
            <div className="space-y-3">
              {treated.map((p) => (
                <div key={p.id} className="rounded-xl p-3 border border-line">
                  <div className="flex items-center justify-between"><span className="text-sm font-bold">{p.name}</span><span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(194,65,12,.1)", color: "var(--warn)" }}>{t("Withdrawal")}</span></div>
                  <p className="text-xs text-muted mt-1">{p.treatment!.name}</p>
                  <p className="text-xs mt-1.5">{t("Clear to sell on day")} <b>{p.treatment!.withdrawalUntilDay}</b> · <span className="mono font-semibold" style={{ color: "var(--warn)" }}>-{formatMoney(p.marginAtRisk, currency)}</span> {t("in extra feed")}</p>
                </div>
              ))}
            </div>
          )}
          <p className="text-[11px] text-muted mt-4">{t("Heat-stress risk for livestock appears in the Overview risk radar.")}</p>
        </div>
      </div>
    </div>
  );
}
