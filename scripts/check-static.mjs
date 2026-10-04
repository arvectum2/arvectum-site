import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const publicDir = path.join(rootDir, "public");
const sitemapPath = path.join(publicDir, "sitemap.xml");
const robotsPath = path.join(publicDir, "robots.txt");
const siteConfigPath = path.join(publicDir, "site-config.js");
const cssPath = path.join(publicDir, "styles.css");

const failures = [];

const record = (condition, message) => {
  if (!condition) failures.push(message);
};

const walk = (dir) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const result = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      result.push(...walk(fullPath));
    } else {
      result.push(fullPath);
    }
  }
  return result;
};

const allFiles = walk(publicDir);
const htmlFiles = allFiles
  .filter((filePath) => filePath.endsWith(".html"))
  .map((filePath) =>
    path.relative(publicDir, filePath).split(path.sep).join("/"),
  )
  .sort();
const htmlSet = new Set(htmlFiles);

const publicIndexablePages = [
  "index.html",
  "solutions.html",
  "solutions/procurement.html",
  "solutions/document-workflow.html",
  "solutions/operations.html",
  "solutions/ai-document-checks.html",
  "approach.html",
  "contact.html",
  "materials.html",
  "materials/how-to-choose-first-process.html",
  "materials/ai-automation-simple.html",
  "materials/chatbot-vs-process-automation.html",
  "materials/mvp-automation-2-4-weeks.html",
  "privacy.html",
  "personal-data-consent.html",
  "cookies.html",
];

const materialArticlePages = [
  "materials/how-to-choose-first-process.html",
  "materials/ai-automation-simple.html",
  "materials/chatbot-vs-process-automation.html",
  "materials/mvp-automation-2-4-weeks.html",
];

const hiddenPages = [
  "cases.html",
  "health.html",
  "favicon-preview.html",
  "thank-you.html",
];

const faviconFiles = [
  "favicon.ico",
  "assets/brand/favicon.svg",
  "assets/brand/favicon-16x16.png",
  "assets/brand/favicon-32x32.png",
  "assets/brand/favicon-48x48.png",
  "assets/brand/apple-touch-icon.png",
];

const sitemap = fs.readFileSync(sitemapPath, "utf8");
const sitemapUrls = Array.from(
  sitemap.matchAll(/<loc>([^<]+)<\/loc>/g),
  (match) => match[1],
);
const robotsContent = fs.readFileSync(robotsPath, "utf8");
const siteConfigContent = fs.readFileSync(siteConfigPath, "utf8");
const cssContent = fs.readFileSync(cssPath, "utf8");
const legacyHomepageH1 =
  "Автоматизируем процессы, где теряются документы, статусы и сроки";
const previousHomepageH1 =
  "Помогаем навести порядок в сложных бизнес-процессах";
const incomingLinks = new Map(
  htmlFiles.map((fileName) => [fileName, new Set()]),
);
const pageMeta = new Map();

const isExternalUrl = (value) =>
  /^(?:[a-z]+:|\/\/|#)/i.test(value) ||
  value.startsWith("mailto:") ||
  value.startsWith("tel:");

const stripQuery = (value) => value.split("#")[0].split("?")[0];

const resolvePublicPath = (fromRel, rawHref) => {
  const cleaned = stripQuery(rawHref);
  if (!cleaned) return "";
  if (cleaned === "/") return "index.html";
  if (cleaned.startsWith("/")) {
    return cleaned.replace(/^\/+/, "");
  }
  return path.posix.normalize(
    path.posix.join(path.posix.dirname(fromRel), cleaned),
  );
};

const toCanonicalUrl = (relPath) =>
  relPath === "index.html"
    ? "https://arvectum.com/"
    : `https://arvectum.com/${relPath}`;

const readHtml = (relPath) =>
  fs.readFileSync(path.join(publicDir, relPath), "utf8");

const normalizeText = (value) =>
  String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const extractTitle = (html) =>
  normalizeText(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || "");

const extractDescription = (html) =>
  html.match(/<meta[^>]+name="description"[^>]+content="([^"]+)"/i)?.[1] || "";

const extractCanonical = (html) =>
  html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i)?.[1] || "";

const extractH1s = (html) =>
  Array.from(html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi), (match) =>
    normalizeText(match[1]),
  ).filter(Boolean);

const isThinAliasPage = (html) =>
  /<meta[^>]+name="robots"[^>]+content="noindex,follow"/i.test(html) &&
  /<meta[^>]+http-equiv="refresh"/i.test(html);

const getJsonLd = (html, id) => {
  const match = html.match(
    new RegExp(
      `<script[^>]+id="${id}"[^>]*type="application/ld\\+json"[^>]*>([\\s\\S]*?)<\\/script>`,
      "i",
    ),
  );
  if (!match) return null;
  try {
    return JSON.parse(match[1].trim());
  } catch (_) {
    return "INVALID";
  }
};

for (const fileName of publicIndexablePages) {
  record(htmlSet.has(fileName), `missing expected page -> ${fileName}`);
}

for (const filePath of faviconFiles) {
  record(
    fs.existsSync(path.join(publicDir, filePath)),
    `Missing favicon asset -> ${filePath}`,
  );
}

for (const fileName of htmlFiles) {
  const html = readHtml(fileName);
  const title = extractTitle(html);
  const description = extractDescription(html);
  const canonical = extractCanonical(html);
  const h1s = extractH1s(html);
  pageMeta.set(fileName, { title, description, canonical, h1s });

  const hasTitle = title.length > 0;
  const hasDescription = description.length > 0;
  const hasCanonical = canonical.length > 0;

  record(hasTitle, `${fileName}: missing or empty <title>`);
  record(hasDescription, `${fileName}: missing meta description`);
  record(hasCanonical, `${fileName}: missing canonical link`);
  record(
    !html.includes("/Users/"),
    `${fileName}: must not contain local machine paths`,
  );
  record(
    !html.includes("file://"),
    `${fileName}: must not contain file:// links`,
  );
  record(
    !html.includes("Сайт работает без JavaScript"),
    `${fileName}: must not show public no-JavaScript messaging`,
  );

  record(
    /<link[^>]+rel="icon"[^>]+type="image\/svg\+xml"[^>]+href="\/assets\/brand\/favicon\.svg\?v=20260616-seo24"/i.test(
      html,
    ),
    `${fileName}: missing SVG favicon link`,
  );
  record(
    /<link[^>]+rel="icon"[^>]+sizes="32x32"[^>]+href="\/assets\/brand\/favicon-32x32\.png\?v=20260616-seo24"/i.test(
      html,
    ),
    `${fileName}: missing 32x32 favicon link`,
  );
  record(
    /<link[^>]+rel="icon"[^>]+sizes="16x16"[^>]+href="\/assets\/brand\/favicon-16x16\.png\?v=20260616-seo24"/i.test(
      html,
    ),
    `${fileName}: missing 16x16 favicon link`,
  );
  record(
    /<link[^>]+rel="apple-touch-icon"[^>]+href="\/assets\/brand\/apple-touch-icon\.png\?v=20260616-seo24"/i.test(
      html,
    ),
    `${fileName}: missing apple-touch-icon link`,
  );
  record(
    /<link[^>]+rel="shortcut icon"[^>]+href="\/favicon\.ico"/i.test(
      html,
    ),
    `${fileName}: missing shortcut icon link`,
  );

  const hrefs = Array.from(
    html.matchAll(/\b(?:href|src)="([^"]+)"/g),
    (match) => match[1],
  );

  for (const href of hrefs) {
    if (isExternalUrl(href)) continue;
    const resolved = resolvePublicPath(fileName, href);
    if (!resolved) continue;
    const fullPath = path.join(publicDir, resolved);

    if (resolved.endsWith(".html")) {
      record(
        htmlSet.has(resolved),
        `${fileName}: broken local HTML link -> ${href}`,
      );
      if (htmlSet.has(resolved) && resolved !== fileName) {
        incomingLinks.get(resolved)?.add(fileName);
      }
    }

    if (/\.(?:png|jpg|jpeg|webp|gif|svg|ico|css|js|json)$/i.test(resolved)) {
      record(fs.existsSync(fullPath), `${fileName}: missing asset -> ${href}`);
    }
  }

  const placeholderPatterns = [
    /Будет добавлено/iu,
    /\bTODO\b/u,
    /placeholder/iu,
    /\bTBD\b/u,
    /ИНН:\s*(?:XXX|0000+)/iu,
    /ОГРН:\s*(?:XXX|0000+)/iu,
  ];
  for (const pattern of placeholderPatterns) {
    record(
      !pattern.test(html),
      `${fileName}: forbidden placeholder text matched ${pattern}`,
    );
  }

  if (fileName === "cases.html") {
    record(
      /<meta[^>]+name="robots"[^>]+content="noindex,nofollow"/i.test(html),
      "cases.html: must use noindex,nofollow",
    );
  } else {
    record(
      !/href="(?:\/)?cases\.html(?:[#?"][^"]*)?"/i.test(html),
      `${fileName}: must not link to cases.html`,
    );
  }

  if (fileName === "favicon-preview.html") {
    record(
      /<meta[^>]+name="robots"[^>]+content="noindex,nofollow"/i.test(html),
      "favicon-preview.html: must use noindex,nofollow",
    );
  }

  if (publicIndexablePages.includes(fileName)) {
    const organizationLd = getJsonLd(html, "organizationLd");
    record(
      organizationLd && organizationLd !== "INVALID",
      `${fileName}: missing or invalid Organization JSON-LD`,
    );
    record(
      h1s.length === 1,
      `${fileName}: must contain exactly one H1 (found ${h1s.length})`,
    );
    record(
      canonical === toCanonicalUrl(fileName),
      `${fileName}: canonical must equal ${toCanonicalUrl(fileName)}`,
    );
    record(
      html.includes("ООО «Арвектум»") || html.includes("Arvectum LLC"),
      `${fileName}: footer must contain company legal name`,
    );
    for (const legalLink of [
      "privacy.html",
      "personal-data-consent.html",
      "cookies.html",
    ]) {
      record(
        html.includes(legalLink),
        `${fileName}: footer must contain legal link -> ${legalLink}`,
      );
    }
  }

  if (fileName === "index.html") {
    const websiteLd = getJsonLd(html, "websiteLd");
    record(
      websiteLd && websiteLd !== "INVALID",
      "index.html: missing or invalid WebSite JSON-LD",
    );

    const h1 = h1s[0] || "";
    record(h1.length > 0, "index.html: homepage H1 is missing");
    record(
      !/где теряются/iu.test(h1),
      "index.html: homepage H1 must not use negative 'где теряются' wording",
    );
    record(
      !/закупочн(ый|ого|ому|ом)? маршрут/iu.test(h1),
      "index.html: homepage H1 must not position procurement as the only focus",
    );
    record(
      !html.includes(legacyHomepageH1),
      "index.html: legacy homepage H1 must be removed",
    );
    record(
      !html.includes(previousHomepageH1),
      "index.html: previous homepage H1 must be removed",
    );
    record(
      h1 ===
        "Автоматизация операционных процессов и корпоративных регламентов на базе ИИ",
      "index.html: homepage H1 must match the enterprise positioning copy",
    );
    record(
      normalizeText(html).includes(
        "Помогаем снизить ручную рутину, уменьшить риск ошибок и настроить цифровой маршрут под специфику вашей организации.",
      ),
      "index.html: homepage lead must match the refined enterprise copy",
    );
    record(
      !html.includes("исключаем ошибки"),
      "index.html: homepage lead must not promise to eliminate errors",
    );
    record(
      !html.includes("исключаем человеческий фактор"),
      "index.html: homepage lead must not use anti-human-factor wording",
    );
    record(
      html.includes(">Запросить демонстрацию<"),
      "index.html: homepage must include the Request Demo CTA",
    );

    for (const link of [
      "solutions/procurement.html",
      "solutions/document-workflow.html",
      "solutions/operations.html",
      "solutions/ai-document-checks.html",
    ]) {
      record(html.includes(link), `index.html: missing static link -> ${link}`);
    }
  }

  if (fileName === "solutions.html") {
    record(
      html.includes("Типовые сценарии"),
      "solutions.html: missing typical use cases block",
    );
    for (const link of [
      "solutions/procurement.html",
      "solutions/document-workflow.html",
      "solutions/operations.html",
      "solutions/ai-document-checks.html",
    ]) {
      record(
        html.includes(link),
        `solutions.html: missing static link -> ${link}`,
      );
    }
  }

  if (fileName === "materials.html") {
    for (const link of materialArticlePages) {
      record(
        html.includes(link),
        `materials.html: missing article link -> ${link}`,
      );
    }
    record(
      /href="(?:\/)?contact\.html"/i.test(html),
      "materials.html: missing contact CTA",
    );
  }

  if (fileName === "approach.html") {
    for (const link of [
      "solutions/procurement.html",
      "solutions/document-workflow.html",
      "solutions/operations.html",
      "solutions/ai-document-checks.html",
    ]) {
      record(
        html.includes(link),
        `approach.html: missing internal direction link -> ${link}`,
      );
    }
  }

  if (materialArticlePages.includes(fileName)) {
    const articleLd = getJsonLd(html, "articleLd");
    record(
      /aria-label="Хлебные крошки"/i.test(html) && /materials\.html/.test(html),
      `${fileName}: missing visible breadcrumbs`,
    );
    record(
      articleLd && articleLd !== "INVALID",
      `${fileName}: missing or invalid Article JSON-LD`,
    );
    record(
      articleLd?.headline && normalizeText(articleLd.headline) === h1s[0],
      `${fileName}: Article JSON-LD headline must match the visible H1`,
    );
    record(
      articleLd?.datePublished && articleLd?.dateModified,
      `${fileName}: Article JSON-LD must include datePublished and dateModified`,
    );
    record(
      (html.match(/<time\b[^>]+datetime=/g) || []).length >= 2,
      `${fileName}: must include publication and modified dates`,
    );
    record(
      /href="(?:\/)?contact\.html"/i.test(html),
      `${fileName}: missing contact CTA`,
    );
    record(
      /href="(?:\/)?materials\.html"/i.test(html),
      `${fileName}: missing link back to materials.html`,
    );
    record(
      /href="(?:\/)?(?:solutions\.html|approach\.html|solutions\/[^"]+\.html)"/i.test(
        html,
      ),
      `${fileName}: missing commercial page link`,
    );
  }

  if (fileName.startsWith("solutions/")) {
    if (isThinAliasPage(html)) {
      record(
        /window\.location\.replace\(/.test(html) ||
          /<meta[^>]+http-equiv="refresh"/i.test(html),
        `${fileName}: thin alias page must redirect to the canonical URL`,
      );
      continue;
    }

    const faqLd = getJsonLd(html, "faqLd");
    record(
      /aria-label="Хлебные крошки"/i.test(html) && /solutions\.html/.test(html),
      `${fileName}: missing visible breadcrumbs`,
    );
    record(
      getJsonLd(html, "breadcrumbLd") &&
        getJsonLd(html, "breadcrumbLd") !== "INVALID",
      `${fileName}: missing or invalid BreadcrumbList JSON-LD`,
    );
    record(
      getJsonLd(html, "serviceLd") &&
        getJsonLd(html, "serviceLd") !== "INVALID",
      `${fileName}: missing or invalid Service JSON-LD`,
    );
    record(
      faqLd && faqLd !== "INVALID",
      `${fileName}: missing or invalid FAQPage JSON-LD`,
    );
    record(
      (faqLd?.mainEntity || []).length >= 4,
      `${fileName}: FAQ JSON-LD must include at least 4 questions`,
    );
    record(
      (html.match(/<details class="faq-item">/g) || []).length >= 4,
      `${fileName}: visible FAQ must include at least 4 items`,
    );
    for (const entity of faqLd?.mainEntity || []) {
      record(
        html.includes(entity.name),
        `${fileName}: FAQ question from JSON-LD must be visible in HTML -> ${entity.name}`,
      );
      record(
        html.includes(entity.acceptedAnswer?.text || ""),
        `${fileName}: FAQ answer from JSON-LD must be visible in HTML -> ${entity.name}`,
      );
    }
    record(
      !/"aggregateRating"|"reviewRating"|"reviewCount"|"bestRating"|"worstRating"|"award"/u.test(
        html,
      ),
      `${fileName}: must not include fake review/rating/award markup`,
    );
  }
}

for (const match of cssContent.matchAll(/url\((['"]?)([^)'"]+)\1\)/g)) {
  const asset = match[2];
  if (isExternalUrl(asset) || asset.startsWith("data:")) continue;
  const resolved = resolvePublicPath("styles.css", asset);
  record(
    fs.existsSync(path.join(publicDir, resolved)),
    `styles.css: missing asset -> ${asset}`,
  );
}

for (const jsFile of ["app.js", "site-config.js"]) {
  const content = fs.readFileSync(path.join(publicDir, jsFile), "utf8");
  for (const pattern of [/Будет добавлено/iu, /\bTODO\b/u]) {
    record(
      !pattern.test(content),
      `${jsFile}: forbidden placeholder text matched ${pattern}`,
    );
  }
  for (const match of content.matchAll(
    /["'](\/?assets\/[^"']+\.(?:png|jpg|jpeg|webp|gif|svg|ico))["']/g,
  )) {
    const resolved = resolvePublicPath(jsFile, match[1]);
    record(
      fs.existsSync(path.join(publicDir, resolved)),
      `${jsFile}: missing asset -> ${match[1]}`,
    );
  }

  if (jsFile === "site-config.js") {
    record(
      !content.includes(previousHomepageH1),
      "site-config.js: previous homepage H1 must be removed",
    );
    record(
      content.includes(
        "Автоматизация операционных процессов и корпоративных регламентов на базе ИИ",
      ),
      "site-config.js: homepage H1 must use the new enterprise positioning copy",
    );
    record(
      !content.includes("исключаем ошибки"),
      "site-config.js: must not claim to eliminate errors",
    );
    record(
      !content.includes("исключаем человеческий фактор"),
      "site-config.js: must not claim to eliminate the human factor",
    );
  }
}

for (const url of sitemapUrls) {
  record(
    url.startsWith("https://arvectum.com/"),
    `sitemap.xml: URL must use https://arvectum.com/ -> ${url}`,
  );
  record(
    !url.includes("https://www."),
    `sitemap.xml: must not use www -> ${url}`,
  );
  record(
    !url.startsWith("http://"),
    `sitemap.xml: must not use http -> ${url}`,
  );

  const relPath =
    url === "https://arvectum.com/"
      ? "index.html"
      : url.replace("https://arvectum.com/", "");
  record(
    htmlSet.has(relPath),
    `sitemap.xml: URL points to non-existing file -> ${url}`,
  );
}

for (const relPath of publicIndexablePages) {
  record(
    sitemapUrls.includes(toCanonicalUrl(relPath)),
    `sitemap.xml: missing URL -> ${toCanonicalUrl(relPath)}`,
  );
}

const seenTitles = new Map();
const seenDescriptions = new Map();

for (const relPath of publicIndexablePages) {
  const meta = pageMeta.get(relPath);
  if (!meta) continue;

  if (seenTitles.has(meta.title)) {
    record(
      false,
      `duplicate <title>: ${relPath} and ${seenTitles.get(meta.title)} share "${meta.title}"`,
    );
  } else {
    seenTitles.set(meta.title, relPath);
  }

  if (seenDescriptions.has(meta.description)) {
    record(
      false,
      `duplicate meta description: ${relPath} and ${seenDescriptions.get(meta.description)} share "${meta.description}"`,
    );
  } else {
    seenDescriptions.set(meta.description, relPath);
  }
}

for (const relPath of hiddenPages) {
  record(
    !sitemapUrls.includes(toCanonicalUrl(relPath)),
    `sitemap.xml: must not include hidden page -> ${toCanonicalUrl(relPath)}`,
  );
}

const orphanAllowed = new Set([
  "index.html",
  "privacy.html",
  "personal-data-consent.html",
  "cookies.html",
]);

for (const relPath of publicIndexablePages) {
  if (orphanAllowed.has(relPath)) continue;
  record(
    (incomingLinks.get(relPath)?.size || 0) > 0,
    `orphan page: ${relPath} is in sitemap but has no incoming internal links`,
  );
}

for (const disallow of [
  "Disallow: /health.html",
  "Disallow: /favicon-preview.html",
  "Disallow: /thank-you.html",
  "Disallow: /api/",
]) {
  record(
    robotsContent.includes(disallow),
    `robots.txt: missing rule -> ${disallow}`,
  );
}
record(
  robotsContent.includes("Sitemap: https://arvectum.com/sitemap.xml"),
  "robots.txt: missing sitemap URL",
);

record(
  !/nav:\s*\[[\s\S]*?slug:\s*"cases"/u.test(siteConfigContent),
  "site-config.js: primary nav must not include cases",
);
record(
  !/footerNav:\s*\[[\s\S]*?slug:\s*"cases"/u.test(siteConfigContent),
  "site-config.js: footer nav must not include cases",
);
record(
  !/Посмотреть сценарии|View scenarios/u.test(siteConfigContent),
  "site-config.js: must not expose scenarios in public CTAs",
);
record(
  !siteConfigContent.includes(legacyHomepageH1),
  "site-config.js: legacy homepage H1 must be removed",
);

if (failures.length) {
  console.error("Static checks failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Static checks passed for ${htmlFiles.length} HTML files.`);
