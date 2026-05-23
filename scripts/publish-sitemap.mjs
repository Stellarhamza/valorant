/**
 * After `astro build`: verify every blog post is in the sitemap and publish
 * a single canonical `/sitemap.xml` urlset (no duplicate sitemap files).
 */
import {
  copyFileSync,
  existsSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import config from "../src/config/config.json" with { type: "json" };
import { getBlogLastModByPath } from "./sitemap-meta.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(root, "dist");
const sitemap0 = path.join(distDir, "sitemap-0.xml");
const sitemapIndex = path.join(distDir, "sitemap-index.xml");
const sitemapPublic = path.join(distDir, "sitemap.xml");

const siteUrl = config.site.base_url.replace(/\/$/, "");
const buildDate = new Date().toISOString();

if (!existsSync(sitemap0)) {
  console.error("[sitemap] dist/sitemap-0.xml missing — run astro build first.");
  process.exit(1);
}

const xml = readFileSync(sitemap0, "utf8");
const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

const blogPaths = Object.keys(getBlogLastModByPath());
const missing = blogPaths.filter((p) => !locs.includes(`${siteUrl}${p}`));

if (missing.length > 0) {
  console.error("[sitemap] Missing blog URLs in sitemap-0.xml:");
  for (const p of missing) console.error(`  - ${siteUrl}${p}`);
  process.exit(1);
}

copyFileSync(sitemap0, sitemapPublic);
unlinkSync(sitemap0);

const indexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${siteUrl}/sitemap.xml</loc>
    <lastmod>${buildDate}</lastmod>
  </sitemap>
</sitemapindex>
`;
writeFileSync(sitemapIndex, indexXml.trim());

console.log(
  `[sitemap] OK — ${locs.length} URLs (${blogPaths.length} blog posts). Published ${siteUrl}/sitemap.xml`,
);
