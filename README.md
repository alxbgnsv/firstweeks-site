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

## Deploy — GitHub Pages (DNS for Alex)
See bottom of this file (added in К5).
