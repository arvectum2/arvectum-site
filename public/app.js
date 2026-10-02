(function () {
  const config = window.SITE_CONFIG || {};
  const apiConfig = config.api || {};
  const routes = config.routes || {};
  const defaultLanguage = config.defaultLanguage || "ru";
  const currentPage = document.body.dataset.page || "home";
  const currentNav = document.body.dataset.nav || currentPage;
  const COOKIE_PREFIX = "arvectum_";
  const CONSENT_COOKIE_NAME = `${COOKIE_PREFIX}cookie_consent`;
  const CONSENT_VERSION = "v2";
  const FOCUSABLE_SELECTOR =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  const TELEGRAM_ICON = `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M21.4 4.6a1.2 1.2 0 0 0-1.25-.18L3.36 11.4a1.15 1.15 0 0 0 .08 2.16l4.1 1.46 1.59 5.1a1.16 1.16 0 0 0 2.02.36l2.3-2.8 4.5 3.3a1.16 1.16 0 0 0 1.83-.68l2.8-14.47a1.2 1.2 0 0 0-.38-1.23ZM9.3 14.56l8.86-6.28-6.98 7.72-.38 1.82-.67-3.26-.83-.3Zm1.84 3.64.37-1.77 1.02.75-1.39 1.02Z" fill="currentColor"/>
    </svg>
  `;

  let currentLanguage = defaultLanguage;
  let currentCommon = null;
  let currentContent = null;
  let revealObserver = null;
  let menuRestoreFocus = null;
  let cookieRestoreFocus = null;

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el && value != null) el.textContent = value;
  };

  const setHtml = (id, html) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  };

  const escapeHtml = (value) =>
    String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");

  const getLanguage = () => {
    const lang = new URLSearchParams(window.location.search).get("lang");
    return config.languages?.[lang] ? lang : defaultLanguage;
  };

  const buildUrl = (slug, hash = "") => {
    const file = routes[slug] || routes.home || "index.html";
    const query =
      currentLanguage === defaultLanguage ? "" : `?lang=${currentLanguage}`;
    const path = file === "index.html" ? "/" : `/${file}`;
    return `${path}${query}${hash}`;
  };

  const buildAgentUiUrl = () => {
    const baseUrl = String(apiConfig.baseUrl || "").replace(/\/$/u, "");
    const uiPath = String(apiConfig.tenderAgentUiPath || "");
    return `${baseUrl}${uiPath.startsWith("/") ? uiPath : `/${uiPath}`}`;
  };

  const buildAbsoluteUrl = (slug, language = currentLanguage) => {
    const file = routes[slug] || routes.home || "index.html";
    const pageUrl =
      file === "index.html"
        ? "https://arvectum.com/"
        : `https://arvectum.com/${file}`;
    return language === defaultLanguage
      ? pageUrl
      : `${pageUrl}?lang=${language}`;
  };

  const buildConfigLink = (link, fallbackSlug = "contact") => {
    if (!link) return buildUrl(fallbackSlug);
    if (typeof link === "string") return buildUrl(link);
    return buildUrl(link.slug || fallbackSlug, link.hash || "");
  };

  const createLinkList = (items) =>
    (items || [])
      .map(
        (item) =>
          `<a href="${buildUrl(item.slug)}">${escapeHtml(item.label)}</a>`,
      )
      .join("");

  const getLanguagePack = () =>
    config.languages?.[currentLanguage] || config.languages?.[defaultLanguage];

  const getPageContent = () => getLanguagePack()?.pages?.[currentPage] || null;

  const renderMeta = () => {
    const meta = currentContent?.meta;
    document.documentElement.lang = currentLanguage;
    if (!meta) return;

    document.title = meta.title || document.title;

    const description = document.getElementById("metaDescription");
    const ogTitle = document.getElementById("metaOgTitle");
    const ogDescription = document.getElementById("metaOgDescription");
    const ogLocale = document.getElementById("metaOgLocale");
    const ogUrl = document.getElementById("metaOgUrl");
    const canonical = document.getElementById("canonicalLink");

    if (description)
      description.setAttribute("content", meta.description || "");
    if (ogTitle) ogTitle.setAttribute("content", meta.ogTitle || "");
    if (ogDescription)
      ogDescription.setAttribute("content", meta.ogDescription || "");
    if (ogLocale)
      ogLocale.setAttribute("content", currentCommon?.locale || "ru_RU");

    const localizedUrl = buildAbsoluteUrl(currentPage, currentLanguage);
    if (ogUrl) ogUrl.setAttribute("content", localizedUrl);
    if (canonical) canonical.setAttribute("href", localizedUrl);

    const hreflangRu = document.getElementById("hrefLangRu");
    const hreflangEn = document.getElementById("hrefLangEn");
    const hreflangDefault = document.getElementById("hrefLangDefault");
    if (hreflangRu)
      hreflangRu.setAttribute("href", buildAbsoluteUrl(currentPage, "ru"));
    if (hreflangEn)
      hreflangEn.setAttribute("href", buildAbsoluteUrl(currentPage, "en"));
    if (hreflangDefault) {
      hreflangDefault.setAttribute(
        "href",
        buildAbsoluteUrl(currentPage, defaultLanguage),
      );
    }
  };

  const renderStructuredData = () => {
    const footer = currentCommon?.footer || {};
    const websiteLd = document.getElementById("websiteLd");
    if (websiteLd) {
      websiteLd.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Arvectum",
        alternateName: "Арвектум",
        url: "https://arvectum.com/",
      });
    }

    const organizationLd = document.getElementById("organizationLd");
    if (organizationLd) {
      const organizationPayload = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: footer.companyName || "ООО «Арвектум»",
        alternateName: "Arvectum",
        url: "https://arvectum.com/",
        logo: "https://arvectum.com/assets/brand/logo-horizontal.svg",
        email: footer.email || "info@arvectum.com",
        sameAs: (footer.socialLinks || [])
          .map((item) => item.href)
          .filter(Boolean),
      };
      if (footer.phone) {
        organizationPayload.telephone = footer.phone;
      }
      organizationLd.textContent = JSON.stringify(organizationPayload);
    }

    const serviceLd = document.getElementById("serviceLd");
    if (serviceLd && currentPage === "home") {
      serviceLd.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Service",
        name:
          currentLanguage === "ru"
            ? "Автоматизация операционных процессов и корпоративных регламентов на базе ИИ"
            : "AI automation for operational workflows and corporate regulations",
        provider: {
          "@type": "Organization",
          name: footer.companyName || currentCommon.brandMeta,
          url: "https://arvectum.com",
        },
        areaServed: currentLanguage === "ru" ? "RU" : "RU / international",
        serviceType:
          currentLanguage === "ru"
            ? [
                "Автоматизация операционных процессов",
                "Автоматизация корпоративных регламентов",
                "Автоматизация снабжения и документооборота",
                "AI-модули для рабочих процессов",
              ]
            : [
                "Business process automation",
                "Procurement automation",
                "Approval and document workflow automation",
                "AI workflow automation",
              ],
        url: buildAbsoluteUrl("home", currentLanguage),
      });
    }

    const faqLd = document.getElementById("faqLd");
    if (faqLd && currentPage === "approach" && currentContent?.faq?.items) {
      faqLd.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: currentContent.faq.items.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      });
    }
  };

  const renderHeader = () => {
    setText("skipLink", currentCommon.skipLink);
    setText("brandMeta", currentCommon.brandMeta);
    setText("topbarCta", currentCommon.headerCta);
    setText("agentLaunchCta", currentCommon.agentLaunchLabel);
    setText("agentAccessLabel", currentCommon.testAccessLabel);
    setText("menuButtonText", currentCommon.menuLabel);
    setText("menuTitle", currentCommon.menuTitle);
    setText("menuCloseText", currentCommon.menuClose);
    setText("menuSectionTitle", currentCommon.pagesLabel);
    setText("menuPrimaryCta", currentCommon.headerCta);
    setText("menuTelegramLink", currentCommon.telegramLabel);

    const brandLink = document.querySelector(".brand");
    if (brandLink) {
      brandLink.setAttribute("href", buildUrl("home"));
    }

    const currentPathname = window.location.pathname;
    const resolveNavHref = (item) => item.href || buildUrl(item.slug);
    const primaryNav = currentCommon.nav || [];
    const menuNav = currentCommon.menuLinks || [
      ...primaryNav,
      ...(primaryNav.some((item) => item.slug === "contact")
        ? []
        : [
            {
              slug: "contact",
              label: currentLanguage === "ru" ? "Контакты" : "Contact",
            },
          ]),
    ];
    const navMarkup = primaryNav
      .map((item) => {
        const isActive = item.slug === currentNav ? " is-active" : "";
        return `<a class="nav-link${isActive}" href="${resolveNavHref(item)}">${escapeHtml(item.label)}</a>`;
      })
      .join("");
    const menuMarkup = menuNav
      .map((item) => {
        const isActive =
          item.slug === currentNav ||
          item.slug === currentPage ||
          (item.href && currentPathname.endsWith(item.href.replace(/^\//, "")))
            ? " is-active"
            : "";
        return `<a class="nav-link${isActive}" href="${resolveNavHref(item)}">${escapeHtml(item.label)}</a>`;
      })
      .join("");
    const menuLegalMarkup = (currentCommon.footer?.legalLinks || [])
      .map(
        (item) =>
          `<a class="nav-link nav-link--meta" href="${buildUrl(item.slug)}">${escapeHtml(item.label)}</a>`,
      )
      .join("");

    setHtml("desktopNav", navMarkup);
    setHtml(
      "menuNav",
      `${menuMarkup}${menuLegalMarkup ? `<div class="menu-nav__divider" aria-hidden="true"></div><div class="menu-nav__meta">${menuLegalMarkup}</div>` : ""}`,
    );

    const ctaUrl = buildAgentUiUrl();
    [
      "topbarCta",
      "menuPrimaryCta",
      "agentLaunchCta",
      "homeAgentLaunchCta",
    ].forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.setAttribute("href", ctaUrl);
        if (id !== "homeAgentLaunchCta")
          el.textContent = currentCommon.agentLaunchLabel;
      }
    });

    const menuTelegram = document.getElementById("menuTelegramLink");
    if (menuTelegram) {
      menuTelegram.setAttribute("href", "https://t.me/arvectum");
    }

    const menuToggle = document.getElementById("menuToggle");
    if (menuToggle) {
      menuToggle.setAttribute("aria-controls", "menuDrawer");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", currentCommon.menuLabel);
    }

    document.querySelectorAll(".lang-switch__button").forEach((button) => {
      const isActive = button.dataset.lang === currentLanguage;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    const brandImage = document.getElementById("brandLogo");
    if (brandImage) {
      brandImage.setAttribute(
        "alt",
        currentLanguage === "ru" ? "Логотип Arvectum" : "Arvectum logo",
      );
    }
  };

  const renderBreadcrumbs = () => {
    const breadcrumbs = document.getElementById("breadcrumbs");
    if (!breadcrumbs) return;

    const navMap = Object.fromEntries(
      (currentCommon.nav || []).map((item) => [item.slug, item.label]),
    );
    const legalMap = Object.fromEntries(
      (currentCommon.footer?.legalLinks || []).map((item) => [
        item.slug,
        item.label,
      ]),
    );

    const labels = {
      home: navMap.home || (currentLanguage === "ru" ? "Главная" : "Home"),
      solutions:
        navMap.solutions ||
        (currentLanguage === "ru" ? "Решения" : "Solutions"),
      approach:
        navMap.approach ||
        (currentLanguage === "ru" ? "Как запускаем" : "How We Launch"),
      procurement:
        currentLanguage === "ru"
          ? "Автоматизация закупок и тендеров"
          : "Procurement and tender automation",
      documentWorkflow:
        currentLanguage === "ru"
          ? "Согласования и документооборот"
          : "Document workflow and approvals",
      operationsAutomation:
        currentLanguage === "ru"
          ? "Операционные процессы"
          : "Operational workflow automation",
      aiDocumentChecks:
        currentLanguage === "ru"
          ? "AI-проверка документов"
          : "AI document checks",
      materials: currentLanguage === "ru" ? "Материалы" : "Materials",
      materialsHowToChooseFirstProcess:
        currentLanguage === "ru"
          ? "Как выбрать первый бизнес-процесс для автоматизации"
          : "How to choose the first business process for automation",
      materialsAiAutomationSimple:
        currentLanguage === "ru"
          ? "AI-автоматизация бизнес-процессов простыми словами"
          : "AI automation for business processes in simple terms",
      materialsChatbotVsProcessAutomation:
        currentLanguage === "ru"
          ? "Почему чат-бот — это не автоматизация бизнес-процесса"
          : "Why a chatbot is not business process automation",
      materialsMvpAutomation:
        currentLanguage === "ru"
          ? "MVP автоматизации: что можно проверить за 2–4 недели"
          : "Automation MVP: what you can validate in 2–4 weeks",
      contact: currentLanguage === "ru" ? "Контакты" : "Contact",
      cases: currentLanguage === "ru" ? "Сценарии" : "Scenarios",
      privacy:
        legalMap.privacy ||
        (currentLanguage === "ru"
          ? "Политика обработки персональных данных"
          : "Privacy policy"),
      "personal-data-consent":
        legalMap.personalDataConsent ||
        (currentLanguage === "ru"
          ? "Согласие на обработку персональных данных"
          : "Personal data consent"),
      personalDataConsent:
        legalMap.personalDataConsent ||
        (currentLanguage === "ru"
          ? "Согласие на обработку персональных данных"
          : "Personal data consent"),
      cookies:
        legalMap.cookiesPolicy ||
        (currentLanguage === "ru"
          ? "Политика использования файлов cookie"
          : "Cookies policy"),
      cookiesPolicy:
        legalMap.cookiesPolicy ||
        (currentLanguage === "ru"
          ? "Политика использования файлов cookie"
          : "Cookies policy"),
    };

    const currentLabel = labels[currentPage] || labels.home;
    const detailPages = new Set([
      "procurement",
      "documentWorkflow",
      "operationsAutomation",
      "aiDocumentChecks",
    ]);
    const materialPages = new Set([
      "materialsHowToChooseFirstProcess",
      "materialsAiAutomationSimple",
      "materialsChatbotVsProcessAutomation",
      "materialsMvpAutomation",
    ]);
    breadcrumbs.innerHTML =
      currentPage === "home"
        ? `<span aria-current="page">${escapeHtml(currentLabel)}</span>`
        : currentPage === "materials"
          ? `<a href="${buildUrl("home")}">${escapeHtml(labels.home)}</a><span class="breadcrumbs__sep">/</span><span aria-current="page">${escapeHtml(currentLabel)}</span>`
          : materialPages.has(currentPage)
            ? `<a href="${buildUrl("home")}">${escapeHtml(labels.home)}</a><span class="breadcrumbs__sep">/</span><a href="${buildUrl("materials")}">${escapeHtml(labels.materials)}</a><span class="breadcrumbs__sep">/</span><span aria-current="page">${escapeHtml(currentLabel)}</span>`
            : detailPages.has(currentPage)
              ? `<a href="${buildUrl("home")}">${escapeHtml(labels.home)}</a><span class="breadcrumbs__sep">/</span><a href="${buildUrl("solutions")}">${escapeHtml(labels.solutions)}</a><span class="breadcrumbs__sep">/</span><span aria-current="page">${escapeHtml(currentLabel)}</span>`
              : `<a href="${buildUrl("home")}">${escapeHtml(labels.home)}</a><span class="breadcrumbs__sep">/</span><span aria-current="page">${escapeHtml(currentLabel)}</span>`;
  };

  const renderFooter = () => {
    const footerGrid = document.querySelector(".footer-grid");
    if (!footerGrid) return;

    const footer = currentCommon.footer;
    const legalLinks = (footer.legalLinks || [])
      .map(
        (item) =>
          `<a href="${buildUrl(item.slug)}">${escapeHtml(item.label)}</a>`,
      )
      .join("");
    const contactItems = [];
    let telegramLink = "";
    const socialLinks = (footer.socialLinks || [])
      .map(
        (item) =>
          `<a href="${escapeHtml(item.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.label)}</a>`,
      )
      .join("");
    const resourceLinks = (footer.resourceLinks || [])
      .map(
        (item) =>
          `<a href="${buildUrl(item.slug)}">${escapeHtml(item.label)}</a>`,
      )
      .join("");
    if (footer.companyName) {
      contactItems.push(`<p>${escapeHtml(footer.companyName)}</p>`);
    }
    if (footer.inn) {
      contactItems.push(`<p>${escapeHtml(footer.inn)}</p>`);
    }
    if (footer.ogrn) {
      contactItems.push(`<p>${escapeHtml(footer.ogrn)}</p>`);
    }
    if (footer.address) {
      contactItems.push(`<p>${escapeHtml(footer.address)}</p>`);
    }
    if (footer.phone) {
      const phoneHref = footer.phone.replace(/[^\d+]/g, "");
      contactItems.push(
        `<a href="tel:${escapeHtml(phoneHref)}">${escapeHtml(footer.phone)}</a>`,
      );
    }
    if (footer.email) {
      contactItems.push(
        `<a href="mailto:${escapeHtml(footer.email)}">${escapeHtml(footer.email)}</a>`,
      );
    }
    if (footer.website) {
      const websiteLabel = footer.website
        .replace(/^https?:\/\//, "")
        .replace(/\/+$/, "");
      contactItems.push(
        `<a href="${escapeHtml(footer.website)}">${escapeHtml(websiteLabel)}</a>`,
      );
    }
    if (footer.telegramUrl && !socialLinks) {
      telegramLink = `
        <a
          class="telegram-link"
          href="${escapeHtml(footer.telegramUrl)}"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="${escapeHtml(footer.telegramLabel || footer.telegramHandle || "Telegram")}"
        ><span class="telegram-link__icon">${TELEGRAM_ICON}</span></a>
      `;
    }

    footerGrid.innerHTML = `
      <div class="footer-block">
        <span>${escapeHtml(footer.contactsTitle)}</span>
        <div class="footer-contact-row">
          <div class="footer-contact-stack">${contactItems.join("")}</div>
          ${telegramLink}
        </div>
        ${
          resourceLinks
            ? `<div class="footer-resource-links">${resourceLinks}</div>`
            : ""
        }
        ${
          socialLinks
            ? `<div class="footer-social-links">${socialLinks}</div>`
            : ""
        }
      </div>
      <details class="footer-legal">
        <summary>${escapeHtml(footer.legalLinksTitle)}</summary>
        <div class="footer-links">${legalLinks}</div>
      </details>
    `;
  };

  const renderListItems = (items, className = "compact-list") =>
    items?.length
      ? `<ul class="${className}">${items
          .map((item) => `<li>${escapeHtml(item)}</li>`)
          .join("")}</ul>`
      : "";

  const renderInfoCards = (items) =>
    (items || [])
      .map(
        (item) => `
          <article class="info-card">
            ${item.label ? `<span class="card-label">${escapeHtml(item.label)}</span>` : ""}
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.text)}</p>
            ${
              item.link
                ? `<a class="text-link" href="${buildConfigLink(item.link, "solutions")}">${escapeHtml(item.cta || (currentLanguage === "ru" ? "Открыть" : "Open"))}</a>`
                : ""
            }
          </article>
        `,
      )
      .join("");

  const renderInfoSection = (section, options = {}) =>
    section?.items?.length
      ? `
        <section class="section${options.soft ? " section-soft" : ""}">
          <div class="container reveal">
            <div class="section-head">
              <h2>${escapeHtml(section.title)}</h2>
              ${section.text ? `<p>${escapeHtml(section.text)}</p>` : ""}
            </div>
            <div class="grid ${section.items.length === 4 ? "grid-2" : "grid-3"}">
              ${renderInfoCards(section.items)}
            </div>
            ${section.note ? `<p class="section-note">${escapeHtml(section.note)}</p>` : ""}
          </div>
        </section>
      `
      : "";

  const renderResourceSection = (resources, fallbackSlug = "materials") =>
    resources?.items?.length
      ? `
        <section class="section section-soft">
          <div class="container reveal">
            <div class="section-head">
              <h2>${escapeHtml(resources.title)}</h2>
              ${resources.text ? `<p>${escapeHtml(resources.text)}</p>` : ""}
            </div>
            <div class="grid ${resources.items.length === 4 ? "grid-2" : "grid-3"}">
              ${renderInfoCards(
                resources.items.map((item) => ({
                  ...item,
                  link: item.link || { slug: fallbackSlug },
                })),
              )}
            </div>
          </div>
        </section>
      `
      : "";

  const renderHome = (page) => `
    <section class="hero">
      <div class="container hero-grid${page.hero.sideItems?.length ? "" : " hero-grid--single"}">
        <div class="hero-copy reveal">
          <p class="eyebrow">${escapeHtml(page.hero.eyebrow)}</p>
          <h1>${escapeHtml(page.hero.title)}</h1>
          <p class="hero-text">${escapeHtml(page.hero.text)}</p>
          ${renderListItems(page.hero.bullets, "hero-bullets")}
          <div class="hero-actions">
            <a class="button" href="${buildUrl("contact")}">${escapeHtml(page.hero.primaryCta)}</a>
            <a class="button button-ghost" href="${buildUrl("solutions")}">${escapeHtml(page.hero.secondaryCta)}</a>
          </div>
        </div>
        ${
          page.hero.sideItems?.length
            ? `<aside class="hero-panel glass reveal">
          <span class="hero-panel__label">${escapeHtml(page.hero.sideLabel)}</span>
          <div class="hero-panel__stack">
            ${(page.hero.sideItems || [])
              .map(
                (item) => `
                  <article class="stack-card">
                    <h3>${escapeHtml(item.title)}</h3>
                    <p>${escapeHtml(item.text)}</p>
                  </article>
                `,
              )
              .join("")}
          </div>
        </aside>`
            : ""
        }
      </div>
    </section>

    ${
      page.tenderSpotlight
        ? `
      <section class="section">
        <div class="container reveal">
          <article class="cta-band cta-band--spotlight">
            <div>
              <h2>${escapeHtml(page.tenderSpotlight.title)}</h2>
              <p>${escapeHtml(page.tenderSpotlight.text)}</p>
            </div>
            <div class="cta-band__actions">
              <a class="button" href="${buildConfigLink(page.tenderSpotlight.primaryLink, "contact")}">${escapeHtml(page.tenderSpotlight.primary)}</a>
              <a class="button button-ghost" href="${buildConfigLink(page.tenderSpotlight.secondaryLink, "procurementAiAgent")}">${escapeHtml(page.tenderSpotlight.secondary)}</a>
            </div>
          </article>
        </div>
      </section>
    `
        : ""
    }

    ${renderInfoSection(page.scenarios)}

    ${renderInfoSection(page.platform, { soft: true })}

    ${renderInfoSection(page.integration)}

    ${renderInfoSection(page.reliability, { soft: true })}

    <section class="section">
      <div class="container reveal">
        <article class="cta-band">
          <div>
            <h2>${escapeHtml(page.cta.title)}</h2>
            <p>${escapeHtml(page.cta.text)}</p>
          </div>
          <div class="cta-band__actions">
            <a class="button" href="${buildConfigLink(page.cta.primaryLink, "contact")}">${escapeHtml(page.cta.primary)}</a>
            <a class="button button-ghost" href="${buildConfigLink(page.cta.secondaryLink, "solutions")}">${escapeHtml(page.cta.secondary)}</a>
          </div>
        </article>
      </div>
    </section>
  `;

  const renderSolutionCard = (card) => `
    <article class="solution-card" id="${escapeHtml(card.id)}">
      <span class="card-label">${escapeHtml(card.label)}</span>
      <h2>${escapeHtml(card.title)}</h2>
      <p class="solution-card__lead">${escapeHtml(card.audience)}</p>
      <p>${escapeHtml(card.pain)}</p>
      ${renderListItems(card.modules)}
      <div class="solution-meta solution-meta--compact">
        <p><strong>${escapeHtml(currentCommon.labels.firstResult)}:</strong> ${escapeHtml(card.firstResult)}</p>
        <p><strong>${escapeHtml(currentCommon.labels.timing)}:</strong> ${escapeHtml(card.timing)}</p>
      </div>
      <div class="solution-card__actions">
        <a class="text-link" href="${buildConfigLink(card.primaryLink || "contact", "contact")}">${escapeHtml(card.cta)}</a>
        ${
          card.secondaryCta
            ? `<a class="text-link" href="${buildConfigLink(card.secondaryLink || "contact", "contact")}">${escapeHtml(card.secondaryCta)}</a>`
            : ""
        }
      </div>
    </article>
  `;

  const renderSolutions = (page) => `
    <section class="page-hero">
      <div class="container reveal">
        <p class="eyebrow">${escapeHtml(page.hero.eyebrow)}</p>
        <h1>${escapeHtml(page.hero.title)}</h1>
        <p class="page-hero__text">${escapeHtml(page.hero.text)}</p>
        <div class="page-pills">
          ${(page.quickLinks || [])
            .map(
              (link) =>
                `<a class="page-pill" href="#${escapeHtml(link.id)}">${escapeHtml(link.label)}</a>`,
            )
            .join("")}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container reveal">
        ${
          page.scenarios?.items?.length
            ? `
              <div class="section-head">
                <h2>${escapeHtml(page.scenarios.title)}</h2>
                ${page.scenarios.text ? `<p>${escapeHtml(page.scenarios.text)}</p>` : ""}
              </div>
              <div class="grid ${page.scenarios.items.length === 4 ? "grid-2" : "grid-3"}">
                ${renderInfoCards(page.scenarios.items)}
              </div>
            `
            : ""
        }
      </div>
    </section>

    <section class="section section-soft">
      <div class="container reveal">
        <div class="grid grid-2">
          ${(page.cards || []).map(renderSolutionCard).join("")}
        </div>
      </div>
    </section>

    ${renderResourceSection(page.resources)}

    <section class="section">
      <div class="container reveal">
        <article class="cta-band">
          <div>
            <h2>${escapeHtml(page.cta.title)}</h2>
            <p>${escapeHtml(page.cta.text)}</p>
          </div>
          <div class="cta-band__actions">
            <a class="button" href="${buildConfigLink(page.cta.primaryLink, "contact")}">${escapeHtml(page.cta.primary)}</a>
            <a class="button button-ghost" href="${buildConfigLink(page.cta.secondaryLink, "approach")}">${escapeHtml(page.cta.secondary)}</a>
          </div>
        </article>
      </div>
    </section>
  `;

  const renderCaseCard = (item) => `
    <article class="case-card" id="${escapeHtml(item.id)}">
      <div class="case-card__top">
        <span class="case-card__label">${escapeHtml(item.label)}</span>
        <span class="case-card__status">${escapeHtml(currentCommon.labels.status)}: ${escapeHtml(item.status)}</span>
      </div>
      <h2>${escapeHtml(item.title)}</h2>
      <div class="case-flow">
        <div>
          <span>${escapeHtml(currentCommon.labels.challenge)}</span>
          <p>${escapeHtml(item.challenge)}</p>
        </div>
        <div>
          <span>${escapeHtml(currentCommon.labels.solution)}</span>
          <p>${escapeHtml(item.solution)}</p>
        </div>
        <div>
          <span>${escapeHtml(currentCommon.labels.result)}</span>
          <p>${escapeHtml(item.result)}</p>
        </div>
      </div>
      ${renderListItems(item.outcomes, "compact-list compact-list--light")}
      <div class="case-card__demo">
        <span>${escapeHtml(currentCommon.labels.demo)}</span>
        ${renderListItems(item.demo, "compact-list compact-list--light")}
      </div>
    </article>
  `;

  const renderCases = (page) => `
    <section class="page-hero">
      <div class="container reveal">
        <p class="eyebrow">${escapeHtml(page.hero.eyebrow)}</p>
        <h1>${escapeHtml(page.hero.title)}</h1>
        <p class="page-hero__text">${escapeHtml(page.hero.text)}</p>
      </div>
    </section>

    <section class="section section-soft">
      <div class="container reveal">
        <div class="section-head">
          <h2>${escapeHtml(page.demoBlock.title)}</h2>
        </div>
        <div class="chip-grid">
          ${(page.demoBlock.items || [])
            .map((item) => `<span class="chip">${escapeHtml(item)}</span>`)
            .join("")}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container reveal">
        <div class="case-list">
          ${(page.cases || []).map(renderCaseCard).join("")}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container reveal">
        <article class="cta-band">
          <div>
            <h2>${escapeHtml(page.cta.title)}</h2>
            <p>${escapeHtml(page.cta.text)}</p>
          </div>
          <div class="cta-band__actions">
            <a class="button" href="${buildUrl("contact")}">${escapeHtml(page.cta.primary)}</a>
            <a class="button button-ghost" href="${buildUrl("solutions")}">${escapeHtml(page.cta.secondary)}</a>
          </div>
        </article>
      </div>
    </section>
  `;

  const renderApproach = (page) => `
    <section class="page-hero">
      <div class="container reveal">
        <p class="eyebrow">${escapeHtml(page.hero.eyebrow)}</p>
        <h1>${escapeHtml(page.hero.title)}</h1>
        <p class="page-hero__text">${escapeHtml(page.hero.text)}</p>
      </div>
    </section>

    <section class="section" id="timeline">
      <div class="container reveal">
        <div class="section-head">
          <h2>${escapeHtml(page.timeline.title)}</h2>
          <p>${escapeHtml(page.timeline.text)}</p>
        </div>
        <div class="step-grid step-grid--four">
          ${(page.timeline.items || [])
            .map(
              (item, index) => `
                <article class="step-card">
                  <strong>${String(index + 1).padStart(2, "0")}</strong>
                  <p>${escapeHtml(item)}</p>
                </article>
              `,
            )
            .join("")}
        </div>
      </div>
    </section>

    <section class="section section-soft" id="formats">
      <div class="container reveal">
        <div class="section-head">
          <h2>${escapeHtml(page.formats.title)}</h2>
          <p>${escapeHtml(page.formats.text)}</p>
        </div>
        <div class="grid grid-3">
          ${(page.formats.items || [])
            .map(
              (item) => `
                <article class="info-card">
                  <h3>${escapeHtml(item.title)}</h3>
                  <p><strong>${escapeHtml(item.audienceLabel)}:</strong> ${escapeHtml(item.audience)}</p>
                  <p><strong>${escapeHtml(item.resultLabel)}:</strong> ${escapeHtml(item.result)}</p>
                  <p><strong>${escapeHtml(item.timingLabel)}:</strong> ${escapeHtml(item.timing)}</p>
                </article>
              `,
            )
            .join("")}
        </div>
        <p class="section-note">${escapeHtml(page.formats.note)}</p>
      </div>
    </section>

    <section class="section">
      <div class="container reveal">
        <div class="section-head">
          <h2>${escapeHtml(page.startingPoints.title)}</h2>
          <p>${escapeHtml(page.startingPoints.text)}</p>
        </div>
        <div class="chip-grid">
          ${(page.startingPoints.items || [])
            .map((item) =>
              item.link
                ? `<a class="chip" href="${buildConfigLink(item.link, "solutions")}">${escapeHtml(item.label)}</a>`
                : `<span class="chip">${escapeHtml(item)}</span>`,
            )
            .join("")}
        </div>
      </div>
    </section>

    ${renderResourceSection(page.resources)}

    <section class="section" id="faq">
      <div class="container reveal">
        <div class="section-head">
          <h2>${escapeHtml(page.faq.title)}</h2>
        </div>
        <div class="grid grid-3">
          ${(page.faq.items || [])
            .map(
              (item) => `
                <article class="info-card faq-card">
                  <h3>${escapeHtml(item.question)}</h3>
                  <p>${escapeHtml(item.answer)}</p>
                </article>
              `,
            )
            .join("")}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container reveal">
        <article class="cta-band">
          <div>
            <h2>${escapeHtml(page.cta.title)}</h2>
            <p>${escapeHtml(page.cta.text)}</p>
          </div>
          <div class="cta-band__actions">
            <a class="button" href="${buildConfigLink(page.cta.primaryLink, "contact")}">${escapeHtml(page.cta.primary)}</a>
            <a class="button button-ghost" href="${buildConfigLink(page.cta.secondaryLink, "contact")}">${escapeHtml(page.cta.secondary)}</a>
          </div>
        </article>
      </div>
    </section>
  `;

  const createErrorMarkup = (field) =>
    `<p class="form-field-error" id="${field}Error" aria-live="polite"></p>`;

  const renderForm = () => {
    const form = currentCommon.form;
    const contactMethodOptions = [
      `<option value="">${escapeHtml(form.contactMethodPlaceholder)}</option>`,
      ...(form.contactMethodOptions || []).map(
        (option) =>
          `<option value="${escapeHtml(option.value)}">${escapeHtml(option.label)}</option>`,
      ),
    ].join("");
    const projectTypeOptions = [
      `<option value="">${escapeHtml(form.projectTypePlaceholder)}</option>`,
      ...(form.projectTypeOptions || []).map(
        (option) =>
          `<option value="${escapeHtml(option.value)}">${escapeHtml(option.label)}</option>`,
      ),
    ].join("");
    const legalLinks = (currentCommon.footer.legalLinks || [])
      .map(
        (item) =>
          `<a href="${buildUrl(item.slug)}">${escapeHtml(item.label)}</a>`,
      )
      .join(" · ");
    const privacyLabel =
      currentCommon.footer.legalLinks?.find((item) => item.slug === "privacy")
        ?.label ||
      (currentLanguage === "ru"
        ? "Политика обработки персональных данных"
        : "Privacy policy");
    const consentLabel =
      currentCommon.footer.legalLinks?.find(
        (item) => item.slug === "personalDataConsent",
      )?.label ||
      (currentLanguage === "ru"
        ? "Согласие на обработку персональных данных"
        : "Personal data consent");
    const consentMarkup = `${escapeHtml(form.consentPrefix || "")}<a href="${buildUrl("personalDataConsent")}">${escapeHtml(consentLabel)}</a>${escapeHtml(form.consentMiddle || "")}<a href="${buildUrl("privacy")}">${escapeHtml(privacyLabel)}</a>${escapeHtml(form.consentSuffix || "")}`;

    return `
      <section class="form-shell">
        <div class="form-block glass">
          <h2>${escapeHtml(form.title)}</h2>
          <p>${escapeHtml(form.intro)}</p>
          <form id="leadForm" novalidate>
            <label for="nameInput">
              <span>${escapeHtml(form.nameLabel)}</span>
            </label>
            <input
              id="nameInput"
              type="text"
              name="name"
              maxlength="120"
              autocomplete="name"
              placeholder="${escapeHtml(form.namePlaceholder)}"
              required
              aria-required="true"
              aria-describedby="nameError"
            />
            ${createErrorMarkup("name")}

            <label for="contactMethod">
              <span>${escapeHtml(form.contactMethodLabel)}</span>
            </label>
            <select
              name="contactMethod"
              id="contactMethod"
              required
              aria-required="true"
              aria-describedby="contactMethodError"
            >
              ${contactMethodOptions}
            </select>
            ${createErrorMarkup("contactMethod")}

            <div id="contactMethodOtherWrap" hidden>
              <label for="contactMethodOther">
                <span>${escapeHtml(form.contactMethodOtherLabel)}</span>
              </label>
              <input
                id="contactMethodOther"
                type="text"
                name="contactMethodOther"
                maxlength="80"
                placeholder="${escapeHtml(form.contactMethodOtherPlaceholder)}"
                aria-describedby="contactMethodOtherError"
              />
              ${createErrorMarkup("contactMethodOther")}
            </div>

            <div class="grid grid-2">
              <div>
                <label for="contactValue">
                  <span>${escapeHtml(form.contactValueLabel)}</span>
                </label>
                <input
                  id="contactValue"
                  type="text"
                  name="contactValue"
                  maxlength="160"
                  autocomplete="off"
                  placeholder="${escapeHtml(form.contactValuePlaceholders.default)}"
                  required
                  aria-required="true"
                  aria-describedby="contactValueError"
                />
                ${createErrorMarkup("contactValue")}
              </div>
              <div>
                <label for="projectType">
                  <span>${escapeHtml(form.projectTypeLabel)}</span>
                </label>
                <select
                  id="projectType"
                  name="projectType"
                  required
                  aria-required="true"
                  aria-describedby="projectTypeError"
                >
                  ${projectTypeOptions}
                </select>
                ${createErrorMarkup("projectType")}
              </div>
            </div>

            <label for="messageInput">
              <span>${escapeHtml(form.messageLabel)}</span>
            </label>
            <textarea
              id="messageInput"
              name="message"
              rows="6"
              maxlength="2000"
              placeholder="${escapeHtml(form.messagePlaceholder)}"
              required
              aria-required="true"
              aria-describedby="messageError"
            ></textarea>
            ${createErrorMarkup("message")}

            <div class="grid grid-2">
              <div>
                <label for="deadlineInput">
                  <span>${escapeHtml(form.deadlineLabel)}</span>
                </label>
                <input
                  id="deadlineInput"
                  type="text"
                  name="deadline"
                  maxlength="80"
                  autocomplete="off"
                  placeholder="${escapeHtml(form.deadlinePlaceholder)}"
                />
              </div>
              <div>
                <label for="budgetInput">
                  <span>${escapeHtml(form.budgetLabel)}</span>
                </label>
                <input
                  id="budgetInput"
                  type="text"
                  name="budget"
                  maxlength="80"
                  autocomplete="off"
                  placeholder="${escapeHtml(form.budgetPlaceholder)}"
                />
              </div>
            </div>

            <input
              type="text"
              name="website"
              class="hp"
              tabindex="-1"
              autocomplete="off"
              aria-hidden="true"
            />
            <input type="hidden" name="consentSource" value="contact form" />
            <input
              type="hidden"
              name="consentDocumentUrl"
              value="https://arvectum.com/personal-data-consent.html"
            />
            <input
              type="hidden"
              name="consentPolicyUrl"
              value="https://arvectum.com/privacy.html"
            />
            <input
              type="hidden"
              name="consentVersion"
              value="pdn-2026-06-24"
            />

            <label class="form-consent" for="personalDataConsent">
              <input
                id="personalDataConsent"
                type="checkbox"
                name="personalDataConsent"
                required
                aria-required="true"
                aria-describedby="personalDataConsentError"
              />
              <span>${consentMarkup}</span>
            </label>
            ${createErrorMarkup("personalDataConsent")}

            <button class="button" type="submit">${escapeHtml(form.submitLabel)}</button>
            <p class="form-status" id="formStatus" aria-live="polite"></p>
            <p class="form-direct-contacts" id="formDirectContacts" hidden>${escapeHtml(form.successContacts)}</p>
            <p class="form-disclaimer">${escapeHtml(form.legalNotice)}</p>
            <p class="form-legal-links">${legalLinks}</p>
          </form>
        </div>
      </section>
    `;
  };

  const renderContact = (page) => `
    <section class="page-hero">
      <div class="container reveal">
        <p class="eyebrow">${escapeHtml(page.hero.eyebrow)}</p>
        <h1>${escapeHtml(page.hero.title)}</h1>
        <p class="page-hero__text">${escapeHtml(page.hero.text)}</p>
      </div>
    </section>

    <section class="section section-soft">
      <div class="container reveal">
        <div class="section-head">
          <h2>${escapeHtml(page.firstCall.title)}</h2>
        </div>
        <div class="step-grid">
          ${(page.firstCall.items || [])
            .map(
              (item, index) => `
                <article class="step-card">
                  <strong>${String(index + 1).padStart(2, "0")}</strong>
                  <p>${escapeHtml(item)}</p>
                </article>
              `,
            )
            .join("")}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container reveal">
        ${
          new URLSearchParams(window.location.search).get("status") === "error"
            ? `<div class="contact-status contact-status--error">${escapeHtml(currentCommon.form.errorFallback)}</div>`
            : ""
        }
        ${renderForm()}
      </div>
    </section>
  `;

  const renderDirectionPage = (page) => `
    <section class="page-hero">
      <div class="container reveal">
        <p class="eyebrow">${escapeHtml(page.hero.eyebrow)}</p>
        <h1>${escapeHtml(page.hero.title)}</h1>
        <p class="page-hero__text">${escapeHtml(page.hero.text)}</p>
        ${
          page.hero.pills?.length
            ? `<div class="page-pills">
                ${page.hero.pills
                  .map(
                    (item) =>
                      `<span class="page-pill">${escapeHtml(item)}</span>`,
                  )
                  .join("")}
              </div>`
            : ""
        }
      </div>
    </section>

    <section class="section">
      <div class="container reveal">
        <div class="section-head">
          <h2>${escapeHtml(page.audience.title)}</h2>
          <p>${escapeHtml(page.audience.text)}</p>
        </div>
        <div class="grid grid-2">
          ${renderInfoCards(page.audience.items)}
        </div>
      </div>
    </section>

    <section class="section section-soft">
      <div class="container reveal">
        <div class="section-head">
          <h2>${escapeHtml(page.capabilities.title)}</h2>
          <p>${escapeHtml(page.capabilities.text)}</p>
        </div>
        <div class="grid grid-2">
          ${(page.capabilities.items || [])
            .map(
              (item) => `
                <article class="info-card">
                  <h3>${escapeHtml(item.title)}</h3>
                  <ul class="compact-list">
                    ${(item.points || [])
                      .map((point) => `<li>${escapeHtml(point)}</li>`)
                      .join("")}
                  </ul>
                </article>
              `,
            )
            .join("")}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container reveal">
        <div class="grid grid-3">
          ${(page.outcomes || [])
            .map(
              (item) => `
                <article class="info-card">
                  <h3>${escapeHtml(item.title)}</h3>
                  <p>${escapeHtml(item.text)}</p>
                </article>
              `,
            )
            .join("")}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container reveal">
        <div class="section-head">
          <h2>${escapeHtml(page.faq.title)}</h2>
        </div>
        <div class="faq-list">
          ${(page.faq.items || [])
            .map(
              (item) => `
                <details class="faq-item">
                  <summary>${escapeHtml(item.question)}</summary>
                  <p>${escapeHtml(item.answer)}</p>
                </details>
              `,
            )
            .join("")}
        </div>
      </div>
    </section>

    ${renderResourceSection(page.resources)}

    <section class="section">
      <div class="container reveal">
        <article class="cta-band">
          <div>
            <h2>${escapeHtml(page.cta.title)}</h2>
            <p>${escapeHtml(page.cta.text)}</p>
          </div>
          <div class="cta-band__actions">
            <a class="button" href="${buildConfigLink(page.cta.primaryLink, "contact")}">${escapeHtml(page.cta.primary)}</a>
            <a class="button button-ghost" href="${buildConfigLink(page.cta.secondaryLink, "solutions")}">${escapeHtml(page.cta.secondary)}</a>
          </div>
        </article>
      </div>
    </section>
  `;

  const pageRenderers = {
    home: renderHome,
    solutions: renderSolutions,
    cases: renderCases,
    approach: renderApproach,
    contact: renderContact,
    procurement: renderDirectionPage,
    documentWorkflow: renderDirectionPage,
    operationsAutomation: renderDirectionPage,
    aiDocumentChecks: renderDirectionPage,
  };

  const renderPage = () => {
    const pageRoot = document.getElementById("pageRoot");
    if (!pageRoot) return;
    const renderer = pageRenderers[currentPage];
    if (renderer && currentContent) {
      pageRoot.innerHTML = renderer(currentContent);
    }
  };

  const setCookie = (name, value, days = 180) => {
    const expires = days
      ? `; expires=${new Date(Date.now() + days * 864e5).toUTCString()}`
      : "";
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Lax${expires}`;
  };

  const getCookie = (name) => {
    const escaped = name.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&");
    const match = document.cookie.match(
      new RegExp(`(?:^|; )${escaped}=([^;]*)`),
    );
    return match ? decodeURIComponent(match[1]) : null;
  };

  const clearCookie = (name) => {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  };

  const generateId = (prefix) => {
    const random = Math.random().toString(36).slice(2, 10);
    return `${prefix}_${Date.now().toString(36)}_${random}`;
  };

  const readConsent = () => {
    let storedConsent = null;
    try {
      storedConsent = window.localStorage.getItem(CONSENT_COOKIE_NAME);
    } catch (_) {
      storedConsent = null;
    }

    const raw = getCookie(CONSENT_COOKIE_NAME) || storedConsent;
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (_) {
      return null;
    }
  };

  const persistConsent = (payload) => {
    const serialized = JSON.stringify(payload);
    setCookie(CONSENT_COOKIE_NAME, serialized, 180);
    setCookie(
      `${COOKIE_PREFIX}consent_status`,
      payload.analytics ? "all" : "essential",
      180,
    );
    setCookie(`${COOKIE_PREFIX}consent_updated_at`, payload.updatedAt, 180);
    try {
      window.localStorage.setItem(CONSENT_COOKIE_NAME, serialized);
    } catch (_) {
      // localStorage may be unavailable in privacy modes.
    }
  };

  const clearAnalyticsCookies = () => {
    [
      `${COOKIE_PREFIX}visitor_id`,
      `${COOKIE_PREFIX}session_id`,
      `${COOKIE_PREFIX}first_visit`,
      `${COOKIE_PREFIX}last_visit`,
      `${COOKIE_PREFIX}landing_path`,
      `${COOKIE_PREFIX}referrer`,
      `${COOKIE_PREFIX}utm_source`,
      `${COOKIE_PREFIX}utm_medium`,
      `${COOKIE_PREFIX}utm_campaign`,
      `${COOKIE_PREFIX}utm_term`,
      `${COOKIE_PREFIX}utm_content`,
    ].forEach(clearCookie);
  };

  const getVisitSnapshot = () => {
    const url = new URL(window.location.href);
    return {
      path: `${url.pathname}${url.search}`,
      referrer: document.referrer || "direct",
      utm_source: url.searchParams.get("utm_source") || "",
      utm_medium: url.searchParams.get("utm_medium") || "",
      utm_campaign: url.searchParams.get("utm_campaign") || "",
      utm_term: url.searchParams.get("utm_term") || "",
      utm_content: url.searchParams.get("utm_content") || "",
    };
  };

  const applyConsent = (consent) => {
    setCookie(`${COOKIE_PREFIX}essential`, "true", 180);

    if (!consent || !consent.analytics) {
      clearAnalyticsCookies();
      return;
    }

    const snapshot = getVisitSnapshot();
    const visitorId =
      getCookie(`${COOKIE_PREFIX}visitor_id`) || generateId("visitor");
    const firstVisit =
      getCookie(`${COOKIE_PREFIX}first_visit`) || new Date().toISOString();

    setCookie(`${COOKIE_PREFIX}visitor_id`, visitorId, 180);
    setCookie(`${COOKIE_PREFIX}session_id`, generateId("session"), 1);
    setCookie(`${COOKIE_PREFIX}first_visit`, firstVisit, 180);
    setCookie(`${COOKIE_PREFIX}last_visit`, new Date().toISOString(), 180);
    setCookie(`${COOKIE_PREFIX}landing_path`, snapshot.path, 30);
    setCookie(`${COOKIE_PREFIX}referrer`, snapshot.referrer, 30);
    setCookie(`${COOKIE_PREFIX}utm_source`, snapshot.utm_source, 30);
    setCookie(`${COOKIE_PREFIX}utm_medium`, snapshot.utm_medium, 30);
    setCookie(`${COOKIE_PREFIX}utm_campaign`, snapshot.utm_campaign, 30);
    setCookie(`${COOKIE_PREFIX}utm_term`, snapshot.utm_term, 30);
    setCookie(`${COOKIE_PREFIX}utm_content`, snapshot.utm_content, 30);
  };

  const sendConsentLog = (consent) => {
    try {
      const snapshot = getVisitSnapshot();
      const payload = {
        consentVersion: consent.version,
        analytics: !!consent.analytics,
        updatedAt: consent.updatedAt,
        path: snapshot.path,
      };

      if (consent.analytics) {
        payload.visitorId = getCookie(`${COOKIE_PREFIX}visitor_id`) || null;
        payload.sessionId = getCookie(`${COOKIE_PREFIX}session_id`) || null;
        payload.firstVisit = getCookie(`${COOKIE_PREFIX}first_visit`) || null;
        payload.lastVisit = getCookie(`${COOKIE_PREFIX}last_visit`) || null;
        payload.landingPath =
          getCookie(`${COOKIE_PREFIX}landing_path`) || snapshot.path;
        payload.referrer = document.referrer || "";
        payload.utm_source = snapshot.utm_source;
        payload.utm_medium = snapshot.utm_medium;
        payload.utm_campaign = snapshot.utm_campaign;
        payload.utm_term = snapshot.utm_term;
        payload.utm_content = snapshot.utm_content;
        payload.language = navigator.language;
      }

      const body = JSON.stringify(payload);
      const blob = new Blob([body], { type: "application/json" });
      if (
        typeof navigator.sendBeacon === "function" &&
        navigator.sendBeacon("/api/cookie-consent.php", blob)
      ) {
        return true;
      }
      fetch("/api/cookie-consent.php", {
        method: "POST",
        keepalive: true,
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body,
      })
        .then((response) => response.ok)
        .catch(() => false);
      return true;
    } catch (_) {
      // consent log errors should never block the site
      return false;
    }
  };

  const saveConsent = ({ analytics }) => {
    const payload = {
      version: CONSENT_VERSION,
      analytics: !!analytics,
      updatedAt: new Date().toISOString(),
    };
    persistConsent(payload);
    applyConsent(payload);
    void sendConsentLog(payload);
    return payload;
  };

  const focusFirst = (container) => {
    const first = container?.querySelector(FOCUSABLE_SELECTOR);
    if (first) first.focus();
  };

  const trapFocus = (container, event) => {
    if (event.key !== "Tab") return;
    const focusable = Array.from(
      container.querySelectorAll(FOCUSABLE_SELECTOR),
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const syncCookieToggleLabel = () => {
    const label = document.getElementById("cookieAnalyticsLabel");
    const toggle = document.getElementById("cookieAnalyticsToggle");
    if (!label || !toggle) return;
    label.textContent = toggle.checked
      ? currentCommon.cookies.analyticsOn
      : currentCommon.cookies.analyticsOff;
  };

  const renderCookies = () => {
    const cookies = currentCommon.cookies;
    setText("cookieBannerEyebrow", cookies.bannerEyebrow);
    setText("cookieBannerTitle", cookies.bannerTitle);
    setText("cookieBannerText", cookies.bannerText);
    setText("cookieDeclineBtn", cookies.decline);
    setText("cookieCustomizeBtn", cookies.customize);
    setText("cookieAcceptBtn", cookies.accept);
    setText("cookiePrefsEyebrow", cookies.prefsEyebrow);
    setText("cookieModalTitle", cookies.prefsTitle);
    setText("cookieEssentialTitle", cookies.essentialTitle);
    setText("cookieEssentialText", cookies.essentialText);
    setText("cookieEssentialAlwaysOn", cookies.essentialAlwaysOn);
    setText("cookieAnalyticsTitle", cookies.analyticsTitle);
    setText("cookieAnalyticsText", cookies.analyticsText);
    setText("cookieSaveEssentialBtn", cookies.saveEssential);
    setText("cookieSavePrefsBtn", cookies.savePrefs);

    const closeButton = document.getElementById("cookieModalClose");
    if (closeButton) {
      closeButton.setAttribute("aria-label", cookies.closeLabel);
    }

    const links = (currentCommon.footer.legalLinks || [])
      .filter(
        (item) => item.slug === "cookiesPolicy" || item.slug === "privacy",
      )
      .map(
        (item) =>
          `<a href="${buildUrl(item.slug)}">${escapeHtml(item.label)}</a>`,
      )
      .join(" · ");
    setHtml(
      "cookieBannerLinks",
      links ? `<p class="cookie-links">${links}</p>` : "",
    );

    syncCookieToggleLabel();
  };

  const initializeCookieConsent = () => {
    const banner = document.getElementById("cookieBanner");
    const modal = document.getElementById("cookieModalBackdrop");
    const modalDialog = document.getElementById("cookieModal");
    const toggle = document.getElementById("cookieAnalyticsToggle");
    const acceptBtn = document.getElementById("cookieAcceptBtn");
    const declineBtn = document.getElementById("cookieDeclineBtn");
    const customizeBtn = document.getElementById("cookieCustomizeBtn");
    const saveEssentialBtn = document.getElementById("cookieSaveEssentialBtn");
    const savePrefsBtn = document.getElementById("cookieSavePrefsBtn");
    const closeBtn = document.getElementById("cookieModalClose");

    const closeModal = () => {
      document.body.classList.remove("cookie-modal-open");
      if (modal) modal.hidden = true;
      if (
        cookieRestoreFocus &&
        typeof cookieRestoreFocus.focus === "function"
      ) {
        cookieRestoreFocus.focus();
      }
    };

    const openModal = () => {
      cookieRestoreFocus = document.activeElement;
      document.body.classList.add("cookie-modal-open");
      if (modal) modal.hidden = false;
      focusFirst(modalDialog);
    };

    const finalize = (analytics) => {
      saveConsent({ analytics });
      if (banner) banner.hidden = true;
      closeModal();
      syncCookieToggleLabel();
    };

    const consent = readConsent();
    if (consent) {
      applyConsent(consent);
      if (banner) banner.hidden = true;
      if (toggle) toggle.checked = !!consent.analytics;
    } else if (banner) {
      banner.hidden = false;
    }

    syncCookieToggleLabel();

    if (toggle) {
      toggle.addEventListener("change", syncCookieToggleLabel);
    }
    if (acceptBtn) acceptBtn.addEventListener("click", () => finalize(true));
    if (declineBtn) declineBtn.addEventListener("click", () => finalize(false));
    if (customizeBtn) {
      customizeBtn.addEventListener("click", () => {
        const currentConsent = readConsent();
        if (toggle) {
          toggle.checked = currentConsent ? !!currentConsent.analytics : false;
        }
        syncCookieToggleLabel();
        openModal();
      });
    }
    if (saveEssentialBtn) {
      saveEssentialBtn.addEventListener("click", () => finalize(false));
    }
    if (savePrefsBtn) {
      savePrefsBtn.addEventListener("click", () =>
        finalize(toggle ? toggle.checked : false),
      );
    }
    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (modal) {
      modal.addEventListener("click", (event) => {
        if (event.target === modal) closeModal();
      });
      modal.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeModal();
        if (modalDialog) trapFocus(modalDialog, event);
      });
    }
  };

  const initMenu = () => {
    const body = document.body;
    const drawer = document.getElementById("menuDrawer");
    const drawerPanel = drawer?.querySelector(".menu-drawer__panel");
    const toggle = document.getElementById("menuToggle");
    const close = document.getElementById("menuClose");

    const syncMenuState = (isOpen) => {
      if (toggle) toggle.setAttribute("aria-expanded", String(isOpen));
      body.classList.toggle("menu-open", isOpen);
      if (drawer) drawer.classList.toggle("is-open", isOpen);
    };

    const closeMenu = () => {
      syncMenuState(false);
      if (menuRestoreFocus) menuRestoreFocus.focus();
    };

    const openMenu = () => {
      menuRestoreFocus = document.activeElement;
      syncMenuState(true);
      focusFirst(drawerPanel);
    };

    if (toggle) {
      toggle.addEventListener("click", () => {
        if (body.classList.contains("menu-open")) {
          closeMenu();
        } else {
          openMenu();
        }
      });
    }

    if (close) close.addEventListener("click", closeMenu);

    if (drawer) {
      drawer.addEventListener("click", (event) => {
        if (event.target === drawer) closeMenu();
      });
      drawer.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeMenu();
        if (drawerPanel) trapFocus(drawerPanel, event);
      });
    }

    document.querySelectorAll("#menuDrawer a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });
  };

  const initLanguageSwitch = () => {
    document.querySelectorAll(".lang-switch__button").forEach((button) => {
      button.addEventListener("click", () => {
        const nextLang = button.dataset.lang;
        if (!nextLang || nextLang === currentLanguage) return;
        const file = routes[currentPage] || `${currentPage}.html`;
        const path = file === "index.html" ? "/" : `/${file}`;
        const query = nextLang === defaultLanguage ? "" : `?lang=${nextLang}`;
        window.location.href = `${path}${query}${window.location.hash}`;
      });
    });
  };

  const initReveal = () => {
    if (revealObserver) {
      revealObserver.disconnect();
      revealObserver = null;
    }

    const nodes = document.querySelectorAll(".reveal");
    if (!nodes.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      nodes.forEach((node) => node.classList.add("is-visible"));
      return;
    }
    if (typeof window.IntersectionObserver !== "function") {
      nodes.forEach((node) => node.classList.add("is-visible"));
      return;
    }

    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    nodes.forEach((node) => {
      node.classList.remove("is-visible");
      revealObserver.observe(node);
    });
  };

  const initForm = () => {
    const form = document.getElementById("leadForm");
    if (!form) return;

    const formConfig = currentCommon.form;
    const statusEl = document.getElementById("formStatus");
    const directContactsEl = document.getElementById("formDirectContacts");
    const methodSelect = document.getElementById("contactMethod");
    const methodOther = document.getElementById("contactMethodOther");
    const methodOtherWrap = document.getElementById("contactMethodOtherWrap");
    const contactValue = document.getElementById("contactValue");

    const setStatus = (message, isError = false) => {
      if (!statusEl) return;
      statusEl.textContent = message;
      statusEl.style.color = isError ? "#d14d72" : "#43e5c5";
    };

    const setFieldError = (field, message = "") => {
      const errorEl = document.getElementById(`${field}Error`);
      const input = form.querySelector(`[name="${field}"]`);
      if (errorEl) errorEl.textContent = message;
      if (input) {
        input.setAttribute("aria-invalid", message ? "true" : "false");
      }
    };

    const clearErrors = () => {
      [
        "name",
        "contactMethod",
        "contactMethodOther",
        "contactValue",
        "projectType",
        "message",
        "personalDataConsent",
      ].forEach((field) => setFieldError(field, ""));
      setStatus("");
      if (directContactsEl) directContactsEl.hidden = true;
    };

    const syncContactFields = () => {
      if (!methodSelect || !contactValue || !methodOtherWrap) return;
      const value = methodSelect.value || "default";
      const isOther = value === "other";
      methodOtherWrap.hidden = !isOther;
      if (methodOther) {
        methodOther.required = isOther;
        methodOther.setAttribute("aria-required", String(isOther));
      }
      contactValue.placeholder =
        formConfig.contactValuePlaceholders?.[value] ||
        formConfig.contactValuePlaceholders?.default ||
        "";
    };

    if (methodSelect) {
      methodSelect.addEventListener("change", () => {
        syncContactFields();
        setFieldError("contactMethod", "");
      });
      syncContactFields();
    }

    [
      "name",
      "contactMethod",
      "contactMethodOther",
      "contactValue",
      "projectType",
      "message",
      "personalDataConsent",
    ].forEach((field) => {
      const input = form.querySelector(`[name="${field}"]`);
      if (!input) return;
      input.addEventListener("input", () => setFieldError(field, ""));
      input.addEventListener("change", () => setFieldError(field, ""));
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      clearErrors();

      const formData = new FormData(form);
      const payload = {
        name: String(formData.get("name") || "").trim(),
        contactMethod: String(formData.get("contactMethod") || "").trim(),
        contactMethodOther: String(
          formData.get("contactMethodOther") || "",
        ).trim(),
        contactValue: String(formData.get("contactValue") || "").trim(),
        projectType: String(formData.get("projectType") || "").trim(),
        message: String(formData.get("message") || "").trim(),
        budget: String(formData.get("budget") || "").trim(),
        deadline: String(formData.get("deadline") || "").trim(),
        website: String(formData.get("website") || "").trim(),
        personalDataConsent: formData.get("personalDataConsent") === "on",
        consentSource: String(formData.get("consentSource") || "").trim(),
        consentDocumentUrl: String(
          formData.get("consentDocumentUrl") || "",
        ).trim(),
        consentPolicyUrl: String(formData.get("consentPolicyUrl") || "").trim(),
        consentVersion: String(formData.get("consentVersion") || "").trim(),
      };

      const validation = formConfig.validation || {};
      let hasError = false;

      if (!payload.name) {
        setFieldError("name", validation.nameRequired);
        hasError = true;
      }
      if (!payload.contactMethod) {
        setFieldError("contactMethod", validation.contactMethodRequired);
        hasError = true;
      }
      if (payload.contactMethod === "other" && !payload.contactMethodOther) {
        setFieldError(
          "contactMethodOther",
          validation.contactMethodOtherRequired,
        );
        hasError = true;
      }
      if (!payload.contactValue) {
        setFieldError("contactValue", validation.contactValueRequired);
        hasError = true;
      }
      if (!payload.projectType) {
        setFieldError("projectType", validation.projectTypeRequired);
        hasError = true;
      }
      if (!payload.message) {
        setFieldError("message", validation.messageRequired);
        hasError = true;
      }
      if (!payload.personalDataConsent) {
        setFieldError(
          "personalDataConsent",
          validation.personalDataConsentRequired,
        );
        hasError = true;
      }

      if (hasError) {
        setStatus(validation.fixErrors || formConfig.errorFallback, true);
        return;
      }

      const methodOption = (formConfig.contactMethodOptions || []).find(
        (item) => item.value === payload.contactMethod,
      );
      const projectOption = (formConfig.projectTypeOptions || []).find(
        (item) => item.value === payload.projectType,
      );

      const chosenMethod =
        payload.contactMethod === "other" && payload.contactMethodOther
          ? payload.contactMethodOther
          : methodOption?.label || payload.contactMethod;

      payload.contact = `${chosenMethod}: ${payload.contactValue}`;
      payload.contactMethod = chosenMethod;
      payload.projectType = projectOption?.label || payload.projectType;

      const submitButton = form.querySelector('button[type="submit"]');
      if (submitButton) submitButton.disabled = true;
      setStatus(validation.sending || "Sending...");

      try {
        const response = await fetch("/api/submit.php", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json().catch(() => null);
        if (!response.ok || !result?.ok) {
          if (result?.fields) {
            Object.entries(result.fields).forEach(([field, message]) => {
              setFieldError(field, String(message || ""));
            });
          }
          setStatus(result?.error || formConfig.errorFallback, true);
          return;
        }

        form.reset();
        syncContactFields();
        setStatus(validation.success || "Request sent.");
        if (directContactsEl) {
          directContactsEl.hidden = false;
          directContactsEl.textContent = formConfig.successContacts;
        }
      } catch (_) {
        setStatus(formConfig.errorFallback, true);
      } finally {
        if (submitButton) submitButton.disabled = false;
      }
    });
  };

  const renderAll = () => {
    currentLanguage = getLanguage();
    currentCommon = getLanguagePack()?.common || null;
    currentContent = getPageContent();

    if (!currentCommon) return;

    renderMeta();
    renderStructuredData();
    renderHeader();
    renderBreadcrumbs();
    renderPage();
    renderFooter();
    renderCookies();
    initMenu();
    initLanguageSwitch();
    initReveal();
    initForm();
    initializeCookieConsent();
  };

  renderAll();
})();
