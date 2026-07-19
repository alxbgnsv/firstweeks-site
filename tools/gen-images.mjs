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

const screens = fs.readdirSync(ASSETS).filter((f) => f.startsWith('scr-') && f.endsWith('.png'));
for (const f of screens) {
  const base = f.replace('.png', '');
  await sharp(path.join(ASSETS, f)).webp({ quality: 78 }).toFile(path.join(ASSETS, base + '.webp'));
  console.log('  webp', base);
}
// Icon → webp + favicon sizes
await sharp(path.join(ASSETS, 'icon.png')).resize(512, 512).webp({ quality: 82 }).toFile(path.join(ASSETS, 'icon.webp'));
console.log(`✓ ${screens.length} screens → webp`);
