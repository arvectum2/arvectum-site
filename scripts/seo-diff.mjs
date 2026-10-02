import { seoDiff } from "./seo-lib.mjs";

const [fromRef, toRef = "HEAD"] = process.argv.slice(2);
if (!fromRef) {
  console.error("Usage: node scripts/seo-diff.mjs <from-ref> [to-ref]");
  process.exit(2);
}

console.log(JSON.stringify(seoDiff(fromRef, toRef), null, 2));
