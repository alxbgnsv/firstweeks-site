// Service pages (light Warm paper): methodology (E-E-A-T core), support,
// privacy, terms, invite. Mockup 04 + correction #7 (no dead forms — Android is
// a text line, support contact is a mailto). Privacy/Terms carry the honest
// short version now; full legal text is pending review → noindex until then.
import { page, storeLink } from '../components/layout.mjs';
import { crumbs, crumbLD, faq } from '../components/blocks.mjs';
import { site, app, ct, sources, flags } from '../../config.mjs';
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
  // SITE-NOPRICE: вопросы о планах/отмене/restore скрыты до pricing_public
  const qa = faq([
    ...(flags.pricing_public ? [
      { q: 'What’s free forever?', a: '<p>Tracking — sleep, feeds, diapers, growth — is free with no time limit. The plan adds Ask, weekly guidance and insights.</p>' },
      { q: 'How do I cancel?', a: '<p>In the app: <b>Settings → Subscription → Cancel</b>. It’s one tap, no retention flow. Your plan runs until the end of the paid period; tracking stays free after.</p>' },
      { q: 'How do I restore purchases?', a: '<p>Open the app on the same Apple ID and tap <b>Settings → Restore purchases</b>. Your plan reactivates automatically.</p>' },
    ] : []),
    { q: 'Can I export data for my pediatrician?', a: '<p>Yes — <b>Settings → Help &amp; data export</b> produces a clean summary you can share or print.</p>' },
    { q: 'How does partner sync work?', a: flags.pricing_public
        ? '<p>Both parents use the same plan and see the same live log. Invite from <b>Settings → Care team</b>.</p>'
        : '<p>Both parents use the same account and see the same live log. Invite from <b>Settings → Care team</b>.</p>' },
    { q: 'How do I delete my data?', a: `<p>Ask any time at <a href="${mailto('Delete my data')}">${esc(site.email)}</a>, or from <b>Settings → Privacy → Delete account</b>. Deletion is permanent.</p>` },
  ]);

  const body = `<div class="wrap reading">
${crumbs(crumbItems)}
<h1>Support</h1>
<p class="svc-lead">Real humans, usually within a day.</p>

<section><h2 class="kicker kicker--muted">Quick answers</h2>
${qa.html}</section>

<div class="contact-card contact-card--email">
<div class="contact-card__body"><h3>Email us</h3><p>Billing, accounts, bugs — anything.</p></div>
<a class="btn btn--primary" href="${mailto('FirstWeeks support')}">Email ${esc(site.email)}</a>
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
  // PRIVACY-PUBLISH (Aug 2026): full reviewed policy from the owner
  // (firstweeks-privacy-en.md, verbatim), noindex lifted — Apple review and
  // users find this page via search. Layout preserved: header, "The short
  // version" callout, sections, footer from the shared page shell.
  const PRIVACY_UPDATED = 'August 2026';

  const subRows = [
    ['Supabase', 'Database, sync, authentication', 'Encrypted records, account identifiers'],
    ['OpenAI', 'Voice transcription, record parsing, answers', 'Audio (transient), transcripts, questions, numeric summaries — no names'],
    ['Apple', 'Sign in with Apple, push notifications, subscriptions', 'Sign-in identifier; purchase receipts'],
    ['Google', 'Sign in with Google', 'Sign-in identifier, email'],
    ['RevenueCat', 'Subscription management', 'Purchase receipts, random app identifier — no personal details'],
    ['Google Firebase', 'Product analytics', 'Usage events, random app-instance identifier — no names, no records'],
  ].map(([a, b, c]) => `<tr><td><b>${a}</b></td><td>${b}</td><td>${c}</td></tr>`).join('');

  const body = `<div class="wrap reading">
${crumbs(crumbItems)}
<h1>Privacy Policy</h1>
<p class="eeat">Updated ${esc(PRIVACY_UPDATED)} · Applies to the FirstWeeks iOS app and firstweeks.app</p>

<div class="callout"><span class="kicker">The short version</span>
<p>Your baby&rsquo;s name never reaches the AI. We run no ads, sell no data, and you can export or delete everything anytime.</p></div>

<section><h2>1. Who we are</h2>
<p>FirstWeeks is a baby-tracking and parent-guidance app operated by WAZZAPPS GLOBAL LIMITED, 16 Anexartisias street, 3036 Limassol, Cyprus (&ldquo;we&rdquo;, &ldquo;us&rdquo;). For anything in this policy, write to <a href="${mailto('Privacy policy')}">${esc(site.email)}</a>. We are the data controller for the personal data described below.</p></section>

<section><h2>2. What we collect</h2>
<p><b>Account.</b> When you sign in with Apple or Google, we receive your name (if you choose to share it), your email address — or Apple&rsquo;s private relay address if you hide your email — and a sign-in identifier. We never see your passwords. There is no email-and-password sign-up.</p>
<p><b>Your baby&rsquo;s profile.</b> The name, date of birth and sex you enter, and the due date if you enable corrected age. You provide this data; you can change or remove it at any time.</p>
<p><b>The records you create.</b> Sleep, feeds, pumping, diapers, health entries (temperature, symptoms, medications, vaccinations), activities, measurements and notes. This is the core of the app, and it exists so you can see it — not so we can.</p>
<p><b>Your questions.</b> Questions you ask in the app, and your thumbs-up/down feedback on answers.</p>
<p><b>Voice recordings.</b> If you log by voice, your recording is sent over an encrypted connection to be transcribed and turned into records. We do not store your recordings. Our speech provider may retain audio briefly for abuse monitoring and then deletes it; recordings are never used to train AI models. The transcript is shown to you for review before anything is saved.</p>
<p><b>Basic product analytics.</b> We use Google Firebase to see which screens and features are used, tied to a random app-instance identifier — so we can tell, for example, where onboarding loses people. No advertising identifiers, no tracking across other apps or websites, and analytics data is not combined with your baby&rsquo;s records.</p>
<p><b>Website.</b> firstweeks.app is a content site. Our hosting provider keeps standard server logs (IP address, pages requested) for security and capacity purposes. The site sets no advertising or cross-site tracking cookies.</p></section>

<section><h2>3. How the AI features work</h2>
<p>When you ask a question, we send our AI provider: your question, your baby&rsquo;s age in weeks, and a short numeric summary of recent records (counts and durations — for example, &ldquo;8 feeds, 6 wet diapers&rdquo;). Your baby&rsquo;s name, your name and your contact details are stripped on the device and never leave it as part of an AI request. Answers are built from our pediatric content library first, with AI used to match and phrase them.</p>
<p>Your questions and records are not used to train AI models — neither by us nor, under our agreements, by our providers.</p></section>

<section><h2>4. What we never do</h2>
<ul>
<li>No advertising in the app, ever.</li>
<li>No sale of personal data. No sharing of personal data for advertising.</li>
<li>No tracking across other companies&rsquo; apps or websites.</li>
<li>No location collection — the app never asks for or records where you are.</li>
<li>No use of your or your baby&rsquo;s data for AI training.</li>
<li>We never contact you about your baby&rsquo;s health data; the app is a tool in your hands, not a monitoring service.</li>
</ul></section>

<section><h2>5. Where your data lives and how it&rsquo;s protected</h2>
<p>Records are stored on your device and synced, encrypted in transit (TLS) and at rest, to our cloud database so your data survives a lost phone and can be shared with a partner you invite. Access inside the database is restricted per account: your family&rsquo;s records are readable by your family only.</p>
<p>Our providers run on servers in the European Union and the United States. Where data leaves the EU/EEA, the transfer is protected by recognized safeguards such as the EU Standard Contractual Clauses or the EU&ndash;US Data Privacy Framework. And an honest note no policy should skip: no app or transmission over the internet is completely secure — we take reasonable, industry-standard precautions, but cannot promise the impossible.</p>
<p>If you invite a partner, they get access to your baby&rsquo;s records, and you can revoke that access at any time in Settings — revoking removes the shared records from their devices.</p></section>

<section><h2>6. Sub-processors</h2>
<p>We use a small number of service providers to run FirstWeeks. They process data only on our instructions:</p>
<div class="table-scroll"><table class="subproc">
<thead><tr><th>Provider</th><th>What for</th><th>What they see</th></tr></thead>
<tbody>${subRows}</tbody>
</table></div>
<p>We will keep this table current if providers change.</p>
<p>Beyond that, we disclose personal data only if the law requires it (for example, a valid legal request), to protect someone&rsquo;s vital interests, or — if FirstWeeks is ever acquired or merged — to the successor, who will be bound by this policy or one at least as protective, with notice to you before any change takes effect.</p></section>

<section><h2>7. Payments</h2>
<p>Purchases are processed by Apple through your App Store account. We never see your card details. Tracking stays free regardless of subscription status.</p></section>

<section><h2>8. How long we keep data</h2>
<p>Your records are kept for as long as your account exists — that is the point of a baby journal. If you delete your account, it is scheduled for deletion with a 30-day grace period: sign back in within 30 days and everything is restored; after that, your account and synced data are permanently deleted from our systems. Backups age out on a rolling basis shortly after.</p></section>

<section><h2>9. Your controls and rights</h2>
<p>From <b>Settings &rarr; Privacy</b> you can:</p>
<ul>
<li>Export a full copy of your records as a CSV file that belongs to you.</li>
<li>Delete your account and all synced data (30-day grace period, see above).</li>
<li>Manage notifications and partner access.</li>
</ul>
<p>Depending on where you live, you also have legal rights to access, correct, delete, restrict or port your personal data, and to object to processing — including under the GDPR (EU/EEA and UK) and the CCPA/CPRA (California). We honor these rights for everyone, not only where the law requires it. To exercise them, use Settings &rarr; Privacy or email <a href="${mailto('Privacy request')}">${esc(site.email)}</a>; we respond within 30 days. For your protection we may need to verify your identity before acting on a request. EU/EEA residents may also lodge a complaint with their local supervisory authority.</p>
<p>We make no automated decisions about you that produce legal or similarly significant effects.</p>
<p>Under the GDPR, our legal bases are: performance of a contract (providing the app you signed up for), your consent (optional features such as notifications), and legitimate interests (keeping the service secure and improving it with basic analytics).</p>
<p>We do not &ldquo;sell&rdquo; or &ldquo;share&rdquo; personal information as those terms are defined in the CCPA, and we do not process personal data for targeted advertising.</p></section>

<section><h2>10. Children</h2>
<p>FirstWeeks is built for parents and caregivers and is intended for users 18 and older. The app is not directed at children, and we do not knowingly collect data from children directly. Information about your baby is entered by you and processed solely to provide the app&rsquo;s features to you. You can delete it at any time.</p></section>

<section><h2>11. Health information</h2>
<p>Records you keep about your baby — including temperature, symptoms and medications — are used only to show them back to you, power your statistics and answer your questions. FirstWeeks is not a medical device, and nothing in the app is medical advice.</p></section>

<section><h2>12. Changes to this policy</h2>
<p>If we make material changes, we will update the date at the top and let you know in the app before the changes take effect. Continued use after that means the updated policy applies.</p></section>

<section><h2>13. Contact</h2>
<p>Questions, requests, concerns: <a href="${mailto('Privacy')}">${esc(site.email)}</a>.</p></section>
</div>`;

  const meta = {
    title: 'Privacy Policy | FirstWeeks',
    description: 'How FirstWeeks handles your data: your baby\u2019s name never reaches the AI, no ads, no data selling, no tracking, and you can export or delete everything anytime.',
    path: '/en/privacy/', theme: 'light',
    jsonld: pageLD('Privacy Policy', '/en/privacy/', crumbItems),
  };
  emit('/en/privacy/', page({ meta, body, theme: 'light' }));
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
