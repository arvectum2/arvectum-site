import fs from "node:fs";
import path from "node:path";
import { renderSitemap } from "./seo-lib.mjs";

const target = path.join(process.cwd(), "public", "sitemap.xml");
const check = process.argv.includes("--check");
const expected = renderSitemap(check ? "HEAD" : "WORKTREE");

if (check) {
  const actual = fs.readFileSync(target, "utf8");
  if (actual !== expected) {
    console.error(
      "sitemap.xml is stale. Run: node scripts/seo-generate-sitemap.mjs",
    );
    process.exit(1);
  }
  console.log("SEO sitemap check passed");
} else {
  fs.writeFileSync(target, expected);
  console.log("Updated public/sitemap.xml");
}
