import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const failures = [];
const record = (condition, message) => {
  if (!condition) failures.push(message);
};

const tracked = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
  .split("\0")
  .filter(Boolean);

const forbiddenTracked = [
  /^public\/\.env(?:$|\.(?!example$))/,
  /^public\/api\/storage\/.*\.(?:jsonl|log|db|sqlite)$/i,
  /(^|\/)__MACOSX\//,
  /^\.github\/workflows\/(?:\.trigger|trigger-)/,
];

for (const file of tracked) {
  for (const pattern of forbiddenTracked) {
    record(!pattern.test(file), "forbidden tracked runtime/generated file -> " + file);
  }
}

record(!fs.existsSync(path.join(root, "public/.env")), "public/.env must remain local/server-only");

const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
record(packageJson.name === "arvectum-site", "package.json name must be arvectum-site");

const wrangler = fs.readFileSync(path.join(root, "wrangler.toml"), "utf8");
record(/name\s*=\s*"arvectum-site"/.test(wrangler), "wrangler project name must be arvectum-site");

const activeIdentityFiles = [
  "README.md",
  "DEPLOY_CHECKLIST.md",
  "package.json",
  "wrangler.toml",
  ".github/workflows/mirror-to-gitverse.yml",
  "docs/seo/procurement_ai_positioning_guardrails.md",
];

for (const rel of activeIdentityFiles) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) continue;
  const content = fs.readFileSync(full, "utf8");
  record(!content.includes("arvectum-landing"), rel + ": stale arvectum-landing identity");
}

const brandDir = path.join(root, "public/assets/brand");
const hashGroups = new Map();

for (const name of fs.readdirSync(brandDir)) {
  const full = path.join(brandDir, name);
  if (!fs.statSync(full).isFile()) continue;
  const hash = crypto.createHash("sha256").update(fs.readFileSync(full)).digest("hex");
  const group = hashGroups.get(hash) || [];
  group.push(name);
  hashGroups.set(hash, group);
}

for (const group of hashGroups.values()) {
  record(group.length === 1, "duplicate runtime brand assets -> " + group.join(", "));
}

if (failures.length) {
  console.error("Repository checks failed:\n");
  failures.forEach((failure) => console.error("- " + failure));
  process.exit(1);
}

console.log("Repository checks passed");
