// Landing (/). К1: shell placeholder; К2 builds the full page.
import { page, storeLink } from '../components/layout.mjs';
import { appStoreBadge, iphone } from '../components/blocks.mjs';
import { flags } from '../../config.mjs';

export function buildLanding({ emit }) {
  const meta = {
    title: 'FirstWeeks — Understand What’s Happening With Your Baby',
    description: 'Track feeding and sleep in seconds, then ask what they mean. Calm, sourced answers matched to your baby’s age. Free 14-day trial, no card.',
    path: '/',
    ogImage: null,
  };
  const cta = flags.web_checkout ? '/#pricing' : storeLink('hero');
  const body = `<section class="section"><div class="wrap" style="display:grid;grid-template-columns:1.1fr .9fr;gap:40px;align-items:center">
<div>
  <h1>Understand what’s happening with your baby</h1>
  <p class="muted" style="font-size:1.2rem;max-width:34ch">Track feeding, sleep and changes in seconds — then ask what they mean. Answers that know your baby’s age and patterns.</p>
  <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:24px">
    <a class="btn btn--primary btn--lg" href="${cta}">Start free — 14 days, no card</a>
    ${appStoreBadge('hero')}
  </div>
  <p class="android-soon" style="margin-top:10px">Android — coming soon</p>
</div>
<div>${iphone('scr-ask', 'Ask — an answer with sources')}</div>
</div></section>
<section id="pricing" class="section section--alt"><div class="wrap center"><h2>Simple pricing</h2></div></section>`;
  emit('/', page({ meta, body }));
}
