// Exercise pages (/en/exercises/slug/) + hub. HowTo schema. Light. Mockup 04.
import { page } from '../components/layout.mjs';
import { crumbs, ctaBox } from '../components/blocks.mjs';
import { eeatLine, sourcesBlock, articleLD } from '../components/content.mjs';
import { site } from '../../config.mjs';
import { esc } from '../lib/html.mjs';

export function buildExercises({ emit, content }) {
  const { exercises, EXERCISE_GROUPS } = content;
  const hub = { url: '/en/exercises/', label: 'All exercises' };

  for (const e of exercises) {
    const crumbItems = [{ name: 'Home', url: '/' }, { name: 'Exercises', url: hub.url }, { name: e.title }];
    const srcs = [{ label: labelFor(e.source), url: e.source }];

    const howto = {
      '@context': 'https://schema.org', '@type': 'HowTo', name: e.title, description: e.benefit,
      totalTime: durationISO(e.duration_hint),
      step: e.steps.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, text: s })),
      citation: e.source,
    };

    const body = `<div class="wrap reading">
${crumbs(crumbItems)}
<h1>${esc(e.title)}</h1>
<div class="ex-meta"><span class="badge badge--save">${esc(e.weeksLabel)}</span> <span class="chip">${esc(e.duration_hint)}</span></div>
${eeatLine({ srcNames: [labelFor(e.source).split(' ')[0]], updated: e.updated })}
<section><h2>Why it helps</h2><p>${esc(e.benefit)}</p></section>
<section><h2>How to do it</h2><ol class="howto">${e.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol></section>
<section class="stopif"><span class="kicker">Stop if you see</span><p>${esc(e.stop_signs)}</p></section>
${sourcesBlock(srcs)}
${ctaBox({ h: 'Get guided exercises matched to your baby’s week', p: 'The app queues the right 2–3 activities every week — no searching.', primary: 'Start free — 14 days, no card' })}
</div>`;

    const meta = {
      title: `${e.title}: How-To & Safety | FirstWeeks`,
      description: clip(`${e.benefit} A short, safe activity for ${e.weeksLabel.toLowerCase()} — with clear stop-signs.`, 155),
      path: e.url, theme: 'light', ogImage: `${site.origin}/og/exercise-${e.slug}.png`,
      jsonld: [howto, articleLD(null, crumbItems)[1]],
    };
    emit(e.url, page({ meta, body, theme: 'light' }));
  }

  buildExerciseHub({ emit, exercises, groups: EXERCISE_GROUPS });
}

function buildExerciseHub({ emit, exercises, groups }) {
  const sections = groups.map((g) => {
    const items = exercises.filter((e) => e.from <= g.to && e.to >= g.from);
    if (!items.length) return '';
    return `<section class="ex-group"><span class="kicker">${esc(g.label)}</span>
<div class="grid grid--auto ex-grid">${items.map((e) => `<a class="ex-card" href="${e.url}">
<span class="badge badge--save">${esc(e.weeksLabel)}</span> <span class="chip">${esc(e.duration_hint)}</span>
<span class="ex-title">${esc(e.title)}</span><span class="muted">${esc(clip(e.benefit, 90))}</span></a>`).join('')}</div></section>`;
  }).join('');

  const body = `<div class="wrap reading">
${crumbs([{ name: 'Home', url: '/' }, { name: 'Exercises' }])}
<h1>Exercises &amp; play</h1>
<p class="summary-lead">Short, safe activities that feed the skill your baby is working on right now — with clear stop-signs.</p>
${eeatLine({ srcNames: ['AAP', 'CDC'] })}
${sections}</div>`;

  const meta = {
    title: 'Baby Exercises & Play by Age: Safe Activities | FirstWeeks',
    description: 'Short, safe, sourced activities matched to your baby’s week — with clear stop-signs. Tummy time, tracking, grasp and more.',
    path: '/en/exercises/', theme: 'light',
    jsonld: [{ '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Exercises', url: `${site.origin}/en/exercises/` },
      { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: site.origin + '/' },
        { '@type': 'ListItem', position: 2, name: 'Exercises' }] }],
  };
  emit('/en/exercises/', page({ meta, body, theme: 'light' }));
}

const clip = (s, n) => (s.length <= n ? s : s.slice(0, n - 1).trimEnd() + '…');
function labelFor(url) {
  try { const h = new URL(url).hostname.replace('www.', '');
    if (h.includes('healthychildren') || h.includes('aap')) return 'AAP / HealthyChildren';
    if (h.includes('cdc')) return 'CDC'; if (h.includes('nih') || h.includes('medlineplus')) return 'MedlinePlus';
    if (h.includes('who')) return 'WHO'; return h; } catch { return 'Source'; }
}
function durationISO(hint) {
  const m = String(hint).match(/(\d+)/); return m ? `PT${m[1]}M` : undefined;
}
