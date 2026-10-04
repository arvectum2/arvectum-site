# Arvectum Site

Canonical repository for the public `arvectum.com` website.

Canonical state:

- GitHub: `arvectum2/arvectum-site`
- GitVerse mirror: `arvectum/arvectum-site`
- Mac mini checkout: `/Volumes/ArvectumSSD/Arvectum/repos/arvectum-site`
- Production document root: REG.RU `www/arvectum.com`
- Deployable website: `public/`

The site is intentionally simple: static HTML/CSS/JS plus small PHP endpoints for forms, health checks, and cookie-consent logging.

## Repository layout

- `public/` — production web root.
- `public/api/` — PHP endpoints.
- `public/api/storage/` — runtime-only data; logs and consent records are never committed.
- `public/assets/` — production assets with explicit size budgets.
- `docs/brand/` — heavyweight source/reference brand artwork not served by the website.
- `docs/seo/` — SEO research and historical implementation evidence.
- `scripts/` — deterministic repository, JS, static-site, asset, and production checks.
- `.github/workflows/ci.yml` — repository/site validation.
- `.github/workflows/mirror-to-gitverse.yml` — GitHub to GitVerse mirror.

## Local development

With npm available:

    npm ci
    npm run dev

Default local address: http://localhost:8788

The core checks can also be run directly with Node, without the npm wrapper:

    node scripts/check-repository.mjs
    node scripts/check-js.mjs
    node scripts/check-static.mjs
    node scripts/check-assets.mjs

## Validation

`npm run check` runs repository invariants, JavaScript syntax, static-site checks, and asset budgets.

PHP syntax:

    npm run lint:php

External production verification:

    npm run check:production

GitHub Actions runs repository, JS, static, asset, and PHP checks on `main`, pull requests, and manual dispatch.

## Secrets and runtime data

Create `public/.env` from `public/.env.example` only where the PHP runtime needs it.

Never commit:

- `public/.env`;
- tokens, passwords, or private keys;
- `public/api/storage/*.jsonl`;
- runtime logs or databases;
- deployment backups.

Only `public/api/storage/.gitkeep` and its protective `.htaccess` are tracked.

## Deployment model

GitHub is the canonical remote. Every GitHub push is mirrored to GitVerse by GitHub Actions.

Production is the content of `public/`. The hosting account keeps runtime `.env` and runtime storage separately from Git.

Before deployment, run repository checks and PHP syntax checks. After deployment, run `scripts/check-production.mjs`.

See `DEPLOY_CHECKLIST.md` for the operational checklist.

## SEO automation

SEO is part of the delivery pipeline rather than a manual webmaster task:

- `scripts/seo-generate-sitemap.mjs` keeps the sitemap synchronized with canonical indexable pages and Git-derived `lastmod` dates;
- `scripts/seo-diff.mjs` computes new, changed and deleted canonical URLs between deployed commits;
- `scripts/seo-indexnow.mjs` notifies Yandex through IndexNow;
- `scripts/seo-google.mjs` integrates with Google Search Console;
- `scripts/seo-yandex.mjs` integrates with Yandex Webmaster;
- `scripts/seo-weekly-report.mjs` captures recurring search-engine evidence.

Credentials and reports remain outside Git. See `docs/seo/AUTOMATION.md`.


## Data Platform growth search

The site repository is a consumer of the shared Arvectum Data Platform for SEO/Growth research. SEO rules, sitemap generation and search-engine submission stay in this repository; Data Platform only owns reusable indexing and retrieval.

Commands:

```bash
node scripts/data-platform/index-site.mjs --dry-run
node scripts/data-platform/index-site.mjs
node scripts/data-platform/search-site.mjs "агент для тендерного отдела"
```

`data:index` reads the canonical URLs from `public/sitemap.xml`, hashes the corresponding local HTML files, and creates a deterministic versioned collection:

```text
growth:arvectum-site:<manifest-revision>
```

The active collection switches only after every sitemap page is ingested and collection statistics confirm that resources, documents, chunks and embeddings are complete. The active revision is stored outside Git by default under the Arvectum runtime directory.

`data:search` searches only the active site collection and prints the canonical URL plus Data Platform evidence identifiers for every result.

Environment overrides:

```text
DATA_PLATFORM_URL=http://127.0.0.1:8094
DATA_PLATFORM_API_KEY=
DATA_PLATFORM_STATE_FILE=<optional custom state path>
```


For external research discovery through the shared connector registry:

```bash
node scripts/data-platform/discover-web.mjs "photo resize iphone app"
```

The discovery command is intentionally separate from the site index. A zero-result response is treated as an external-source outcome, not as permission to broaden or silently switch providers.


### Versioned external research collections

Discovery results can be materialized into a bounded research collection:

```bash
node scripts/data-platform/research-web.mjs --limit 5 --min-success 3 "photo resize iphone app"
node scripts/data-platform/search-research.mjs "resize image exact file size kilobytes iphone"
```

The research command first discovers a fixed URL set, creates a deterministic versioned collection, and then ingests each external URL through Data Platform. Fetch failures are reported explicitly and stored in the runtime research state; there is no silent snippet fallback. A research revision becomes active only when the configured minimum number of pages succeeds and collection stats confirm matching resources/documents plus complete chunk embeddings.

Research state is stored outside Git under the Arvectum runtime directory unless `DATA_PLATFORM_RESEARCH_STATE_FILE` overrides it.


### Product metadata collection

Public product landing pages under `public/tools/*/index.html` are indexed into a separate versioned metadata collection:

```bash
node scripts/data-platform/index-products.mjs
node scripts/data-platform/search-products.mjs "уменьшить фото до 500 КБ на iPhone"
```

Each product landing page becomes one pre-chunked metadata document containing its canonical URL, product heading, page title, meta description and section headings. The collection is independent from the full site index, so product discovery can search concise product metadata without ranking against long marketing pages.

The index is derived from public landing pages only. A product is not invented or added manually before it has a public `/tools/<product>/index.html` page; future product pages are included automatically.
