const DEFAULT_SITEMAP_ORIGIN = "https://sns-post-checker-mvp.vercel.app";

export function getMetadataBase(): URL | undefined {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit?.startsWith("http")) {
    try {
      return new URL(explicit);
    } catch {
      return undefined;
    }
  }
  const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (productionUrl) {
    try {
      return new URL(`https://${productionUrl}`);
    } catch {
      return undefined;
    }
  }
  return undefined;
}

export function getSitemapBaseOrigin(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit?.startsWith("http")) {
    try {
      return new URL(explicit).origin.replace(/\/$/, "");
    } catch {
      /* fall through */
    }
  }
  return DEFAULT_SITEMAP_ORIGIN;
}
