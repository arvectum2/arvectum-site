import {
  DATA_PLATFORM_URL,
  dataPlatform,
  ensureConsumerContract,
} from "./client.mjs";

const args = process.argv.slice(2);
const connectorIndex = args.indexOf("--connector");
let connector = "duckduckgo_html";
if (connectorIndex >= 0) {
  connector = args[connectorIndex + 1] || connector;
  args.splice(connectorIndex, 2);
}

const query = args.join(" ").trim();
if (!query) {
  console.error(
    "Usage: node scripts/data-platform/discover-web.mjs [--connector name] <query>",
  );
  process.exit(2);
}

await ensureConsumerContract();
const payload = await dataPlatform.discover({
  connector,
  query,
  limit: 10,
});

console.log("Data Platform:", DATA_PLATFORM_URL);
console.log("Connector:", connector);
console.log("Query:", query);
console.log("Resources:", payload.resources?.length || 0);

for (const item of payload.resources || []) {
  console.log("");
  console.log(`#${item.rank || "?"} ${item.title || ""}`);
  console.log(item.canonical_uri);
  if (item.snippet) console.log(item.snippet);
}
