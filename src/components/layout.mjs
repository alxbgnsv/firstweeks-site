// Page shell: header, footer, and the outer document.
import { site, app, ct, flags } from '../../config.mjs';
import { esc } from '../lib/html.mjs';
import { head } from '../lib/meta.mjs';

export const storeLink = (tag) => `${app.storeURL}?ct=${ct[tag]}`;

const NAV = [
  ['Articles', '/en/articles/'],
  ['Week by Week', '/en/week-by-week/'],
  ['Exercises', '/en/exercises/'],
  ['Pricing', '/#pricing'],
];

export function header() {
  // Stage 1: "Start free" → App Store (?ct=web_header). Anchors are same on both themes.
  return `<header class="site-header"><div class="wrap">
<a class="brand" href="/"><img src="/assets/icon.png" width="30" height="30" alt="FirstWeeks"> FirstWeeks</a>
<nav class="nav" aria-label="Primary">${NAV.map(([t, h]) => `<a href="${h}">${t}</a>`).join('')}</nav>
<a class="btn btn--primary header-cta" href="${flags.web_checkout ? '/#pricing' : storeLink('header')}">Start free</a>
</div></header>`;
}

const FOOTER_LINKS = [
  ['Articles', '/en/articles/'], ['Week by Week', '/en/week-by-week/'], ['Exercises', '/en/exercises/'],
  ['Support', '/en/support/'], ['Privacy', '/en/privacy/'], ['Terms', '/en/terms/'],
  ['Methodology', '/en/methodology/'],
];

export function footer() {
  return `<footer class="site-footer"><div class="wrap">
<div class="footer-grid">
  <div>
    <a class="brand" href="/"><img src="/assets/icon.png" width="30" height="30" alt=""> FirstWeeks</a>
    <div class="locale-switch" style="margin-top:14px">
      <span class="on">EN</span><span>ES — soon</span><span>PT-BR — soon</span>
    </div>
  </div>
  <nav class="footer-links" aria-label="Footer">
    ${FOOTER_LINKS.map(([t, h]) => `<a href="${h}">${t}</a>`).join('')}
    <a href="mailto:${site.email}">${site.email}</a>
  </nav>
</div>
<p class="legal">© 2026 FirstWeeks · Not a medical device. Educational information, not medical advice.</p>
</div></footer>`;
}

// Full page. scripts: array of module paths to include (deferred).
export function page({ meta, body, theme = 'dark', scripts = [], stickyCTA = false }) {
  const cls = [theme === 'light' ? 'light' : '', stickyCTA ? 'has-sticky' : ''].filter(Boolean).join(' ');
  const js = scripts.map((s) => `<script src="${s}" defer></script>`).join('');
  return `${head({ ...meta, theme })}<body${cls ? ` class="${cls}"` : ''}>
<a class="skip-link" href="#main">Skip to content</a>
${header()}
<main id="main">${body}</main>
${footer()}
${js}
</body></html>`;
}
