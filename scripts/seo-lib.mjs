import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

export const SITE_ORIGIN = "https://arvectum.com";

const root = process.cwd();
const publicDir = path.join(root, "public");
const normalize = (value) => value.split(path.sep).join("/");

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });

export const canonicalForHtml = (html) =>
  html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i)?.[1] || "";

export const robotsForHtml = (html) =>
  html
    .match(/<meta[^>]+name="robots"[^>]+content="([^"]+)"/i)?.[1]
    ?.toLowerCase() || "";

export const isIndexableHtml = (html) => {
  const canonical = canonicalForHtml(html);
  return (
    canonical.startsWith(SITE_ORIGIN) &&
    !robotsForHtml(html).includes("noindex")
  );
};

export const discoverIndexablePages = () =>
  walk(publicDir)
    .filter((file) => file.endsWith(".html"))
    .map((file) => {
      const html = fs.readFileSync(file, "utf8");
      return {
        file,
        rel: normalize(path.relative(publicDir, file)),
        url: canonicalForHtml(html),
        html,
      };
    })
    .filter((page) => isIndexableHtml(page.html))
    .sort((a, b) => a.url.localeCompare(b.url));

export const lastModifiedFor = (rel, ref = "HEAD") => {
  const gitPath = normalize(path.posix.join("public", rel));
  if (ref === "WORKTREE") {
    const dirty = execFileSync(
      "git",
      ["status", "--porcelain", "--", gitPath],
      { encoding: "utf8" },
    ).trim();
    if (dirty) return new Date().toISOString().slice(0, 10);
    ref = "HEAD";
  }
  const value = execFileSync(
    "git",
    ["log", "-1", "--format=%cs", ref, "--", gitPath],
    {
      encoding: "utf8",
    },
  ).trim();
  return value || new Date().toISOString().slice(0, 10);
};

export const xmlEscape = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

export const renderSitemap = (ref = "WORKTREE") => {
  const rows = discoverIndexablePages().map((page) => {
    const lastmod = lastModifiedFor(page.rel, ref);
    return [
      "  <url>",
      "    <loc>" + xmlEscape(page.url) + "</loc>",
      "    <lastmod>" + lastmod + "</lastmod>",
      "  </url>",
    ].join("\n");
  });
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...rows,
    "</urlset>",
    "",
  ].join("\n");
};

const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();

const readAtRef = (ref, gitPath) => {
  try {
    return execFileSync("git", ["show", ref + ":" + gitPath], {
      encoding: "utf8",
    });
  } catch {
    return "";
  }
};

const indexablePagesAtRef = (ref) => {
  const names = git("ls-tree", "-r", "--name-only", ref, "public")
    .split("\n")
    .filter((name) => name.endsWith(".html"));
  const map = new Map();
  for (const gitPath of names) {
    const html = readAtRef(ref, gitPath);
    if (!html || !isIndexableHtml(html)) continue;
    map.set(gitPath, canonicalForHtml(html));
  }
  return map;
};

export const seoDiff = (fromRef, toRef) => {
  const before = indexablePagesAtRef(fromRef);
  const after = indexablePagesAtRef(toRef);
  const changedPaths = git(
    "diff",
    "--name-only",
    fromRef,
    toRef,
    "--",
    "public",
  )
    .split("\n")
    .filter(Boolean);

  const globalSeoChange = changedPaths.some((name) =>
    [
      "public/site-config.js",
      "public/site-config-locales.js",
      "public/app.js",
    ].includes(name),
  );

  const added = [];
  const changed = [];
  const deleted = [];

  for (const [file, url] of after) {
    if (!before.has(file)) added.push(url);
    else if (
      globalSeoChange ||
      changedPaths.includes(file) ||
      before.get(file) !== url
    )
      changed.push(url);
  }
  for (const [file, url] of before) {
    if (!after.has(file)) deleted.push(url);
  }

  return {
    from: fromRef,
    to: toRef,
    globalSeoChange,
    added: [...new Set(added)].sort(),
    changed: [...new Set(changed)].sort(),
    deleted: [...new Set(deleted)].sort(),
    notify: [...new Set([...added, ...changed, ...deleted])].sort(),
  };
};
