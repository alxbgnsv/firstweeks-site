// SITE-2 · firstweeks.app — build configuration (single source of truth).
// Placeholders below are filled by Alex before/after App Store approval (see README).

export const site = {
  domain: 'firstweeks.app',
  origin: 'https://firstweeks.app',
  name: 'FirstWeeks',
  email: 'hello@firstweeks.app',
  // Visible E-E-A-T date; per-page dates come from content-dates.json (hash-lock).
  reviewedLabel: 'June 2026',
  locales: ['en'], // built locales; es/pt-br are hreflang bookmarks only (§6)
  defaultLocale: 'en',
  hreflang: ['en', 'es', 'pt-br'], // emitted as alternates; only `en` is built
};

// APP STORE / TEAM — placeholders until approval (README lists what to fill).
export const app = {
  // Replace with the real App Store URL after approval.
  storeURL: 'https://apps.apple.com/app/idPLACEHOLDER',
  // AASA appID = {TEAMID}.{bundle}; release bundle is com.firstweeks.app.
  teamID: 'TEAMID',
  bundleID: 'com.firstweeks.app',
};

// Feature flags (§5). All ship in markup; behaviour toggles here.
export const flags = {
  // OFF (Stage 1): every pricing CTA → App Store with ?ct=web_pricing.
  // ON (Stage 2, after legal): checkout flow from mockup 02.
  web_checkout: false,
  // Social-proof slot under hero (rating + families) — off until we have real numbers.
  social_proof: false,
  // Analytics slot — deferred (no cookie banner, no consent). null = nothing loaded.
  analytics: null,
  // SITE-NOPRICE (11.08.2026): все цены/планы/триал скрыты до запуска платной
  // подписки. ON — вернуть pricing-секцию, Pricing в навигации, checkout,
  // FAQ о планах и Offer-разметку одним флагом.
  pricing_public: false,
};

// App Store campaign tags per placement (§1). Appended to storeURL as ?ct=.
export const ct = {
  header: 'web_header',
  hero: 'web_hero',
  pricing: 'web_pricing',
  content: 'web_content',
  invite: 'web_invite',
  footer: 'web_footer',
};

// Pricing (§4). Mirrors app StoreKit config.
export const pricing = {
  annual: { price: '$59.99', perMonth: '$4.99/mo', billed: 'billed $59.99 once a year', save: 'SAVE 50%' },
  monthly: { price: '$9.99', perMonth: '$9.99/mo', note: 'cancel anytime' },
  trialLine: '14 days of everything free. No card. Nothing to cancel.',
  freeForever: 'Tracking is free forever — plan or no plan',
};

// Canonical guidance sources (E-E-A-T).
export const sources = ['CDC', 'NIH', 'WHO', 'AAP'];

// Article category enum — strict; unknown category = build error (§ answer 1).
export const CATEGORIES = [
  { slug: 'sleep', label: 'Sleep' },
  { slug: 'feeding', label: 'Feeding' },
  { slug: 'development', label: 'Development' },
  { slug: 'health-safety', label: 'Health & Safety' },
  { slug: 'crying-soothing', label: 'Crying & Soothing' },
  { slug: 'for-parents', label: 'For Parents' },
];

// Week hub period groupings (§ mockup 04).
export const WEEK_PERIODS = [
  { kicker: 'THE NEWBORN WEEKS · 1–8', from: 1, to: 8 },
  { kicker: 'MONTHS 2–6 · WEEKS 9–26', from: 9, to: 26 },
  { kicker: 'MONTHS 6–12 · WEEKS 27–52', from: 27, to: 52 },
  { kicker: 'INTO THE SECOND YEAR · WEEKS 53–64', from: 53, to: 64 },
];

// Exercise hub age tabs (§ mockup 04).
export const EXERCISE_GROUPS = [
  { label: 'Weeks 1–8', from: 1, to: 8 },
  { label: '2–6 months', from: 9, to: 26 },
  { label: '6–12 months', from: 27, to: 52 },
  { label: '12+ months', from: 53, to: 999 },
];

export const ARTICLES_PER_PAGE = 12; // hub pagination (§4)
