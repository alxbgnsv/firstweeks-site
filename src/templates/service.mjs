// Service pages (light Warm paper): methodology (E-E-A-T core), support,
// privacy, terms, invite. Mockup 04 + correction #7 (no dead forms — Android is
// a text line, support contact is a mailto). Privacy/Terms carry the honest
// short version now; full legal text is pending review → noindex until then.
import { page, storeLink } from '../components/layout.mjs';
import { crumbs, crumbLD, faq } from '../components/blocks.mjs';
import { site, app, ct, sources } from '../../config.mjs';
import { esc, minify } from '../lib/html.mjs';

const REVIEWED = site.reviewedLabel; // visible "Updated <month year>"
const mailto = (subject) => `mailto:${site.email}?subject=${encodeURIComponent(subject)}`;

// WebPage + BreadcrumbList for a simple service page.
const pageLD = (name, url, crumbItems) => [
  { '@context': 'https://schema.org', '@type': 'WebPage', name, url: site.origin + url,
    isPartOf: { '@type': 'WebSite', name: site.name, url: site.origin + '/' } },
  crumbLD(crumbItems),
];

export function buildService({ emit, emitFile }) {
  buildMethodology({ emit });
  buildSupport({ emit });
  buildPrivacy({ emit });
  buildTerms({ emit });
  buildInvite({ emit });
  buildNotFound({ emitFile });
}

// 404 → dist/404.html (GitHub Pages serves it for any unmatched path, including
// deep /invite/<token> links that reach the browser without the app). Mirrors
// the invite fallback + a way home. Not in the sitemap.
function buildNotFound({ emitFile }) {
  const body = `<div class="wrap reading">
<div class="invite">
<img class="invite-ic" src="/assets/icon.png" width="72" height="72" alt="FirstWeeks">
<h1>This page moved on</h1>
<p class="svc-lead" style="margin-inline:auto">The link may be old — or it’s a care-team invite that opens in the app.</p>
<div class="btn-row">
<a class="btn btn--primary" href="${storeLink('invite')}">Get FirstWeeks — free</a>
<a class="btn btn--secondary" href="/">Go to homepage</a>
</div>
<p class="muted">Have an invite link? Open it on your iPhone with the app installed.</p>
</div>
</div>`;
  const meta = {
    title: 'Page not found | FirstWeeks',
    description: 'That page could not be found.',
    path: '/404/', theme: 'light', noindex: true, jsonld: [],
  };
  emitFile('404.html', minify(page({ meta, body, theme: 'light' })) + '\n');
}

// ---------------------------------------------------------------- Methodology
function buildMethodology({ emit }) {
  const crumbItems = [{ name: 'Home', url: '/' }, { name: 'Methodology' }];
  const chips = ['CDC', 'NIH · MedlinePlus', 'WHO', 'AAP · HealthyChildren']
    .map((s) => `<span class="src-chip">${esc(s)}</span>`).join('');

  const body = `<div class="wrap reading">
${crumbs(crumbItems)}
<h1>How FirstWeeks answers are made</h1>
<p class="svc-lead">Every answer and every article follows the same rules. This page is those rules, in full.</p>

<section><h2>Where the content comes from</h2>
<p>Guidance is written from public sources used by pediatricians: <b>CDC</b>, <b>NIH / MedlinePlus</b>, <b>WHO</b>, and <b>AAP / HealthyChildren</b>. Answers and articles cite their sources — visibly, every time.</p>
<div class="src-chips">${chips}</div></section>

<section><h2>What the AI does — and doesn’t</h2>
<div class="split">
<div class="split-col split-col--does"><span class="kicker">It does</span>
<ul><li>Explains patterns in your log</li><li>Matches guidance to your baby’s age</li><li>Cites its sources</li><li>Says plainly when something needs a doctor</li></ul></div>
<div class="split-col split-col--never"><span class="kicker">It never</span>
<ul><li>Diagnoses</li><li>Doses medication</li><li>Gives personalized medical advice</li><li>Talks you out of seeing a doctor</li></ul></div>
</div></section>

<section><h2>The red-flag policy</h2>
<p>A fixed list of thresholds — fever under 12 weeks, dehydration signs, breathing trouble, lethargy and others — always escalates to a direct “call your pediatrician now.” These answers are never softened, hedged or delayed, by design.</p></section>

<div class="callout callout--warn"><span class="kicker">Not a medical device</span>
<p>FirstWeeks provides educational information. It is not a medical device, does not diagnose or treat, and does not replace your pediatrician. In an emergency, call 911.</p></div>

<section><h2>Review and updates</h2>
<p>Content is reviewed against current source guidance on a rolling schedule. Every article and week page shows its last-updated date.</p></section>
</div>`;

  const meta = {
    title: 'How Our Answers Are Made: Sources & Method | FirstWeeks',
    description: 'FirstWeeks writes from CDC, NIH/MedlinePlus, WHO and AAP — cites every source, never diagnoses, and always escalates red flags to your pediatrician.',
    path: '/en/methodology/', theme: 'light',
    jsonld: pageLD('How FirstWeeks answers are made', '/en/methodology/', crumbItems),
  };
  emit('/en/methodology/', page({ meta, body, theme: 'light' }));
}

// -------------------------------------------------------------------- Support
function buildSupport({ emit }) {
  const crumbItems = [{ name: 'Home', url: '/' }, { name: 'Support' }];

  // Quick-answers FAQ (native <details>, JS enhances single-open on load).
  const qa = faq([
    { q: 'What’s free forever?', a: '<p>Tracking — sleep, feeds, diapers, growth — is free with no time limit. The plan adds Ask, weekly guidance and insights.</p>' },
    { q: 'How do I cancel?', a: '<p>In the app: <b>Settings → Subscription → Cancel</b>. It’s one tap, no retention flow. Your plan runs until the end of the paid period; tracking stays free after.</p>' },
    { q: 'How do I restore purchases?', a: '<p>Open the app on the same Apple ID and tap <b>Settings → Restore purchases</b>. Your plan reactivates automatically.</p>' },
    { q: 'Can I export data for my pediatrician?', a: '<p>Yes — <b>Settings → Help &amp; data export</b> produces a clean summary you can share or print.</p>' },
    { q: 'How does partner sync work?', a: '<p>Both parents use the same plan and see the same live log. Invite from <b>Settings → Care team</b>.</p>' },
    { q: 'How do I delete my data?', a: `<p>Ask any time at <a href="${mailto('Delete my data')}">${esc(site.email)}</a>, or from <b>Settings → Privacy → Delete account</b>. Deletion is permanent.</p>` },
  ]);

  const body = `<div class="wrap reading">
${crumbs(crumbItems)}
<h1>Support</h1>
<p class="svc-lead">Real humans, usually within a day.</p>

<section><h2 class="kicker kicker--muted">Quick answers</h2>
${qa.html}</section>

<div class="contact-grid">
<div class="contact-card"><h3>Email us</h3><p>Billing, accounts, bugs — anything.</p>
<a class="btn btn--primary" href="${mailto('FirstWeeks support')}">Email ${esc(site.email)}</a></div>
<div class="contact-card"><h3>Android</h3><p>Not out yet — we’re building it.</p>
<span class="soon">Android — coming soon</span></div>
</div>

<div class="callout callout--warn"><span class="kicker">One thing first</span>
<p>Emergencies are never a support ticket — call your pediatrician or 911. In the app, data export lives under <b>Settings → Help &amp; data export</b>.</p></div>
</div>`;

  const meta = {
    title: 'Support & Help: Contact, Cancel, Export | FirstWeeks',
    description: 'Get help with FirstWeeks — cancelling, restoring purchases, exporting data for your pediatrician, partner sync and account deletion. Email us, real humans reply.',
    path: '/en/support/', theme: 'light',
    jsonld: [qa.ld, ...pageLD('Support', '/en/support/', crumbItems)],
  };
  emit('/en/support/', page({ meta, body, theme: 'light', scripts: ['/js/landing.js'] }));
}

// ------------------------------------------------------------ Privacy / Terms
// Honest short version + the two commitments live now; full legal text is being
// finalized (mockup 04 note; question #8). noindex until the reviewed version
// ships — README flags the flip.
function buildPrivacy({ emit }) {
  const crumbItems = [{ name: 'Home', url: '/' }, { name: 'Privacy' }];
  const body = `<div class="wrap reading">
${crumbs(crumbItems)}
<h1>Privacy Policy</h1>
<p class="eeat">Updated ${esc(REVIEWED)} · Applies to the FirstWeeks app and firstweeks.app</p>

<div class="callout"><span class="kicker">The short version</span>
<p>Your baby’s name never reaches the AI. We run no ads, sell no data, and you can export or delete everything anytime.</p></div>

<section><h2>1. What we collect</h2>
<p>Your account email, the logs you create (sleep, feeds, diapers, growth), and the questions you ask. Identifiers are stripped before any AI request.</p></section>

<section><h2>2. What we never do</h2>
<p>No advertising, no sale or sharing of personal data, no tracking across other apps or sites.</p></section>

<section><h2>3. Your controls</h2>
<p>Export a full copy or delete your account and data at any time from <b>Settings → Privacy</b>, or email <a href="${mailto('Privacy request')}">${esc(site.email)}</a>.</p></section>

<p class="draft-note">The complete policy — data retention, sub-processors, regional rights (GDPR/CCPA) and contact details — is being finalized with counsel and will be published here before launch.</p>
</div>`;

  const meta = {
    title: 'Privacy Policy | FirstWeeks',
    description: 'How FirstWeeks handles your data: your baby’s name never reaches the AI, no ads, no data selling, and you can export or delete everything anytime.',
    path: '/en/privacy/', theme: 'light', noindex: true,
    jsonld: pageLD('Privacy Policy', '/en/privacy/', crumbItems),
  };
  emit('/en/privacy/', page({ meta, body, theme: 'light' }), { indexable: false });
}

function buildTerms({ emit }) {
  const crumbItems = [{ name: 'Home', url: '/' }, { name: 'Terms' }];
  const body = `<div class="wrap reading">
${crumbs(crumbItems)}
<h1>Terms of Use</h1>
<p class="eeat">Updated ${esc(REVIEWED)} · Applies to the FirstWeeks app and firstweeks.app</p>

<section><h2>1. What FirstWeeks is</h2>
<p>FirstWeeks is an educational tracking and guidance app for parents. It provides general information — it is not a medical device, does not diagnose or treat, and does not replace your pediatrician. In an emergency, call 911.</p></section>

<section><h2>2. Your account</h2>
<p>You’re responsible for keeping your login secure and for the accuracy of what you log. Tracking is free; paid plans are billed through the App Store and cancellable anytime.</p></section>

<section><h2>3. Acceptable use</h2>
<p>Use FirstWeeks for your own family. Don’t resell, scrape, or attempt to misuse the service or its content.</p></section>

<p class="draft-note">The complete terms — billing and refunds, liability, governing law and dispute resolution — are being finalized with counsel and will be published here before launch.</p>
</div>`;

  const meta = {
    title: 'Terms of Use | FirstWeeks',
    description: 'The terms for using FirstWeeks: an educational app, not a medical device; free tracking, cancellable plans, and fair-use rules.',
    path: '/en/terms/', theme: 'light', noindex: true,
    jsonld: pageLD('Terms of Use', '/en/terms/', crumbItems),
  };
  emit('/en/terms/', page({ meta, body, theme: 'light' }), { indexable: false });
}

// --------------------------------------------------------------------- Invite
// Universal-link fallback at /invite/ (AASA declares /invite/*, no locale
// prefix). Installed iOS opens the app; everyone else lands here. Deep tokens
// (/invite/<token>) that miss the app fall through to 404.html, which mirrors
// this copy. noindex (utility page, not content).
function buildInvite({ emit }) {
  const crumbItems = [{ name: 'Home', url: '/' }, { name: 'Invite' }];
  const body = `<div class="wrap reading">
${crumbs(crumbItems)}
<div class="invite">
<img class="invite-ic" src="/assets/icon.png" width="72" height="72" alt="FirstWeeks">
<h1>You’re invited to a care team</h1>
<p class="svc-lead" style="margin-inline:auto">Someone wants you on their baby’s FirstWeeks — one shared log, both parents in sync.</p>
<div class="btn-row">
<a class="btn btn--primary" href="${storeLink('invite')}">Get FirstWeeks — free</a>
</div>
<p class="muted">Already have the app? Open this link on your iPhone and it’ll take you straight to the invite.</p>
</div>
</div>`;

  const meta = {
    title: 'You’re invited to a care team | FirstWeeks',
    description: 'Join a baby’s FirstWeeks care team — one shared log, both parents in sync. Open on iPhone to accept, or download free.',
    path: '/invite/', theme: 'light', noindex: true,
    jsonld: pageLD('Invite', '/invite/', crumbItems),
  };
  emit('/invite/', page({ meta, body, theme: 'light' }), { indexable: false });
}
