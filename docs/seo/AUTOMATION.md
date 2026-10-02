# SEO automation

The website uses one SEO pipeline for Google and Yandex.

## What is automated

1. `public/sitemap.xml` is generated from canonical HTML pages that are not marked `noindex`.
2. Every sitemap URL gets a deterministic `lastmod` from Git history.
3. CI rejects a stale sitemap.
4. After a successful production deploy, the deployed SHA can be compared with the previous SHA.
5. New, changed and deleted canonical URLs can be sent to Yandex through IndexNow.
6. Google Search Console can receive the sitemap after each successful deployment.
7. Yandex Webmaster can ensure that the sitemap is registered.
8. Weekly reports can collect Google Search Analytics, sitemap/index inspection data, Yandex diagnostics, sitemap state and popular queries.

Search-engine notification is evidence and a recrawl signal; it does not guarantee indexing.

## Private credential boundary

Credentials live outside Git:

`/Volumes/ArvectumSSD/Arvectum/private/arvectum-site/seo/`

Expected runtime files:

- `indexnow.key` — generated locally; already provisioned.
- `google-search-console-service-account.json` — provided after Google Search Console API setup.
- `yandex-webmaster.token` — provided after Yandex OAuth authorization.

Recommended environment:

```text
INDEXNOW_KEY_FILE=/Volumes/ArvectumSSD/Arvectum/private/arvectum-site/seo/indexnow.key
GOOGLE_SEARCH_CONSOLE_CREDENTIALS_FILE=/Volumes/ArvectumSSD/Arvectum/private/arvectum-site/seo/google-search-console-service-account.json
YANDEX_WEBMASTER_TOKEN_FILE=/Volumes/ArvectumSSD/Arvectum/private/arvectum-site/seo/yandex-webmaster.token
SEO_EVIDENCE_DIR=/Volumes/ArvectumSSD/Arvectum/runtime/arvectum-site-seo/deployments
SEO_REPORT_DIR=/Volumes/ArvectumSSD/Arvectum/runtime/arvectum-site-seo/reports
```

## Commands

Regenerate sitemap:

```bash
node scripts/seo-generate-sitemap.mjs
```

Check sitemap freshness:

```bash
node scripts/seo-generate-sitemap.mjs --check
```

Get the SEO URL delta between two deployed commits:

```bash
node scripts/seo-diff.mjs <old-sha> <new-sha>
```

Run post-deploy search-engine updates:

```bash
node scripts/seo-post-deploy.mjs <old-sha> <new-sha>
```

Generate the weekly machine-readable report:

```bash
node scripts/seo-weekly-report.mjs
```

The post-deploy and weekly scripts skip an external integration when its credential file is absent. They never require secrets in the repository.

## Google

The Google adapter discovers the Search Console property available to the service account, preferring `sc-domain:arvectum.com`. It supports:

- sitemap submission;
- Search Analytics for the latest completed 28-day period and the preceding period;
- sitemap status;
- URL Inspection for canonical indexable pages.

Google does not provide a general-purpose indexing request API for ordinary web pages. For this site the correct automated path is sitemap submission plus monitoring/inspection.

## Yandex

The Yandex adapter discovers the user and verified `arvectum.com` host through Webmaster API v4. It supports:

- ensuring `https://arvectum.com/sitemap.xml` is registered;
- site diagnostics;
- sitemap status;
- top queries by impressions and clicks.

IndexNow is separate from Webmaster OAuth and is used for the changed-URL notification path.
