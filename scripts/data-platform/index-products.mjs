import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import {
  PUBLIC_ROOT,
  REPO_ROOT,
  STATE_FILE,
  collectionStats,
  dataPlatform,
  ensureCollection,
  sha256,
  writeState,
} from "./client.mjs";
import { productCollectionId } from "./presets.mjs";

function decodeHtml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&nbsp;", " ")
    .replace(/\s+/g, " ")
    .trim();
}

function textFromTag(html, tag) {
  const match = html.match(
    new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"),
  );
  if (!match) return "";
  return decodeHtml(match[1].replace(/<[^>]+>/g, " "));
}

function metaContent(html, name) {
  const patterns = [
    new RegExp(
      `<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']*)["'][^>]*>`,
      "i",
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']*)["'][^>]+name=["']${name}["'][^>]*>`,
      "i",
    ),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return decodeHtml(match[1]);
  }
  return "";
}

function canonicalUrl(html) {
  const patterns = [
    /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/i,
    /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["'][^>]*>/i,
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return match[1].trim();
  }
  return "";
}

async function productEntries() {
  const toolsRoot = path.join(PUBLIC_ROOT, "tools");
  const dirs = await readdir(toolsRoot, { withFileTypes: true });
  const entries = [];
  for (const dir of dirs
    .filter((item) => item.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name))) {
    const filePath = path.join(toolsRoot, dir.name, "index.html");
    let html;
    try {
      html = await readFile(filePath, "utf8");
    } catch (error) {
      if (error?.code === "ENOENT") continue;
      throw error;
    }
    const canonical = canonicalUrl(html);
    if (!canonical) {
      throw new Error(`Product landing page has no canonical URL: ${filePath}`);
    }
    const h1 = textFromTag(html, "h1");
    const title = textFromTag(html, "title");
    const description = metaContent(html, "description");
    const h2s = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)]
      .map((match) => decodeHtml(match[1].replace(/<[^>]+>/g, " ")))
      .filter(Boolean);
    const text = [
      `Product: ${h1 || title}`,
      `Page title: ${title}`,
      `Description: ${description}`,
      `Canonical URL: ${canonical}`,
      h2s.length ? `Sections: ${h2s.join("; ")}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    entries.push({
      productId: dir.name,
      canonical,
      title: h1 || title || dir.name,
      description,
      text,
      sha256: sha256(text),
    });
  }
  if (!entries.length) {
    throw new Error(
      "No public product landing pages found under public/tools/*/index.html",
    );
  }
  return entries;
}

const entries = await productEntries();
const manifestText = entries
  .map((item) => `${item.productId}\t${item.canonical}\t${item.sha256}`)
  .sort()
  .join("\n");
const revision = sha256(manifestText).slice(0, 16);
const collectionId = productCollectionId(revision);

await ensureCollection(collectionId, {
  owner: "growth-products",
  name: "Arvectum public product metadata",
  defaultLanguage: "russian",
});

for (const [index, entry] of entries.entries()) {
  const result = await dataPlatform.ingestDocument({
    collectionId,
    canonicalUri: entry.canonical,
    title: entry.title,
    content: entry.text,
    filename: `${entry.productId}.txt`,
    contentType: "text/plain; charset=utf-8",
    preChunked: true,
  });
  console.log(
    `[${index + 1}/${entries.length}] ${entry.productId}: chunks=${result.chunks || 0}, embeddings=${result.embeddings || 0}`,
  );
}

const stats = await collectionStats(collectionId);
if (
  stats.resources !== entries.length ||
  stats.documents !== entries.length ||
  stats.chunks !== entries.length ||
  stats.embeddings !== entries.length
) {
  throw new Error(
    `Product metadata index is inconsistent: expected ${entries.length} each, got ${JSON.stringify(stats)}`,
  );
}

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

await writeState(
  {
    active_collection_id: collectionId,
    revision,
    indexed_at: new Date().toISOString(),
    products: entries.map((item) => ({
      product_id: item.productId,
      canonical_uri: item.canonical,
      title: item.title,
      description: item.description,
      sha256: item.sha256,
    })),
    stats,
  },
  productStateFile,
);

console.log("Product collection:", collectionId);
console.log("Products:", entries.length);
console.log("Stats:", JSON.stringify(stats));
console.log("State:", productStateFile);
