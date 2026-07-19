// Checkout (/en/checkout/) — mockup 02. Feature-flagged (§5).
// Stage 1 (web_checkout=false): page is deployed but noindex + unlinked; every
// pricing CTA goes to the App Store. Primary buttons fall back to the App Store
// (no dead controls, § correction 7) and a banner explains Stage 2.
// Stage 2 (true): pricing CTAs link here; checkout.js drives the state machine
// and Stripe/Paddle Elements mount into the placeholders.
import { page, storeLink } from '../components/layout.mjs';
import { appStoreBadge } from '../components/blocks.mjs';
import { flags, pricing, site } from '../../config.mjs';
import { esc } from '../lib/html.mjs';

export function buildCheckout({ emit }) {
  const live = flags.web_checkout;
  const fallback = storeLink('pricing');
  const btnAction = (label, id) =>
    live ? `<button class="btn btn--primary btn--block" data-next id="${id}">${esc(label)}</button>`
         : `<a class="btn btn--primary btn--block" href="${fallback}" id="${id}">${esc(label)}</a>`;

  // Plan summary (Annual default; JS swaps if ?plan=monthly in Stage 2).
  const planSummary = `<div class="co-plan" data-plan-summary>
<div><b>FirstWeeks Annual</b> <span class="badge badge--save">${pricing.annual.save}</span></div>
<div class="co-plan__price">${pricing.annual.price} <small>${pricing.annual.perMonth} · billed once a year</small></div>
${live ? '<button class="co-change" data-change>change</button>' : ''}
</div>`;

  const benefits = `<ul class="co-benefits">
<li>Cancel anytime in one click — no retention flows</li>
<li>Both parents on one plan, synced</li>
<li>Encrypted · no ads · no data selling</li>
<li>Tracking stays free forever, plan or no plan</li>
</ul>`;

  const steps = (active) => `<div class="co-steps" aria-hidden="true">
<span class="${active === 1 ? 'on' : ''}">1 · Email</span> —
<span class="${active === 2 ? 'on' : ''}">2 · Payment</span> —
<span class="${active === 3 ? 'on' : ''}">3 · Done</span></div>`;

  // --- State panels (all in DOM; JS toggles [hidden] in Stage 2) ---
  const stepEmail = `<section class="co-panel" data-state="email">
${steps(1)}
<h1 class="co-h">Where should we set up your account?</h1>
<p class="muted">This email will be your app login.</p>
<label class="co-field"><span>Email</span>
<input type="email" name="email" placeholder="you@example.com" autocomplete="email" ${live ? '' : 'disabled'}></label>
${btnAction('Continue', 'co-continue')}
<p class="co-fine muted">By continuing you agree to the <a href="/en/terms/">Terms</a> and <a href="/en/privacy/">Privacy Policy</a>.</p>
</section>`;

  const cardFields = `<div class="co-elements" data-stripe-mount>
<p class="kicker">Stripe / Paddle Elements</p>
<div class="co-input">Card number <span class="co-ph">1234 1234 1234 1234</span></div>
<div class="co-row"><div class="co-input">MM / YY</div><div class="co-input">CVC</div></div>
<div class="co-row"><div class="co-input">United States</div><div class="co-input">ZIP</div></div>
</div>`;

  const stepPayment = `<section class="co-panel" data-state="payment" hidden>
${steps(2)}
${planSummary}
${cardFields}
${btnAction('Subscribe — $59.99/year', 'co-subscribe')}
<p class="co-fine muted">Secured by Stripe · Cancel anytime in one click — no emails, no calls.</p>
</section>`;

  const stepSuccess = `<section class="co-panel co-panel--center" data-state="success" hidden>
${steps(3)}
<div class="co-check" aria-hidden="true">✓</div>
<h1 class="co-h">Your plan is ready</h1>
<p class="muted">Check your inbox → download FirstWeeks → sign in with <b data-success-email>your email</b> — your plan is waiting.</p>
<div class="co-center">${appStoreBadge('pricing')}</div>
<p class="co-fine muted">Receipt sent · Didn’t get the email? <a href="#" data-resend>Resend</a></p>
</section>`;

  const stepDeclined = `<section class="co-panel" data-state="declined" hidden>
${steps(2)}
<div class="co-banner co-banner--danger">Your card was declined</div>
<p class="muted">No charge was made. Try another card, or contact your bank — the trial isn’t going anywhere.</p>
${cardFields}
${btnAction('Try again — $59.99/year', 'co-retry')}
<button class="btn btn--secondary btn--block" data-alt-method>Use a different payment method</button>
</section>`;

  const stepExists = `<section class="co-panel" data-state="exists" hidden>
${steps(1)}
<label class="co-field"><span>Email</span>
<input type="email" value="" placeholder="you@example.com" disabled></label>
<div class="co-banner">This email already has an active plan</div>
<p class="muted">Open the app and sign in with this email — everything is already there. Bought on the App Store? Use Restore purchases.</p>
<a class="btn btn--primary btn--block" href="${fallback}">I already have the app — sign in</a>
<p class="co-fine muted"><a href="${fallback}">Restore an App Store purchase</a> · <a href="#" data-other-email>Use another email</a></p>
</section>`;

  const stageBanner = live ? '' :
    `<div class="co-stage" role="note">Web checkout opens after launch. For now, start free in the app — 14 days, no card.</div>`;

  const body = `<div class="co-wrap">
<div class="co-left">
  <a class="co-back" href="/">← Back to firstweeks.app</a>
  <h2 class="co-plan-h">Your plan</h2>
  ${planSummary}
  <div class="co-due"><span>Due today</span><b>${pricing.annual.price}</b></div>
  ${benefits}
</div>
<div class="co-right card" data-checkout${live ? ' data-checkout-live' : ''}>
  ${stageBanner}
  ${stepEmail}${stepPayment}${stepSuccess}${stepDeclined}${stepExists}
</div>
</div>`;

  const meta = {
    title: 'Checkout · FirstWeeks',
    description: 'Start your FirstWeeks plan.',
    path: '/en/checkout/',
  };
  let html = page({ meta, body, scripts: live ? ['/js/checkout.js'] : [] });
  html = html.replace('</title>', '</title><meta name="robots" content="noindex">'); // Stage-2 surface
  emit('/en/checkout/', html, { indexable: false });
}
