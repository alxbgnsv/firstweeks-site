// Reusable content blocks.
import { site, app, ct, flags, pricing } from '../../config.mjs';
import { esc } from '../lib/html.mjs';
import { storeLink } from './layout.mjs';

export function appStoreBadge(tag = 'hero') {
  return `<a class="appstore" href="${storeLink(tag)}"><span><small>Download on the</small><b>App Store</b></span></a>`;
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
export function ctaText(label = 'Ask FirstWeeks anything about your baby', href = null) {
  return `<a class="cta-text" href="${href || (flags.web_checkout ? '/#pricing' : storeLink('content'))}">${esc(label)} <span aria-hidden="true">→</span></a>`;
}
export function ctaBox({ h, p, primary = 'Start free — 14 days', withBadge = true }) {
  const href = flags.web_checkout ? '/#pricing' : storeLink('content');
  return `<div class="cta-box"><h3>${esc(h)}</h3><p>${esc(p)}</p>
<div class="btn-row"><a class="btn btn--primary" href="${href}">${esc(primary)}</a>
${withBadge ? appStoreBadge('content') : ''}</div></div>`;
}

// Pricing cards. Stage 1: CTAs → App Store (?ct=web_pricing). Stage 2: → checkout.
export function priceCards() {
  const dest = (plan) => flags.web_checkout ? `/en/checkout/?plan=${plan}` : storeLink('pricing');
  const a = pricing.annual, m = pricing.monthly;
  return `<div class="plans">
<div class="plan plan--featured">
  <span class="plan__save badge badge--save">${a.save}</span>
  <h3>Annual</h3>
  <div class="price">${a.perMonth}</div>
  <div class="sub">${a.billed}</div>
  <a class="btn btn--primary btn--block" href="${dest('annual')}">Start free with Annual</a>
</div>
<div class="plan">
  <h3>Monthly</h3>
  <div class="price">${m.perMonth}</div>
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
