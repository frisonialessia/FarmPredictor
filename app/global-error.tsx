"use client";
// Last-resort boundary: catches errors in the root layout itself. It must
// render its own <html>/<body>, so styles are inline (the app stylesheet may
// not have loaded). Kept deliberately minimal and dependency-free.
import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#0B0F0C", color: "#fff", minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <div style={{ textAlign: "center", padding: 24, maxWidth: 420 }}>
          <p style={{ fontSize: 56, fontWeight: 800, color: "#85df42", margin: 0 }}>!</p>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginTop: 12 }}>Something went sideways.</h1>
          <p style={{ marginTop: 12, color: "rgba(255,255,255,.7)" }}>An unexpected error interrupted the app. Please try again.</p>
          <button onClick={reset} style={{ marginTop: 24, borderRadius: 999, padding: "12px 24px", fontSize: 14, fontWeight: 600, border: "none", background: "#52c871", color: "#0B0F0C", cursor: "pointer" }}>Try again</button>
        </div>
      </body>
    </html>
  );
}
