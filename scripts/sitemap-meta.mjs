import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const blogDir = path.join(root, "src", "content", "blog");

/** Parse `date:` from blog markdown frontmatter for sitemap lastmod. */
export function getBlogLastModByPath() {
  /** @type {Record<string, string>} */
  const map = {};

  let files = [];
  try {
    files = readdirSync(blogDir).filter((file) => file.endsWith(".md"));
  } catch {
    return map;
  }

  for (const file of files) {
    const slug = file.replace(/\.md$/, "");
    const raw = readFileSync(path.join(blogDir, file), "utf8");
    const dateMatch = raw.match(/^date:\s*(.+)$/m);
    if (!dateMatch) continue;

    const parsed = new Date(dateMatch[1].trim());
    if (Number.isNaN(parsed.getTime())) continue;

    map[`/blog/${slug}`] = parsed.toISOString();
  }

  return map;
}

/** Static page lastmod hints (ISO strings). */
export function getStaticPageLastMod() {
  const buildDate = new Date().toISOString();
  return {
    "/": buildDate,
    "/about": buildDate,
    "/blog": buildDate,
    "/contact": buildDate,
    "/pricing": buildDate,
    "/privacy-policy": buildDate,
    "/term-and-condition": buildDate,
  };
}

export function getSitemapLastMod(pathname) {
  const normalized = pathname.replace(/\/$/, "") || "/";
  const blogDates = getBlogLastModByPath();
  const staticDates = getStaticPageLastMod();

  return blogDates[normalized] ?? staticDates[normalized] ?? new Date().toISOString();
}

export function getSitemapPriority(pathname) {
  const path = pathname.replace(/\/$/, "") || "/";

  if (path === "/") return 1.0;
  if (path === "/blog") return 0.9;
  if (path.startsWith("/blog/")) return 0.85;
  if (path === "/pricing") return 0.85;
  if (path === "/about") return 0.8;
  if (path === "/contact") return 0.75;
  if (path === "/privacy-policy" || path === "/term-and-condition") return 0.3;

  return 0.7;
}

export function getSitemapChangeFreq(pathname) {
  const path = pathname.replace(/\/$/, "") || "/";

  if (path === "/") return "weekly";
  if (path === "/blog" || path.startsWith("/blog/")) return "weekly";
  if (path === "/pricing") return "monthly";

  return "monthly";
}
