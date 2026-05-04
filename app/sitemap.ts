import type { MetadataRoute } from "next";
import { getSitemapBaseOrigin } from "@/lib/siteUrl";

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = getSitemapBaseOrigin();
  const lastModified = new Date();

  return [
    {
      url: `${origin}/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
