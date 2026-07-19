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

// Sun/moon icons for the theme toggle (currentColor).
const THEME_ICONS = `<svg class="ic-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"/></svg><svg class="ic-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/></svg>`;

export function header() {
  // Stage 1: "Start free" → App Store (?ct=web_header). Anchors are same on both themes.
  const cta = flags.web_checkout ? '/#pricing' : storeLink('header');
  const links = NAV.map(([t, h]) => `<a href="${h}">${t}</a>`).join('');
  // Desktop: nav + theme toggle + compact Start-free pill. Mobile (≤720): compact
  // pill stays visible; a CSS-only <details> hamburger reveals nav + Start free +
  // an in-panel theme toggle. Pure CSS so nav works on content pages too (no JS).
  return `<header class="site-header"><div class="wrap">
<a class="brand" href="/"><img src="/assets/icon.png" width="28" height="28" alt="FirstWeeks"> FirstWeeks</a>
<nav class="nav" aria-label="Primary">${links}</nav>
<div class="header-tools">
<button class="theme-toggle theme-toggle--icon" type="button" data-theme-toggle aria-label="Toggle light/dark theme">${THEME_ICONS}</button>
<a class="btn btn--primary header-cta" href="${cta}">Start free</a>
<details class="menu">
<summary class="menu__btn" aria-label="Menu" role="button">
<svg class="menu__ic menu__ic--bars" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M4 7h16M4 12h16M4 17h16"/></svg>
<svg class="menu__ic menu__ic--x" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M6 6l12 12M18 6 6 18"/></svg>
</summary>
<div class="menu__panel"><nav aria-label="Mobile">${links}</nav>
<a class="btn btn--primary btn--block" href="${cta}">Start free</a></div>
</details>
</div>
</div></header>`;
}

// Distraction-free header for checkout: brand + back link only (no nav/CTA/hamburger).
export function minimalHeader() {
  return `<header class="site-header site-header--min"><div class="wrap">
<a class="brand" href="/"><img src="/assets/icon.png" width="28" height="28" alt="FirstWeeks"> FirstWeeks</a>
<a class="co-back" href="/">← Back to firstweeks.app</a>
</div></header>`;
}

// Toggle wire-up (global, tiny, inline on every page). Pre-paint script in <head>
// already applied the saved theme + added .js.
export function themeScript() {
  return `<script>(function(){var t=document.querySelectorAll('[data-theme-toggle]');if(!t.length)return;function set(v){document.documentElement.setAttribute('data-theme',v);try{localStorage.setItem('fw-theme',v);}catch(e){}}for(var i=0;i<t.length;i++){t[i].addEventListener('click',function(){set(document.documentElement.getAttribute('data-theme')==='light'?'dark':'light');});}})();</script>`;
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

// Full page. Theme is carried by <html data-theme> (set in head, overridable by
// the toggle); body no longer needs a .light class. scripts: deferred module paths.
export function page({ meta, body, theme = 'dark', scripts = [], stickyCTA = false, chrome = 'full' }) {
  const cls = stickyCTA ? 'has-sticky' : '';
  const js = scripts.map((s) => `<script src="${s}" defer></script>`).join('');
  return `${head({ ...meta, theme })}<body${cls ? ` class="${cls}"` : ''}>
<a class="skip-link" href="#main">Skip to content</a>
${chrome === 'minimal' ? minimalHeader() : header()}
<main id="main">${body}</main>
${footer()}
${js}
${themeScript()}
</body></html>`;
}
