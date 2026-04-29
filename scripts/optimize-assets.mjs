// Optimize landing assets: convert PNGs to webp + generate og-image, favicons.
// Run with: node scripts/optimize-assets.mjs

import sharp from "sharp";
import { mkdir, copyFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const COWORK = "C:/Users/Jesus/Desktop/En Escritorio/IA/Cowork";
const SRC_ASSETS = `${COWORK}/outputs/v2_servicios_completos`;
const LANDING_ASSETS = `${COWORK}/v2_servicios_completos/landing_assets`;

const PUBLIC_IMG = "./public/img";
const PUBLIC_ROOT = "./public";

await mkdir(PUBLIC_IMG, { recursive: true });
await mkdir(PUBLIC_ROOT, { recursive: true });

const tasks = [
  // Hero banner — full size webp
  {
    in: `${LANDING_ASSETS}/banner_cover.png`,
    out: `${PUBLIC_IMG}/banner-cover.webp`,
    width: 2400,
    quality: 82,
  },
  // Avatar — 400x400 webp
  {
    in: `${LANDING_ASSETS}/avatar_jm.png`,
    out: `${PUBLIC_IMG}/avatar-jm.webp`,
    width: 400,
    quality: 90,
  },
  // 5 portadas — webp 800px wide
  {
    in: `${SRC_ASSETS}/Portada_Guion_Kodak.png`,
    out: `${PUBLIC_IMG}/portada-kodak.webp`,
    width: 900,
    quality: 85,
  },
  {
    in: `${SRC_ASSETS}/Portada_Guion_Torre_Eiffel.png`,
    out: `${PUBLIC_IMG}/portada-torre-eiffel.webp`,
    width: 900,
    quality: 85,
  },
  {
    in: `${SRC_ASSETS}/Portada_SEO_Cafe_Frio.png`,
    out: `${PUBLIC_IMG}/portada-cafe-frio.webp`,
    width: 900,
    quality: 85,
  },
  {
    in: `${SRC_ASSETS}/Portada_SEO_Regla_2_Minutos.png`,
    out: `${PUBLIC_IMG}/portada-regla-2-min.webp`,
    width: 900,
    quality: 85,
  },
  {
    in: `${SRC_ASSETS}/Portada_Copys_Redes_Molino_Cafe.png`,
    out: `${PUBLIC_IMG}/portada-copys-molino.webp`,
    width: 900,
    quality: 85,
  },
];

for (const t of tasks) {
  if (!existsSync(t.in)) {
    console.warn(`SKIP: source not found ${t.in}`);
    continue;
  }
  await sharp(t.in)
    .resize({ width: t.width, withoutEnlargement: true })
    .webp({ quality: t.quality, effort: 6 })
    .toFile(t.out);
  console.log(`✓ ${path.basename(t.out)}`);
}

// === OG image (1200×630 from banner) ===
await sharp(`${LANDING_ASSETS}/banner_cover.png`)
  .resize({ width: 1200, height: 630, fit: "cover", position: "center" })
  .png({ quality: 90 })
  .toFile(`${PUBLIC_ROOT}/og-image.png`);
console.log("✓ og-image.png");

// === Favicons from avatar ===
await sharp(`${LANDING_ASSETS}/avatar_jm.png`)
  .resize({ width: 180, height: 180 })
  .png()
  .toFile(`${PUBLIC_ROOT}/apple-touch-icon.png`);
console.log("✓ apple-touch-icon.png");

await sharp(`${LANDING_ASSETS}/avatar_jm.png`)
  .resize({ width: 32, height: 32 })
  .png()
  .toFile(`${PUBLIC_ROOT}/favicon-32.png`);

await sharp(`${LANDING_ASSETS}/avatar_jm.png`)
  .resize({ width: 16, height: 16 })
  .png()
  .toFile(`${PUBLIC_ROOT}/favicon-16.png`);

console.log("\nAssets optimized.");
