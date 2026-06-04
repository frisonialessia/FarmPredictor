import { ImageResponse } from "next/og";
import { ogFonts } from "@/lib/ogFonts";

export const runtime = "nodejs";

const LIME = "#85df42", WARN_SOFT = "#ff9f7a";

const ROWS: [string, string, string][] = [
  ["Optimal ceiling", "$34,200", "#fff"],
  ["Timing degradation", "−$0", WARN_SOFT],
  ["Unresolved conflicts", "−$7,904", WARN_SOFT],
  ["Action cost", "−$0", WARN_SOFT],
];

export async function GET() {
  const fonts = ogFonts();
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 58, background: "linear-gradient(135deg,#0B0F0C 0%,#143b1f 58%,#1d5c2e 100%)", color: "#fff", fontFamily: "Jakarta" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <svg width="32" height="32" viewBox="0 0 100 100"><g fill={LIME}><rect x="46" y="20" width="8" height="40" rx="4" /><g stroke={LIME} strokeWidth="8" strokeLinecap="round"><line x1="50" y1="34" x2="50" y2="14" /><line x1="49" y1="32" x2="29" y2="20" /><line x1="51" y1="32" x2="71" y2="20" /><line x1="48" y1="40" x2="25" y2="34" /><line x1="52" y1="40" x2="75" y2="34" /><line x1="48" y1="48" x2="27" y2="49" /><line x1="52" y1="48" x2="73" y2="49" /></g><path d="M28 68 Q50 56 72 68" fill="none" stroke={LIME} strokeWidth="8" strokeLinecap="round" /><path d="M24 82 Q50 66 76 82" fill="none" stroke={LIME} strokeWidth="8" strokeLinecap="round" /></g></svg>
            <span style={{ fontSize: 22, fontWeight: 700 }}>FarmPredictor</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 50, fontWeight: 800, letterSpacing: -1, lineHeight: 1.05 }}>
            <span>Move one harvest.</span>
            <div style={{ display: "flex" }}><span>Watch the margin</span><span style={{ color: WARN_SOFT, marginLeft: 16 }}>fall.</span></div>
          </div>
          <span style={{ fontSize: 20, fontWeight: 400, color: "rgba(255,255,255,.72)", maxWidth: 760 }}>One engine: the Planner and the Simulator share the same plan. A conflict you create shows up here automatically — in dollars.</span>
        </div>

        <div style={{ display: "flex", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 20, padding: 26, gap: 30 }}>
          <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, padding: "4px 12px", borderRadius: 99, background: LIME, color: "#0B0F0C" }}>Live scenario</span>
              <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 99, background: "rgba(194,65,12,.25)", color: WARN_SOFT }}>+1 conflict from your Planner</span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, color: "rgba(255,255,255,.55)" }}>Weekly net margin</span>
            <span style={{ fontSize: 70, fontWeight: 700, color: LIME, lineHeight: 1.1, fontFamily: "Plex" }}>$26,296</span>
            <span style={{ fontSize: 16, fontWeight: 400, color: WARN_SOFT, marginTop: 2 }}>−$7,904 below the executable ceiling</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", width: 330, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.10)", borderRadius: 14, padding: 18, justifyContent: "center" }}>
            {ROWS.map(([l, v, c]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", fontSize: 15, marginBottom: 10 }}>
                <span style={{ fontWeight: 400, color: "rgba(255,255,255,.7)" }}>{l}</span>
                <span style={{ fontWeight: 700, color: c, fontFamily: "Plex" }}>{v}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 17, fontWeight: 800, marginTop: 6, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,.16)" }}>
              <span>Net</span><span style={{ color: LIME, fontFamily: "Plex", fontWeight: 700 }}>$26,296</span>
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 675, ...(fonts.length ? { fonts } : {}) },
  );
}
