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
  const cta = flags.web_checkout ? '/#pricing' : storeLink('header');
  const links = NAV.map(([t, h]) => `<a href="${h}">${t}</a>`).join('');
  // Desktop: .nav + .header-cta. Mobile (≤720): CSS-only <details> hamburger reveals
  // the same links + Start free. Pure CSS so it works on content pages too (no JS).
  return `<header class="site-header"><div class="wrap">
<a class="brand" href="/"><img src="/assets/icon.png" width="30" height="30" alt="FirstWeeks"> FirstWeeks</a>
<nav class="nav" aria-label="Primary">${links}</nav>
<a class="btn btn--primary header-cta" href="${cta}">Start free</a>
<details class="menu">
<summary class="menu__btn" aria-label="Menu" role="button">
<svg class="menu__ic menu__ic--bars" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M4 7h16M4 12h16M4 17h16"/></svg>
<svg class="menu__ic menu__ic--x" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M6 6l12 12M18 6 6 18"/></svg>
</summary>
<div class="menu__panel"><nav aria-label="Mobile">${links}</nav>
<a class="btn btn--primary btn--block" href="${cta}">Start free</a></div>
</details>
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
