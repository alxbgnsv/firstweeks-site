// Content merge + neutralization + date hash-lock. Produces the typed content
// model consumed by the week/article/exercise templates.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CATEGORIES, EXERCISE_GROUPS } from '../../config.mjs';
import { neutralizeName, neutralizeTree } from './tokens.mjs';
import { dateFor, humanMonth } from './dates.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url)) + '/../..';
const load = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const arr = (x) => (Array.isArray(x) ? x : x.articles || x.weeks || x.exercises || x.skills || []);

const catBySlug = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c]));
const catByLabel = Object.fromEntries(CATEGORIES.map((c) => [c.label, c]));
function categoryOf(label) {
  const c = catByLabel[label];
  if (!c) throw new Error(`Article category "${label}" not in enum (${CATEGORIES.map((x) => x.label).join(', ')})`);
  return c;
}

// Short source label from URL host (reuses the site's domain map idea).
const HOSTNAMES = {
  'cdc.gov': 'CDC', 'medlineplus.gov': 'MedlinePlus', 'nih.gov': 'NIH', 'who.int': 'WHO',
  'aap.org': 'AAP', 'healthychildren.org': 'AAP / HealthyChildren', 'fda.gov': 'FDA', 'nhs.uk': 'NHS',
};
function labelForUrl(url) {
  try {
    const host = new URL(url).hostname.replace('www.', '');
    const key = Object.keys(HOSTNAMES).find((h) => host.endsWith(h));
    return key ? HOSTNAMES[key] : host;
  } catch { return url; }
}

export function loadContent(buildISO) {
  const weeksBase = arr(load('content/weeks.json'));
  const weeksSeo = Object.fromEntries(arr(load('content/seo/weeks-seo.json')).map((w) => [w.week, w]));
  const artsBase = Object.fromEntries(arr(load('content/articles.json')).map((a) => [a.id, a]));
  const artsSeo = arr(load('content/seo/articles-seo.json'));
  const skills = arr(load('content/skills.json'));
  const exBase = arr(load('content/exercises.json'));

  // New-article batches: additive glob new-articles-B*.json (§ note 1).
  const seoDir = path.join(ROOT, 'content/seo');
  const newArticles = fs.readdirSync(seoDir)
    .filter((f) => /^new-articles-B\d+\.json$/.test(f))
    .sort()
    .flatMap((f) => arr(JSON.parse(fs.readFileSync(path.join(seoDir, f), 'utf8'))));

  const resolveSchema = (schema, key, item, firstSeen) => {
    const d = dateFor(key, item, firstSeen);
    const s = JSON.parse(JSON.stringify(schema).replace(/\{\{BUILD_DATE\}\}/g, d.modified));
    if (!s.datePublished) s.datePublished = d.published;
    return { schema: s, dates: d };
  };

  // --- Exercises ---
  const exercises = exBase.map((raw) => {
    const e = neutralizeTree(raw); // exercise steps/benefit use {name}
    const weeks = e.weeks.slice().sort((a, b) => a - b);
    const slug = e.slug || slugify(e.title);
    const item = { id: e.id, title: e.title, benefit: e.benefit, steps: e.steps, stop_signs: e.stop_signs,
      duration_hint: e.duration_hint, source: e.source };
    const { dates } = resolveSchema({ dateModified: '{{BUILD_DATE}}' }, `exercise:${slug}`, item);
    return { ...e, slug, url: `/en/exercises/${slug}/`, from: weeks[0], to: weeks[weeks.length - 1],
      weeksLabel: weeks[0] === weeks[weeks.length - 1] ? `WEEKS ${weeks[0]}` : `WEEKS ${weeks[0]}–${weeks[weeks.length - 1]}`,
      dates, updated: humanMonth(dates.modified) };
  });
  const exercisesForWeek = (n) => exercises.filter((e) => e.weeks.includes(n));

  // --- Skills (§ answer 4) ---
  const parseRange = (r) => { const [a, b] = String(r).split('-').map(Number); return [a, b || a]; };
  const skillItems = skills.map((s) => ({ ...s, range: parseRange(s.weeks) }));
  const skillsForWeek = (n) => skillItems
    .filter((s) => n >= s.range[0] && n <= s.range[1])
    .sort((a, b) => (a.range[0] === n ? -1 : b.range[0] === n ? 1 : (a.range[1] - a.range[0]) - (b.range[1] - b.range[0])));

  // --- Articles (old 39 neutralized + new 13 clean) ---
  const oldArticles = artsSeo.map((raw) => {
    const base = artsBase[raw.id];
    if (!base) throw new Error(`articles-seo id ${raw.id} has no base article`);
    const cat = categoryOf(raw.category);
    // Generator owns {name} neutralization for the 39 old articles (README).
    const seo = neutralizeTree(raw.seo);       // meta title/description
    const rawSchema = neutralizeTree(raw.schema); // headline etc.
    const body = neutralizeTree(base.body);
    const title = neutralizeName(seo.title.replace(' | FirstWeeks', ''));
    const citations = (rawSchema && rawSchema.citation) || (base.source ? [base.source] : []);
    const sources = citations.map((u) => ({ label: labelForUrl(u), url: u }));
    const item = { title, body, category: cat.slug };
    const { schema, dates } = resolveSchema(rawSchema, `article:${raw.slug}`, item);
    return {
      id: raw.id, slug: raw.slug, url: `/en/articles/${raw.slug}/`, week: raw.week,
      title, category: cat, read_min: raw.read_min || base.read_min || 3,
      seo, body, sources, related: null, schema, dates, updated: humanMonth(dates.modified),
      summary: neutralizeName(base.body[0] ? base.body[0].p : ''),
    };
  });

  const freshArticles = newArticles.map((a) => {
    const cat = categoryOf(a.category);
    const item = { title: a.title, body: a.body, category: cat.slug };
    const { schema, dates } = resolveSchema(a.schema, `article:${a.slug}`, item, buildISO);
    return {
      id: a.id, slug: a.slug, url: `/en/articles/${a.slug}/`, week: a.week,
      title: a.title, category: cat, read_min: a.read_min || 4,
      seo: a.seo, body: a.body, sources: a.sources, related: a.related, schema, dates,
      updated: humanMonth(dates.modified), summary: a.body[0] ? a.body[0].p : '',
    };
  });

  const articles = [...oldArticles, ...freshArticles];
  const bySlug = Object.fromEntries(articles.map((a) => [a.slug, a]));
  const articlesByWeek = (n) => articles.filter((a) => a.week === n);
  const articlesByCategory = (slug) => articles.filter((a) => a.category.slug === slug);

  // Resolve each article's related (hub-and-spoke ≥3 + 1 hub, §6).
  for (const a of articles) {
    const rel = [];
    if (a.related) for (const s of a.related) if (bySlug[s]) rel.push(bySlug[s]);
    // top up with same-week then same-category siblings
    for (const c of [...articlesByWeek(a.week), ...articlesByCategory(a.category.slug)]) {
      if (rel.length >= 3) break;
      if (c.slug !== a.slug && !rel.includes(c)) rel.push(c);
    }
    a.relatedResolved = rel.slice(0, 3);
    a.relatedWeek = a.week; // link to the week page (spoke → week)
  }

  // --- Weeks (base + seo overlay; happening/todo/watching neutralized) ---
  const weeks = weeksBase.map((w) => {
    const seo = weeksSeo[w.week];
    if (!seo) throw new Error(`week ${w.week} missing in weeks-seo.json`);
    const happening = neutralizeTree(w.happening || []);
    const todo = neutralizeTree(w.todo || []);
    const watching = neutralizeName(w.watching || '');
    const item = { happening, todo, watching, summary: seo.summary_paragraph };
    const { schema, dates } = resolveSchema(seo.schema, `week:${w.week}`, item);
    return {
      week: w.week, slug: seo.slug, url: `/en/week-by-week/week-${w.week}/`,
      badge: neutralizeName(w.badge || ''), period_type: w.period_type,
      seo: seo.seo, h1: seo.h1, summary: seo.summary_paragraph,
      happening, todo, watching, source: w.source,
      exercises: exercisesForWeek(w.week), skills: skillsForWeek(w.week),
      articles: articlesByWeek(w.week), schema, dates, updated: humanMonth(dates.modified),
    };
  });

  return {
    weeks, articles, exercises, skills: skillItems, categories: CATEGORIES,
    bySlug, articlesByWeek, articlesByCategory, exercisesForWeek, skillsForWeek, EXERCISE_GROUPS,
  };
}

export function slugify(s) {
  return String(s).toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
