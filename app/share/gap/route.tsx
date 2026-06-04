import { ImageResponse } from "next/og";
import { ogFonts } from "@/lib/ogFonts";

export const runtime = "nodejs";

const LIME = "#85df42", WARN_SOFT = "#ff9f7a";

export async function GET() {
  const fonts = ogFonts();
  const execPct = (26296 / 34200) * 100;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 70, background: "linear-gradient(135deg,#0B0F0C 0%,#143b1f 60%,#1d5c2e 100%)", color: "#fff", fontFamily: "Jakarta" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <svg width="34" height="34" viewBox="0 0 100 100"><g fill={LIME}><rect x="46" y="20" width="8" height="40" rx="4" /><g stroke={LIME} strokeWidth="8" strokeLinecap="round"><line x1="50" y1="34" x2="50" y2="14" /><line x1="49" y1="32" x2="29" y2="20" /><line x1="51" y1="32" x2="71" y2="20" /><line x1="48" y1="40" x2="25" y2="34" /><line x1="52" y1="40" x2="75" y2="34" /><line x1="48" y1="48" x2="27" y2="49" /><line x1="52" y1="48" x2="73" y2="49" /></g><path d="M28 68 Q50 56 72 68" fill="none" stroke={LIME} strokeWidth="8" strokeLinecap="round" /><path d="M24 82 Q50 66 76 82" fill="none" stroke={LIME} strokeWidth="8" strokeLinecap="round" /></g></svg>
          <span style={{ fontSize: 24, fontWeight: 700 }}>FarmPredictor</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          <span style={{ fontSize: 52, fontWeight: 800, letterSpacing: -1.2, lineHeight: 1.05, maxWidth: 1000 }}>
            The gap between optimal and executable is real money.
          </span>

          {/* the bar */}
          <div style={{ display: "flex", width: "100%", height: 92, borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,.14)" }}>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: `${execPct}%`, background: "linear-gradient(90deg,#2f9e54,#52c871)", padding: "0 28px" }}>
              <span style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, color: "rgba(11,15,12,.65)" }}>Executable</span>
              <span style={{ fontSize: 34, fontWeight: 700, color: "#0B0F0C", fontFamily: "Plex" }}>$26,296</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flex: 1, background: "rgba(194,65,12,.85)", padding: "0 24px" }}>
              <span style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, color: "rgba(255,255,255,.8)" }}>Lost</span>
              <span style={{ fontSize: 30, fontWeight: 700, color: "#fff", fontFamily: "Plex" }}>−$7,904</span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 22, fontWeight: 400, color: "rgba(255,255,255,.75)", maxWidth: 760 }}>
            One optimal harvest you can&apos;t execute — a machine busy, a crew short — costs you measurable margin. FarmPredictor finds it.
          </span>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <span style={{ fontSize: 14, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.5, color: "rgba(255,255,255,.5)" }}>Optimal ceiling</span>
            <span style={{ fontSize: 34, fontWeight: 700, color: "#fff", fontFamily: "Plex" }}>$34,200</span>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 675, ...(fonts.length ? { fonts } : {}) },
  );
}
