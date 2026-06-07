import { translate } from "@/lib/i18n";
import { ALL_CROPS } from "@/data/crops";

// Maps a (possibly Spanish) crop name back to its canonical English name so the
// crop templates match regardless of the UI language.
const ES_TO_EN = new Map(ALL_CROPS.map((c) => [translate("es", c).toLowerCase(), c] as const));

export function canonCrop(s: string): string {
  return ES_TO_EN.get(s.toLowerCase().trim()) ?? s.trim();
}
