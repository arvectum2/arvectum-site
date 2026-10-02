import fs from "node:fs";

const keyFile = process.env.INDEXNOW_KEY_FILE;
if (!keyFile || !fs.existsSync(keyFile)) {
  console.error("INDEXNOW_KEY_FILE is not configured");
  process.exit(2);
}

const key = fs.readFileSync(keyFile, "utf8").trim();
if (!/^[A-Za-z0-9-]{8,128}$/.test(key)) {
  console.error("Invalid IndexNow key format");
  process.exit(2);
}

const input = await new Promise((resolve) => {
  let data = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (chunk) => (data += chunk));
  process.stdin.on("end", () => resolve(data));
});

const parsed = JSON.parse(input || "{}");
const urls = [...new Set(parsed.notify || parsed.urls || [])].filter((url) =>
  String(url).startsWith("https://arvectum.com"),
);

if (!urls.length) {
  console.log(JSON.stringify({ skipped: true, reason: "no changed URLs" }));
  process.exit(0);
}

const keyLocation = "https://arvectum.com/" + key + ".txt";
const response = await fetch("https://yandex.com/indexnow", {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host: "arvectum.com",
    key,
    keyLocation,
    urlList: urls.slice(0, 10000),
  }),
});

const body = await response.text();
if (![200, 202].includes(response.status)) {
  console.error(
    "IndexNow failed: HTTP " + response.status + " " + body.slice(0, 500),
  );
  process.exit(1);
}

console.log(
  JSON.stringify({
    status: response.status,
    keyLocation,
    submitted: Math.min(urls.length, 10000),
  }),
);
