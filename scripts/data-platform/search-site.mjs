import {
  DATA_PLATFORM_URL,
  dataPlatformFetch,
  readState,
} from "./client.mjs";

const query = process.argv.slice(2).join(" ").trim();
if (!query) {
  console.error("Usage: npm run data:search -- <query>");
  process.exit(2);
}

const state = await readState();
if (!state?.active_collection_id) {
  throw new Error(
    "No active Data Platform site collection. Run npm run data:index first.",
  );
}

const response = await dataPlatformFetch("/v1/search", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    query,
    collections: [state.active_collection_id],
    limit: 8,
    mode: "hybrid",
  }),
});
const payload = await response.json();

console.log("Data Platform:", DATA_PLATFORM_URL);
console.log("Collection:", state.active_collection_id);
console.log("Query:", query);
console.log("Hits:", payload.hits?.length || 0);

for (const [index, hit] of (payload.hits || []).entries()) {
  const score = hit.scores?.fusion ?? 0;
  console.log("");
  console.log(`#${index + 1} score=${score.toFixed(6)}`);
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
