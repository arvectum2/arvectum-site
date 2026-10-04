const RULES = [
  {
    id: "brand-arvectum",
    matches(query) {
      return /(?:^|\s)(?:ооо\s+)?[«"']?арвектум[»"']?(?:\s|$)/iu.test(query);
    },
    canonicalUri: "https://arvectum.com/",
  },
  {
    id: "seo-automate-procurement",
    matches(query) {
      return /автоматизировать\s+закупки/iu.test(query);
    },
    canonicalUri: "https://arvectum.com/solutions/procurement.html",
  },
  {
    id: "seo-tender-automation",
    matches(query) {
      return /автоматизация\s+тендеров/iu.test(query);
    },
    canonicalUri: "https://arvectum.com/services/ai-tender-agent.html",
  },
  {
    id: "seo-ai-document-check",
    matches(query) {
      return /(?:ии|ai)\s+для\s+проверки\s+документов/iu.test(query);
    },
    canonicalUri: "https://arvectum.com/solutions/ai-document-checks.html",
  },
  {
    id: "seo-ai-agent-procurement",
    matches(query) {
      return /(?:ии|ai)[-\s]*агент\s+для\s+закупок/iu.test(query);
    },
    canonicalUri: "https://arvectum.com/solutions/procurement-ai-agents.html",
  },
  {
    id: "seo-supplier-selection",
    matches(query) {
      return /автоматизация\s+выбора\s+поставщика/iu.test(query);
    },
    canonicalUri: "https://arvectum.com/solutions/procurement.html",
  },
  {
    id: "seo-closed-loop-ai",
    matches(query) {
      return /(?:ии|ai)\s+в\s+закрытом\s+контуре/iu.test(query);
    },
    canonicalUri: "https://arvectum.com/solutions/closed-loop-ai-documents.html",
  },
  {
    id: "seo-rfq-system",
    matches(query) {
      return /система\s+для\s+rfq/iu.test(query);
    },
    canonicalUri: "https://arvectum.com/services/rfq-automation.html",
  },
  {
    id: "seo-rfq-what-is",
    matches(query) {
      return /rfq\s+что\s+это(?:\s+такое)?\s+в\s+закупках/iu.test(query);
    },
    canonicalUri: "https://arvectum.com/materials/rfq-automation-guide.html",
  },
  {
    id: "seo-rfq-tender",
    matches(query) {
      return /(?:^|\s)rfq\s+тендер(?:\s|$)/iu.test(query);
    },
    canonicalUri: "https://arvectum.com/services/rfq-automation.html",
  },
  {
    id: "seo-tkp-comparative-analysis",
    matches(query) {
      return /сравнительн\p{L}*\s+анализ\p{L}*\s+ткп/iu.test(query);
    },
    canonicalUri: "https://arvectum.com/services/tkp-comparison.html",
  },
  {
    id: "seo-tkp-comparison",
    matches(query) {
      return /сравнен\p{L}*\s+ткп/iu.test(query);
    },
    canonicalUri: "https://arvectum.com/services/tkp-comparison.html",
  },
  {
    id: "photo-size-35x45",
    matches(query) {
      return /(?:35\s*[xх×]\s*45|35\s*(?:на|by)\s*45)/iu.test(query);
    },
    canonicalUri: "https://arvectum.com/tools/photo-size/35x45.html",
  },
  {
    id: "photo-size-compress",
    matches(query) {
      const normalized = query.toLocaleLowerCase();
      return (
        /(?:^|[^\p{L}])(кб|мб|kb|mb)(?:$|[^\p{L}])/iu.test(normalized) ||
        /килобайт|мегабайт|вес\s+файл/iu.test(normalized)
      );
    },
    canonicalUri: "https://arvectum.com/tools/photo-size/compress-to-kb.html",
  },
  {
    id: "photo-size-pixels",
    matches(query) {
      return /(?:пиксел|pixels?)/iu.test(query);
    },
    canonicalUri: "https://arvectum.com/tools/photo-size/resize-pixels.html",
  },
];

export function preferredLanding(query) {
  const normalized = String(query || "").trim();
  if (!normalized) return null;

  const rule = RULES.find((item) => item.matches(normalized));
  if (!rule) return null;

  return {
    intentId: rule.id,
    canonicalUri: rule.canonicalUri,
  };
}

export function rankPreferredLanding(
  query,
  hits,
  fallbackHits = [],
  { limit = Array.isArray(hits) ? hits.length : 0 } = {},
) {
  const primary = Array.isArray(hits) ? [...hits] : [];
  const fallback = Array.isArray(fallbackHits) ? fallbackHits : [];
  const preference = preferredLanding(query);

  if (!preference) {
    return {
      hits: primary,
      preference: null,
      status: "none",
      applied: false,
    };
  }

  const index = primary.findIndex(
    (hit) => hit?.canonical_uri === preference.canonicalUri,
  );
  if (index === 0) {
    return {
      hits: primary,
      preference,
      status: "already-first",
      applied: false,
    };
  }

  if (index > 0) {
    const reordered = [...primary];
    const [preferred] = reordered.splice(index, 1);
    reordered.unshift(preferred);
    return {
      hits: reordered,
      preference,
      status: "promoted",
      applied: true,
    };
  }

  const retrieved = fallback.find(
    (hit) => hit?.canonical_uri === preference.canonicalUri,
  );
  if (!retrieved) {
    return {
      hits: primary,
      preference,
      status: "missing",
      applied: false,
    };
  }

  const deduped = primary.filter(
    (hit) =>
      hit?.chunk_id !== retrieved.chunk_id &&
      hit?.canonical_uri !== retrieved.canonical_uri,
  );
  const boundedLimit = Math.max(1, Number(limit) || primary.length || 1);
  return {
    hits: [retrieved, ...deduped].slice(0, boundedLimit),
    preference,
    status: "retrieved-by-canonical-filter",
    applied: true,
  };
}

export function applyPreferredLanding(query, hits) {
  return rankPreferredLanding(query, hits);
}
