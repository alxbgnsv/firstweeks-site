// Shared content-page pieces (light "Warm paper" theme): E-E-A-T line, TOC,
// sources (nofollow), related (hub-and-spoke), Article JSON-LD wrapper.
import { site, sources } from '../../config.mjs';
import { esc } from '../lib/html.mjs';
import { crumbLD } from './blocks.mjs';

// "Medically-informed · Sources: CDC, AAP · Updated June 2026 · N min read"
export function eeatLine({ srcNames, updated, readMin }) {
  const parts = ['Medically-informed'];
  if (srcNames && srcNames.length) parts.push('Sources: ' + srcNames.join(', '));
  if (updated) parts.push('Updated ' + updated);
  if (readMin) parts.push(readMin + ' min read');
  return `<p class="eeat">${esc(parts.join(' · '))}</p>`;
}

export const tocAnchor = (t) => String(t).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export function tocBlock(items) {
  if (!items || items.length < 2) return '';
  return `<nav class="toc" aria-label="In this article"><span class="kicker">In this article</span>
<ul>${items.map((t) => `<li><a href="#${tocAnchor(t)}">${esc(t)}</a></li>`).join('')}</ul></nav>`;
}

// External source links: nofollow noopener (§6a — weight not passed out).
export function sourcesBlock(srcs) {
  if (!srcs || !srcs.length) return '';
  return `<div class="sources"><span class="kicker">Sources</span><ul>${srcs.map((s) =>
    `<li><a href="${esc(s.url)}" target="_blank" rel="nofollow noopener">${esc(s.label)} ↗</a></li>`).join('')}</ul></div>`;
}

// Related: contextual spokes + hub link (internal, follow, descriptive anchors).
export function relatedBlock(items, hub) {
  const cards = items.map((a) => `<a class="rel-card" href="${a.url}">
<span class="kicker">${esc(a.category ? a.category.label : 'Week by Week')}</span>
<span class="rel-title">${esc(a.title || a.h1)}</span></a>`).join('');
  const hubLink = hub ? `<a class="rel-card rel-card--hub" href="${hub.url}"><span class="rel-title">${esc(hub.label)} →</span></a>` : '';
  return `<div class="related"><span class="kicker">Related</span><div class="rel-grid">${cards}${hubLink}</div></div>`;
}

// Article schema with BreadcrumbList; returns [articleLD, breadcrumbLD].
export function articleLD(schema, crumbs) {
  return [schema, crumbLD(crumbs)];
}

export const GUIDANCE = sources.join(' · ');
