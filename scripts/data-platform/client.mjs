import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(SCRIPT_DIR, "../..");
export const PUBLIC_ROOT = path.join(REPO_ROOT, "public");
export const SITEMAP_PATH = path.join(PUBLIC_ROOT, "sitemap.xml");

export const DATA_PLATFORM_URL =
  process.env.DATA_PLATFORM_URL || "http://127.0.0.1:8094";

export const STATE_FILE =
  process.env.DATA_PLATFORM_STATE_FILE ||
  path.join(
    REPO_ROOT,
    "..",
    "..",
    "runtime",
    "arvectum-site-seo",
    "data-platform-state.json",
  );

export function requestHeaders(extra = {}) {
  const headers = { ...extra };
  if (process.env.DATA_PLATFORM_API_KEY) {
    headers["X-Arvectum-Key"] = process.env.DATA_PLATFORM_API_KEY;
  }
  return headers;
}

export async function dataPlatformFetch(route, options = {}) {
  const response = await fetch(new URL(route, DATA_PLATFORM_URL), {
    ...options,
    headers: requestHeaders(options.headers || {}),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Data Platform ${options.method || "GET"} ${route} returned ${response.status}: ${body.slice(0, 500)}`,
    );
  }
  return response;
}

export function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

export async function readSitemapEntries() {
  const xml = await readFile(SITEMAP_PATH, "utf8");
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) =>
    match[1].trim(),
  );
  if (!urls.length) {
    throw new Error("public/sitemap.xml contains no canonical URLs");
  }

  const entries = [];
  for (const canonicalUri of urls) {
    const url = new URL(canonicalUri);
    if (url.hostname !== "arvectum.com") {
      throw new Error(`Unexpected sitemap hostname: ${url.hostname}`);
    }
    const relativePath =
      url.pathname === "/" ? "index.html" : decodeURIComponent(url.pathname.slice(1));
    const filePath = path.join(PUBLIC_ROOT, relativePath);
    const content = await readFile(filePath);
    const html = content.toString("utf8");
    const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
    entries.push({
      canonicalUri,
      relativePath,
      filePath,
      content,
      title: titleMatch?.[1]?.trim() || relativePath,
      sha256: sha256(content),
    });
  }
  return entries;
}

export function manifestFor(entries) {
  const manifestText = entries
    .map((entry) => `${entry.canonicalUri}\t${entry.sha256}`)
    .sort()
    .join("\n");
  const revision = sha256(manifestText).slice(0, 16);
  return {
    revision,
    collectionId: `growth:arvectum-site:${revision}`,
    manifestHash: sha256(manifestText),
  };
}

export async function readState() {
  try {
    return JSON.parse(await readFile(STATE_FILE, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
}

export async function writeState(state) {
  await mkdir(path.dirname(STATE_FILE), { recursive: true });
  await writeFile(STATE_FILE, JSON.stringify(state, null, 2) + "\n", "utf8");
}

export async function ensureCollection(collectionId) {
  const lookup = await fetch(
    new URL(`/v1/collections/${encodeURIComponent(collectionId)}`, DATA_PLATFORM_URL),
    { headers: requestHeaders() },
  );
  if (lookup.ok) return lookup.json();
  if (lookup.status !== 404) {
    throw new Error(
      `Data Platform collection lookup returned ${lookup.status}: ${await lookup.text()}`,
    );
  }
  const created = await dataPlatformFetch("/v1/collections", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      collection_id: collectionId,
      owner: "growth",
      name: "Arvectum public website",
      default_language: "russian",
    }),
  });
  return created.json();
}

export async function ingestHtml(entry, collectionId) {
  const form = new FormData();
  form.set("collection_id", collectionId);
  form.set("title", entry.title);
  form.set("canonical_uri", entry.canonicalUri);
  form.set(
    "file",
    new Blob([entry.content], { type: "text/html; charset=utf-8" }),
    path.basename(entry.filePath),
  );
  const response = await dataPlatformFetch("/v1/ingest/document", {
    method: "POST",
    body: form,
  });
  return response.json();
}

export async function collectionStats(collectionId) {
  const response = await dataPlatformFetch(
    `/v1/collections/${encodeURIComponent(collectionId)}/stats`,
  );
  return response.json();
}
