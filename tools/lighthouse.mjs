// Quality gate: desktop Lighthouse over one page of each type. Self-contained —
// serves dist/ on an ephemeral port (concurrent + gzip + cache headers, like
// Pages; python http.server is single-threaded and inflates LCP). Exits non-zero
// if any INDEXABLE page scores <95 in any category.
// Usage: npm run build && npm run lh
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import lighthouse from 'lighthouse';
import desktopConfig from 'lighthouse/core/config/desktop-config.js';
import * as chromeLauncher from 'chrome-launcher';

const DIST = path.dirname(fileURLToPath(import.meta.url)) + '/../dist';
const MIME = { '.html':'text/html;charset=utf-8', '.css':'text/css', '.js':'text/javascript',
  '.png':'image/png', '.webp':'image/webp', '.xml':'application/xml', '.txt':'text/plain', '.json':'application/json' };
const TEXT = new Set(['.html','.css','.js','.xml','.txt','.json']);
const PORT = 8940;

const server = http.createServer((req, res) => {
  let file = path.join(DIST, decodeURIComponent(req.url.split('?')[0]));
  try {
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    else if (!fs.existsSync(file) && fs.existsSync(file + '/index.html')) file += '/index.html';
    if (!fs.existsSync(file)) { file = path.join(DIST, '404.html'); res.statusCode = 404; }
    const ext = path.extname(file), body = fs.readFileSync(file);
    res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
    res.setHeader('Cache-Control', TEXT.has(ext) ? 'max-age=600' : 'max-age=86400');
    if (TEXT.has(ext) && /gzip/.test(req.headers['accept-encoding'] || '')) {
      res.setHeader('Content-Encoding', 'gzip'); res.end(zlib.gzipSync(body));
    } else res.end(body);
  } catch { res.statusCode = 500; res.end('err'); }
});
await new Promise((r) => server.listen(PORT, r));

const PAGES = [
  ['landing', '/'], ['week', '/en/week-by-week/week-5/'], ['week-hub', '/en/week-by-week/'],
  ['article', '/en/articles/the-3-am-proof-sleep-setup/'], ['article-hub', '/en/articles/'],
  ['category-hub', '/en/articles/sleep/'], ['exercise', '/en/exercises/chest-tummy-time/'],
  ['exercise-hub', '/en/exercises/'], ['support', '/en/support/'], ['methodology', '/en/methodology/'], ['privacy', '/en/privacy/'], ['terms', '/en/terms/'],
];
const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu'] });
const opts = { port: chrome.port, output: 'json', logLevel: 'error',
  onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'] };

console.log('\n  page           perf a11y best seo');
console.log('  ' + '-'.repeat(37));
let worst = 100;
for (const [name, p] of PAGES) {
  const r = await lighthouse(`http://127.0.0.1:${PORT}${p}`, opts, desktopConfig);
  const s = (k) => Math.round(r.lhr.categories[k].score * 100);
  const cells = [s('performance'), s('accessibility'), s('best-practices'), s('seo')];
  worst = Math.min(worst, ...cells);
  console.log('  ' + name.padEnd(14) + cells.map((v) => String(v).padStart(4) + (v >= 95 ? ' ' : '!')).join(''));
}
await chrome.kill();
server.close();
console.log('\n  lowest score: ' + worst + (worst >= 95 ? '  ✓ gate passed (≥95)' : '  ✗ GATE FAILED'));
process.exit(worst >= 95 ? 0 : 1);
