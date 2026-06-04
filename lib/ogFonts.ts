import fs from "node:fs";
import path from "node:path";

type OgFont = { name: string; data: Buffer; weight: 400 | 600 | 700 | 800; style: "normal" };

// Loads the brand fonts (Plus Jakarta Sans + IBM Plex Mono) for share-image
// generation so titles match the site. Wrapped in try/catch so the route still
// renders with a fallback font if the files aren't bundled (e.g. on Vercel).
function tryLoad(rel: string): Buffer | null {
  try {
    return fs.readFileSync(path.join(process.cwd(), "node_modules", rel));
  } catch {
    return null;
  }
}

export function ogFonts(): OgFont[] {
  const defs: [string, string, OgFont["weight"]][] = [
    ["Jakarta", "@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-400-normal.woff", 400],
    ["Jakarta", "@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-600-normal.woff", 600],
    ["Jakarta", "@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-700-normal.woff", 700],
    ["Jakarta", "@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-800-normal.woff", 800],
    ["Plex", "@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-700-normal.woff", 700],
  ];
  const out: OgFont[] = [];
  for (const [name, rel, weight] of defs) {
    const data = tryLoad(rel);
    if (data) out.push({ name, data, weight, style: "normal" });
  }
  return out;
}
