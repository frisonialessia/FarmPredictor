"use client";
import { useId, useRef, useState } from "react";

// Premium area chart: gradient fill, baseline gridlines and a hover tooltip.
// Strokes use non-scaling-stroke so the line stays crisp at any width, and the
// dots/tooltip are HTML overlays positioned by percentage (never distorted).
export function AreaChart({
  data,
  labels,
  height = 150,
  prefix = "$",
  suffix = "k",
}: {
  data: number[];
  labels: string[];
  height?: number;
  prefix?: string;
  suffix?: string;
}) {
  const gid = useId().replace(/:/g, "");
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  const n = data.length;
  const maxScaled = Math.max(...data) * 1.15 || 1;
  const x = (i: number) => (n === 1 ? 50 : (i / (n - 1)) * 100);
  const y = (v: number) => 100 - (v / maxScaled) * 100;

  const linePts = data.map((v, i) => `${x(i)},${y(v)}`).join(" L ");
  const areaPath = `M ${x(0)},${y(data[0])} L ${linePts} L 100,100 L 0,100 Z`;
  const linePath = `M ${linePts}`;

  function onMove(e: React.PointerEvent) {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    setHover(Math.round(px * (n - 1)));
  }

  return (
    <div>
      <div ref={wrapRef} className="relative" style={{ height }} onPointerMove={onMove} onPointerLeave={() => setHover(null)}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: "100%", height: "100%", display: "block", overflow: "visible" }}>
          <defs>
            <linearGradient id={`fill-${gid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--green)" stopOpacity="0.28" />
              <stop offset="100%" stopColor="var(--green)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[25, 50, 75].map((gy) => (
            <line key={gy} x1="0" y1={gy} x2="100" y2={gy} stroke="var(--line)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          ))}
          <path d={areaPath} fill={`url(#fill-${gid})`} />
          <path d={linePath} fill="none" stroke="var(--green)" strokeWidth="2.5" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        {/* dots */}
        {data.map((v, i) => {
          const on = hover === i;
          const last = i === n - 1;
          return (
            <span
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${x(i)}%`, top: `${y(v)}%`, transform: "translate(-50%,-50%)",
                width: on || last ? 11 : 7, height: on || last ? 11 : 7,
                background: "#fff", border: `2.5px solid var(--green)`,
                boxShadow: on ? "0 2px 8px rgba(11,15,12,.18)" : "none", transition: "width .12s, height .12s",
              }}
            />
          );
        })}

        {/* hover guide + tooltip */}
        {hover !== null && (
          <>
            <span className="absolute top-0 bottom-0" style={{ left: `${x(hover)}%`, width: 1, background: "var(--line)" }} />
            <div
              className="absolute mono text-xs font-bold px-2.5 py-1.5 rounded-lg whitespace-nowrap pointer-events-none"
              style={{ left: `${x(hover)}%`, top: `${y(data[hover])}%`, transform: "translate(-50%,-135%)", background: "var(--ink)", color: "#fff", boxShadow: "var(--shadow-lg)" }}
            >
              {prefix}{data[hover]}{suffix}
              <span className="block text-[10px] font-medium" style={{ color: "rgba(255,255,255,.6)" }}>{labels[hover]}</span>
            </div>
          </>
        )}
      </div>

      <div className="flex justify-between mt-2">
        {labels.map((l, i) => (
          <span key={i} className="text-[10px] mono" style={{ color: hover === i ? "var(--ink)" : "var(--muted)", fontWeight: hover === i ? 700 : 400 }}>{l}</span>
        ))}
      </div>
    </div>
  );
}
