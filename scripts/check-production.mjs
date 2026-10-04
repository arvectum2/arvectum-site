import { execFileSync } from "node:child_process";

const checks = [
  {
    url: "https://arvectum.com/",
    ok: ({ status }) => status === 200,
  },
  {
    url: "https://www.arvectum.com/",
    ok: ({ status, location }) =>
      [301, 302, 308].includes(status) && location === "https://arvectum.com/",
  },
  {
    url: "https://arvectum.com/index.html",
    ok: ({ status, location }) =>
      [301, 302, 308].includes(status) && location === "https://arvectum.com/",
  },
  {
    url: "https://arvectum.com/ru",
    ok: ({ status, location }) =>
      [301, 302, 308].includes(status) && location === "https://arvectum.com/",
  },
  {
    url: "https://arvectum.com/solutions/approach.html?lang=en",
    ok: ({ status, location }) =>
      [301, 302, 308].includes(status) &&
      location === "https://arvectum.com/approach.html?lang=en",
  },
  {
    url: "https://arvectum.com/materials/index.html?lang=en",
    ok: ({ status, location }) =>
      [301, 302, 308].includes(status) &&
      location === "https://arvectum.com/materials.html?lang=en",
  },
  {
    url: "https://arvectum.com/health.html",
    ok: ({ status, body }) =>
      status === 200 && body.includes("Arvectum site is online"),
  },
  {
    url: "https://arvectum.com/api/health.php",
    ok: ({ status, body, contentType }) => {
      if (status !== 200 || !contentType.includes("application/json")) {
        return false;
      }

      try {
        const parsed = JSON.parse(body);
        return parsed.ok === true && parsed.service === "arvectum-site";
      } catch {
        return false;
      }
    },
  },
  {
    url: "https://arvectum.com/robots.txt",
    ok: ({ status, body }) =>
      status === 200 && body.toLowerCase().includes("sitemap"),
  },
  {
    url: "https://arvectum.com/sitemap.xml",
    ok: ({ status, body, contentType }) =>
      status === 200 &&
      (contentType.includes("xml") || body.includes("<urlset")),
  },
  {
    url: "https://arvectum.com/solutions/procurement.html",
    ok: ({ status, body }) =>
      status === 200 && body.includes("Автоматизация закупок и тендеров"),
  },
  {
    url: "https://arvectum.com/solutions/document-workflow.html",
    ok: ({ status, body }) =>
      status === 200 && body.includes("Согласования и документооборот"),
  },
  {
    url: "https://arvectum.com/solutions/operations.html",
    ok: ({ status, body }) =>
      status === 200 && body.includes("Автоматизация операционных процессов"),
  },
  {
    url: "https://arvectum.com/solutions/ai-document-checks.html",
    ok: ({ status, body }) =>
      status === 200 && body.includes("Проверка документов с AI"),
  },
  {
    url: "https://arvectum.com/materials.html",
    ok: ({ status, body }) =>
      status === 200 &&
      body.includes("Материалы по AI-автоматизации закупок"),
  },
  {
    url: "https://arvectum.com/materials/how-to-choose-first-process.html",
    ok: ({ status, body }) =>
      status === 200 &&
      body.includes("Как выбрать первый бизнес-процесс для автоматизации"),
  },
  {
    url: "https://arvectum.com/contact.html",
    ok: ({ status, body }) =>
      status === 200 &&
      body.includes("Оставьте заявку на разбор бизнес-процесса"),
  },
  {
    url: "https://arvectum.com/services/ai-tender-agent.html",
    ok: ({ status, body }) =>
      status === 200 &&
      body.includes("Форматы работы / пакеты") &&
      body.includes("Что нужно от клиента") &&
      body.includes('id="demo"'),
  },
  {
    url: "https://arvectum.com/solutions/procurement-ai-agent.html",
    ok: ({ status, body }) =>
      status === 200 &&
      body.includes("/services/ai-tender-agent.html") &&
      body.includes("/services/ai-tender-agent.html#demo"),
  },
];

const normalizeSnippet = (body) =>
  body.replace(/\s+/g, " ").trim().slice(0, 120) || "(empty response)";

const runCurl = (url, insecure = false) =>
  execFileSync(
    "curl",
    [
      "-sS",
      "--max-time",
      "45",
      "-D",
      "-",
      "-o",
      "-",
      ...(insecure ? ["-k"] : []),
      url,
    ],
    { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  );

const runCurlWithRetry = (url, insecure = false, attempts = 3) => {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return runCurl(url, insecure);
    } catch (error) {
      lastError = error;
      const stderr =
        error && typeof error === "object" && "stderr" in error
          ? String(error.stderr || "")
          : "";
      const isTransient =
        stderr.includes("Connection timed out") ||
        stderr.includes("Couldn't connect to server") ||
        stderr.includes("Operation timed out");

      if (!isTransient || attempt === attempts) {
        throw error;
      }
    }
  }

  throw lastError;
};

const parseCurlResponse = (raw) => {
  const normalized = raw.replace(/\r\n/g, "\n");
  const parts = normalized.split("\n\n");
  let headerBlock = "";
  let body = "";

  for (let index = 0; index < parts.length; index += 1) {
    const part = parts[index].trim();
    if (/^HTTP\/\S+\s+\d{3}/.test(part)) {
      headerBlock = part;
      continue;
    }

    body = parts.slice(index).join("\n\n");
    break;
  }

  const headerLines = headerBlock.split("\n").filter(Boolean);
  const statusLine = headerLines[0] || "";
  const statusMatch = statusLine.match(/HTTP\/\S+\s+(\d{3})/);
  const status = statusMatch ? Number(statusMatch[1]) : 0;
  const headers = new Map();

  for (const line of headerLines.slice(1)) {
    const separator = line.indexOf(":");
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();
    headers.set(key, value);
  }

  return {
    status,
    body,
    contentType: headers.get("content-type") || "",
    location: headers.get("location") || "",
  };
};

let hasFailures = false;

for (const item of checks) {
  try {
    const raw = runCurlWithRetry(item.url);
    const result = parseCurlResponse(raw);
    const passed = item.ok(result);
    hasFailures ||= !passed;

    console.log(`${passed ? "PASS" : "FAIL"} ${item.url}`);
    console.log(`  status: ${result.status}`);
    console.log(`  content-type: ${result.contentType || "(missing)"}`);
    if (result.location) console.log(`  location: ${result.location}`);
    console.log(`  body: ${normalizeSnippet(result.body)}`);
  } catch (error) {
    hasFailures = true;
    const stderr =
      error && typeof error === "object" && "stderr" in error
        ? String(error.stderr || "")
        : "";

    if (stderr.includes("SSL certificate problem")) {
      try {
        const insecureRaw = runCurlWithRetry(item.url, true);
        const insecureResult = parseCurlResponse(insecureRaw);
        console.log(`FAIL ${item.url}`);
        console.log(
          "  error: SSL certificate is not trusted (self-signed or invalid chain)",
        );
        console.log(`  insecure status: ${insecureResult.status}`);
        console.log(
          `  insecure content-type: ${
            insecureResult.contentType || "(missing)"
          }`,
        );
        console.log(
          `  insecure body: ${normalizeSnippet(insecureResult.body)}`,
        );
        continue;
      } catch {
        // fall through to the generic error output below
      }
    }

    console.log(`FAIL ${item.url}`);
    console.log(
      `  error: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

if (hasFailures) {
  process.exitCode = 1;
}
