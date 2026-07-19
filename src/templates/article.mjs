// Article pages (/en/articles/slug/) + hub + category hubs + pagination. Light. Mockup 03.
import { page, storeLink } from '../components/layout.mjs';
import { crumbs, ctaBox, ctaText, appStoreBadge } from '../components/blocks.mjs';
import { eeatLine, tocBlock, sourcesBlock, relatedBlock, articleLD } from '../components/content.mjs';
import { site, ARTICLES_PER_PAGE, CATEGORIES } from '../../config.mjs';
import { esc } from '../lib/html.mjs';

export function buildArticles({ emit, content }) {
  const { articles } = content;
  const hub = { url: '/en/articles/', label: 'All articles' };

  for (const a of articles) {
    const crumbItems = [{ name: 'Home', url: '/' }, { name: 'Articles', url: hub.url },
      { name: a.category.label, url: `/en/articles/${a.category.slug}/` }, { name: a.title }];
    const toc = a.body.filter((b) => b.h).map((b) => b.h);

    // Body with a text CTA after the first section and a box CTA mid-way.
    const sectionsHtml = a.body.map((b, i) => {
      let html = (b.h ? `<h2>${esc(b.h)}</h2>` : '') + `<p>${esc(b.p)}</p>`;
      if (i === 0) html += ctaText();
      if (i === 1 && a.body.length > 2) html += ctaBox({
        h: 'Is this normal for your baby?',
        p: 'FirstWeeks answers with your baby’s age and today’s log in mind — with pediatric sources attached.',
      });
      return html;
    }).join('');

    const weekLink = content.weeks.find((w) => w.week === a.week);
    const body = `<div class="wrap reading">
${crumbs(crumbItems)}
<h1>${esc(a.title)}</h1>
${eeatLine({ srcNames: [...new Set(a.sources.map((s) => s.label.split(' ')[0]))].slice(0, 3), updated: a.updated, readMin: a.read_min })}
${tocBlock(toc)}
${sectionsHtml}
${sourcesBlock(a.sources)}
${relatedBlock(a.relatedResolved, hub)}
${ctaBox({ h: 'Less guessing tonight', p: 'Track the evening in one tap — then ask what it means.', primary: 'Start free — 14 days, no card' })}
</div>`;

    const meta = {
      title: a.seo.title, description: a.seo.description, path: a.url, theme: 'light',
      ogImage: `${site.origin}/og/article-${a.slug}.png`,
      jsonld: articleLD(a.schema, crumbItems),
    };
    emit(a.url, page({ meta, body, theme: 'light' }));
  }

  buildArticleHub({ emit, content });
  for (const cat of CATEGORIES) buildCategoryHub({ emit, content, cat });
}

function card(a) {
  return `<a class="art-card" href="${a.url}">
<span class="kicker">${esc(a.category.label)}</span>
<span class="art-min">${a.read_min} min</span>
<span class="art-title">${esc(a.title)}</span>
<span class="art-teaser muted">${esc(clip(a.summary, 120))}</span></a>`;
}
const clip = (s, n) => (s.length <= n ? s : s.slice(0, n - 1).trimEnd() + '…');

function chips(activeSlug) {
  const all = `<a class="chip"${activeSlug ? '' : ' aria-current="page"'} href="/en/articles/">All</a>`;
  return `<div class="chips">${all}${CATEGORIES.map((c) =>
    `<a class="chip"${activeSlug === c.slug ? ' aria-current="page"' : ''} href="/en/articles/${c.slug}/">${esc(c.label)}</a>`).join('')}</div>`;
}

function hubShell({ emit, title, desc, path, heading, lead, items, activeSlug, page: pageNo = 1, totalPages = 1 }) {
  const start = (pageNo - 1) * ARTICLES_PER_PAGE;
  const slice = items.slice(start, start + ARTICLES_PER_PAGE);
  const crumbItems = activeSlug
    ? [{ name: 'Home', url: '/' }, { name: 'Articles', url: '/en/articles/' }, { name: title.split(' ')[0] }]
    : [{ name: 'Home', url: '/' }, { name: 'Articles' }];
  const pager = totalPages > 1 ? `<nav class="pager" aria-label="Pagination">${Array.from({ length: totalPages }, (_, i) => {
    const p = i + 1; const url = p === 1 ? path : `${path}page/${p}/`;
    return p === pageNo ? `<span aria-current="page">${p}</span>` : `<a href="${url}">${p}</a>`;
  }).join('')}</nav>` : '';

  const body = `<div class="wrap reading art-hub">
${crumbs(crumbItems)}
<h1>${esc(heading)}</h1>
<p class="summary-lead">${esc(lead)}</p>
${eeatLine({ srcNames: ['CDC', 'NIH', 'WHO', 'AAP'] })}
${chips(activeSlug)}
<div class="grid grid--auto art-grid">${slice.map(card).join('')}</div>
${pager}
</div>`;

  const meta = {
    title, description: desc, path: pageNo === 1 ? path : `${path}page/${pageNo}/`, theme: 'light',
    jsonld: [{ '@context': 'https://schema.org', '@type': 'CollectionPage', name: heading, url: site.origin + path },
      { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: crumbItems.map((c, i) => ({
        '@type': 'ListItem', position: i + 1, name: c.name, item: c.url ? site.origin + c.url : undefined })) }],
  };
  emit(pageNo === 1 ? path : `${path}page/${pageNo}/`, page({ meta, body, theme: 'light' }));
}

function buildArticleHub({ emit, content }) {
  const items = content.articles.slice().sort((a, b) => a.week - b.week || a.id.localeCompare(b.id));
  const totalPages = Math.ceil(items.length / ARTICLES_PER_PAGE);
  for (let p = 1; p <= totalPages; p++) {
    hubShell({
      emit, items, page: p, totalPages, activeSlug: null, path: '/en/articles/',
      title: p === 1 ? 'Articles: Newborn & Baby Care Guides | FirstWeeks' : `Articles — page ${p} | FirstWeeks`,
      desc: 'Calm, practical, sourced guides for the first years — written from the same references your pediatrician uses.',
      heading: 'Articles',
      lead: 'Calm, practical guides for the first years — written from the same sources your pediatrician uses.',
    });
  }
}

function buildCategoryHub({ emit, content, cat }) {
  const items = content.articlesByCategory(cat.slug).sort((a, b) => a.week - b.week);
  if (!items.length) return;
  const totalPages = Math.ceil(items.length / ARTICLES_PER_PAGE);
  for (let p = 1; p <= totalPages; p++) {
    hubShell({
      emit, items, page: p, totalPages, activeSlug: cat.slug, path: `/en/articles/${cat.slug}/`,
      title: `${cat.label}: Baby Care Guides | FirstWeeks`,
      desc: `Sourced ${cat.label.toLowerCase()} guides for your baby’s first year — practical and calm, cited every time.`,
      heading: cat.label,
      lead: `Practical, sourced guides on ${cat.label.toLowerCase()} for the first year.`,
    });
  }
}
