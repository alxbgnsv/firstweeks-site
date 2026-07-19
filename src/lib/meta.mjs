// Head/meta/JSON-LD helpers. title/description rules live here (one rule per page type, §6a.1).
import { site } from '../../config.mjs';
import { esc } from './html.mjs';

let CSS = ''; // inlined critical CSS; set once by build via setCSS()
export function setCSS(css) { CSS = css; }

// hreflang alternates: en built, es/pt-br bookmarked to same path (§6). x-default → en.
function alternates(path) {
  const clean = path.endsWith('/') ? path : path + '/';
  const rows = site.hreflang.map((lc) => {
    const href = lc === 'en' ? `${site.origin}${clean}` : `${site.origin}/${lc}${clean === '/' ? '/' : clean}`;
    return `<link rel="alternate" hreflang="${lc}" href="${esc(href)}">`;
  });
  rows.push(`<link rel="alternate" hreflang="x-default" href="${esc(site.origin + clean)}">`);
  return rows.join('');
}

export function head({ title, description, path, theme = 'dark', ogImage, jsonld = [], css = CSS, noindex = false, preload = [] }) {
  const canonical = `${site.origin}${path.endsWith('/') ? path : path + '/'}`;
  const og = ogImage || `${site.origin}/og/home.png`;
  const ld = jsonld.filter(Boolean).map((o) =>
    `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('');
  const preloads = preload.map((p) =>
    `<link rel="preload" as="${p.as}"${p.type ? ` type="${p.type}"` : ''} href="${esc(p.href)}"${p.fetchpriority ? ` fetchpriority="${p.fetchpriority}"` : ''}>`).join('');
  return `<!doctype html><html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>${noindex ? '\n<meta name="robots" content="noindex,follow">' : ''}
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(canonical)}">
${alternates(path)}
<meta property="og:type" content="website">
<meta property="og:site_name" content="FirstWeeks">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:image" content="${esc(og)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/assets/icon.png" type="image/png">
<link rel="apple-touch-icon" href="/assets/icon.png">
${preloads}<style>${css}</style>
${ld}
</head>`;
}

export const clamp = (s, n) => (s.length <= n ? s : s.slice(0, n - 1).trimEnd() + '…');
