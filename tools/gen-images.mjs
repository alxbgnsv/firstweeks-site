// Local-only: pre-generate WebP screens from PNG (committed; CI needs no image deps).
// Usage: npm run images   (requires sharp devDependency)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url)) + '/..';
const ASSETS = path.join(ROOT, 'public/assets');

let sharp;
try { sharp = (await import('sharp')).default; }
catch { console.error('sharp not installed — run: npm i -D sharp'); process.exit(1); }

// Screens only ever render inside small phone frames (≤340px CSS ≈ ≤680px @2×).
// Serve a right-sized 780px-wide webp (PNG stays full-res as <picture> fallback).
const SCREEN_W = 780;
const screens = fs.readdirSync(ASSETS).filter((f) => f.startsWith('scr-') && f.endsWith('.png'));
for (const f of screens) {
  const base = f.replace('.png', '');
  await sharp(path.join(ASSETS, f)).resize({ width: SCREEN_W }).webp({ quality: 80 }).toFile(path.join(ASSETS, base + '.webp'));
  console.log('  webp', base);
}
// Icon: the source app icon is 1024² (~1.6MB). The site only shows it at ≤180px
// (favicon 30, invite 72, apple-touch 180), so serve a 192² PNG + webp. A giant
// header icon decodes on the main thread and wrecks LCP on every page.
const ICON = path.join(ASSETS, 'icon.png');
const iconBuf = fs.readFileSync(ICON);
await sharp(iconBuf).resize(192, 192).png({ compressionLevel: 9 }).toFile(ICON);
await sharp(iconBuf).resize(192, 192).webp({ quality: 88 }).toFile(path.join(ASSETS, 'icon.webp'));
console.log(`✓ ${screens.length} screens → webp; icon → 192²`);
