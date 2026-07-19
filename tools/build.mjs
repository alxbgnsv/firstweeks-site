// SITE-2 static generator. Pure Node, zero runtime deps. Emits dist/.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { site } from '../config.mjs';
import { minify, assertNoPlaceholders } from '../src/lib/html.mjs';
import { setCSS } from '../src/lib/meta.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url)) + '/..';
const DIST = path.join(ROOT, 'dist');
export const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
export const content = (name) => JSON.parse(read(`content/${name}.json`));

// Inlined critical CSS (tokens + base) — one <style>, no render-blocking request.
export const CSS = (read('src/styles/tokens.css') + '\n' + read('src/styles/base.css'))
  .replace(/\/\*[^]*?\*\//g, '')        // strip comments first
  .replace(/\s*\n\s*/g, '\n').trim();   // collapse blank lines (keep CSS intact)
setCSS(CSS);

let pageCount = 0;
const urls = []; // for sitemap (populated by builders)

export function emit(urlPath, html, { indexable = true } = {}) {
  assertNoPlaceholders(html, urlPath);
  const rel = urlPath === '/' ? 'index.html'
    : path.join(urlPath.replace(/^\//, '').replace(/\/$/, ''), 'index.html');
  const dest = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, minify(html) + '\n');
  pageCount++;
  if (indexable) urls.push(urlPath.endsWith('/') || urlPath === '/' ? urlPath : urlPath + '/');
}

export function emitFile(rel, data) {
  const dest = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, data);
}

function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name), d = path.join(dst, e.name);
    if (e.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

// ---- build ----
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });

// Page builders (added per commit). К1: shell + styleguide.
const { buildStyleguide } = await import('../src/templates/styleguide.mjs');
const { buildLanding } = await import('../src/templates/landing.mjs');

buildLanding({ emit, CSS });
buildStyleguide({ emit, CSS });

// Static assets + files
copyDir(path.join(ROOT, 'public'), DIST);

// sitemap.xml (indexable pages only)
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `<url><loc>${site.origin}${u}</loc></url>`).join('\n')}
</urlset>`;
emitFile('sitemap.xml', sitemap);
emitFile('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${site.origin}/sitemap.xml\n`);

console.log(`✓ built ${pageCount} pages → dist/`);
export { urls };
