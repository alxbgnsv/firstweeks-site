// Landing (/). Mockup 01 + 4 conversion tweaks (§2). Section order = §4 hierarchy:
// promise → mechanism → emotion → proof.
import { page, storeLink } from '../components/layout.mjs';
import { appStoreBadge, priceCards, faq, ctaText } from '../components/blocks.mjs';
import { flags, site, app, pricing, sources } from '../../config.mjs';
import { esc } from '../lib/html.mjs';
import { crumbLD } from '../components/blocks.mjs';

// FAQ order per task §2(г): free → medical → privacy → cancel → partner → Android → export → trial.
const FAQ_ORDER = [
  'What’s free forever?',
  'Is this medical advice?',
  'What happens to my data?',
  'How do I cancel?',
  'Can my partner use it too?',
  'When is Android coming?',
  'Can I export data for my pediatrician?',
  'How does the 14-day trial work without a card?',
];

export function buildLanding({ emit, read }) {
  const faqsMap = JSON.parse(read('content/landing-faqs.json'));
  // Android answer must not promise a form field that doesn't exist (§ correction 7).
  // SITE-NOPRICE: партнёрский ответ без упоминания плана
  if (!flags.pricing_public) {
    faqsMap['Can my partner use it too?'] =
      'Yes — both parents use the same account, and logs sync between devices in seconds.';
  }
  faqsMap['When is Android coming?'] =
    'We’re iOS-first for now. Android is planned — email us at ' + site.email +
    ' and we’ll tell you when it ships.';
  // SITE-NOPRICE: до запуска подписки вопросы о планах/отмене/триале скрыты
  const PRICING_QS = new Set(['What’s free forever?', 'How do I cancel?',
                              'How does the 14-day trial work without a card?']);
  const faqItems = FAQ_ORDER
    .filter((q) => flags.pricing_public || !PRICING_QS.has(q))
    .map((q) => ({ q, a: esc(faqsMap[q]) }));
  const asks = JSON.parse(read('content/landing-asks.json'));

  const heroCTA = flags.web_checkout ? '/#pricing' : storeLink('hero');

  // --- Hero (promise) + tweak (a) primary→store, secondary "See pricing";
  //     tweak (c) social_proof slot (flagged off).
  const hero = `<section class="section hero"><div class="wrap hero__grid">
<div>
  <h1>Understand what’s happening with your baby</h1>
  <p class="muted hero__sub">Track feeding, sleep and changes in seconds — then ask what they mean. Answers that know your baby’s age and patterns.</p>
  <div class="hero__cta">
    <a class="btn btn--primary" href="${heroCTA}">${flags.pricing_public ? 'Start free — 14 days, no card' : 'Get FirstWeeks — free'}</a>
    ${flags.pricing_public ? '<a class="link-arrow" href="#pricing">See pricing</a>' : ''}
  </div>
  <div class="hero__store">${appStoreBadge('hero')}<span class="android-soon">Android — coming soon</span></div>
  ${flags.social_proof ? `<p class="social-proof muted">★★★★★ Loved by 12,000+ families</p>` : ''}
</div>
<div class="hero__phone">${heroCrossfade()}</div>
</div></section>`;

  // --- Emotion band (own full-width statement between hero and mechanism)
  const emotion = `<section class="emotion"><div class="wrap">
<p class="emotion__line">Less guessing. Less searching. <span>More confidence.</span></p>
</div></section>`;

  // --- How it works (mechanism)
  const steps = [
    ['STEP 1', 'Track in one tap', 'Sleep, feeds, diapers — logged in seconds, one-handed, at 3 AM.', 'scr-tracker', 'Tracker — one-tap logging'],
    ['STEP 2', 'Ask what it means', 'Plain questions, calm answers — with sources you can check.', 'scr-ask', 'Ask — answer with sources'],
    ['STEP 3', 'Answers that know your baby', 'Every answer fits your baby’s age and logs.', 'scr-today', 'Today — week-by-week guidance'],
  ];
  const how = `<section class="section"><div class="wrap">
<h2 class="center">How it works</h2>
<div class="grid grid--3 steps">${steps.map(([k, h, p, scr, alt]) => `<div class="step">
<div class="step__body"><div class="kicker">${k}</div><h3>${esc(h)}</h3><p class="muted">${esc(p)}</p></div>
<div class="step__phone"><div class="iphone iphone--mini"><div class="iphone__screen"><picture>
<source srcset="/assets/${scr}.webp" type="image/webp">
<img src="/assets/${scr}.png" width="1206" height="2478" alt="${esc(alt)}" loading="lazy" decoding="async"></picture></div></div></div>
</div>`).join('')}</div></div></section>`;

  // --- Ask demo (mechanism/proof)
  const askDemo = `<section class="section section--alt"><div class="wrap">
<h2 class="center">Ask about your baby, not “babies in general”</h2>
<p class="center muted">Tap a question — this is what answers look like.</p>
<div class="ask-demo" data-ask-demo>
<div class="ask-tabs" role="tablist">${asks.map((a, i) =>
    `<button class="ask-tab" role="tab" id="asktab-${i}" aria-controls="askans-${i}" aria-selected="${i === 0}">${esc(a.q)}</button>`).join('')}</div>
${asks.map((a, i) => `<div class="ask-answer" id="askans-${i}" role="tabpanel" aria-labelledby="asktab-${i}"${i === 0 ? '' : ' hidden'}>
<p class="ask-q">${esc(a.q)}</p>
<p>${esc(a.a)}</p>
<p class="source-badge">Sources: ${esc(a.src)}</p>
<p class="used">this answer used: ${esc(a.ctx)}</p>
<p class="disclaimer">Educational information, not medical advice.</p>
</div>`).join('')}
</div></div></section>`;

  // --- Reassurance — common calm scenario (spit-up), full range of the answer,
  //     neutral warm card (not danger red). Calm marker instead of "Needs a doctor".
  const redflag = `<section class="section"><div class="wrap redflag">
<div class="redflag__intro">
<h2>Reassuring when it should be — clear when it shouldn’t</h2>
<p class="muted redflag__lead">Most of the time the honest answer is “this is normal” — and we say that plainly. When something genuinely needs a doctor, we say that just as plainly.</p>
</div>
<div class="redflag__card">
<p class="redflag__q">“She spits up after every feed — should I worry?”</p>
<span class="badge badge--calm">Usually normal</span>
<p>Frequent spit-up is usually normal — many babies do it daily and outgrow it. It’s likely fine if she’s gaining weight, feeding well, and content. Worth a same-day call if you see forceful vomiting, green or bloody spit-up, poor weight gain, or fewer wet diapers.</p>
<p class="redflag__src">Reflects AAP guidance · not a diagnosis</p>
</div></div></section>`;

  // --- Pricing (#pricing)
  const priceSec = `<section id="pricing" class="section section--alt"><div class="wrap center">
<h2>Simple pricing</h2>
<p class="muted">${esc(pricing.trialLine)}</p>
${priceCards()}
<p class="muted freeforever">${esc(pricing.freeForever)}</p>
<div class="store-row"><span class="muted store-row__lead">or download and start in the app</span>${appStoreBadge('pricing')}</div>
</div></section>`;

  // --- Trust — 4-col accent-topped columns
  const trust = `<section class="section"><div class="wrap">
<h2 class="center">Built to be trusted</h2>
<div class="grid trust">
${[
    ['Grounded in pediatric guidance', 'Answers draw on CDC, NIH, WHO and AAP-aligned sources — cited in every response.'],
    ['Private by design', 'Your baby’s name is removed before any AI request leaves your device.'],
    ['No ads. No data selling.', flags.pricing_public
      ? 'You’re the customer, not the product. Revenue comes from plans only.'
      : 'You’re the customer, not the product.'],
    ['Encrypted', 'In transit and at rest. Export or delete everything anytime.'],
  ].map(([h, p]) => `<div class="trust__card"><h3>${esc(h)}</h3><p class="muted">${esc(p)}</p></div>`).join('')}
</div>
<p class="center kicker guidance">Guidance sources</p>
<p class="center trust__sources">${sources.join('  ·  ')}</p>
</div></section>`;

  // --- FAQ
  const { html: faqHtml, ld: faqLD } = faq(faqItems);
  const faqSec = `<section class="section section--alt"><div class="wrap"><div class="faq-wrap"><h2>Questions, answered</h2>${faqHtml}</div></div></section>`;

  // --- mobile sticky CTA (tweak b) — no CLS (fixed overlay), JS reveals after hero.
  const sticky = `<div class="sticky-cta" data-sticky-cta><a class="btn btn--primary" href="${heroCTA}">${flags.pricing_public ? 'Start free — no card' : 'Get FirstWeeks — free'}</a></div>`;

  const body = hero + emotion + how + askDemo + redflag
    + (flags.pricing_public ? priceSec : '') + trust + faqSec + sticky;

  const orgLD = {
    '@context': 'https://schema.org', '@type': 'Organization', name: 'FirstWeeks',
    url: site.origin, logo: `${site.origin}/assets/icon.png`, email: site.email,
  };
  const appLD = {
    '@context': 'https://schema.org', '@type': 'MobileApplication', name: 'FirstWeeks',
    operatingSystem: 'iOS', applicationCategory: 'HealthApplication',
    offers: [
      // SITE-NOPRICE: Offer-разметка вернётся с pricing_public
      ...(flags.pricing_public ? [
        { '@type': 'Offer', price: '59.99', priceCurrency: 'USD', name: 'Annual plan' },
        { '@type': 'Offer', price: '9.99', priceCurrency: 'USD', name: 'Monthly plan' },
      ] : [{ '@type': 'Offer', price: '0', priceCurrency: 'USD', name: 'Free' }]),
    ],
    url: site.origin,
  };

  const meta = {
    title: 'FirstWeeks — Understand What’s Happening With Your Baby',
    description: flags.pricing_public
      ? 'Track feeding and sleep in seconds, then ask what they mean. Calm, sourced answers matched to your baby’s age. Free 14-day trial, no card.'
      : 'Track feeding and sleep in seconds, then ask what they mean. Calm, sourced answers matched to your baby’s age. Free on iPhone.',
    path: '/',
    ogImage: `${site.origin}/og/home.png`,
    jsonld: [orgLD, appLD, faqLD],
    preload: [{ href: '/assets/scr-today.webp', as: 'image', type: 'image/webp', fetchpriority: 'high' }],
  };
  emit('/', page({ meta, body, scripts: ['/js/landing.js'], stickyCTA: true }));
}

// Hero crossfade (§4): 4 layered screens fade in sequence over a static base (no blank frame).
function heroCrossfade() {
  const layers = ['scr-today', 'scr-ask', 'scr-feed', 'scr-skills'];
  const alts = ['Today — weekly guidance', 'Ask — answer with sources', 'Feed logging', 'Skills to watch'];
  return `<div class="iphone hero-frame"><div class="iphone__screen">
<picture><source srcset="/assets/scr-today.webp" type="image/webp">
<img src="/assets/scr-today.png" width="1206" height="2478" alt="FirstWeeks app" fetchpriority="high" class="hero-base"></picture>
${layers.map((s, i) => `<img src="/assets/${s}.webp" width="1206" height="2478" alt="${esc(alts[i])}" class="hero-layer hero-layer--${i}" aria-hidden="true" decoding="async" loading="lazy" fetchpriority="low">`).join('')}
</div></div>`;
}
