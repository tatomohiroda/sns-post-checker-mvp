import type { MetadataRoute } from "next";
import { getSitemapBaseOrigin } from "@/lib/siteUrl";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${getSitemapBaseOrigin()}/sitemap.xml`,
  };
}
