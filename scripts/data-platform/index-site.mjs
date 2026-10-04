import {
  DATA_PLATFORM_URL,
  STATE_FILE,
  collectionStats,
  ensureCollection,
  ingestHtml,
  manifestFor,
  readSitemapEntries,
  readState,
  writeState,
} from "./client.mjs";

const dryRun = process.argv.includes("--dry-run");
const force = process.argv.includes("--force");

const entries = await readSitemapEntries();
const manifest = manifestFor(entries);
const previous = await readState();

console.log("Data Platform:", DATA_PLATFORM_URL);
console.log("Sitemap pages:", entries.length);
console.log("Revision:", manifest.revision);
console.log("Collection:", manifest.collectionId);

if (!force && previous?.active_collection_id === manifest.collectionId) {
  console.log("No content changes detected; active collection already matches manifest.");
  process.exit(0);
}

if (dryRun) {
  console.log("Dry run: no collection or documents were written.");
  process.exit(0);
}

await ensureCollection(manifest.collectionId);

let chunks = 0;
let embeddings = 0;
for (const [index, entry] of entries.entries()) {
  const result = await ingestHtml(entry, manifest.collectionId);
  chunks += Number(result.chunks || 0);
  embeddings += Number(result.embeddings || 0);
  console.log(
    `[${index + 1}/${entries.length}] ${entry.relativePath}: chunks=${result.chunks || 0}, embeddings=${result.embeddings || 0}`,
  );
}

const stats = await collectionStats(manifest.collectionId);
if (stats.resources !== entries.length || stats.documents !== entries.length) {
  throw new Error(
    `Incomplete site index: expected ${entries.length} resources/documents, got resources=${stats.resources}, documents=${stats.documents}`,
  );
}
if (stats.chunks < entries.length || stats.embeddings !== stats.chunks) {
  throw new Error(
    `Incomplete search index: chunks=${stats.chunks}, embeddings=${stats.embeddings}`,
  );
}

await writeState({
  active_collection_id: manifest.collectionId,
  revision: manifest.revision,
  manifest_hash: manifest.manifestHash,
  indexed_at: new Date().toISOString(),
  sitemap_pages: entries.length,
  resources: stats.resources,
  documents: stats.documents,
  chunks: stats.chunks,
  embeddings: stats.embeddings,
  previous_collection_id: previous?.active_collection_id || null,
});

console.log("Indexed successfully.");
console.log("Stats:", JSON.stringify(stats));
console.log("State:", STATE_FILE);
console.log("This collection is now the active Growth/SEO site index.");
