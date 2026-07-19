// Reusable content blocks.
import { site, app, ct, flags, pricing } from '../../config.mjs';
import { esc } from '../lib/html.mjs';
import { storeLink } from './layout.mjs';

export function appStoreBadge(tag = 'hero') {
  // Official-style Apple badge: black pill, Apple mark + "Download on the / App Store".
  return `<a class="appstore" href="${storeLink(tag)}" aria-label="Download on the App Store">
<svg class="appstore__apple" viewBox="0 0 24 24" width="21" height="21" aria-hidden="true" focusable="false"><path fill="currentColor" d="M16.365 1.43c0 1.14-.42 2.22-1.15 3.02-.79.87-2.08 1.55-3.13 1.47-.14-1.1.44-2.28 1.13-3.03.78-.85 2.13-1.5 3.15-1.46zm3.93 16.03c-.57 1.31-.85 1.9-1.58 3.06-1.02 1.62-2.46 3.63-4.25 3.65-1.58.02-1.99-.99-4.14-.98-2.15.01-2.6 1-4.18.97-1.79-.02-3.15-1.83-4.17-3.44-2.85-4.51-3.15-9.8-1.39-12.62 1.25-2 3.22-3.17 5.08-3.17 1.89 0 3.08 1.04 4.64 1.04 1.51 0 2.43-1.04 4.62-1.04 1.65 0 3.4.9 4.65 2.45-4.09 2.24-3.42 8.08.98 10.13z"/></svg>
<span class="appstore__txt"><small>Download on the</small><b>App Store</b></span></a>`;
}

// Breadcrumbs (visible + returns matching BreadcrumbList for JSON-LD via crumbLD).
export function crumbs(items) {
  const parts = items.map((it, i) =>
    i === items.length - 1
      ? `<span aria-current="page">${esc(it.name)}</span>`
      : `<a href="${it.url}">${esc(it.name)}</a>`
  );
  return `<nav class="crumbs" aria-label="Breadcrumb">${parts.join(' / ')}</nav>`;
}
export function crumbLD(items) {
  return {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem', position: i + 1, name: it.name,
      item: it.url ? site.origin + it.url : undefined,
    })),
  };
}

// iPhone frame with a product screen (screens are pre-generated WebP; PNG fallback via <picture>).
export function iphone(screen, alt, mini = false) {
  return `<div class="iphone${mini ? ' iphone--mini' : ''}">
<div class="iphone__screen"><picture>
<source srcset="/assets/${screen}.webp" type="image/webp">
<img src="/assets/${screen}.png" width="1206" height="2478" alt="${esc(alt)}" loading="lazy" decoding="async">
</picture></div></div>`;
}

// Two content CTA inserts (§ mockup 05).
// Inline peach banner: app icon · label · arrow (space-between).
export function ctaText(label = 'Ask FirstWeeks anything about your baby', href = null) {
  const dest = href || (flags.web_checkout ? '/#pricing' : storeLink('content'));
  return `<a class="cta-text" href="${dest}"><img class="cta-text__ic" src="/assets/icon.png" width="30" height="30" alt="" aria-hidden="true"><span>${esc(label)}</span><span class="cta-text__arrow" aria-hidden="true">→</span></a>`;
}
// Rich CTA. variant "dark" = branded dark box + phone screenshot (mid-content);
// variant "center" = centered peach panel, single button (closing CTA).
export function ctaBox({ h, p, primary = 'Start free — 14 days, no card', screen = 'scr-today', variant = 'dark' }) {
  const href = flags.web_checkout ? '/#pricing' : storeLink('content');
  const btn = `<a class="btn btn--primary" href="${href}">${esc(primary)}</a>`;
  if (variant === 'center') {
    return `<div class="cta-box cta-box--center"><h3>${esc(h)}</h3><p>${esc(p)}</p><div class="btn-row">${btn}</div></div>`;
  }
  return `<div class="cta-box"><div><h3>${esc(h)}</h3><p>${esc(p)}</p><div class="btn-row">${btn}</div></div>
<div class="cta-box__phone"><picture><source srcset="/assets/${screen}.webp" type="image/webp">
<img src="/assets/${screen}.png" width="1206" height="2478" alt="" loading="lazy" decoding="async"></picture></div></div>`;
}

// Pricing cards. Stage 1: CTAs → App Store (?ct=web_pricing). Stage 2: → checkout.
export function priceCards() {
  const dest = (plan) => flags.web_checkout ? `/en/checkout/?plan=${plan}` : storeLink('pricing');
  const a = pricing.annual, m = pricing.monthly;
  // "$4.99/mo" → "$4.99<small>/mo</small>"
  const price = (pm) => { const [n, unit] = pm.split('/'); return `${esc(n)}<small>/${esc(unit)}</small>`; };
  return `<div class="plans">
<div class="plan plan--featured">
  <span class="plan__save badge badge--save">${a.save}</span>
  <div class="plan__name">Annual</div>
  <div class="price">${price(a.perMonth)}</div>
  <div class="sub">${a.billed}</div>
  <a class="btn btn--primary btn--block" href="${dest('annual')}">Start free with Annual</a>
</div>
<div class="plan">
  <div class="plan__name">Monthly</div>
  <div class="price">${price(m.perMonth)}</div>
  <div class="sub">${m.note}</div>
  <a class="btn btn--secondary btn--block" href="${dest('monthly')}">Start free with Monthly</a>
</div>
</div>`;
}

// FAQ accordion (native <details>; JS enhances single-open). Returns markup + FAQPage LD.
export function faq(items) {
  const html = `<div class="faq">${items.map((q, i) => `<details${i === 0 ? ' open' : ''}>
<summary>${esc(q.q)}</summary><div>${q.a}</div></details>`).join('')}</div>`;
  const ld = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: items.map((q) => ({
      '@type': 'Question', name: q.q,
      acceptedAnswer: { '@type': 'Answer', text: q.aText || q.a.replace(/<[^>]+>/g, '') },
    })),
  };
  return { html, ld };
}
