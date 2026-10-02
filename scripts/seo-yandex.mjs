import fs from "node:fs";

const tokenFile = process.env.YANDEX_WEBMASTER_TOKEN_FILE;
if (!tokenFile || !fs.existsSync(tokenFile)) {
  console.error("YANDEX_WEBMASTER_TOKEN_FILE is not configured");
  process.exit(2);
}

const token = fs.readFileSync(tokenFile, "utf8").trim();
const headers = { Authorization: "OAuth " + token };

const request = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) },
  });
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  if (!response.ok)
    throw new Error(response.status + " " + JSON.stringify(body));
  return body;
};

const user = await request("https://api.webmaster.yandex.net/v4/user");
const userId = user.user_id;

const hosts = await request(
  "https://api.webmaster.yandex.net/v4/user/" +
    encodeURIComponent(userId) +
    "/hosts",
);
const host = (hosts.hosts || []).find((item) =>
  String(item.ascii_host_url || item.unicode_host_url || "").includes(
    "arvectum.com",
  ),
);

if (!host) {
  console.error("arvectum.com not found in Yandex Webmaster account");
  process.exit(3);
}

const hostId = host.host_id;
const hostBase =
  "https://api.webmaster.yandex.net/v4/user/" +
  encodeURIComponent(userId) +
  "/hosts/" +
  encodeURIComponent(hostId);

const mode = process.argv[2] || "report";

if (mode === "sync-sitemap") {
  const endpoint = hostBase + "/user-added-sitemaps";
  const current = await request(endpoint);
  const sitemapUrl = "https://arvectum.com/sitemap.xml";
  const found = (current.sitemaps || []).find(
    (item) => item.sitemap_url === sitemapUrl,
  );

  if (!found) {
    const created = await request(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url: sitemapUrl }),
    });
    console.log(JSON.stringify({ added: true, sitemap: created }, null, 2));
  } else {
    console.log(JSON.stringify({ added: false, sitemap: found }, null, 2));
  }
  process.exit(0);
}

if (mode !== "report") {
  console.error("Usage: node scripts/seo-yandex.mjs [sync-sitemap|report]");
  process.exit(2);
}

const [diagnostics, sitemaps, queriesByShows, queriesByClicks] =
  await Promise.all([
    request(hostBase + "/diagnostics"),
    request(hostBase + "/sitemaps?limit=100"),
    request(
      hostBase +
        "/search-queries/popular?order_by=TOTAL_SHOWS" +
        "&query_indicator=TOTAL_SHOWS&query_indicator=TOTAL_CLICKS" +
        "&query_indicator=AVG_SHOW_POSITION&limit=100",
    ),
    request(
      hostBase +
        "/search-queries/popular?order_by=TOTAL_CLICKS" +
        "&query_indicator=TOTAL_SHOWS&query_indicator=TOTAL_CLICKS" +
        "&query_indicator=AVG_SHOW_POSITION&limit=100",
    ),
  ]);

console.log(
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      host,
      diagnostics,
      sitemaps,
      queriesByShows,
      queriesByClicks,
    },
    null,
    2,
  ),
);
