/** Supabase showcase clips — unique URL per slot (no repeats on the page). */
const EF_BASE =
  "https://ooszazcwzmwhitdxwtom.supabase.co/storage/v1/object/public/ef";

export const videos = {
  hero: "https://bryjchknhsrmjdunnfer.supabase.co/storage/v1/object/public/575/0510(3).mp4",
  mainFeatures: `${EF_BASE}/0522(3).mp4`,
  testimonials: [
    `${EF_BASE}/0522(4).mp4`,
    `${EF_BASE}/0522(5).mp4`,
    `${EF_BASE}/0522(6).mp4`,
  ] as const,
} as const;

/** Same clips as homepage: hero, main features, then testimonial row. */
export const homeVideoPool = [
  videos.hero,
  videos.mainFeatures,
  ...videos.testimonials,
] as const;

const blogVideoBySlug: Record<string, string> = {
  "overwatch-2-cheats-zadeyo-guide": videos.hero,
  "install-overwatch-esp-windows": videos.mainFeatures,
  "overwatch-esp-features-wallhack": videos.testimonials[0],
  "overwatch-cheat-settings-profiles": videos.testimonials[1],
  "overwatch-2-patch-day-esp": videos.testimonials[2],
};

/** Resolve blog post video to match homepage slots (by slug, else pool index). */
export function getBlogVideo(slug: string, index = 0): string {
  return (
    blogVideoBySlug[slug] ??
    homeVideoPool[index % homeVideoPool.length]
  );
}

export const ZADEYO_URL = "https://zadeyo.com";
export const ZADEYO_PRODUCT_URL =
  "https://zadeyo.com/products/overwatch-2-novaxware";
