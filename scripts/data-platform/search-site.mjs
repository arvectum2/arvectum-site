import { rankPreferredLanding, preferredLanding } from "./landing-intents.mjs";
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

const resultLimit = 8;
const response = await dataPlatformFetch("/v1/search", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    query,
    collections: [state.active_collection_id],
    limit: resultLimit,
    mode: "hybrid",
  }),
});
const payload = await response.json();

const preference = preferredLanding(query);
let fallbackHits = [];
if (
  preference &&
  !(payload.hits || []).some(
    (hit) => hit?.canonical_uri === preference.canonicalUri,
  )
) {
  const fallbackResponse = await dataPlatformFetch("/v1/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      collections: [state.active_collection_id],
      filters: {
        canonical_uri: [preference.canonicalUri],
      },
      limit: 1,
      mode: "hybrid",
    }),
  });
  const fallbackPayload = await fallbackResponse.json();
  fallbackHits = fallbackPayload.hits || [];
}

const ranked = rankPreferredLanding(
  query,
  payload.hits || [],
  fallbackHits,
  { limit: resultLimit },
);

console.log("Data Platform:", DATA_PLATFORM_URL);
console.log("Collection:", state.active_collection_id);
console.log("Query:", query);
console.log("Hits:", ranked.hits.length);
if (ranked.preference) {
  console.log(
    `Preferred landing: ${ranked.preference.intentId} -> ${ranked.preference.canonicalUri} (${ranked.status})`,
  );
}

for (const [index, hit] of ranked.hits.entries()) {
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
