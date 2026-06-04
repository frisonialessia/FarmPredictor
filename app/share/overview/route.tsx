import { ImageResponse } from "next/og";

export const runtime = "edge";

const GREEN = "#52c871", GREEN_DEEP = "#2f9e54", MINT = "#b4e8c5", INK = "#0B0F0C", BG = "#F3F6F2", MUTED = "#6B756C", LINE = "#E6EBE5", WARN = "#C2410C";

const KPIS: [string, string, boolean][] = [
  ["Margin at risk", "$6,240", true],
  ["Avg. displacement", "2.3 d", false],
  ["In window", "4 / 6", false],
  ["Machinery use", "92%", false],
];
const DECISIONS: [string, string, string][] = [
  ["North A", "Harvest before Thursday", "-$2,940"],
  ["West 2", "Cover Wednesday rain", "-$2,080"],
  ["North A", "Order 620 crates today", "-$1,120"],
];
const SEASON = [18, 24, 31, 28, 36, 42];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ display: "flex", flexDirection: "column", background: "#fff", border: `1px solid ${LINE}`, borderRadius: 14, boxShadow: "0 1px 3px rgba(11,15,12,.05)", ...style }}>{children}</div>;
}

export async function GET() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: BG, padding: 40, fontFamily: "sans-serif" }}>
        <div style={{ width: 1120, display: "flex", flexDirection: "column", background: "#fff", borderRadius: 18, overflow: "hidden", boxShadow: "0 24px 60px rgba(11,15,12,.18)", border: `1px solid ${LINE}` }}>
          {/* window chrome */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 18px", background: BG, borderBottom: `1px solid ${LINE}` }}>
            <div style={{ width: 12, height: 12, borderRadius: 99, background: "#ff5f57" }} />
            <div style={{ width: 12, height: 12, borderRadius: 99, background: "#febc2e" }} />
            <div style={{ width: 12, height: 12, borderRadius: 99, background: "#28c840" }} />
            <div style={{ display: "flex", margin: "0 auto", padding: "5px 16px", background: "#fff", border: `1px solid ${LINE}`, borderRadius: 8, fontSize: 14, color: MUTED }}>farmpredictor.app/dashboard</div>
          </div>

          <div style={{ display: "flex" }}>
            {/* rail */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "18px 12px", borderRight: `1px solid ${LINE}`, width: 70 }}>
              <svg width="30" height="30" viewBox="0 0 100 100"><g fill={GREEN}><rect x="46" y="20" width="8" height="40" rx="4" /><g stroke={GREEN} strokeWidth="8" strokeLinecap="round"><line x1="50" y1="34" x2="50" y2="14" /><line x1="49" y1="32" x2="29" y2="20" /><line x1="51" y1="32" x2="71" y2="20" /><line x1="48" y1="40" x2="25" y2="34" /><line x1="52" y1="40" x2="75" y2="34" /><line x1="48" y1="48" x2="27" y2="49" /><line x1="52" y1="48" x2="73" y2="49" /></g><path d="M28 68 Q50 56 72 68" fill="none" stroke={GREEN} strokeWidth="8" strokeLinecap="round" /><path d="M24 82 Q50 66 76 82" fill="none" stroke={GREEN} strokeWidth="8" strokeLinecap="round" /></g></svg>
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} style={{ display: "flex", width: 40, height: 40, borderRadius: 12, background: i === 0 ? INK : BG }} />
              ))}
            </div>

            {/* content */}
            <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: 24, gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: 19, fontWeight: 800, letterSpacing: -0.3 }}>Overview</span>
                  <span style={{ fontSize: 13, color: MUTED }}>Tuesday, June 9 · 08:14</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", border: `1px solid ${LINE}`, borderRadius: 99, fontSize: 12, color: MUTED }}><div style={{ width: 7, height: 7, borderRadius: 99, background: GREEN }} />Demo data</div>
                  <div style={{ display: "flex", padding: "7px 14px", background: GREEN, color: INK, borderRadius: 99, fontSize: 13, fontWeight: 700 }}>Recommendations</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 14 }}>
                {KPIS.map(([label, value, hl]) => (
                  <Card key={label} style={{ flex: 1, padding: "16px 18px" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: MUTED }}>{label}</span>
                    <span style={{ fontSize: 28, fontWeight: 800, marginTop: 8, color: hl ? GREEN_DEEP : INK }}>{value}</span>
                  </Card>
                ))}
              </div>

              <div style={{ display: "flex", gap: 14 }}>
                <Card style={{ flex: 2, padding: 20 }}>
                  <span style={{ fontSize: 15, fontWeight: 800 }}>Today&apos;s decisions</span>
                  <span style={{ fontSize: 12, color: MUTED, marginTop: 2, marginBottom: 6 }}>Sorted by margin impact</span>
                  {DECISIONS.map(([parcel, title, loss], i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderTop: i > 0 ? `1px solid ${LINE}` : "none" }}>
                      <div style={{ display: "flex", width: 34, height: 34, borderRadius: 10, background: "rgba(194,65,12,.1)" }} />
                      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                        <span style={{ fontSize: 13, fontWeight: 800 }}>{parcel}</span>
                        <span style={{ fontSize: 13, color: INK }}>{title}</span>
                      </div>
                      <span style={{ fontSize: 15, fontWeight: 800, color: WARN }}>{loss}</span>
                    </div>
                  ))}
                </Card>

                <Card style={{ flex: 1, padding: 20 }}>
                  <span style={{ fontSize: 15, fontWeight: 800 }}>Season margin</span>
                  <span style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>Recovered, by month</span>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120, marginTop: 16 }}>
                    {SEASON.map((v, i) => (
                      <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, height: "100%", justifyContent: "flex-end" }}>
                        <div style={{ display: "flex", width: "100%", height: `${(v / 42) * 100}%`, background: i === 5 ? GREEN : MINT, borderRadius: "6px 6px 0 0" }} />
                        <span style={{ fontSize: 10, color: MUTED, marginTop: 4 }}>{MONTHS[i]}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 750 },
  );
}
