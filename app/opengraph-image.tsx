import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "FarmPredictor — it's not when you should harvest, it's when you can";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Brand wheat-spike mark (matches BrandMark.tsx), drawn inline so the card
// renders entirely on the edge with no external asset.
function Spike({ s = 64 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 100 100">
      <g fill="#85df42">
        <rect x="46" y="20" width="8" height="40" rx="4" />
        <g stroke="#85df42" strokeWidth="8" strokeLinecap="round">
          <line x1="50" y1="34" x2="50" y2="14" />
          <line x1="49" y1="32" x2="29" y2="20" />
          <line x1="51" y1="32" x2="71" y2="20" />
          <line x1="48" y1="40" x2="25" y2="34" />
          <line x1="52" y1="40" x2="75" y2="34" />
          <line x1="48" y1="48" x2="27" y2="49" />
          <line x1="52" y1="48" x2="73" y2="49" />
        </g>
        <path d="M28 68 Q50 56 72 68" fill="none" stroke="#85df42" strokeWidth="8" strokeLinecap="round" />
        <path d="M24 82 Q50 66 76 82" fill="none" stroke="#85df42" strokeWidth="8" strokeLinecap="round" />
      </g>
    </svg>
  );
}

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg,#0B0F0C 0%,#143b1f 60%,#1d5c2e 100%)",
          color: "#fff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Spike s={56} />
          <span style={{ fontSize: 30, fontWeight: 700, letterSpacing: -0.5 }}>FarmPredictor</span>
          <span
            style={{
              marginLeft: 12, fontSize: 16, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase",
              color: "#85df42", border: "1px solid rgba(133,223,66,.4)", borderRadius: 999, padding: "6px 14px",
            }}
          >
            For high-yield farms
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", fontSize: 66, fontWeight: 800, lineHeight: 1.05, letterSpacing: -1.5 }}>
          <div style={{ display: "flex" }}>
            <span>It&apos;s not</span>
            <span style={{ color: "#85df42", margin: "0 18px" }}>when</span>
            <span>you should harvest.</span>
          </div>
          <div style={{ display: "flex" }}>
            <span>It&apos;s when you</span>
            <span style={{ color: "#85df42", marginLeft: 18 }}>can.</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 24, color: "rgba(255,255,255,.78)" }}>
            Operations intelligence that turns harvest timing into dollars.
          </span>
          <div style={{ display: "flex", gap: 28 }}>
            {[["$6,240", "at risk / week"], ["1 engine", "plan + simulator"]].map(([n, l]) => (
              <div key={l} style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: 30, fontWeight: 800, color: "#85df42" }}>{n}</span>
                <span style={{ fontSize: 15, color: "rgba(255,255,255,.55)" }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
