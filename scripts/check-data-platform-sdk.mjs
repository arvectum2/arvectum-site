import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  CONSUMER_CONTRACT_MAJOR,
  DataPlatformClient,
} from "@arvectum/data-platform-client";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const artifactName = "arvectum-data-platform-client-0.3.0.tgz";
const artifactPath = path.join(repoRoot, "vendor", artifactName);
const expectedSha256 =
  "3300a992887c5cbf3bc832f2abed0c83d13600863620e9bb8728b58b23e5260c";

const artifact = await readFile(artifactPath);
const actualSha256 = createHash("sha256").update(artifact).digest("hex");
if (actualSha256 !== expectedSha256) {
  throw new Error(
    `Data Platform SDK artifact checksum mismatch: expected ${expectedSha256}, got ${actualSha256}`,
  );
}

if (CONSUMER_CONTRACT_MAJOR !== 1) {
  throw new Error(
    `Unsupported Data Platform consumer contract major: ${CONSUMER_CONTRACT_MAJOR}`,
  );
}

const probe = new DataPlatformClient({
  baseUrl: "http://127.0.0.1:8094",
  fetchImpl: async () =>
    new Response(JSON.stringify({ query: null, hits: [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }),
});
if (!(probe instanceof DataPlatformClient)) {
  throw new Error("Data Platform SDK import is not usable");
}

const dataScriptsDir = path.join(repoRoot, "scripts", "data-platform");
const files = (await readdir(dataScriptsDir))
  .filter((name) => name.endsWith(".mjs"))
  .sort();
for (const name of files) {
  const source = await readFile(path.join(dataScriptsDir, name), "utf8");
  if (source.includes("dataPlatformFetch")) {
    throw new Error(
      `Direct Data Platform transport helper is forbidden in ${name}; use the shared SDK`,
    );
  }
}

const packageLock = await readFile(
  path.join(repoRoot, "package-lock.json"),
  "utf8",
);
if (
  !packageLock.includes("file:vendor/arvectum-data-platform-client-0.3.0.tgz")
) {
  throw new Error(
    "package-lock.json does not pin the vendored Data Platform SDK",
  );
}

console.log(
  `Data Platform SDK boundary OK: contract v${CONSUMER_CONTRACT_MAJOR}, sha256=${actualSha256}`,
);
