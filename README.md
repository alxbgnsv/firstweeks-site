# firstweeks-site

Static marketing + SEO site for **firstweeks.app** — self-written Node generator (zero runtime deps, zero JS by default).

## Build
```
npm install          # dev-only: sharp (image pre-gen)
npm run images       # regenerate WebP screens (commit output)
npm run build        # → dist/
npm run dev          # build + serve on :8930
```
CI builds `dist/` with pure Node (no image deps — WebP/OG are pre-generated and committed).

## Fill before launch (placeholders in `config.mjs`)
- `app.storeURL` — real App Store URL after approval.
- `app.teamID` — Apple Team ID (for AASA).
- `flags.web_checkout` — flip to `true` only after legal sign-off (Stage 2).

## Before deploy
- Add a GitHub **remote**; for free GitHub Pages the repo must be **public**
  (all site content is public by nature — this is fine).
- **Never commit secrets.** The site has no keys and must never gain any.
  Stripe keys (Stage 2 checkout) live only in CI/env, never in the repo.

## Forms policy (Stage 1)
No dead inputs. There is no backend, so there are no email-collection fields
that silently drop input — that would be deceptive on a site selling trust.
- Android: a plain "Android — coming soon" line (no field).
- Support: a `mailto:hello@firstweeks.app` button with a prefilled subject.
Real forms ship only when a backend exists for them.

## Deploy — GitHub Pages (DNS for Alex)
See bottom of this file (added in К5).
