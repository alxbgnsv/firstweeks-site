// Local-only: pre-generate 1200×630 OG images (committed to public/og; CI needs
// no image deps — build.mjs just copies public/). Template from mockup 05:
// dark bg + radial peach glow, "FirstWeeks" wordmark, {section-kicker} in accent
// caps, {title} ≤2 lines 54px, domain footer.
// Usage: npm run og   (requires sharp; run after content changes, then commit).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CATEGORIES } from '../config.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url)) + '/..';
const OUT = path.join(ROOT, 'public/og');

let sharp;
try { sharp = (await import('sharp')).default; }
catch { console.error('sharp not installed — run: npm i -D sharp'); process.exit(1); }

const { loadContent } = await import('../src/lib/content.mjs');
const cnt = loadContent(process.env.BUILD_DATE || '2026-06-15');

const xml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Greedy wrap to ≤2 lines; truncate line 2 with … if it overflows.
function wrap(title, maxChars = 30) {
  const words = String(title).split(/\s+/);
  const lines = [''];
  for (const w of words) {
    const i = lines.length - 1;
    if (!lines[i]) lines[i] = w;
    else if ((lines[i] + ' ' + w).length <= maxChars) lines[i] += ' ' + w;
    else if (lines.length < 2) lines.push(w);
    else { lines[1] = lines[1].replace(/…$/, '') + '…'; break; }
  }
  return lines;
}

function svg({ kicker, title }) {
  const lines = wrap(title);
  const startY = lines.length === 1 ? 348 : 320;
  const tspans = lines.map((l, i) =>
    `<tspan x="80" y="${startY + i * 66}">${xml(l)}</tspan>`).join('');
  return `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
<defs>
<radialGradient id="glow" cx="78%" cy="30%" r="70%">
<stop offset="0%" stop-color="#E8A37F" stop-opacity="0.34"/>
<stop offset="45%" stop-color="#E8A37F" stop-opacity="0.10"/>
<stop offset="100%" stop-color="#0B0B0D" stop-opacity="0"/>
</radialGradient>
</defs>
<rect width="1200" height="630" fill="#0B0B0D"/>
<rect width="1200" height="630" fill="url(#glow)"/>
<circle cx="905" cy="205" r="150" fill="#E8A37F" opacity="0.16"/>
<text x="80" y="118" font-family="Helvetica, Arial, sans-serif" font-size="30" font-weight="700" fill="#FAF6F0">FirstWeeks</text>
<text x="80" y="248" font-family="Helvetica, Arial, sans-serif" font-size="24" font-weight="700" letter-spacing="3" fill="#E8A37F">${xml(kicker.toUpperCase())}</text>
<text font-family="Helvetica, Arial, sans-serif" font-size="54" font-weight="700" fill="#FAF6F0" letter-spacing="-0.5">${tspans}</text>
<text x="80" y="560" font-family="Helvetica, Arial, sans-serif" font-size="26" font-weight="500" fill="#9A938B">firstweeks.app</text>
</svg>`;
}

async function render(name, spec) {
  const buf = Buffer.from(svg(spec));
  await sharp(buf).png({ quality: 90 }).toFile(path.join(OUT, name + '.png'));
}

fs.mkdirSync(OUT, { recursive: true });
const jobs = [];

// Home (landing default OG)
jobs.push(['home', { kicker: 'FirstWeeks', title: 'Understand what’s happening with your baby' }]);
// Weeks
for (const w of cnt.weeks) jobs.push([`week-${w.week}`, { kicker: 'Week by Week', title: w.h1 }]);
// Articles (kicker = category label)
const catLabel = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c.label]));
for (const a of cnt.articles) jobs.push([`article-${a.slug}`, { kicker: catLabel[a.category.slug] || 'Articles', title: a.title }]);
// Exercises
for (const e of cnt.exercises) jobs.push([`exercise-${e.slug}`, { kicker: 'Exercise', title: e.title }]);

let n = 0;
for (const [name, spec] of jobs) { await render(name, spec); n++; }
console.log(`✓ ${n} OG images → public/og/ (home + ${cnt.weeks.length} weeks + ${cnt.articles.length} articles + ${cnt.exercises.length} exercises)`);
