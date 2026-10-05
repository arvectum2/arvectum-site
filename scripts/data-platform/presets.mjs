import { buildCollectionId } from "@arvectum/data-platform-client";

export const GROWTH_SEARCH_PROFILE = Object.freeze({
  mode: "hybrid",
  lexicalWeight: 1,
  vectorWeight: 1,
  queryVariantWeight: 0.5,
  collapseByCanonicalUri: false,
});

export function siteCollectionId(revision) {
  return buildCollectionId("growth", "arvectum-site", revision);
}

export function productCollectionId(revision) {
  return buildCollectionId("growth", "products", revision);
}

export function researchCollectionId(queryHash, revision) {
  return buildCollectionId("growth", "research", queryHash, revision);
}
