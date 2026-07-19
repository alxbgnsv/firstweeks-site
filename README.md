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

## Deploy — GitHub Pages + custom domain (for Alex)

**1. Create a public repo and push.**
```
git remote add origin git@github.com:<you>/firstweeks-site.git
git push -u origin main
```
Free Pages requires the repo to be **public** (all site content is public anyway).

**2. Publish `dist/` via GitHub Actions.** Add `.github/workflows/pages.yml`:
```yaml
name: Deploy
on: { push: { branches: [main] } }
permissions: { pages: write, id-token: write, contents: read }
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci --omit=dev      # no sharp needed — images are committed
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: github-pages
    steps: [ { uses: actions/deploy-pages@v4 } ]
```
Then **Settings → Pages → Source: GitHub Actions**. `public/CNAME` (`firstweeks.app`)
is copied into `dist/` by the build, so Pages keeps the custom domain on every deploy.

**3. DNS (at the registrar for `firstweeks.app`).** Point the apex + `www`:
```
# Apex (firstweeks.app) — four A records to GitHub Pages:
A     @     185.199.108.153
A     @     185.199.109.153
A     @     185.199.110.153
A     @     185.199.111.153
# (or AAAA to 2606:50c0:8000::153 … :8003::153 for IPv6)
# www subdomain:
CNAME www   <you>.github.io.
```
In **Settings → Pages**, set the custom domain to `firstweeks.app` and tick
**Enforce HTTPS** once the certificate is issued (a few minutes to a few hours).
DNS propagation can take up to 24–48h.

**4. Verify after deploy:**
- `https://firstweeks.app/sitemap.xml` and `/robots.txt` resolve.
- `https://firstweeks.app/.well-known/apple-app-site-association` returns the JSON.
- Run Google's **Rich Results Test** on a live article/week/exercise URL (needs the
  public URL — can't run against localhost). Locally the same schema is validated by
  the build (Article/BreadcrumbList/HowTo/FAQPage), so this is a formality.

## Quality gate (measured before К5 shipped, desktop Lighthouse)
Landing / article / week / exercise / all hubs / methodology / support:
**Performance, Accessibility, Best-Practices, SEO all = 100.**
The `noindex` pages (privacy, terms, invite, checkout) intentionally score low on
Lighthouse *SEO* — that audit flags the deliberate no-index, which is correct.
