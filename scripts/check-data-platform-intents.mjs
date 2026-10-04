import assert from "node:assert/strict";

import {
  applyPreferredLanding,
  preferredLanding,
} from "./data-platform/landing-intents.mjs";

assert.equal(
  preferredLanding("уменьшить фото до нужного размера в пикселях")?.canonicalUri,
  "https://arvectum.com/tools/photo-size/resize-pixels.html",
);
assert.equal(
  preferredLanding("сжать фото до 500 КБ на айфоне")?.canonicalUri,
  "https://arvectum.com/tools/photo-size/compress-to-kb.html",
);
assert.equal(
  preferredLanding("подготовить фото 35 на 45")?.canonicalUri,
  "https://arvectum.com/tools/photo-size/35x45.html",
);
assert.equal(preferredLanding("агент для тендерного отдела"), null);

const hits = [
  { canonical_uri: "https://arvectum.com/tools/index.html" },
  { canonical_uri: "https://arvectum.com/tools/photo-size/index.html" },
  { canonical_uri: "https://arvectum.com/tools/photo-size/resize-pixels.html" },
];

const promoted = applyPreferredLanding(
  "уменьшить фото до нужного размера в пикселях",
  hits,
);
assert.equal(promoted.applied, true);
assert.equal(
  promoted.hits[0].canonical_uri,
  "https://arvectum.com/tools/photo-size/resize-pixels.html",
);
assert.equal(hits[0].canonical_uri, "https://arvectum.com/tools/index.html");

const untouched = applyPreferredLanding("агент для тендерного отдела", hits);
assert.equal(untouched.applied, false);
assert.deepEqual(untouched.hits, hits);

console.log("Data Platform landing-intent checks passed");

const seoCases = [
  ["автоматизировать закупки", "https://arvectum.com/solutions/procurement.html"],
  ["автоматизация тендеров", "https://arvectum.com/services/ai-tender-agent.html"],
  ["ии для проверки документов", "https://arvectum.com/solutions/ai-document-checks.html"],
  ["ии агент для закупок", "https://arvectum.com/solutions/procurement-ai-agents.html"],
  ["автоматизация выбора поставщика", "https://arvectum.com/solutions/procurement.html"],
  ["ии в закрытом контуре", "https://arvectum.com/solutions/closed-loop-ai-documents.html"],
  ["система для rfq", "https://arvectum.com/services/rfq-automation.html"],
  ["rfq тендер", "https://arvectum.com/services/rfq-automation.html"],
  ["rfq что это такое в закупках", "https://arvectum.com/materials/rfq-automation-guide.html"],
  ["сравнение ткп", "https://arvectum.com/services/tkp-comparison.html"],
  ["сравнительный анализ ткп", "https://arvectum.com/services/tkp-comparison.html"],
  ["ооо арвектум", "https://arvectum.com/"],
];

for (const [query, expected] of seoCases) {
  assert.equal(preferredLanding(query)?.canonicalUri, expected, query);
}
