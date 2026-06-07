// Absolute site URL, resolved + validated in lib/env. Used for metadata,
// sitemap and robots. Kept as a named export for existing call sites.
import { env } from "./env";

export const siteUrl = env.siteUrl;
