import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  REPO_ROOT,
  collectionStats,
  dataPlatform,
  ensureCollection,
  ensureConsumerContract,
  sha256,
} from "./client.mjs";

const rawArgs = process.argv.slice(2);
const queryParts = [];
let connector = "duckduckgo_html";
let limit = 5;
let minSuccess = 3;

for (let index = 0; index < rawArgs.length; index += 1) {
  const value = rawArgs[index];
  if (value === "--connector") {
    connector = rawArgs[++index] || connector;
  } else if (value === "--limit") {
    limit = Number(rawArgs[++index] || limit);
  } else if (value === "--min-success") {
    minSuccess = Number(rawArgs[++index] || minSuccess);
  } else {
    queryParts.push(value);
  }
}

const query = queryParts.join(" ").trim();
if (!query) {
  console.error(
    "Usage: node scripts/data-platform/research-web.mjs [--limit 5] [--min-success 3] <query>",
  );
  process.exit(2);
}
if (!Number.isInteger(limit) || limit < 1 || limit > 20) {
  throw new Error("--limit must be an integer between 1 and 20");
}
if (!Number.isInteger(minSuccess) || minSuccess < 1 || minSuccess > limit) {
  throw new Error("--min-success must be between 1 and --limit");
}

await ensureConsumerContract();
const discovery = await dataPlatform.discover({ connector, query, limit });
const resources = (discovery.resources || []).slice(0, limit);
if (!resources.length) {
  throw new Error(
    "Discovery returned no resources; research collection was not created.",
  );
}

const manifestText = [
  connector,
  query,
  ...resources.map((item) => item.canonical_uri),
].join("\n");
const queryHash = sha256(query).slice(0, 10);
const revision = sha256(manifestText).slice(0, 16);
const collectionId = `growth:research:${queryHash}:${revision}`;

await ensureCollection(collectionId, {
  owner: "growth-research",
  name: `Growth research: ${query}`,
  defaultLanguage: "english",
});

const successes = [];
const failures = [];

for (const [index, resource] of resources.entries()) {
  try {
    const result = await dataPlatform.ingestUrl({
      collectionId,
      url: resource.canonical_uri,
      title: resource.title || null,
    });
    successes.push({
      canonical_uri: resource.canonical_uri,
      title: resource.title || null,
      chunks: Number(result.chunks || 0),
      embeddings: Number(result.embeddings || 0),
    });
    console.log(
      `[${index + 1}/${resources.length}] OK ${resource.canonical_uri} chunks=${result.chunks || 0}`,
    );
  } catch (error) {
    failures.push({
      canonical_uri: resource.canonical_uri,
      title: resource.title || null,
      error: String(error?.message || error),
    });
    console.warn(
      `[${index + 1}/${resources.length}] FAILED ${resource.canonical_uri}: ${error?.message || error}`,
    );
  }
}

if (successes.length < minSuccess) {
  throw new Error(
    `Research acceptance failed: ${successes.length} successful pages, minimum is ${minSuccess}`,
  );
}

const stats = await collectionStats(collectionId);
if (
  stats.resources !== successes.length ||
  stats.documents !== successes.length ||
  stats.chunks < successes.length ||
  stats.embeddings !== stats.chunks
) {
  throw new Error(
    `Research index is inconsistent: successes=${successes.length}, resources=${stats.resources}, documents=${stats.documents}, chunks=${stats.chunks}, embeddings=${stats.embeddings}`,
  );
}

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

let state = { collections: [] };
try {
  state = JSON.parse(await readFile(stateFile, "utf8"));
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
}
const previousCollections = Array.isArray(state.collections)
  ? state.collections
  : [];
const record = {
  collection_id: collectionId,
  query,
  query_hash: queryHash,
  connector,
  revision,
  created_at: new Date().toISOString(),
  discovered: resources.length,
  indexed: successes.length,
  failed: failures.length,
  stats,
  sources: successes,
  failures,
};
state.collections = [
  record,
  ...previousCollections.filter((item) => item.query_hash !== queryHash),
].slice(0, 50);

await mkdir(path.dirname(stateFile), { recursive: true });
await writeFile(stateFile, JSON.stringify(state, null, 2) + "\n", "utf8");

console.log("Research collection:", collectionId);
console.log("Indexed:", successes.length, "Failed:", failures.length);
console.log("Stats:", JSON.stringify(stats));
console.log("State:", stateFile);
