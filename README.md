# firstweeks-site

Static marketing + SEO site for **firstweeks.app** — self-written Node generator (zero runtime deps, zero JS by default).

## Build
```
npm install          # dev-only: sharp (image pre-gen)
npm run images       # regenerate WebP screens + right-size icon (commit output)
npm run og           # regenerate 1200×630 OG images → public/og/ (commit output)
npm run build        # → dist/  (set BUILD_DATE=YYYY-MM-DD for reproducible dates)
npm run dev          # build + serve on :8930
```
CI builds `dist/` with pure Node (no image deps — WebP/OG are pre-generated and committed).
Re-run `npm run images` / `npm run og` locally only when screens or content change.

## Fill before launch (placeholders in `config.mjs`)
- `app.storeURL` — real App Store URL after approval (`idPLACEHOLDER` → real id).
- `app.teamID` — Apple Team ID; feeds the AASA `appID` (`{TEAMID}.com.firstweeks.app`).
- `flags.web_checkout` — flip to `true` only after legal sign-off (Stage 2).
- **Privacy/Terms** (`src/templates/service.mjs`) ship as an honest *short version* and
  are `noindex` until counsel finalizes the full text. Remove `noindex: true` from
  `buildPrivacy`/`buildTerms` once the reviewed policy is in.

## Universal links (AASA)
`tools/build.mjs` emits `/.well-known/apple-app-site-association` (and a root copy)
declaring `paths: ["/invite/*"]`. It has **no file extension** and a JSON body; GitHub
Pages serves it as `application/octet-stream`, which modern iOS accepts (content-type
is no longer required to be `application/json`). Installed apps intercept `/invite/*`;
everyone else gets the `/invite/` fallback page, and deep `/invite/<token>` links that
miss the app fall through to the branded `404.html`.

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

## Deploy — GitHub Pages + custom domain (runbook for Alex)

The GitHub Actions workflow is already committed at `.github/workflows/deploy.yml`
— it builds `dist/` on every push to `main` and publishes it to Pages. You just
create the repo, push, enable Pages, and point DNS.

**1. Create a PUBLIC repo and push.** (Free Pages needs public; all content here is
public anyway, and there are no secrets in the repo.)
```
git remote add origin git@github.com:<you>/firstweeks-site.git   # or https://…
git push -u origin main
```

**2. Enable Pages.** Repo → **Settings → Pages → Build and deployment →
Source: GitHub Actions**. The push already triggered the workflow (watch it under the
**Actions** tab). `public/CNAME` (`firstweeks.app`) is copied into `dist/` by the
build, so Pages keeps the custom domain on every deploy.

**3. DNS — at your domain registrar for `firstweeks.app`** (do this by hand). Add:

| Type  | Host / Name | Value                | Notes |
|-------|-------------|----------------------|-------|
| A     | `@`         | `185.199.108.153`    | apex |
| A     | `@`         | `185.199.109.153`    | apex |
| A     | `@`         | `185.199.110.153`    | apex |
| A     | `@`         | `185.199.111.153`    | apex |
| CNAME | `www`       | `<you>.github.io.`   | replace `<you>` with your GitHub username; keep the trailing dot |

- `@` (or blank / "root") = the apex `firstweeks.app`. Remove any old A/ALIAS/AAAA on
  the apex first. (IPv6 optional: AAAA `@` → `2606:50c0:8000::153` … `:8003::153`.)
- Canonical host is the **apex, no www**; `www` → apex is a 301 handled automatically
  by Pages once both resolve. canonical/sitemap/hreflang already all point to the apex.

**4. Custom domain + HTTPS.** Settings → Pages → **Custom domain** = `firstweeks.app`
→ Save (writes/keeps the CNAME). Wait for the DNS check to go green, then tick
**Enforce HTTPS** (cert issues in minutes–hours; DNS can take up to 24–48h).

**5. Verify on the live domain:**
```
curl -sI https://firstweeks.app/            # 200, no redirect
curl -sI http://firstweeks.app/             # 301 → https
curl -sI https://www.firstweeks.app/        # 301 → https://firstweeks.app/
curl -sI https://firstweeks.app/.well-known/apple-app-site-association   # 200, no redirect
curl -s  https://firstweeks.app/.well-known/apple-app-site-association | jq .   # valid JSON
```
- Also open: `/`, `/en/week-by-week/week-5/`, an article, the hubs, `/en/support/`,
  `/en/methodology/`, `/invite/`, `/sitemap.xml`, `/robots.txt`.
- Google **Rich Results Test** on live article/week/exercise URLs (schema is already
  build-validated locally, so this is a formality).
- OG cards: paste a couple of URLs into a share-preview validator (e.g. opengraph.xyz).

**AASA content-type caveat:** GitHub Pages serves the extensionless
`apple-app-site-association` as `application/octet-stream`, **not** `application/json`.
That is fine for modern iOS — since iOS 9.3.1 Apple fetches AASA via its CDN and does
**not** validate the content-type; it only requires HTTPS, no redirect, and valid JSON
(all satisfied). If a strict `application/json` is ever required, front the domain with
Cloudflare (free) and add a Transform Rule to set the header. No repo change needed.

## Quality gate (measured, desktop Lighthouse — `npm run lh`)
Landing / article / week / exercise / all hubs / methodology / support:
**Performance, Accessibility, Best-Practices, SEO all = 100.**
The `noindex` pages (privacy, terms, invite, checkout) intentionally score low on
Lighthouse *SEO* — that audit flags the deliberate no-index, which is correct.

## Quality gate (measured before К5 shipped, desktop Lighthouse)
Landing / article / week / exercise / all hubs / methodology / support:
**Performance, Accessibility, Best-Practices, SEO all = 100.**
The `noindex` pages (privacy, terms, invite, checkout) intentionally score low on
Lighthouse *SEO* — that audit flags the deliberate no-index, which is correct.
