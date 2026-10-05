import { readFile } from "node:fs/promises";
import path from "node:path";

import { REPO_ROOT, dataPlatform, ensureConsumerContract } from "./client.mjs";

const query = process.argv.slice(2).join(" ").trim();
if (!query) {
  console.error(
    "Usage: node scripts/data-platform/search-products.mjs <query>",
  );
  process.exit(2);
}

const stateFile =
  process.env.DATA_PLATFORM_PRODUCT_STATE_FILE ||
  path.join(
    REPO_ROOT,
    "..",
    "..",
    "runtime",
    "arvectum-site-seo",
    "data-platform-products-state.json",
  );
const state = JSON.parse(await readFile(stateFile, "utf8"));
if (!state.active_collection_id) {
  throw new Error("No active product metadata collection.");
}

await ensureConsumerContract();
const payload = await dataPlatform.search({
  query,
  collections: [state.active_collection_id],
  limit: 8,
  mode: "hybrid",
});

console.log("Collection:", state.active_collection_id);
console.log("Query:", query);
console.log("Hits:", payload.hits?.length || 0);
for (const [index, hit] of (payload.hits || []).entries()) {
  console.log("");
  console.log(`#${index + 1} score=${(hit.scores?.fusion || 0).toFixed(6)}`);
  console.log(hit.title);
  console.log(hit.canonical_uri);
  console.log(hit.preview);
  const evidence = hit.evidence?.[0];
  if (evidence) {
    console.log(
      `evidence resource=${evidence.resource_id} document=${evidence.document_id} chunk=${evidence.chunk_id}`,
    );
  }
}
