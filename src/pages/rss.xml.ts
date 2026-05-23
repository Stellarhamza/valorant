import { getCollection } from "astro:content";
import seo from "@/config/seo.json";
import config from "@/config/config.json";

export const prerender = true;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const siteUrl = seo.site_url.replace(/\/$/, "");
  const posts = (await getCollection("blog", ({ data }) => !data.draft)).sort(
    (a, b) =>
      (b.data.date?.getTime() ?? 0) - (a.data.date?.getTime() ?? 0),
  );

  const items = posts
    .map((post) => {
      const link = `${siteUrl}/blog/${post.id}`;
      const pubDate = post.data.date?.toUTCString() ?? new Date().toUTCString();
      const description = escapeXml(
        post.data.description ?? post.data.title ?? "",
      );

      return `<item>
  <title>${escapeXml(post.data.title)}</title>
  <link>${link}</link>
  <guid isPermaLink="true">${link}</guid>
  <pubDate>${pubDate}</pubDate>
  <description>${description}</description>
</item>`;
    })
    .join("\n");

  const buildDate = new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(seo.brand_domain)} - Valorant Cheats Guides</title>
    <link>${siteUrl}/blog</link>
    <description>${escapeXml(config.metadata.meta_description)}</description>
    <language>en-us</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <pubDate>${buildDate}</pubDate>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
