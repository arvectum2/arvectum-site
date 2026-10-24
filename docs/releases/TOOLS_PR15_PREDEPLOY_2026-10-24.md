# Arvectum Tools product pages — PR #15 pre-deployment gate

**Prepared 24 October 2026. Not a deploy authorization.**

Scope: https://github.com/arvectum2/arvectum-site/pull/15
- RU/EN Pushkin landing pages and links to its real App Store listing.
- RU/EN Uhvat App Store links, Pushkin Tools-hub entry, sitemap and assets.
- Private /schlam/ prototypes remain noindex and excluded from sitemap.

## Before approved merge/deploy

- [x] 24 October PR #15 OPEN/MERGEABLE, site verify and GitVerse mirror SUCCESS.
- [ ] Confirm owner's separate approval to merge PR and deploy website.
- [ ] Run npm run verify on the exact final PR HEAD. Confirm GitHub CI and clean worktree.
- [ ] Identify actual production document root. Preserve server-local .env
  and API runtime api/storage, do not overwrite with Git contents.
- [ ] Back up the production document root and record the exact rollback path.

## Public smoke checks — AFTER approved deployment

- [ ] HTTP success on /, /tools/index.html, /tools/pushkin/index.html,
  /tools/pushkin/en/index.html, /tools/what/index.html,
  /tools/what/en/index.html.
- [ ] Pushkin link resolves App Store ID 6817847111; Uhvat pages no longer
  show coming-soon copy and point to its actual App Store release.
- [ ] App icons and optimized screenshots load without redirects/errors.
- [ ] RU/EN canonical tags, hreflang, x-default, OpenGraph and JSON-LD
  use the deployed public URLs without indexable duplication.
- [ ] /robots.txt and /sitemap.xml include both Pushkin pages but exclude
  private /schlam/ previews.
- [ ] Run node scripts/check-production.mjs; verify /health.html,
  /api/health.php, form submission and cookie consent per DEPLOY_CHECKLIST.md.
- [ ] Confirm www handling and legacy redirect behavior. Do not invent new redirects.
- [ ] Once live, request sitemap refresh in Google Search Console and Yandex
  Webmaster and record baseline; publication does not prove indexing.

## Rollback

On a health, form/consent, page, asset, or SEO redirect regression restore the
pre-deploy document-root backup and recheck health/home/sitemap. Preserve
server-local .env and api/storage during deploy AND rollback.

**This document does not merge the PR or deploy the site.**
