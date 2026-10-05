import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const publicDir = path.join(root, "public");
const failures = [];

const fail = (condition, message) => {
  if (!condition) failures.push(message);
};

const normalizeText = (value) =>
  String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const allHtml = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (full.endsWith(".html")) allHtml.push(full);
  }
};
walk(publicDir);

const pages = [];
for (const file of allHtml) {
  const rel = path.relative(publicDir, file).split(path.sep).join("/");
  const html = fs.readFileSync(file, "utf8");
  const robots =
    html
      .match(/<meta[^>]+name="robots"[^>]+content="([^"]+)"/i)?.[1]
      ?.toLowerCase() || "";
  if (robots.includes("noindex")) continue;

  const title = normalizeText(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]);
  const description =
    html.match(/<meta[^>]+name="description"[^>]+content="([^"]+)"/i)?.[1] ||
    "";
  const canonical =
    html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i)?.[1] || "";
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  const expectedCanonical =
    rel === "index.html"
      ? "https://arvectum.com/"
      : rel === "privacy.html"
        ? "https://arvectum.com/privacy"
        : "https://arvectum.com/" + rel;

  pages.push({ rel, title, description, canonical });

  fail(
    title.length >= 20 && title.length <= 70,
    rel + ": title length " + title.length + " is outside 20..70",
  );
  fail(
    description.length >= 60 && description.length <= 180,
    rel + ": description length " + description.length + " is outside 60..180",
  );
  fail(h1Count === 1, rel + ": expected exactly one H1, found " + h1Count);
  fail(
    canonical === expectedCanonical,
    rel + ": canonical must be " + expectedCanonical,
  );
  fail(!canonical.includes("www."), rel + ": canonical must not use www");
  fail(!canonical.startsWith("http://"), rel + ": canonical must use HTTPS");
  fail(
    /<link[^>]+rel="shortcut icon"[^>]+href="\/favicon\.ico"/i.test(html),
    rel + ": stable root favicon shortcut is required",
  );
}

const unique = (field, label) => {
  const seen = new Map();
  for (const page of pages) {
    const value = page[field];
    if (!value) continue;
    if (seen.has(value)) {
      failures.push(
        "duplicate " + label + ": " + seen.get(value) + " and " + page.rel,
      );
    } else {
      seen.set(value, page.rel);
    }
  }
};
unique("title", "title");
unique("description", "description");

const photoSize = fs.readFileSync(
  path.join(publicDir, "tools/photo-size/index.html"),
  "utf8",
);
fail(
  /id="softwareApplicationLd"[^>]+type="application\/ld\+json"/i.test(
    photoSize,
  ),
  "tools/photo-size/index.html: missing SoftwareApplication JSON-LD",
);

if (failures.length) {
  console.error("SEO quality checks failed:\n");
  failures.forEach((failure) => console.error("- " + failure));
  process.exit(1);
}

console.log(
  "SEO quality checks passed for " + pages.length + " indexable HTML pages.",
);
