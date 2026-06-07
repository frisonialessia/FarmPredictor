// Parses an optional numeric input — returns undefined for blank/invalid.
export function num(s: string): number | undefined {
  const cleaned = String(s).replace(/[^0-9.]/g, "");
  const n = Number(cleaned);
  return cleaned === "" || Number.isNaN(n) ? undefined : n;
}
