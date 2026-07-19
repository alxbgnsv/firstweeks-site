// Internal styleguide (/styleguide/) — noindex, not in sitemap. For visual verification of К1.
import { page } from '../components/layout.mjs';
import { appStoreBadge, iphone, crumbs, ctaText, ctaBox, priceCards, faq } from '../components/blocks.mjs';

export function buildStyleguide({ emit, read }) {
  const { html: faqHtml } = faq([
    { q: 'What’s free forever?', a: 'Tracking — sleep, feeds, diapers, growth — is free with no time limit.' },
    { q: 'Is this medical advice?', a: 'No. Educational information with sources — not a diagnosis.' },
  ]);
  const section = (t, inner) => `<section class="section"><div class="wrap"><h2>${t}</h2>${inner}</div></section>`;
  const dark = `
${section('Buttons', `<div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center">
<a class="btn btn--primary">Start free — 14 days, no card</a>
<a class="btn btn--secondary">Secondary action</a>
${appStoreBadge('hero')}<a class="link-arrow">Text link</a></div>`)}
${section('Badges', `<span class="badge badge--save">SAVE 50%</span> <span class="badge badge--danger">Needs a doctor now</span> <span class="source-badge">Sources: MedlinePlus</span>`)}
${section('Breadcrumbs', crumbs([{ name: 'Home', url: '/' }, { name: 'Articles', url: '/en/articles/' }, { name: 'Feeding' }]))}
${section('CTA inserts', ctaText() + ctaBox({ h: 'Is tonight’s pattern normal for her?', p: 'Answers that know your baby’s age and today’s log — with sources attached.' }))}
${section('Pricing cards', priceCards())}
${section('FAQ', faqHtml)}
${section('iPhone frame', `<div style="max-width:320px">${iphone('scr-today', 'Today — your baby’s week')}</div>`)}`;

  const light = `<div class="light" style="background:var(--bg);color:var(--text)">
${section('Light theme (Warm paper 1a)', `<div style="display:flex;gap:12px;flex-wrap:wrap"><a class="btn btn--primary">Start free — 14 days, no card</a><a class="link-arrow">Content link</a></div>` + crumbs([{ name: 'Home', url: '/' }, { name: 'Articles', url: '/en/articles/' }, { name: 'Cluster feeding' }]))}
</div>`;

  const body = `<div class="wrap section"><p class="kicker">Internal styleguide · not indexed</p></div>${dark}${light}`;
  const meta = {
    title: 'Styleguide · FirstWeeks',
    description: 'Internal component preview.',
    path: '/styleguide/',
  };
  // noindex: emit but keep out of sitemap
  let html = page({ meta, body });
  html = html.replace('</title>', '</title><meta name="robots" content="noindex">');
  emit('/styleguide/', html, { indexable: false });
}
