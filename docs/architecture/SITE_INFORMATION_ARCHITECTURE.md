# Site information architecture

Status: active repository rule for arvectum.com.

## Purpose

The website should remain understandable to a human visitor, search engines, and maintainers as the company adds B2B solutions and end-user products.

Every indexable page must have a clear role, a canonical URL, at least one meaningful internal link, and a path from the homepage.

## Canonical sections

### Company

- `/` — company homepage and primary positioning.
- `/about.html` — company and operating approach.
- `/approach.html` — how an automation engagement is launched.
- `/implementation-scenarios.html` — deployment and implementation scenarios.
- `/contact.html` — contact and conversion endpoint.

### B2B solutions

- `/solutions.html` — solution discovery hub.
- `/solutions/procurement.html` — broad procurement/tender automation journey.
- `/solutions/document-workflow.html` — document workflow solution.
- `/solutions/operations.html` — operations automation solution.
- `/solutions/ai-document-checks.html` — document-checking solution.
- other `/solutions/*` pages may exist when they represent a distinct search/user intent rather than a duplicate commercial offer.

### Commercial service landings

- `/services/ai-tender-agent.html` — tender/procurement AI agent.
- `/services/rfq-automation.html` — RFQ automation.
- `/services/tkp-comparison.html` — quote/TKP comparison.
- `/services/contract-risk-review.html` — contract risk review.
- `/services/tender-documents-automation.html` — tender-document workflow.

A service landing is the canonical commercial destination when a solution page would otherwise target the same user intent.

### Materials

- `/materials.html` — materials hub.
- `/materials/*` — educational/search-intent content supporting solution and service pages.

### Products

- `/tools/index.html` — Arvectum Tools product hub.
- `/tools/<product>/...` — product and task-specific pages.

Consumer/product pages remain connected to the company site but are not mixed into the primary B2B desktop navigation.

### Security, diagnostics and evidence

Security, diagnostic and case pages stay separate when they provide distinct evidence or a distinct user task.

## Privacy policy

`/privacy` is the single canonical privacy/personal-data policy page for the website and all Arvectum products.

Legacy product-specific policy URLs are permanent aliases:

- `/privacy.html` → `/privacy`
- `/pushkin-privacy.html` → `/privacy`
- `/photo-pod-razmer-privacy.html` → `/privacy`

The routing decision does not by itself assert that the current policy text already covers every product-specific processing scenario. A new approved policy revision must update the canonical `/privacy` content when required.

## Retired competing routes

- `/solutions/tender-department-ai-agent.html` → `/services/ai-tender-agent.html`
- `/solutions/contract-risk-ai-review.html` → `/services/contract-risk-review.html`

Permanent redirects preserve external links while consolidating search and internal authority.

## Navigation rules

1. Primary desktop navigation stays compact and focused on the core B2B journey.
2. Secondary/mobile navigation may expose Company, implementation scenarios and Arvectum Tools.
3. Footer/resource navigation provides stable discovery of Company, implementation scenarios, Tools, the tender AI agent and Materials.
4. Product pages link back to the Tools hub and to the single privacy policy.
5. Breadcrumbs are required for every indexable page except the homepage.
6. Indexable pages must be reachable from the homepage within three static HTML link hops. The current target is two hops.
7. An indexable orphan page is a CI failure.
8. A configuration slug without a defined route is a CI failure.
9. Internal links to retired routes are a CI failure.

## Verification

Run:

```bash
node scripts/check-site-graph.mjs
node scripts/seo-generate-sitemap.mjs --check
node scripts/check-seo-quality.mjs
node scripts/check-static.mjs
```

The generated sitemap contains only current canonical indexable pages. Redirect aliases do not belong in the sitemap.
