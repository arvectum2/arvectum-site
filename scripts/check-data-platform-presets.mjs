import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  GROWTH_SEARCH_PROFILE,
  productCollectionId,
  researchCollectionId,
  siteCollectionId,
} from "./data-platform/presets.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

if (siteCollectionId("rev") !== "growth:arvectum-site:rev") throw new Error("site collection namespace drift");
if (productCollectionId("rev") !== "growth:products:rev") throw new Error("product collection namespace drift");
if (researchCollectionId("query", "rev") !== "growth:research:query:rev") throw new Error("research collection namespace drift");
if (GROWTH_SEARCH_PROFILE.lexicalWeight !== 1 || GROWTH_SEARCH_PROFILE.vectorWeight !== 1) {
  throw new Error("growth ranking profile drift");
}

const dataDir = path.join(root, "scripts", "data-platform");
for (const name of (await readdir(dataDir)).filter((item) => item.endsWith(".mjs"))) {
  if (name === "presets.mjs") continue;
  const source = await readFile(path.join(dataDir, name), "utf8");
  if (source.includes("dataPlatform.search({")) {
    throw new Error(`Raw Data Platform search is forbidden in ${name}; use searchWithProfile`);
  }
  if (/growth:(?:arvectum-site|products|research):/.test(source)) {
    throw new Error(`Raw Growth collection ID is forbidden in ${name}; use presets.mjs`);
  }
}

console.log("Data Platform consumer presets OK");
