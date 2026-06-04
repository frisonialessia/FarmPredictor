import { ImageResponse } from "next/og";
import { ogFonts } from "@/lib/ogFonts";

export const runtime = "nodejs";

const LIME = "#85df42";

export async function GET() {
  const fonts = ogFonts();
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 70, background: "linear-gradient(135deg,#0B0F0C 0%,#143b1f 58%,#1d5c2e 100%)", color: "#fff", fontFamily: "Jakarta" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <svg width="40" height="40" viewBox="0 0 100 100"><g fill={LIME}><rect x="46" y="20" width="8" height="40" rx="4" /><g stroke={LIME} strokeWidth="8" strokeLinecap="round"><line x1="50" y1="34" x2="50" y2="14" /><line x1="49" y1="32" x2="29" y2="20" /><line x1="51" y1="32" x2="71" y2="20" /><line x1="48" y1="40" x2="25" y2="34" /><line x1="52" y1="40" x2="75" y2="34" /><line x1="48" y1="48" x2="27" y2="49" /><line x1="52" y1="48" x2="73" y2="49" /></g><path d="M28 68 Q50 56 72 68" fill="none" stroke={LIME} strokeWidth="8" strokeLinecap="round" /><path d="M24 82 Q50 66 76 82" fill="none" stroke={LIME} strokeWidth="8" strokeLinecap="round" /></g></svg>
          <span style={{ fontSize: 30, fontWeight: 700 }}>FarmPredictor</span>
          <span style={{ marginLeft: 10, fontSize: 15, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: LIME, border: `1px solid rgba(133,223,66,.4)`, borderRadius: 999, padding: "6px 14px" }}>For high-yield farms</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", fontSize: 78, fontWeight: 800, lineHeight: 1.04, letterSpacing: -2 }}>
          <div style={{ display: "flex" }}><span>It&apos;s not</span><span style={{ color: LIME, margin: "0 22px" }}>when</span></div>
          <span>you should harvest.</span>
          <div style={{ display: "flex", marginTop: 8 }}><span>It&apos;s when you</span><span style={{ color: LIME, marginLeft: 22 }}>can.</span></div>
        </div>

        <span style={{ fontSize: 24, fontWeight: 400, color: "rgba(255,255,255,.78)", maxWidth: 880 }}>
          Operations intelligence that crosses harvest timing with the machinery, crews and weather you actually have — and shows the gap in dollars.
        </span>
      </div>
    ),
    { width: 1200, height: 675, ...(fonts.length ? { fonts } : {}) },
  );
}
