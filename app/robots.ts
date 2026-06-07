import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Utility/app pages shouldn't be indexed.
      disallow: ["/dashboard", "/onboarding", "/login", "/signup", "/share/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
