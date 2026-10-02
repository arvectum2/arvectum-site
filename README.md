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
