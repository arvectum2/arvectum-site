import { readFile } from "node:fs/promises";
import path from "node:path";

import { REPO_ROOT, dataPlatform, ensureConsumerContract } from "./client.mjs";

const args = process.argv.slice(2);
const collectionAt = args.indexOf("--collection");
let collectionId = null;
if (collectionAt >= 0) {
  collectionId = args[collectionAt + 1] || null;
  args.splice(collectionAt, 2);
}
const query = args.join(" ").trim();
if (!query) {
  console.error(
    "Usage: node scripts/data-platform/search-research.mjs [--collection id] <query>",
  );
  process.exit(2);
}

if (!collectionId) {
  const stateFile =
    process.env.DATA_PLATFORM_RESEARCH_STATE_FILE ||
    path.join(
      REPO_ROOT,
      "..",
      "..",
      "runtime",
      "arvectum-site-seo",
      "data-platform-research-state.json",
    );
  const state = JSON.parse(await readFile(stateFile, "utf8"));
  collectionId = state.collections?.[0]?.collection_id || null;
}
if (!collectionId) {
  throw new Error("No research collection is available.");
}

await ensureConsumerContract();
const payload = await dataPlatform.search({
  query,
  collections: [collectionId],
  limit: 8,
  mode: "hybrid",
});

console.log("Collection:", collectionId);
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
