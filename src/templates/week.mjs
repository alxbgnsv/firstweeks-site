// Week pages (/en/week-by-week/week-N/) + hub. Light theme. Mockup 04.
import { page, storeLink } from '../components/layout.mjs';
import { crumbs, ctaBox } from '../components/blocks.mjs';
import { eeatLine, sourcesBlock, relatedBlock, articleLD } from '../components/content.mjs';
import { WEEK_PERIODS, site } from '../../config.mjs';
import { esc } from '../lib/html.mjs';

export function buildWeeks({ emit, content }) {
  const { weeks } = content;
  const hub = { url: '/en/week-by-week/', label: 'All 64 weeks' };

  for (const w of weeks) {
    const prev = weeks.find((x) => x.week === w.week - 1);
    const next = weeks.find((x) => x.week === w.week + 1);
    const crumbItems = [{ name: 'Home', url: '/' }, { name: 'Week by Week', url: hub.url }, { name: `Week ${w.week}` }];

    const nav = `<div class="week-nav">
${prev ? `<a href="${prev.url}">← Week ${prev.week}</a>` : '<span></span>'}
<span class="week-of">Week ${w.week} of 64</span>
${next ? `<a href="${next.url}">Week ${next.week} →</a>` : '<span></span>'}</div>`;

    const happening = `<section><h2>What’s happening</h2><div class="hgrid">${w.happening.map((h) =>
      `<div class="hcard"><h3>${esc(h.t)}</h3><p>${esc(h.b)}</p></div>`).join('')}</div></section>`;
    const todo = `<section><h2>What to do</h2><ul class="dotlist">${w.todo.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></section>`;
    const checkin = `<section><h2>When to check in</h2><div class="checkin-box"><p>${esc(w.watching)}</p></div></section>`;

    // Skills to watch (§ answer 4) — between check-in and product CTA.
    const skills = w.skills.length ? `<section><h2>Skills to watch this week</h2>
<ul class="skill-list">${w.skills.slice(0, 6).map((s) =>
      `<li><span class="skill-range">${esc(s.weeks.replace('-', '–'))}</span> <b>${esc(s.title)}</b> — ${esc(s.how_to_spot)}</li>`).join('')}</ul>
<p class="muted skill-note">Every baby has their own pace — ranges are typical, not deadlines.</p></section>` : '';

    const cta = ctaBox({
      h: 'This is exactly what FirstWeeks shows you — matched to your baby',
      p: `Week ${w.week} guidance, skills to watch, and answers that know your baby’s age and log.`,
    });

    const exercises = w.exercises.length ? `<section class="week-ex"><h2>Exercises for week ${w.week}</h2>
<div class="ex-links">${w.exercises.map((e) => `<a class="ex-link" href="${e.url}">${esc(e.title)} <span>${esc(e.duration_hint)}</span></a>`).join('')}</div></section>` : '';

    const reads = w.articles.length ? `<section class="week-reads"><span class="kicker">Reads for week ${w.week}</span>
<ul class="linklist">${w.articles.slice(0, 4).map((a) => `<li><a href="${a.url}">${esc(a.title)}</a></li>`).join('')}</ul></section>` : '';

    const relatedItems = [...w.articles.slice(0, 2), ...(next ? [{ url: next.url, title: `Baby at ${next.week} weeks`, category: null }] : [])].slice(0, 3);

    const body = `<div class="wrap reading">
${crumbs(crumbItems)}
${nav}
<h1>${esc(w.h1)}</h1>
${eeatLine({ srcNames: srcNamesFor(w), updated: w.updated })}
<p class="summary-lead">${esc(w.summary)}</p>
${happening}${todo}${checkin}${skills}
${cta}
${exercises}${reads}
${relatedBlock(relatedItems, hub)}
<div class="week-foot">${prev ? `<a href="${prev.url}">← Week ${prev.week}</a>` : '<span></span>'}
<a href="${hub.url}">All 64 weeks</a>
${next ? `<a href="${next.url}">Week ${next.week} →</a>` : '<span></span>'}</div>
</div>`;

    const meta = {
      title: w.seo.title, description: w.seo.description, path: w.url, theme: 'light',
      ogImage: `${site.origin}/og/week-${w.week}.png`,
      jsonld: articleLD(w.schema, crumbItems),
    };
    emit(w.url, page({ meta, body, theme: 'light' }));
  }

  buildWeekHub({ emit, weeks });
}

function srcNamesFor(w) {
  const cites = (w.schema && w.schema.citation) || [];
  const names = cites.map((u) => u.includes('cdc') ? 'CDC' : u.includes('aap') || u.includes('healthychildren') ? 'AAP' : u.includes('medlineplus') || u.includes('nih') ? 'MedlinePlus' : u.includes('who') ? 'WHO' : null).filter(Boolean);
  return [...new Set(names)].slice(0, 3);
}

function buildWeekHub({ emit, weeks }) {
  const groups = WEEK_PERIODS.map((p) => `<section class="wk-period"><span class="kicker">${esc(p.kicker)}</span>
<div class="weekgrid">${weeks.filter((w) => w.week >= p.from && w.week <= p.to).map((w) => `<a href="${w.url}">${w.week}</a>`).join('')}</div></section>`).join('');

  const body = `<div class="wrap index wk-hub">
${crumbs([{ name: 'Home', url: '/' }, { name: 'Week by Week' }])}
<h1>Your baby, week by week</h1>
<p class="summary-lead">64 weeks of what’s happening, what to do and when to check in — the same guidance the app matches to your baby.</p>
${eeatLine({ srcNames: ['CDC', 'NIH', 'WHO'] })}
${groups}
</div>`;

  const meta = {
    title: 'Week by Week: Your Baby’s First 64 Weeks | FirstWeeks',
    description: 'A calm, sourced week-by-week guide to your baby’s first 64 weeks — what’s happening, what to do, and when to check in.',
    path: '/en/week-by-week/', theme: 'light',
    jsonld: [{ '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Week by Week', url: `${site.origin}/en/week-by-week/` },
      { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: site.origin + '/' },
        { '@type': 'ListItem', position: 2, name: 'Week by Week' }] }],
  };
  emit('/en/week-by-week/', page({ meta, body, theme: 'light' }));
}
