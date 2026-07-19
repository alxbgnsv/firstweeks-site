// Reusable content blocks.
import { site, app, ct, flags, pricing } from '../../config.mjs';
import { esc } from '../lib/html.mjs';
import { storeLink } from './layout.mjs';

export function appStoreBadge(tag = 'hero') {
  // Official-style Apple badge: black pill, Apple mark + "Download on the / App Store".
  return `<a class="appstore" href="${storeLink(tag)}" aria-label="Download on the App Store">
<svg class="appstore__apple" viewBox="0 0 384 512" width="18" height="22" aria-hidden="true" focusable="false"><path fill="currentColor" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5c0 26.2 4.8 53.3 14.4 81.2 12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
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
