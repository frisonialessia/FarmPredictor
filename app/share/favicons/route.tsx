import { ImageResponse } from "next/og";
import { ogFonts } from "@/lib/ogFonts";

export const runtime = "nodejs";

// Brand spike (no background) — colored by `c`.
function Spike({ s, c }: { s: number; c: string }) {
  return (
    <svg width={s} height={s} viewBox="0 0 100 100">
      <g fill={c}>
        <rect x="46" y="20" width="8" height="40" rx="4" />
        <g stroke={c} strokeWidth="8" strokeLinecap="round">
          <line x1="50" y1="34" x2="50" y2="14" /><line x1="49" y1="32" x2="29" y2="20" /><line x1="51" y1="32" x2="71" y2="20" />
          <line x1="48" y1="40" x2="25" y2="34" /><line x1="52" y1="40" x2="75" y2="34" /><line x1="48" y1="48" x2="27" y2="49" /><line x1="52" y1="48" x2="73" y2="49" />
        </g>
        <path d="M28 68 Q50 56 72 68" fill="none" stroke={c} strokeWidth="8" strokeLinecap="round" />
        <path d="M24 82 Q50 66 76 82" fill="none" stroke={c} strokeWidth="8" strokeLinecap="round" />
      </g>
    </svg>
  );
}

const OPTIONS: { label: string; bg: string; spike: string }[] = [
  { label: "1 · Ink + Lime (current)", bg: "#0B0F0C", spike: "#85df42" },
  { label: "2 · Green + Ink", bg: "#52c871", spike: "#0B0F0C" },
  { label: "3 · White + Green", bg: "#ffffff", spike: "#52c871" },
  { label: "4 · Ink + Green", bg: "#0B0F0C", spike: "#52c871" },
  { label: "5 · Lime + Ink", bg: "#85df42", spike: "#0B0F0C" },
  { label: "6 · Mint + Deep green", bg: "#b4e8c5", spike: "#2f9e54" },
  { label: "7 · Green gradient + White", bg: "linear-gradient(135deg,#2f9e54,#85df42)", spike: "#ffffff" },
  { label: "8 · Ink gradient + Lime", bg: "linear-gradient(135deg,#0B0F0C,#1d5c2e)", spike: "#85df42" },
];

export async function GET() {
  const fonts = ogFonts();
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#F3F6F2", padding: 56, fontFamily: "Jakarta" }}>
        <span style={{ fontSize: 34, fontWeight: 800, color: "#0B0F0C" }}>FarmPredictor — favicon options</span>
        <span style={{ fontSize: 17, color: "#6B756C", marginTop: 4, marginBottom: 28 }}>Tell me the number you want.</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
          {OPTIONS.map((o) => (
            <div key={o.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 250 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 120, height: 120, borderRadius: 27, background: o.bg, border: o.bg === "#ffffff" ? "1px solid #E6EBE5" : "none", boxShadow: "0 6px 18px rgba(11,15,12,.12)" }}>
                <Spike s={76} c={o.spike} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#0B0F0C", marginTop: 12 }}>{o.label}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { width: 1200, height: 760, ...(fonts.length ? { fonts } : {}) },
  );
}
