/**
 * After `astro build`: verify every blog post is in the sitemap and publish
 * `/sitemap.xml` as a full urlset (not only the index wrapper).
 */
import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
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

if (existsSync(sitemapIndex)) {
  const indexXml = readFileSync(sitemapIndex, "utf8");
  if (!indexXml.includes(`${siteUrl}/sitemap.xml`)) {
    const patched = indexXml.replace(
      "</sitemapindex>",
      `  <sitemap><loc>${siteUrl}/sitemap.xml</loc></sitemap>\n</sitemapindex>`,
    );
    writeFileSync(sitemapIndex, patched);
  }
}

console.log(
  `[sitemap] OK — ${locs.length} URLs (${blogPaths.length} blog posts). Published ${siteUrl}/sitemap.xml`,
);
