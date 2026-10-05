import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { DataPlatformClient } from "@arvectum/data-platform-client";

import { siteCollectionId } from "./presets.mjs";

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

export const dataPlatform = new DataPlatformClient({
  baseUrl: DATA_PLATFORM_URL,
  apiKey: process.env.DATA_PLATFORM_API_KEY || "",
  consumer: process.env.DATA_PLATFORM_CONSUMER || "",
  consumerKey: process.env.DATA_PLATFORM_CONSUMER_KEY || "",
});

let contractPromise = null;

export function ensureConsumerContract() {
  contractPromise ||= dataPlatform.requireContract(1);
  return contractPromise;
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
      url.pathname === "/"
        ? "index.html"
        : decodeURIComponent(url.pathname.slice(1));
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
    collectionId: siteCollectionId(revision),
    manifestHash: sha256(manifestText),
  };
}

export async function readState(stateFile = STATE_FILE) {
  try {
    return JSON.parse(await readFile(stateFile, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
}

export async function writeState(state, stateFile = STATE_FILE) {
  await mkdir(path.dirname(stateFile), { recursive: true });
  await writeFile(stateFile, JSON.stringify(state, null, 2) + "\n", "utf8");
}

export async function ensureCollection(
  collectionId,
  {
    owner = "growth",
    name = "Arvectum public website",
    defaultLanguage = "russian",
  } = {},
) {
  await ensureConsumerContract();
  return dataPlatform.ensureCollection(collectionId, {
    owner,
    name,
    defaultLanguage,
  });
}

export async function ingestHtml(entry, collectionId) {
  await ensureConsumerContract();
  return dataPlatform.ingestDocument({
    collectionId,
    canonicalUri: entry.canonicalUri,
    title: entry.title,
    content: entry.content,
    filename: path.basename(entry.filePath),
    contentType: "text/html; charset=utf-8",
  });
}

export async function collectionStats(collectionId) {
  await ensureConsumerContract();
  return dataPlatform.collectionStats(collectionId);
}
