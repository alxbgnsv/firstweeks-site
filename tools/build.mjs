// SITE-2 static generator. Pure Node, zero runtime deps. Emits dist/.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { site, app, flags } from '../config.mjs';
import { minify, assertNoPlaceholders } from '../src/lib/html.mjs';
import { setCSS } from '../src/lib/meta.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url)) + '/..';
const DIST = path.join(ROOT, 'dist');
export const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
export const content = (name) => JSON.parse(read(`content/${name}.json`));

// Inlined critical CSS (tokens + base) — one <style>, no render-blocking request.
export const CSS = ['tokens', 'base', 'landing', 'checkout', 'content', 'service'].map((n) => read(`src/styles/${n}.css`)).join('\n')
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
const { buildCheckout } = await import('../src/templates/checkout.mjs');
// SITE-NOPRICE: страницы checkout (с ценами) не собираются до pricing_public
const { buildWeeks } = await import('../src/templates/week.mjs');
const { buildArticles } = await import('../src/templates/article.mjs');
const { buildExercises } = await import('../src/templates/exercise.mjs');
const { buildService } = await import('../src/templates/service.mjs');
const { loadContent } = await import('../src/lib/content.mjs');
const { initDates, persistDates } = await import('../src/lib/dates.mjs');

// Build date (reproducible-friendly: override via BUILD_DATE).
const BUILD_ISO = process.env.BUILD_DATE || new Date().toISOString().slice(0, 10);
initDates(BUILD_ISO);
const cnt = loadContent(BUILD_ISO);

buildLanding({ emit, read, CSS });
if (flags.pricing_public) buildCheckout({ emit, read, CSS });
buildWeeks({ emit, content: cnt });
buildArticles({ emit, content: cnt });
buildExercises({ emit, content: cnt });
buildService({ emit, emitFile });
// SITE-NOPRICE: styleguide показывает priceCards — прячем вместе с ценами
if (flags.pricing_public) buildStyleguide({ emit, read, CSS });
persistDates();

// Static assets + files
copyDir(path.join(ROOT, 'public'), DIST);

// Apple App Site Association (universal links → /invite/*). Served at
// /.well-known/apple-app-site-association with NO extension and JSON body.
// appID = {TEAMID}.{bundleID}; Alex fills the real Team ID (README).
const aasa = {
  applinks: {
    apps: [],
    details: [{ appID: `${app.teamID}.${app.bundleID}`, paths: ['/invite/*'] }],
  },
};
emitFile('.well-known/apple-app-site-association', JSON.stringify(aasa, null, 2));
// Root copy too (older iOS checks site root before .well-known).
emitFile('apple-app-site-association', JSON.stringify(aasa, null, 2));

// sitemap.xml (indexable pages only)
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `<url><loc>${site.origin}${u}</loc></url>`).join('\n')}
</urlset>`;
emitFile('sitemap.xml', sitemap);
emitFile('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${site.origin}/sitemap.xml\n`);

console.log(`✓ built ${pageCount} pages → dist/`);
export { urls };
