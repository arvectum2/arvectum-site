import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const outputDir =
  process.env.SEO_REPORT_DIR ||
  "/Volumes/ArvectumSSD/Arvectum/runtime/arvectum-site-seo/reports";

const runOptional = (script, credentialVar) => {
  const credential = process.env[credentialVar];
  if (!credential || !fs.existsSync(credential)) {
    return { ok: null, skipped: credentialVar + " not configured" };
  }
  const result = spawnSync(process.execPath, [script, "report"], {
    cwd: process.cwd(),
    env: process.env,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    return {
      ok: false,
      error: String(result.stderr || result.stdout || "")
        .trim()
        .slice(0, 4000),
    };
  }
  try {
    return { ok: true, data: JSON.parse(result.stdout) };
  } catch {
    return { ok: false, error: "Invalid JSON from " + script };
  }
};

const report = {
  generatedAt: new Date().toISOString(),
  google: runOptional(
    "scripts/seo-google.mjs",
    "GOOGLE_SEARCH_CONSOLE_CREDENTIALS_FILE",
  ),
  yandex: runOptional("scripts/seo-yandex.mjs", "YANDEX_WEBMASTER_TOKEN_FILE"),
};

fs.mkdirSync(outputDir, { recursive: true });
const date = new Date().toISOString().slice(0, 10);
const file = path.join(outputDir, date + ".json");
fs.writeFileSync(file, JSON.stringify(report, null, 2) + "\n");

console.log(
  JSON.stringify(
    {
      report: file,
      google: report.google.ok ?? report.google.skipped,
      yandex: report.yandex.ok ?? report.yandex.skipped,
    },
    null,
    2,
  ),
);
