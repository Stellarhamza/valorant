/**
 * Creates raster images referenced by the site but missing from public/images.
 * The Automark template ships SVGs only; PNG/JPG paths in content need real files.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const imagesDir = path.join(root, "public", "images");

const PRIMARY = "#86198f";
const BG = "#0f0a14";
const TEXT = "#f5f5f5";

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function labelSvg(text, w, h, fontSize = 32) {
  const safe = text.replace(/[<>&]/g, "");
  return Buffer.from(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${PRIMARY};stop-opacity:0.9"/>
      <stop offset="100%" style="stop-color:#1a0a1f;stop-opacity:1"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <rect width="100%" height="100%" fill="${BG}" opacity="0.55"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
    fill="${TEXT}" font-family="system-ui,sans-serif" font-size="${fontSize}" font-weight="600">${safe}</text>
</svg>`);
}

async function writeFromSvg(svg, outPath, w, h) {
  ensureDir(outPath);
  const pipeline = sharp(svg).resize(w, h);
  if (outPath.endsWith(".png")) {
    await pipeline
      .png({ compressionLevel: 9, adaptiveFiltering: true })
      .toFile(outPath);
    return;
  }
  if (outPath.endsWith(".jpg") || outPath.endsWith(".jpeg")) {
    await pipeline.jpeg({ quality: 82, mozjpeg: true }).toFile(outPath);
    return;
  }
  await pipeline.toFile(outPath);
}

async function svgFileToPng(relativeSvg, outRelative, size) {
  const inPath = path.join(imagesDir, relativeSvg.replace(/^\/images\//, ""));
  const outPath = path.join(imagesDir, outRelative.replace(/^\/images\//, ""));
  if (!fs.existsSync(inPath)) {
    console.warn(`Skip (missing SVG): ${inPath}`);
    return;
  }
  ensureDir(outPath);
  await sharp(inPath)
    .resize(size, size, { fit: "contain", background: BG })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(outPath);
}

async function main() {
  const jobs = [
    writeFromSvg(labelSvg("OverwatchCheats.com", 1200, 630, 48), path.join(imagesDir, "og-image.png"), 1200, 630),
    writeFromSvg(labelSvg("OC", 64, 64, 28), path.join(imagesDir, "favicon.png"), 64, 64),
    writeFromSvg(labelSvg("Overwatch 2 ESP", 1200, 700, 42), path.join(imagesDir, "about_hero.png"), 1200, 700),
    writeFromSvg(labelSvg("ESP overlay", 1100, 650, 40), path.join(imagesDir, "automark_dashboard.png"), 1100, 650),
    writeFromSvg(labelSvg("Guide", 400, 250, 28), path.join(imagesDir, "ebook.png"), 400, 250),
    writeFromSvg(labelSvg("OW", 128, 128, 40), path.join(imagesDir, "avatar.png"), 128, 128),
    writeFromSvg(labelSvg("Our story", 800, 900, 36), path.join(imagesDir, "our-story-hero.jpg"), 800, 900),
    svgFileToPng("/images/features/service-feature-1.svg", "brands-group-1.png", 280),
    svgFileToPng("/images/features/service-feature-2.svg", "brands-group-2.png", 280),
    svgFileToPng("/images/features/ai-powered-graph.svg", "brands-group-3.png", 280),
    svgFileToPng("/images/features/automated-marketing-visual.svg", "brands-group-4.png", 280),
    svgFileToPng("/images/features/grow-your-earnings.svg", "brands-group-5.png", 280),
    writeFromSvg(labelSvg("Author", 96, 96, 20), path.join(imagesDir, "blog", "author-1.png"), 96, 96),
    writeFromSvg(labelSvg("OW2 guide", 600, 310, 24), path.join(imagesDir, "blog", "post-1.png"), 600, 310),
    writeFromSvg(labelSvg("Install", 600, 310, 24), path.join(imagesDir, "blog", "post-2.png"), 600, 310),
    writeFromSvg(labelSvg("ESP features", 600, 310, 24), path.join(imagesDir, "blog", "post-3.png"), 600, 310),
    writeFromSvg(labelSvg("Profiles", 600, 310, 24), path.join(imagesDir, "blog", "post-4.png"), 600, 310),
    writeFromSvg(labelSvg("Patches", 600, 310, 24), path.join(imagesDir, "blog", "post-5.png"), 600, 310),
    writeFromSvg(labelSvg("Blog", 800, 420, 32), path.join(imagesDir, "blog", "featured-cover.png"), 800, 420),
    writeFromSvg(labelSvg("Review 1", 640, 360, 28), path.join(imagesDir, "testimonials", "1.png"), 640, 360),
    writeFromSvg(labelSvg("Review 2", 640, 360, 28), path.join(imagesDir, "testimonials", "2.png"), 640, 360),
    writeFromSvg(labelSvg("Review 3", 640, 360, 28), path.join(imagesDir, "testimonials", "3.png"), 640, 360),
  ];

  await Promise.all(jobs);
  console.log("Generated missing images in public/images/");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
