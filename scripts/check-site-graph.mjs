import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const publicDir = path.join(root, "public");
const failures = [];

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });

const normalize = (value) => value.split(path.sep).join("/");
const htmlFiles = walk(publicDir).filter((file) => file.endsWith(".html"));

const canonicalFor = (html) =>
  html.match(
    /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i,
  )?.[1] || "";

const robotsFor = (html) =>
  html
    .match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i)?.[1]
    ?.toLowerCase() || "";

const hrefsFor = (html) =>
  [...html.matchAll(/<a[^>]+href=["']([^"']+)["']/gi)].map((match) => match[1]);

const pages = new Map();
for (const file of htmlFiles) {
  const rel = normalize(path.relative(publicDir, file));
  const html = fs.readFileSync(file, "utf8");
  pages.set(rel, {
    html,
    canonical: canonicalFor(html),
    robots: robotsFor(html),
    hrefs: hrefsFor(html),
  });
}

const indexable = new Set(
  [...pages.entries()]
    .filter(
      ([, page]) =>
        page.canonical.startsWith("https://arvectum.com") &&
        !page.robots.includes("noindex"),
    )
    .map(([rel]) => rel),
);

const resolveInternal = (sourceRel, href) => {
  if (
    !href ||
    href.startsWith("#") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("javascript:")
  )
    return null;

  let url;
  try {
    url = new URL(href, "https://arvectum.com/" + sourceRel);
  } catch {
    return null;
  }

  if (!["arvectum.com", "www.arvectum.com"].includes(url.hostname)) return null;

  let pathname = decodeURIComponent(url.pathname || "/");
  if (pathname === "/") return "index.html";
  let rel = pathname.replace(/^\/+/, "");
  if (rel.endsWith("/")) rel += "index.html";

  if (pages.has(rel)) return rel;

  if (!path.extname(rel)) {
    const htmlCandidate = rel + ".html";
    if (pages.has(htmlCandidate)) return htmlCandidate;
    const indexCandidate = rel + "/index.html";
    if (pages.has(indexCandidate)) return indexCandidate;
  }

  return { missing: rel, href };
};

const edges = new Map([...pages.keys()].map((rel) => [rel, new Set()]));
const inbound = new Map([...pages.keys()].map((rel) => [rel, 0]));

for (const [source, page] of pages) {
  for (const href of page.hrefs) {
    const target = resolveInternal(source, href);
    if (!target) continue;
    if (typeof target === "object") {
      const fileLike = /\.[A-Za-z0-9]{1,8}$/.test(target.missing);
      if (
        fileLike &&
        !target.missing.startsWith("api/") &&
        !target.missing.startsWith("assets/")
      ) {
        failures.push(source + ": broken internal link " + href);
      }
      continue;
    }
    edges.get(source).add(target);
    inbound.set(target, (inbound.get(target) || 0) + 1);
  }
}

const distance = new Map([["index.html", 0]]);
const queue = ["index.html"];
while (queue.length) {
  const source = queue.shift();
  for (const target of edges.get(source) || []) {
    if (!distance.has(target)) {
      distance.set(target, distance.get(source) + 1);
      queue.push(target);
    }
  }
}

for (const rel of indexable) {
  if (rel !== "index.html" && (inbound.get(rel) || 0) === 0) {
    failures.push(rel + ": indexable orphan page");
  }
  if (!distance.has(rel)) {
    failures.push(rel + ": indexable page unreachable from homepage");
  } else if (distance.get(rel) > 3) {
    failures.push(rel + ": click depth " + distance.get(rel) + " exceeds 3");
  }
}

const configMain = fs.readFileSync(
  path.join(publicDir, "site-config.js"),
  "utf8",
);
const configLocales = fs.readFileSync(
  path.join(publicDir, "site-config-locales.js"),
  "utf8",
);
const routesBlock =
  configMain.match(/routes:\s*\{([\s\S]*?)\n\s*\},\n\s*languages:/)?.[1] || "";
const routeKeys = new Set(
  [...routesBlock.matchAll(/^\s*([A-Za-z][A-Za-z0-9_]*)\s*:/gm)].map(
    (m) => m[1],
  ),
);
const slugRefs = new Set(
  [
    ...(configMain + "\n" + configLocales).matchAll(
      /slug:\s*["']([A-Za-z][A-Za-z0-9_]*)["']/g,
    ),
  ].map((m) => m[1]),
);
for (const slug of slugRefs) {
  if (!routeKeys.has(slug))
    failures.push("undefined SITE_CONFIG route slug: " + slug);
}

const retired = [
  "pushkin-privacy.html",
  "photo-pod-razmer-privacy.html",
  "solutions/contract-risk-ai-review.html",
  "solutions/tender-department-ai-agent.html",
];
for (const [source, page] of pages) {
  for (const retiredPath of retired) {
    if (page.html.includes(retiredPath)) {
      failures.push(source + ": references retired route " + retiredPath);
    }
  }
}

if (failures.length) {
  console.error("Site graph checks failed:\n");
  failures.forEach((failure) => console.error("- " + failure));
  process.exit(1);
}

const depths = [...indexable].map((rel) => distance.get(rel) ?? Infinity);
console.log(
  "Site graph checks passed: " +
    indexable.size +
    " indexable pages, 0 orphans, max click depth " +
    Math.max(...depths),
);
