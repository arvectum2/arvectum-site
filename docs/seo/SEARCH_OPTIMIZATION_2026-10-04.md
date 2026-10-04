# Search optimization evidence — 2026-10-04

## Scope

Evidence-driven optimization of arvectum.com using the live Google Search Console and Yandex Webmaster properties available on 2026-10-04.

This document separates observed search-engine data from implementation hypotheses. Search ranking changes are not treated as guaranteed outcomes.

## Google Search Console observations

Performance window shown in Search Console: 2026-06-30 through 2026-09-29.

- Clicks: 6
- Impressions: 368
- CTR: 1.6%
- Average position: 45.6

High-value query signals included:

| Query | Impressions | Average position |
| --- | ---: | ---: |
| автоматизировать закупки | 68 | 92.9 |
| автоматизация тендеров | 10 | 92.3 |
| ии для проверки документов | 5 | 42.6 |
| ии агент для закупок | 4 | 28.2 |
| автоматизация выбора поставщика | 3 | 45.3 |
| ии в закрытом контуре | 2 | 15.0 |
| система для rfq | 2 | 21.5 |

High-opportunity landing pages included:

| Page | Clicks | Impressions | CTR | Average position |
| --- | ---: | ---: | ---: | ---: |
| /solutions/procurement.html | 0 | 161 | 0% | 81.8 |
| /services/ai-tender-agent.html | 0 | 30 | 0% | 4.7 |
| /materials/ai-procurement-guide.html | 0 | 21 | 0% | 41.6 |
| /materials/contract-risk-checklist.html | 0 | 19 | 0% | 1.1 |
| /services/rfq-automation.html | 0 | 11 | 0% | 2.7 |
| /materials/rfq-automation-guide.html | 0 | 10 | 0% | 8.5 |
| /services/contract-risk-review.html | 0 | 8 | 0% | 3.1 |
| /solutions/closed-loop-ai-documents.html | 0 | 8 | 0% | 14.5 |

Interpretation: pages already ranking on page one or near it with zero clicks are the safest candidates for snippet/title alignment. The broad procurement page has much larger demand but weak ranking, so it needs both relevance and internal-link/content depth rather than only CTR changes.

## Google indexing observations

Search Console last showed 51 indexed and 58 non-indexed URLs.

Non-indexing groups:

- canonical variant: 31
- server error 5xx: 14
- redirect: 7
- noindex: 3
- 404: 2
- crawled but not indexed: 1
- canonical mismatch: 0
- discovered but not indexed: 0

The 5xx and 404 examples were legacy URL shapes such as /ru, /solutions/approach.html?lang=en, /materials/index.html?lang=en and www variants. They are not current canonical routes.

The sitemap was accepted by Google but the Search Console UI showed its last processing date as 2026-06-24, so it needs to be resubmitted after this release.

Core Web Vitals had insufficient Chrome field data for both mobile and desktop as of 2026-10-03. No field-data conclusion should be inferred from that absence.

## Yandex Webmaster observations

The dashboard reported no errors and five recommendations.

Material recommendations still visible:

- the robot was not yet using a Sitemap;
- the property was still transitioning from the HTTP main address to HTTPS;
- favicon was reported as not found;
- add the organization to Yandex Business;
- specify site region.

The region change had already been submitted and was pending application to Russia. The HTTPS migration was also already pending. Neither should be duplicated.

The sitemap https://arvectum.com/sitemap.xml had been submitted earlier but remained queued for processing in the current HTTP property.

## Implemented changes

1. Canonical host cleanup:
   - www HTTPS URLs redirect to the apex HTTPS host;
   - /index.html redirects to /;
   - legacy /ru and obsolete nested route shapes redirect to current canonical pages.
2. Search-intent alignment:
   - procurement, tender-agent, RFQ, contract-risk, document-check and closed-loop titles/descriptions were aligned to observed query language;
   - broad procurement content now explains a concrete six-step automation route including RFQ, TКП and supplier-selection support.
3. Internal discovery:
   - procurement landing page links directly to practical procurement, RFQ, contract-risk and TКП materials.
4. Snippet hygiene:
   - duplicate titles were removed;
   - app privacy descriptions were made page-specific;
   - overly long Photo Size titles were shortened;
   - the homepage description was shortened while preserving its positioning.
5. Crawl/search presentation:
   - stable /favicon.ico link without cache-busting query;
   - SoftwareApplication JSON-LD for Photo Size;
   - SEO quality checks added to CI for all indexable HTML pages.
6. Regression protection:
   - production health checks now require canonical redirects for www, /index.html, /ru and selected legacy paths.

## Expected evidence window

Immediate evidence after deployment:

- HTTP redirect contract;
- current sitemap content and status;
- successful production health checks;
- successful IndexNow notification.

Search-engine evidence is delayed. Re-evaluate CTR/rank/indexing only after the engines have recrawled and Search Console/Webmaster have refreshed. Do not attribute short-term ranking movement to this release without enough observations.
