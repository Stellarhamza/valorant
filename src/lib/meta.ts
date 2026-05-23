import seo from "@/config/seo.json";
import { resolveOgImage } from "@/lib/seo";

const OG_DIMENSIONS: Record<string, { width: number; height: number }> = {
  "/images/og-image.png": { width: 1200, height: 630 },
  "/images/about_hero.png": { width: 1200, height: 700 },
  "/images/blog/featured-cover.png": { width: 1200, height: 630 },
};

const BLOG_OG_SIZE = { width: 1200, height: 630 };

/** Keep meta descriptions within Google's recommended display length. */
export function truncateMetaDescription(text: string, maxLength = 160): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength - 1).trimEnd()}…`;
}

export function resolveOgImageMeta(image?: string, alt?: string) {
  const path = image || seo.default_og_image;
  const isBlogPost =
    path.startsWith("/images/blog/post-") && path.endsWith(".png");

  const dimensions =
    OG_DIMENSIONS[path] ??
    (isBlogPost ? BLOG_OG_SIZE : { width: seo.og_image_width, height: seo.og_image_height });

  return {
    url: resolveOgImage(path),
    path,
    width: dimensions.width,
    height: dimensions.height,
    type: seo.og_image_type ?? "image/png",
    alt: alt ?? seo.default_og_alt ?? seo.homepage.meta_title,
  };
}
