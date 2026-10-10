# Photo & PDF Size: draft multilingual SEO rollout — 2026-10-10

**Branch:** `feature/photo-size-global-seo` (separate from production `main`).
**Status (2026-10-10): LIVE DEPLOYED** after owner expressly authorized release. GitHub origin/main at commit 2607dcf; deployment backed up the old index and sitemap under ~/backups/photo-size-seo-20261010 on REG.RU hosting.

## Prepared pages

| Language / intent | Static URL in the repo | Main search target |
|---|---|---|
| RU, updated | `/tools/photo-size/index.html` | сжать фото и PDF до 100 КБ или 1 МБ |
| EN (global) | `/tools/photo-size/en/index.html` | compress photo to 100kb; resize image |
| ES (LatAm & Spain) | `/tools/photo-size/es/index.html` | comprimir fotos y pdf; reducir a 100 kb |
| PT-BR | `/tools/photo-size/pt-br/index.html` | comprimir foto 100 kb; pdf 1 mb |
| DE | `/tools/photo-size/de/index.html` | foto auf 100 kb verkleinern; pdf 1 mb |
| FR | `/tools/photo-size/fr/index.html` | compresser photo 100 ko; pdf 1 mo |
| RU PDF guide | `/tools/photo-size/compress-pdf.html` | как сжать PDF до 1 МБ / 500 КБ |
| EN PDF guide | `/tools/photo-size/en/compress-pdf.html` | compress PDF to 1 MB / 500 KB |

All international pages use **self-canonical** links, reciprocal `hreflang` annotations, localized title/description/H1/FAQ, real screenshots derived from the existing app UI (no fabricated UI), Schema.org SoftwareApplication where relevant, free App Store CTA and truthful on-device processing / PDF rasterization caveats.

The locale-aware pages live at different URLs for actual indexing, rather than relying on an in-browser JS language switch. A reciprocal `hreflang` block in the Russian root landing page completes the cluster. Sitemap is generated with the site's existing script.

## Deployment gates

- [x] Preserve production `main` unchanged.
- [x] Build five localized landing pages, two PDF intent pages and update RU description to include PDF.
- [x] Prepare and optimize localized marketing images with the app's existing screenshots.
- [x] Generate `public/sitemap.xml` through the site's established `seo-generate-sitemap.mjs`.
- [ ] Check `npm run check` on the staged branch and fix failures before merge.
- [ ] Re-evaluate copy against the post-refactor app binary / localized UI.
- [ ] Check image claims after a **real** PDF-screen capture in the app branch.
- [ ] Merge only after manual approval; production `main` deploy remains blocked.
- [ ] Only after deployment: request indexing for the newly served URLs in Google Search Console and Yandex Webmaster, verify sitemap and `hreflang` live.

## What to measure after launch

Use search query/impression/click and CTR segmented by landing page in Google Search Console; sitemap/indexing and queries in Yandex Webmaster; outgoing App Store CTA clicks with privacy-preserving analytics only if the site has consent-compliant measurement; App Store page views and downloads by country. Do not claim conversion improvements before the data exists.

Related app draft: `arvectum2/arvectum-tools` / `feature/photo-pdf-global-aso`.

## Deployment evidence (2026-10-10)

- Authorized owner instruction: publish 1.0.0 and associated international SEO.
- Published static site pages at arvectum.com, including RU/EN/ES/PT-BR/DE/FR and RU/EN PDF guides.
- Uploaded matching images and generated sitemap to the REG.RU server with existing SOCKS5 SSH tunnel after direct SSH timed out.
- Verified 11/11 remote resources with HTTP 200 and exact SHA256 agreement with committed files. Production smoke test passed on existing site paths.
- App Store version 1.0.0 (12) awaits Apple approval; the site was published ahead of its approval.
