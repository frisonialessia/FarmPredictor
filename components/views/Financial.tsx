"use client";
import { useFarm, useApp } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { formatMoney } from "@/lib/format";

const FINK = [
  { l: "Projected revenue", base: 228000, s: "this season" },
  { l: "Net margin", base: 76500, s: "33.5% of sales", hl: true },
  { l: "Production cost", base: 151500, s: "cumulative" },
];
const CF = [14, 22, 31, 27, 38, 34];
const CONTRACTS: [string, string, string, number][] = [
  ["Sysco Foods", "Sweet corn", "12,000 crates", 82],
  ["HEB Grocery", "Grapefruit", "8,500 boxes", 64],
  ["Cotton Co-op", "Upland cotton", "240 bales", 95],
  ["Open market", "Grain sorghum", "unsold", 30],
];

export function Financial() {
  const farm = useFarm();
  const { currency } = useApp();
  const t = useT();
  const maxM = Math.max(...farm.parcels.map((p) => p.marginPerAcre));
  return (
    <div className="fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {FINK.map((k) => (
          <div key={k.l} className="card p-5"><p className="text-xs text-muted">{t(k.l)}</p><p className={`mono text-2xl font-bold mt-2 ${k.hl ? "text-green" : ""}`}>{formatMoney(k.base, currency)}</p><p className="text-xs mt-1 text-muted">{t(k.s)}</p></div>
        ))}
        <div className="card p-5"><p className="text-xs text-muted">{t("Committed")}</p><p className="mono text-2xl font-bold mt-2">68%</p><p className="text-xs mt-1 text-muted">{t("in sales contracts")}</p></div>
      </div>
      <div className="grid lg:grid-cols-5 gap-5 mb-5">
        <div className="lg:col-span-3 card p-6">
          <h4 className="text-[15px] font-bold mb-1">{t("Margin by parcel")}</h4><p className="text-xs mb-4 text-muted">{t("Estimated net profit per acre")}</p>
          <div className="space-y-3">
            {[...farm.parcels].sort((a, b) => b.marginPerAcre - a.marginPerAcre).map((p) => (
              <div key={p.id}><div className="flex items-center justify-between mb-1"><span className="text-sm font-medium">{p.name}</span><span className="mono text-sm font-bold">{formatMoney(p.marginPerAcre, currency)}/ac</span></div><div className="h-2.5 rounded-full" style={{ background: "var(--mint)" }}><div className="h-full rounded-full" style={{ width: `${(p.marginPerAcre / maxM) * 100}%`, background: "var(--green)" }} /></div></div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-2 card p-6">
          <h4 className="text-[15px] font-bold mb-1">{t("Projected cash flow")}</h4><p className="text-xs mb-4 text-muted">{t("Next 6 weeks")}</p>
          <div className="flex items-end gap-2 h-40 mt-2">
            {CF.map((v, i) => (<div key={i} className="flex-1 flex flex-col items-center justify-end gap-1 h-full"><span className="text-[10px] mono font-semibold text-muted">${v}k</span><div className="w-full rounded-t-lg" style={{ height: `${(v / 38) * 84}%`, minHeight: 6, background: i === 4 ? "var(--green)" : "var(--mint)" }} /><span className="text-[10px] mono text-muted">W{i + 1}</span></div>))}
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-line text-sm"><span className="text-muted">{t("Committed in contracts")}</span><span className="mono font-bold">68%</span></div>
        </div>
      </div>
      <div className="card p-6">
        <h4 className="text-[15px] font-bold mb-1">{t("Sales contracts")}</h4><p className="text-xs mb-4 text-muted">{t("Committed volume vs. open")}</p>
        <div>
          {CONTRACTS.map((c, i) => (
            <div key={i} className={`flex items-center gap-4 py-3 ${i > 0 ? "border-t border-line" : ""}`}>
              <div className="flex-1"><p className="text-sm font-semibold">{t(c[0])}</p><p className="text-xs text-muted">{t(c[1])} · {t(c[2])}</p></div>
              <div className="w-32"><div className="h-2 rounded-full" style={{ background: "var(--mint)" }}><div className="h-full rounded-full" style={{ width: `${c[3]}%`, background: "var(--green)" }} /></div></div>
              <span className="mono text-xs font-bold w-10 text-right">{c[3]}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
