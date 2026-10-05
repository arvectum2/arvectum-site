import { readFile } from "node:fs/promises";
import path from "node:path";

import { REPO_ROOT, dataPlatform, ensureConsumerContract } from "./client.mjs";
import { GROWTH_SEARCH_PROFILE } from "./presets.mjs";

const dryRun = process.argv.includes("--dry-run");

const productStateFile =
  process.env.DATA_PLATFORM_PRODUCT_STATE_FILE ||
  path.join(
    REPO_ROOT,
    "..",
    "..",
    "runtime",
    "arvectum-site-seo",
    "data-platform-products-state.json",
  );

const state = JSON.parse(await readFile(productStateFile, "utf8"));
if (!state.active_collection_id) {
  throw new Error("No active product metadata collection.");
}
if (!Array.isArray(state.products) || !state.products.length) {
  throw new Error("Product state contains no products.");
}

await ensureConsumerContract();

async function resolveExact(entityType, aliasKind, value) {
  const payload = await dataPlatform.resolveEntity({
    entityType,
    value,
    aliasKind,
    limit: 20,
  });
  if (payload.status === "ambiguous") {
    throw new Error(
      `Ambiguous entity identity for ${entityType}/${aliasKind}: ${value}`,
    );
  }
  return payload.status === "resolved" ? payload.candidates[0] : null;
}

async function ensureEntity({
  entityType,
  canonicalName,
  identifierKind,
  identifierValue,
  aliases = [],
  metadata = {},
}) {
  const existing = await resolveExact(
    entityType,
    identifierKind,
    identifierValue,
  );
  if (existing) {
    return { entity: existing, created: false };
  }

  if (dryRun) {
    return {
      entity: {
        entity_id: `dry-run:${entityType}:${identifierValue}`,
        entity_type: entityType,
        canonical_name: canonicalName,
      },
      created: true,
    };
  }

  const entity = await dataPlatform.createEntity({
    entityType,
    canonicalName,
    aliases: [
      {
        alias_kind: identifierKind,
        value: identifierValue,
        metadata: { stable_identifier: true },
      },
      ...aliases,
    ],
    metadata,
  });
  return { entity, created: true };
}

async function exactProductHit(product) {
  const payload = await dataPlatform.searchWithProfile({
    query: product.title,
    collections: [state.active_collection_id],
    profile: GROWTH_SEARCH_PROFILE,
    limit: 8,
  });
  const hit = (payload.hits || []).find(
    (item) => item.canonical_uri === product.canonical_uri,
  );
  if (!hit) {
    throw new Error(
      `No exact product hit for canonical URI ${product.canonical_uri}`,
    );
  }
  return hit;
}

const organizationResult = await ensureEntity({
  entityType: "organization",
  canonicalName: "Arvectum",
  identifierKind: "domain",
  identifierValue: "arvectum.com",
  aliases: [
    {
      alias_kind: "name",
      value: "Арвектум",
      metadata: { language: "ru" },
    },
  ],
  metadata: {
    canonical_uri: "https://arvectum.com/",
    source: "arvectum-site",
  },
});

console.log(
  `Organization: ${organizationResult.entity.entity_id} (${
    organizationResult.created ? "created" : "existing"
  })`,
);

let createdProducts = 0;
let existingProducts = 0;
let relations = 0;

for (const product of state.products) {
  const productResult = await ensureEntity({
    entityType: "product",
    canonicalName: product.title,
    identifierKind: "canonical_uri",
    identifierValue: product.canonical_uri,
    aliases: [
      {
        alias_kind: "slug",
        value: product.product_id,
      },
    ],
    metadata: {
      canonical_uri: product.canonical_uri,
      description: product.description || "",
      source: "arvectum-site",
    },
  });

  if (productResult.created) createdProducts += 1;
  else existingProducts += 1;

  const hit = await exactProductHit(product);
  const evidence = hit.evidence?.[0];
  if (!evidence) {
    throw new Error(`No evidence for product ${product.product_id}`);
  }

  if (!dryRun) {
    const relation = await dataPlatform.createEntityRelation({
      sourceEntityId: organizationResult.entity.entity_id,
      targetEntityId: productResult.entity.entity_id,
      relationType: "publishes",
      sourceCollectionId: state.active_collection_id,
      resourceId: evidence.resource_id,
      documentId: evidence.document_id,
      chunkId: evidence.chunk_id,
      metadata: {
        canonical_uri: product.canonical_uri,
        source: "arvectum-site",
      },
    });
    relations += 1;
    console.log(
      `Product: ${product.product_id} -> ${productResult.entity.entity_id} (${
        productResult.created ? "created" : "existing"
      }), relation=${relation.relation_id}`,
    );
  } else {
    console.log(
      `Product: ${product.product_id} -> ${productResult.entity.entity_id} (dry-run), provenance chunk=${evidence.chunk_id}`,
    );
  }
}

console.log("Collection:", state.active_collection_id);
console.log("Products created:", createdProducts);
console.log("Products existing:", existingProducts);
console.log("Relations:", relations);
console.log("Dry run:", dryRun);
