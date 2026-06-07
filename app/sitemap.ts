import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

// Only the indexable marketing pages. App/auth pages are excluded (see robots).
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: siteUrl, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
  ];
}
