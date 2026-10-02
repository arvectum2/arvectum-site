import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { seoDiff } from "./seo-lib.mjs";

const [fromRef, toRef = "HEAD"] = process.argv.slice(2);
if (!fromRef) {
  console.error(
    "Usage: node scripts/seo-post-deploy.mjs <previous-sha> [new-sha]",
  );
  process.exit(2);
}

const evidenceDir =
  process.env.SEO_EVIDENCE_DIR ||
  "/Volumes/ArvectumSSD/Arvectum/runtime/arvectum-site-seo/deployments";
const diff = seoDiff(fromRef, toRef);

const run = (script, args = [], input = "") => {
  const result = spawnSync(process.execPath, [script, ...args], {
    cwd: process.cwd(),
    env: process.env,
    input,
    encoding: "utf8",
  });
  return {
    ok: result.status === 0,
    status: result.status,
    stdout: String(result.stdout || "").trim(),
    stderr: String(result.stderr || "").trim(),
  };
};

const actions = {};

if (
  process.env.INDEXNOW_KEY_FILE &&
  fs.existsSync(process.env.INDEXNOW_KEY_FILE)
) {
  actions.indexNow = run("scripts/seo-indexnow.mjs", [], JSON.stringify(diff));
} else {
  actions.indexNow = { ok: null, skipped: "INDEXNOW_KEY_FILE not configured" };
}

if (
  process.env.GOOGLE_SEARCH_CONSOLE_CREDENTIALS_FILE &&
  fs.existsSync(process.env.GOOGLE_SEARCH_CONSOLE_CREDENTIALS_FILE)
) {
  actions.googleSitemap = run("scripts/seo-google.mjs", ["submit-sitemap"]);
} else {
  actions.googleSitemap = {
    ok: null,
    skipped: "GOOGLE_SEARCH_CONSOLE_CREDENTIALS_FILE not configured",
  };
}

if (
  process.env.YANDEX_WEBMASTER_TOKEN_FILE &&
  fs.existsSync(process.env.YANDEX_WEBMASTER_TOKEN_FILE)
) {
  actions.yandexSitemap = run("scripts/seo-yandex.mjs", ["sync-sitemap"]);
} else {
  actions.yandexSitemap = {
    ok: null,
    skipped: "YANDEX_WEBMASTER_TOKEN_FILE not configured",
  };
}

const evidence = {
  generatedAt: new Date().toISOString(),
  diff,
  actions,
};

fs.mkdirSync(evidenceDir, { recursive: true });
const safeSha = String(toRef).replace(/[^A-Za-z0-9._-]/g, "_");
const output = path.join(evidenceDir, safeSha + ".json");
fs.writeFileSync(output, JSON.stringify(evidence, null, 2) + "\n");

console.log(
  JSON.stringify(
    {
      evidence: output,
      changedUrls: diff.notify.length,
      actions: Object.fromEntries(
        Object.entries(actions).map(([name, value]) => [
          name,
          value.ok ?? value.skipped,
        ]),
      ),
    },
    null,
    2,
  ),
);
