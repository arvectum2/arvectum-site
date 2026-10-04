import { execFileSync } from "node:child_process";

const baseUrl = (process.env.ARVECTUM_DATA_BASE_URL || "http://127.0.0.1:8094").replace(/\/$/, "");
const siteUrl = process.env.GROWTH_SITE_URL || "https://arvectum.com";
const owner = "growth";
const defaultLimit = 100;

const getRevision = () =>
  execFileSync("git", ["rev-parse", "--short=12", "HEAD"], {
    cwd: process.cwd(),
    encoding: "utf8",
  }).trim();

const collectionId = () => `growth:arvectum-site:${getRevision()}`;

const request = async (method, path, payload) => {
  const response = await fetch(baseUrl + path, {
    method,
    headers: payload ? { "content-type": "application/json" } : undefined,
    body: payload ? JSON.stringify(payload) : undefined,
  });
  const raw = await response.text();
  let body = raw;
  try {
    body = raw ? JSON.parse(raw) : null;
  } catch {
    // Keep non-JSON response text for diagnostics.
  }
  if (!response.ok) {
    const detail =
      typeof body === "string" ? body : JSON.stringify(body ?? {});
    throw new Error(
      `Data Platform ${method} ${path} returned HTTP ${response.status}: ${detail.slice(0, 500)}`,
    );
  }
  return body;
};

const encodedCollectionPath = (id) =>
  "/v1/collections/" + encodeURIComponent(id);

const ensureCollection = async (id) => {
  const response = await fetch(baseUrl + encodedCollectionPath(id));
  if (response.status === 200) {
    return response.json();
  }
  if (response.status !== 404) {
    const detail = await response.text();
    throw new Error(
      `Data Platform collection lookup returned HTTP ${response.status}: ${detail.slice(0, 500)}`,
    );
  }
  return request("POST", "/v1/collections", {
    collection_id: id,
    owner,
    name: `arvectum.com ${getRevision()}`,
    default_language: "russian",
  });
};

const discoverSite = async (limit = defaultLimit) =>
  request("POST", "/v1/discover", {
    connector: "sitemap",
    query: `${siteUrl}/sitemap.xml`,
    limit,
  });

const indexSite = async () => {
  const id = collectionId();
  await ensureCollection(id);
  const discovery = await discoverSite();
  const resources = discovery.resources || [];
  const summary = {
    collectionId: id,
    revision: getRevision(),
    discovered: resources.length,
    indexed: 0,
    failed: [],
    chunks: 0,
    embeddings: 0,
    warnings: discovery.warnings || [],
  };

  for (const [offset, resource] of resources.entries()) {
    const url = resource.canonical_uri;
    try {
      const result = await request("POST", "/v1/ingest/url", {
        collection_id: id,
        url,
        title: resource.title || null,
      });
      summary.indexed += 1;
      summary.chunks += Number(result.chunks || 0);
      summary.embeddings += Number(result.embeddings || 0);
      process.stderr.write(
        `[${offset + 1}/${resources.length}] indexed ${url} (${result.chunks || 0} chunks)\n`,
      );
    } catch (error) {
      summary.failed.push({
        url,
        error: String(error?.message || error).slice(0, 500),
      });
      process.stderr.write(
        `[${offset + 1}/${resources.length}] failed ${url}: ${String(error?.message || error).slice(0, 200)}\n`,
      );
    }
  }

  const stats = await request("GET", encodedCollectionPath(id) + "/stats");
  console.log(JSON.stringify({ ...summary, stats }, null, 2));
  if (summary.failed.length > 0) {
    process.exitCode = 2;
  }
};

const status = async () => {
  const id = collectionId();
  try {
    const stats = await request("GET", encodedCollectionPath(id) + "/stats");
    console.log(
      JSON.stringify(
        {
          collectionId: id,
          revision: getRevision(),
          available: true,
          stats,
        },
        null,
        2,
      ),
    );
  } catch (error) {
    console.log(
      JSON.stringify(
        {
          collectionId: id,
          revision: getRevision(),
          available: false,
          error: String(error?.message || error),
        },
        null,
        2,
      ),
    );
    process.exitCode = 1;
  }
};

const search = async (query) => {
  if (!query?.trim()) {
    throw new Error("search query must not be blank");
  }
  const id = collectionId();
  const payload = await request("POST", "/v1/search", {
    query,
    collections: [id],
    limit: 10,
    mode: "hybrid",
  });
  console.log(
    JSON.stringify(
      {
        collectionId: id,
        revision: getRevision(),
        query,
        hits: (payload.hits || []).map((hit) => ({
          title: hit.title,
          canonicalUri: hit.canonical_uri,
          preview: hit.preview,
          scores: hit.scores,
        })),
      },
      null,
      2,
    ),
  );
};

const command = process.argv[2];
if (command === "index-site") {
  await indexSite();
} else if (command === "status") {
  await status();
} else if (command === "search") {
  await search(process.argv.slice(3).join(" "));
} else {
  console.error(
    [
      "Usage:",
      "  node scripts/growth-data-platform.mjs index-site",
      "  node scripts/growth-data-platform.mjs status",
      '  node scripts/growth-data-platform.mjs search "query"',
    ].join("\n"),
  );
  process.exitCode = 64;
}
