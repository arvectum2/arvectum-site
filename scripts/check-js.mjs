import fs from "node:fs";
import path from "node:path";

const publicDir = path.join(process.cwd(), "public");
const failures = [];

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });

for (const filePath of walk(publicDir).filter((file) => file.endsWith(".js"))) {
  const rel = path.relative(process.cwd(), filePath).split(path.sep).join("/");
  try {
    new Function(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    failures.push(rel + ": " + error.message);
  }
}

if (failures.length) {
  console.error("JavaScript syntax checks failed:\n");
  failures.forEach((failure) => console.error("- " + failure));
  process.exit(1);
}

console.log("JavaScript syntax checks passed");
