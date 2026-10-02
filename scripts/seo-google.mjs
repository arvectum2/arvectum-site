import crypto from "node:crypto";
import fs from "node:fs";
import { discoverIndexablePages } from "./seo-lib.mjs";

const credentialsFile = process.env.GOOGLE_SEARCH_CONSOLE_CREDENTIALS_FILE;
if (!credentialsFile || !fs.existsSync(credentialsFile)) {
  console.error("GOOGLE_SEARCH_CONSOLE_CREDENTIALS_FILE is not configured");
  process.exit(2);
}

const credentials = JSON.parse(fs.readFileSync(credentialsFile, "utf8"));
const b64 = (value) => Buffer.from(value).toString("base64url");
const now = Math.floor(Date.now() / 1000);

const header = b64(
  JSON.stringify({
    alg: "RS256",
    typ: "JWT",
    kid: credentials.private_key_id,
  }),
);
const claim = b64(
  JSON.stringify({
    iss: credentials.client_email,
    scope: "https://www.googleapis.com/auth/webmasters",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  }),
);

const signer = crypto.createSign("RSA-SHA256");
signer.update(header + "." + claim);
const assertion =
  header +
  "." +
  claim +
  "." +
  signer.sign(credentials.private_key, "base64url");

const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
  method: "POST",
  headers: { "content-type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion,
  }),
});
const tokenBody = await tokenResponse.json();
if (!tokenResponse.ok || !tokenBody.access_token) {
  console.error("Google OAuth failed: " + JSON.stringify(tokenBody));
  process.exit(3);
}

const accessToken = tokenBody.access_token;
const headers = { Authorization: "Bearer " + accessToken };

const jsonRequest = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) },
  });
  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!response.ok)
    throw new Error(response.status + " " + JSON.stringify(body).slice(0, 800));
  return body;
};

const sites = await jsonRequest(
  "https://www.googleapis.com/webmasters/v3/sites",
);
const entries = sites.siteEntry || [];
const site =
  entries.find((item) => item.siteUrl === "sc-domain:arvectum.com") ||
  entries.find((item) => item.siteUrl === "https://arvectum.com/") ||
  entries.find((item) => String(item.siteUrl).includes("arvectum.com"));

if (!site) {
  console.error("arvectum.com is not available to the Google service account");
  process.exit(4);
}
const siteUrl = site.siteUrl;
const mode = process.argv[2] || "report";

const webmastersBase =
  "https://www.googleapis.com/webmasters/v3/sites/" +
  encodeURIComponent(siteUrl);

if (mode === "submit-sitemap") {
  const sitemapUrl = "https://arvectum.com/sitemap.xml";
  await jsonRequest(
    webmastersBase + "/sitemaps/" + encodeURIComponent(sitemapUrl),
    { method: "PUT" },
  );
  console.log(
    JSON.stringify(
      {
        submitted: true,
        siteUrl,
        sitemapUrl,
        serviceAccount: credentials.client_email,
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

const dateString = (date) => date.toISOString().slice(0, 10);
const end = new Date();
end.setUTCDate(end.getUTCDate() - 3);
const start = new Date(end);
start.setUTCDate(start.getUTCDate() - 27);
const previousEnd = new Date(start);
previousEnd.setUTCDate(previousEnd.getUTCDate() - 1);
const previousStart = new Date(previousEnd);
previousStart.setUTCDate(previousStart.getUTCDate() - 27);

const analytics = async (from, to) =>
  jsonRequest(webmastersBase + "/searchAnalytics/query", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      startDate: dateString(from),
      endDate: dateString(to),
      dimensions: ["query", "page"],
      rowLimit: 500,
      dataState: "final",
    }),
  });

if (mode !== "report") {
  console.error("Usage: node scripts/seo-google.mjs [submit-sitemap|report]");
  process.exit(2);
}

const [sitemaps, current, previous] = await Promise.all([
  jsonRequest(webmastersBase + "/sitemaps"),
  analytics(start, end),
  analytics(previousStart, previousEnd),
]);

const inspections = [];
for (const page of discoverIndexablePages().slice(0, 50)) {
  try {
    const result = await jsonRequest(
      "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          inspectionUrl: page.url,
          siteUrl,
          languageCode: "ru-RU",
        }),
      },
    );
    inspections.push({
      url: page.url,
      ok: true,
      result: result.inspectionResult || null,
    });
  } catch (error) {
    inspections.push({
      url: page.url,
      ok: false,
      error: String(error.message || error),
    });
  }
}

console.log(
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      serviceAccount: credentials.client_email,
      site,
      periods: {
        current: [dateString(start), dateString(end)],
        previous: [dateString(previousStart), dateString(previousEnd)],
      },
      sitemaps,
      current,
      previous,
      inspections,
    },
    null,
    2,
  ),
);
