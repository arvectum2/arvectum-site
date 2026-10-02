(() => {
  const config = window.SITE_CONFIG;
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const sharedRoutes = config.routes || {};
  const ru = config.languages?.ru;
  const en = config.languages?.en;

  if (!ru || !en) return;

  const ensurePage = (targetLang, pageKey, fallbackLang = ru) => {
    if (!targetLang?.pages) return;
    if (!targetLang.pages[pageKey] && fallbackLang?.pages?.[pageKey]) {
      targetLang.pages[pageKey] = clone(fallbackLang.pages[pageKey]);
    }
  };

  ["implementationScenarios", "localAiProcurement"].forEach((pageKey) => {
    ensurePage(en, pageKey, ru);
  });

  if (en.pages.implementationScenarios) {
    en.pages.implementationScenarios.meta = {
      title:
        "Implementation scenarios for procurement AI agents \u2014 Arvectum",
      description:
        "A comparison of deployment options for Arvectum AI agents: API-based cloud model, dedicated cloud perimeter, on-premise installation and air-gapped setup.",
      ogTitle:
        "Implementation scenarios for procurement AI agents \u2014 Arvectum",
      ogDescription:
        "A comparison of deployment options for Arvectum AI agents: API-based cloud model, dedicated cloud perimeter, on-premise installation and air-gapped setup.",
    };
    en.pages.implementationScenarios.hero = {
      eyebrow: "Delivery and security",
      title: "Implementation scenarios for AI agents",
      text: "From a fast pilot to an isolated perimeter: choose the deployment option where data, access, support and responsibility stay manageable.",
    };
    if (en.pages.implementationScenarios.automation) {
      en.pages.implementationScenarios.automation.title =
        "What procurement automation should cover";
      en.pages.implementationScenarios.automation.note =
        "The key task is to choose a deployment model where data, access and support remain controlled.";
      en.pages.implementationScenarios.automation.items.forEach((item, i) => {
        if (i === 0) {
          item.title = "Incoming tender";
          item.text =
            "Review requirements, documents, deadlines and constraints. Capture follow-up questions.";
        }
        if (i === 1) {
          item.title = "Quotes and suppliers";
          item.text =
            "Collect vendor quotes and compare price, timing, warranty terms and risks.";
        }
        if (i === 2) {
          item.title = "Bid package and risks";
          item.text =
            "Prepare draft documents, completeness checklists, contract risks and a decision log.";
        }
      });
    }
    if (en.pages.implementationScenarios.workflow) {
      en.pages.implementationScenarios.workflow.title = "How a request flows";
      en.pages.implementationScenarios.workflow.text =
        "The same logic works in every deployment scenario. Only the model\u2019s location and data constraints change.";
      en.pages.implementationScenarios.workflow.steps.forEach((step, i) => {
        if (i === 0) {
          step.title = "User";
          step.text =
            "Uploads documents, selects a scenario and reviews the result.";
        }
        if (i === 1) {
          step.title = "Arvectum";
          step.text =
            "Prepares context: roles, rules, statuses, constraints and an audit log.";
        }
        if (i === 2) {
          step.title = "Language model";
          step.text =
            "Analyses documents, extracts terms, compares options and drafts a decision.";
        }
        if (i === 3) {
          step.title = "Draft decision";
          step.text =
            "A responsible person reviews the output, approves the action or sends it back for revision.";
        }
      });
      en.pages.implementationScenarios.workflow.disclaimer =
        "Final decisions, external submission and legally significant actions remain with the human.";
    }
    if (en.pages.implementationScenarios.deployments) {
      en.pages.implementationScenarios.deployments.title =
        "Four deployment scenarios";
      en.pages.implementationScenarios.deployments.items.forEach((item, i) => {
        if (i === 0) {
          item.title = "Cloud model via API";
          item.text =
            "Fits a fast pilot and does not require an in-house GPU server.";
        }
        if (i === 1) {
          item.title = "Dedicated cloud perimeter";
          item.text =
            "A separate client project or perimeter in a Russian cloud. More control and isolation.";
        }
        if (i === 2) {
          item.title = "On-premise installation";
          item.text =
            "The system runs on the client\u2019s servers. Internet access can be limited.";
        }
        if (i === 3) {
          item.title = "Air-gapped perimeter";
          item.text =
            "The network is physically or logically isolated. Updates and support are handled manually.";
        }
      });
    }
    if (en.pages.implementationScenarios.difference) {
      en.pages.implementationScenarios.difference.title =
        "On-premise vs air-gapped: what is the difference?";
      en.pages.implementationScenarios.difference.text =
        "On-premise describes where the system is installed. Air-gapped describes the network isolation mode.";
      en.pages.implementationScenarios.difference.localTitle =
        "On-premise installation";
      en.pages.implementationScenarios.difference.isolatedTitle =
        "Air-gapped perimeter";
      en.pages.implementationScenarios.difference.note =
        "Practical summary: on-premise is about the place of installation, while air-gapped is about network isolation and the support model.";
    }
    if (en.pages.implementationScenarios.responsibility) {
      en.pages.implementationScenarios.responsibility.title =
        "Who is responsible for what";
      en.pages.implementationScenarios.responsibility.note =
        "If the system is installed on-premise, the provider role typically shifts to the client\u2019s IT team.";
    }
    if (en.pages.implementationScenarios.support) {
      en.pages.implementationScenarios.support.title = "Support lines";
      en.pages.implementationScenarios.support.note =
        "It is worth fixing in the contract who receives incidents, response targets, escalation rules and access to logs.";
    }
    if (en.pages.implementationScenarios.operationsModel) {
      en.pages.implementationScenarios.operationsModel.title =
        "Licensing and operations";
    }
    if (en.pages.implementationScenarios.comparison) {
      en.pages.implementationScenarios.comparison.title = "Scenario comparison";
    }
    if (en.pages.implementationScenarios.chooser) {
      en.pages.implementationScenarios.chooser.title =
        "How to choose a scenario";
      en.pages.implementationScenarios.chooser.text =
        "For a first pilot, pick the fastest agreeable option. For production, define security requirements, support and responsibility upfront.";
    }
    if (en.pages.implementationScenarios.comparisonTable) {
      en.pages.implementationScenarios.comparisonTable.title =
        "Quick scenario comparison";
      en.pages.implementationScenarios.comparisonTable.text =
        "The matrix sums up launch speed, data control, IT demands, security risk and support load.";
      en.pages.implementationScenarios.comparisonTable.columns = [
        "Scenario",
        "Speed",
        "Data control",
        "IT demands",
        "Security risk",
        "Support",
      ];
      en.pages.implementationScenarios.comparisonTable.rows = [
        {
          title: "Cloud model via API",
          values: ["High", "Lower", "Minimal", "Higher", "Simpler"],
        },
        {
          title: "Dedicated cloud perimeter",
          values: ["Medium", "Higher", "Medium", "Medium", "Medium"],
        },
        {
          title: "On-premise installation",
          values: ["Lower", "High", "High", "Lower", "More complex"],
        },
        {
          title: "Air-gapped perimeter",
          values: ["Lowest", "Maximum", "Maximum", "Minimal", "Most complex"],
        },
      ];
    }
    if (en.pages.implementationScenarios.glossary) {
      en.pages.implementationScenarios.glossary.title = "Glossary";
      en.pages.implementationScenarios.glossary.businessTitle =
        "Business terms";
      en.pages.implementationScenarios.glossary.itTitle = "IT terms";
    }
    en.pages.implementationScenarios.cta = {
      title:
        "Choose the implementation scenario around your security requirements",
      text: "We will help match deployment, support and responsibility zones to your client-side constraints.",
      primary: "Discuss the scenario",
      secondary: "Private AI perimeter",
      primaryLink: { slug: "contact" },
      secondaryLink: { slug: "localAiProcurement" },
    };
  }

  if (en.pages.localAiProcurement) {
    en.pages.localAiProcurement.meta = {
      title: "Private AI perimeter for procurement \u2014 Arvectum",
      description:
        "A private AI perimeter for procurement and tenders: on-premise setup, isolated environment, access control, logging, support model and human oversight.",
      ogTitle: "Private AI perimeter for procurement \u2014 Arvectum",
      ogDescription:
        "A private AI perimeter for procurement and tenders: on-premise setup, isolated environment, access control, logging, support model and human oversight.",
    };
    en.pages.localAiProcurement.hero.title =
      "Private AI perimeter for procurement";
    en.pages.localAiProcurement.hero.text =
      "When procurement documents and statuses cannot be sent to an external service, we design a local or isolated contour with clear roles, logs and a workable support model.";
    if (en.pages.localAiProcurement.audience) {
      en.pages.localAiProcurement.audience.title = "When this matters";
      en.pages.localAiProcurement.audience.text =
        "Useful for teams where procurement documents, risks and workflows require stricter control over access and infrastructure.";
    }
    if (en.pages.localAiProcurement.capabilities) {
      en.pages.localAiProcurement.capabilities.title =
        "What is designed inside a private perimeter";
      en.pages.localAiProcurement.capabilities.text =
        "A perimeter is not a marketing term. It is the way to respect constraints on data, access and support without losing the value of AI modules.";
    }
    if (en.pages.localAiProcurement.deployment) {
      en.pages.localAiProcurement.deployment.title =
        "How this relates to implementation scenarios";
    }
    if (en.pages.localAiProcurement.faq) {
      en.pages.localAiProcurement.faq.title = "Common questions";
    }
    if (en.pages.localAiProcurement.resources) {
      en.pages.localAiProcurement.resources.title = "Useful next pages";
      en.pages.localAiProcurement.resources.text =
        "When a private perimeter is needed, it usually helps to compare implementation scenarios and revisit the procurement workflow itself.";
    }
    en.pages.localAiProcurement.cta = {
      title: "Need a local or isolated pilot?",
      text: "We can help choose the right deployment model, clarify security limits and launch the first scenario without unsafe autonomy.",
      primary: "Discuss the scenario",
      secondary: "Implementation scenarios",
      primaryLink: { slug: "contact" },
      secondaryLink: { slug: "implementationScenarios" },
    };
  }

  const applySharedCommon = (lang, { socials, menuLabel, headerCta }) => {
    if (!lang?.common?.footer) return;
    lang.common.telegramLabel = menuLabel;
    lang.common.headerCta = headerCta;
    lang.common.footer.socialLinks = socials;
    lang.common.footer.positioning =
      lang.common.footer.positioning ||
      (lang.common.locale === "ru_RU"
        ? "AI-автоматизация бизнес-процессов"
        : "AI automation for business processes");
    lang.common.footer.navigationLinks = [
      { slug: "about", label: lang.common.footer.navigationLinks?.[0]?.label },
      {
        slug: "solutions",
        label: lang.common.footer.navigationLinks?.[1]?.label,
      },
      {
        slug: "implementationScenarios",
        label: lang.common.footer.navigationLinks?.[2]?.label,
      },
      {
        slug: "materials",
        label: lang.common.footer.navigationLinks?.[3]?.label,
      },
    ];
    lang.common.footer.flagshipLinks = [
      {
        slug: "procurement",
        label: lang.common.footer.flagshipLinks?.[0]?.label,
      },
      {
        slug: "procurement",
        label: lang.common.footer.flagshipLinks?.[1]?.label,
      },
      {
        slug: "procurement",
        label: lang.common.footer.flagshipLinks?.[2]?.label,
      },
      {
        slug: "localAiProcurement",
        label: lang.common.footer.flagshipLinks?.[3]?.label,
      },
    ];
  };

  applySharedCommon(ru, {
    menuLabel: "Телеграм",
    headerCta: "Связаться с нами",
    socials: [
      {
        kind: "telegram",
        url: "https://t.me/arvectum",
        label: "Telegram Arvectum",
      },
      {
        kind: "vk",
        url: "https://vk.com/arvectum",
        label: "VK Arvectum",
      },
      {
        kind: "dzen",
        url: "https://dzen.ru/arvectum",
        label: "Дзен Arvectum",
      },
    ],
  });
  ru.common.footer.navigationLinks = [
    { slug: "about", label: "О подходе" },
    { slug: "solutions", label: "Решения" },
    { slug: "approach", label: "Как запускаем" },
    { slug: "materials", label: "Материалы" },
    { slug: "implementationScenarios", label: "Сценарии реализации" },
  ];

  applySharedCommon(en, {
    menuLabel: "Telegram",
    headerCta: "Contact us",
    socials: [
      {
        kind: "telegram",
        url: "https://t.me/arvectum",
        label: "Telegram Arvectum",
      },
      {
        kind: "x",
        url: "https://x.com/arvectum",
        label: "X Arvectum",
      },
      {
        kind: "vk",
        url: "https://vk.com/arvectum",
        label: "VK Arvectum",
      },
      {
        kind: "dzen",
        url: "https://dzen.ru/arvectum",
        label: "Dzen Arvectum",
      },
    ],
  });
  en.common.footer.navigationLinks = [
    { slug: "about", label: "Approach" },
    { slug: "solutions", label: "Solutions" },
    { slug: "approach", label: "How we launch" },
    { slug: "materials", label: "Materials" },
    {
      slug: "implementationScenarios",
      label: "Implementation scenarios",
    },
  ];

  Object.assign(ru.common.form, {
    title: "Обсудить автоматизацию",
    intro:
      "Опишите задачу в двух-трёх предложениях. Нам важно понять, где много ручной координации, какие документы критичны и какой первый результат вы хотите увидеть.",
    successContacts:
      "Если нужен быстрый ответ, напишите нам напрямую: info@arvectum.com или в Telegram.",
  });

  Object.assign(en.common.form, {
    title: "Discuss automation",
    intro:
      "Describe the workflow in a few clear sentences. It is enough to explain where manual coordination is still heavy, which documents matter and what first result you want to see.",
    successContacts:
      "If you need a faster response, write to us directly at info@arvectum.com or on Telegram.",
  });

  Object.assign(ru.pages.home.meta, {
    description:
      "Arvectum помогает автоматизировать операционные процессы, регламенты, закупки, документооборот и внутренние маршруты с помощью AI-модулей и понятной рабочей логики.",
    ogDescription:
      "Arvectum помогает автоматизировать операционные процессы, регламенты, закупки, документооборот и внутренние маршруты с помощью AI-модулей и понятной рабочей логики.",
  });
  Object.assign(ru.pages.home.hero, {
    text: "Помогаем сократить ручную работу, упорядочить документы и собрать цифровой маршрут с понятными ролями, статусами и следующими шагами.",
    bullets: [
      "Начинаем с одного рабочего участка, а не с большой платформы",
      "Первый контур можно проверить за 2–4 недели",
      "Роли, документы и статусы видны в одной системе",
      "AI-модули готовят аналитику, сравнения и черновики",
    ],
    sideItems: [],
  });
  Object.assign(ru.pages.home.scenarios, {
    title: "Где можно начать",
    text: "Обычно стартуем с участка, где уже накопились документы, согласования или ручные проверки.",
  });
  ru.pages.home.scenarios.items = [
    {
      title: "Закупки и тендеры",
      text: "RFQ, ТКП, экономика, риски и документы в одном рабочем маршруте.",
      link: { slug: "procurement" },
      cta: "Подробнее",
      icon: "assets/icons/icon-procurement.svg",
    },
    {
      title: "Документы и согласования",
      text: "Разбор документов, маршруты согласования и понятные статусы.",
      link: { slug: "documentWorkflow" },
      cta: "Подробнее",
      icon: "assets/icons/icon-docs.svg",
    },
    {
      title: "Операционные процессы",
      text: "Регламенты, роли, поручения и журнал действий без ручной путаницы.",
      link: { slug: "operationsAutomation" },
      cta: "Подробнее",
      icon: "assets/icons/icon-workflow.svg",
    },
    {
      title: "AI-проверка документов",
      text: "Проверка комплектности, подсветка рисков и черновики memo.",
      link: { slug: "aiDocumentChecks" },
      cta: "Подробнее",
      icon: "assets/icons/icon-values.svg",
    },
  ];
  Object.assign(ru.pages.home.flagship, {
    text: "Подробный закупочный контур раскрываем в отдельном разделе. На главной оставляем только короткую карту направлений.",
  });
  ru.pages.home.flagship.items = [
    {
      title: "AI-агент",
      text: "Собирает требования, документы и статусы в одном окне.",
      link: { slug: "procurement" },
      cta: "Открыть хаб",
      icon: "assets/icons/icon-procurement.svg",
    },
    {
      title: "RFQ",
      text: "Фиксирует вопросы и предложения без хаоса в почте.",
      link: { slug: "procurement" },
      cta: "Подробнее",
      icon: "assets/icons/icon-workflow.svg",
    },
    {
      title: "ТКП",
      text: "Собирает цену, сроки и условия в одном рабочем сравнении.",
      link: { slug: "procurement" },
      cta: "Подробнее",
      icon: "assets/icons/icon-docs.svg",
    },
    {
      title: "Документы",
      text: "Показывает комплектность, версии и комментарии по заявке.",
      link: { slug: "procurement" },
      cta: "Подробнее",
      icon: "assets/icons/icon-security.svg",
    },
    {
      title: "Риски",
      text: "Готовит короткие заметки по спорным условиям и ограничениям.",
      link: { slug: "aiDocumentChecks" },
      cta: "Подробнее",
      icon: "assets/icons/icon-clarity.svg",
    },
    {
      title: "Закрытый контур",
      text: "Подходит, если документы нельзя передавать во внешний сервис.",
      link: { slug: "localAiProcurement" },
      cta: "Подробнее",
      icon: "assets/icons/icon-contour.svg",
    },
  ];
  Object.assign(ru.pages.home.aboutPreview, {
    text: "Сначала собираем понятную рабочую схему: роли, документы, статусы и точки решения. AI подключаем там, где он действительно ускоряет работу.",
  });
  ru.pages.home.aboutPreview.items = [
    {
      title: "Системность",
      text: "Маршрут строится вокруг следующего шага, документа и ответственного.",
      icon: "assets/icons/icon-process.svg",
    },
    {
      title: "Ясность",
      text: "Команда видит статус, комментарий и причину остановки без лишних созвонов.",
      icon: "assets/icons/icon-clarity.svg",
    },
    {
      title: "Контроль человека",
      text: "Аналитику и черновики готовит система, внешние действия подтверждает сотрудник.",
      icon: "assets/icons/icon-human.svg",
    },
    {
      title: "Безопасность данных",
      text: "Сразу учитываем доступы, журналы и требования к размещению.",
      icon: "assets/icons/icon-security.svg",
    },
  ];
  ru.pages.home.launch = null;
  Object.assign(ru.pages.home.delivery, {
    title: "Безопасность и сценарии реализации",
    text: "Сразу учитываем ограничения по данным, доступам, интеграциям и варианту размещения.",
    items: [
      {
        title: "Способ размещения",
        text: "API, выделенное облако, локальная установка или полностью изолированная среда.",
        icon: "assets/icons/icon-contour.svg",
      },
      {
        title: "Роли и журналы",
        text: "Фиксируем права доступа, историю действий и ответственных по шагам.",
        icon: "assets/icons/icon-security.svg",
      },
      {
        title: "Внешние действия",
        text: "Подача, отправка и подтверждение остаются за сотрудником, а не за моделью.",
        icon: "assets/icons/icon-human.svg",
      },
      {
        title: "ИТ-контур",
        text: "Проектируем обмен данными и точки интеграции без лишней ручной склейки.",
        icon: "assets/icons/icon-reliability.svg",
      },
    ],
    actions: [
      {
        label: "Сценарии реализации",
        link: { slug: "implementationScenarios" },
      },
      {
        label: "Закрытый контур AI",
        link: { slug: "localAiProcurement" },
      },
    ],
  });
  Object.assign(ru.pages.home.cta, {
    title: "Покажем, как может выглядеть первый рабочий контур",
    text: "Разберём один процесс, документы, роли и ограничения по доступам.",
    primary: "Запросить демонстрацию",
    secondary: "Как запускаем",
    secondaryLink: { slug: "approach" },
  });

  Object.assign(ru.pages.about.meta, {
    description:
      "Подход Arvectum: не магический AI, а понятная рабочая система с ролями, статусами, документами, безопасностью данных и контролем человека.",
    ogDescription:
      "Подход Arvectum: не магический AI, а понятная рабочая система с ролями, статусами, документами, безопасностью данных и контролем человека.",
  });
  Object.assign(ru.pages.about.hero, {
    text: "Arvectum — IT-компания, которая делает цифровые продукты, автоматизацию и AI-решения для бизнеса. Наша задача — упростить сложную работу, не убирая у команды финальный контроль.",
  });
  if (ru.pages.about.philosophy) {
    Object.assign(ru.pages.about.philosophy, {
      title: "Не магический AI, а управляемая система",
      text: "Нам важны не красивые обещания, а понятная рабочая логика. Поэтому сначала собираем роли, документы, статусы и точки принятия решения, а уже потом подключаем AI-модули к нужным участкам.",
    });
  }
  if (ru.pages.about.guardrails) {
    ru.pages.about.guardrails.note =
      "Мы заранее проговариваем, где модель полезна, а где всё ещё нужен человек, юрист или владелец процесса.";
  }
  if (ru.pages.about.nextLinks) {
    ru.pages.about.nextLinks.title = "Куда перейти дальше";
    ru.pages.about.nextLinks.text =
      "Если хотите перейти от принципов к практике, начните с одной из этих страниц.";
  }
  Object.assign(ru.pages.about.cta, {
    text: "Можно обсудить ваш процесс, выбрать формат запуска и сразу понять, нужен ли пилот, локальная установка или закрытый контур.",
  });

  Object.assign(ru.pages.implementationScenarios.hero, {
    text: "Помогаем выбрать, где должна работать модель: через API, в выделенном облаке, локально или в изолированной среде. Главное — чтобы данные, доступы и поддержка оставались под контролем.",
  });
  if (ru.pages.implementationScenarios.automation) {
    ru.pages.implementationScenarios.automation.text =
      "Эта страница нужна, когда важно не только что автоматизировать, но и как безопасно развернуть систему.";
  }
  if (ru.pages.implementationScenarios.workflow) {
    Object.assign(ru.pages.implementationScenarios.workflow, {
      title: "Как проходит запрос",
      text: "Одинаковая логика работает во всех сценариях размещения. Меняется только то, где находится модель и какие ограничения действуют для данных.",
      disclaimer:
        "Финальное решение, внешняя отправка и юридически значимые действия остаются за человеком.",
    });
    ru.pages.implementationScenarios.workflow.steps.forEach((step, i) => {
      if (i === 0) {
        step.text =
          "Загружает документы, выбирает сценарий и проверяет результат.";
      }
      if (i === 1) {
        step.text =
          "Готовит контекст: роли, правила, статусы, ограничения и журнал действий.";
      }
      if (i === 2) {
        step.text =
          "Анализирует документы, извлекает условия, сравнивает варианты и готовит черновик.";
      }
      if (i === 3) {
        step.text =
          "Ответственный сотрудник проверяет вывод, утверждает действие или отправляет на доработку.";
      }
    });
  }
  if (ru.pages.implementationScenarios.comparisonTable) {
    ru.pages.implementationScenarios.comparisonTable.text =
      "Матрица помогает быстро сравнить варианты по скорости запуска, требованиям ИБ и нагрузке на внутренний ИТ-контур.";
  }
  if (ru.pages.implementationScenarios.chooser) {
    ru.pages.implementationScenarios.chooser.text =
      "Для первого пилота обычно выбирают самый быстрый согласуемый вариант. Для промышленного внедрения важнее заранее определить требования ИБ, поддержку и ответственность сторон.";
  }
  Object.assign(ru.pages.implementationScenarios.cta, {
    title: "Подберём сценарий реализации под ваши требования ИБ",
    text: "Разберём, какой формат лучше подходит по данным, поддержке и внутренней инфраструктуре.",
    primary: "Обсудить сценарий",
  });

  if (ru.pages.procurement) {
    Object.assign(ru.pages.procurement.hero, {
      text: "Помогаем собрать закупочный маршрут в рабочую систему: документы, RFQ, ТКП, риски, статусы и решения остаются в одном поле зрения.",
    });
    ru.pages.procurement.audience.text =
      "Эта страница для команд, у которых закупка уже упирается не в идею, а в объём переписки, документов и ручных проверок.";
    ru.pages.procurement.capabilities.text =
      "Начинаем не с огромного комбайна, а с конкретных участков, которые действительно тормозят работу.";
    ru.pages.procurement.cta.text =
      "Если хотите понять, с какого участка закупки лучше начать, достаточно коротко описать текущую схему работы.";
  }

  if (ru.pages.localAiProcurement) {
    Object.assign(ru.pages.localAiProcurement.hero, {
      text: "Если рабочие документы нельзя передавать во внешний сервис, проектируем локальный или изолированный запуск с понятными ролями, журналами и порядком поддержки.",
    });
    ru.pages.localAiProcurement.deployment.text =
      "Формат размещения зависит от чувствительности данных, правил ИБ и того, как заказчик хочет сопровождать систему дальше.";
    ru.pages.localAiProcurement.cta.text =
      "Сверим требования ИБ, ограничения по данным и поймём, нужен ли локальный или полностью изолированный запуск.";
  }

  if (ru.pages.solutions) {
    ru.pages.solutions.hero.text =
      "Собрали основные направления, с которых чаще всего начинают: закупки, документы, поручения и проверка комплектности.";
    ru.pages.solutions.scenarios.text =
      "Ниже — четыре понятных точки входа. Дальше уже можно уходить в нужный сценарий глубже.";
    ru.pages.solutions.cta.text =
      "Если у вас свой маршрут и он не укладывается в типовую карточку, опишите его — поможем выбрать старт.";
  }

  if (ru.pages.approach) {
    ru.pages.approach.hero.text =
      "Сначала разбираем реальную работу команды, затем собираем один рабочий сценарий и только после этого масштабируем решение.";
  }

  if (ru.pages.contact) {
    ru.pages.contact.hero.text =
      "Опишите задачу, ограничения по данным и желаемый результат. Этого достаточно, чтобы предложить следующий шаг.";
  }

  ru.pages.materials = {
    ...ru.pages.materials,
    hero: {
      eyebrow: "Материалы",
      title: "Материалы об автоматизации бизнес-процессов",
      text: "Практические заметки без хайпа: как выбрать первый процесс, где нужен MVP и чем рабочая система отличается от чат-бота.",
    },
    readingStart: {
      title: "С чего начать чтение",
      text: "Эти материалы помогают быстрее понять, как подойти к автоматизации закупок, согласований, документооборота и проверок документов.",
      items: [
        {
          title: "Как выбрать первый бизнес-процесс для автоматизации",
          text: "Когда начинать с одного сценария, а не с большой платформы, и как очертить полезный MVP.",
          link: { slug: "materialsHowToChooseFirstProcess" },
          cta: "Открыть материал",
        },
        {
          title: "AI-автоматизация бизнес-процессов простыми словами",
          text: "Короткое объяснение, где полезны AI-модули и почему одних диалогов недостаточно.",
          link: { slug: "materialsAiAutomationSimple" },
          cta: "Открыть материал",
        },
        {
          title: "Почему чат-бот — это не автоматизация бизнес-процесса",
          text: "Чем рабочая система отличается от чата и почему важны роли, статусы, документы и следующий шаг.",
          link: { slug: "materialsChatbotVsProcessAutomation" },
          cta: "Открыть материал",
        },
        {
          title: "MVP автоматизации: что можно проверить за 2–4 недели",
          text: "Что реально вынести в первый этап и какие метрики стоит увидеть уже на пилоте.",
          link: { slug: "materialsMvpAutomation" },
          cta: "Открыть материал",
        },
      ],
    },
    popular: {
      title: "Популярные темы",
      text: "Если нужны не только статьи, но и прикладные страницы по запуску и внедрению, начните отсюда.",
      items: [
        { label: "AI-агенты для закупок", link: { slug: "procurement" } },
        { label: "RFQ", link: { slug: "procurement" } },
        { label: "Сравнение ТКП", link: { slug: "procurement" } },
        { label: "Договорные риски", link: { slug: "aiDocumentChecks" } },
        {
          label: "Сценарии реализации",
          link: { slug: "implementationScenarios" },
        },
      ],
    },
    cta: {
      title: "Нужен разбор вашего процесса",
      text: "Если уже понятно, что нужна не теория, а первый рабочий шаг, перейдите к заявке.",
      primary: "Оставить заявку",
      secondary: "Посмотреть решения",
      primaryLink: { slug: "contact" },
      secondaryLink: { slug: "solutions" },
    },
  };

  Object.assign(en.pages.home.meta, {
    description:
      "Arvectum helps automate operational workflows, regulations, procurement, document flow and internal coordination with AI modules and a clear working structure.",
    ogDescription:
      "Arvectum helps automate operational workflows, regulations, procurement, document flow and internal coordination with AI modules and a clear working structure.",
  });
  Object.assign(en.pages.home.hero, {
    text: "Arvectum helps reduce manual coordination, structure documents and build digital routes with clear roles, statuses and next steps.",
    bullets: [
      "Start from one practical workflow instead of a giant platform",
      "Validate the first working setup in 2–4 weeks",
      "Roles, documents and statuses stay in one place",
      "AI modules prepare analysis, comparisons and drafts",
    ],
    sideItems: [],
  });
  Object.assign(en.pages.home.scenarios, {
    title: "Where you can start",
    text: "We usually begin with a workflow where documents, approvals or manual checks already slow the team down.",
  });
  Object.assign(en.pages.home.aboutPreview, {
    text: "We first map the working route itself: owners, documents, statuses and decision points. AI is added only where it saves real time.",
  });
  en.pages.home.launch = null;
  Object.assign(en.pages.home.delivery, {
    title: "Security and implementation scenarios",
    text: "We shape the setup around data sensitivity, access rules, integrations and the support model you need after launch.",
  });
  Object.assign(en.pages.home.cta, {
    title: "We can show what the first working setup may look like",
    text: "We review one workflow, the documents involved, the roles and the access limits around it.",
    primary: "Request a demo",
    secondary: "How we launch",
    secondaryLink: { slug: "approach" },
  });
  en.pages.materials = {
    ...en.pages.materials,
    hero: {
      eyebrow: "Materials",
      title: "Materials about AI automation in business",
      text: "Practical notes without hype: how to choose the first workflow, when an MVP is enough and why a working system is more than a chatbot.",
    },
    readingStart: {
      title: "Where to start reading",
      text: "These articles help frame procurement, approvals, document flow and document checks before you move into implementation.",
      items: [
        {
          title: "How to choose the first workflow for automation",
          text: "When to start with one scenario instead of a big platform and how to frame a useful MVP.",
          link: { slug: "materialsHowToChooseFirstProcess" },
          cta: "Open article",
        },
        {
          title: "AI automation for business workflows in simple terms",
          text: "A short explanation of where AI modules are useful and why dialogue alone is not enough.",
          link: { slug: "materialsAiAutomationSimple" },
          cta: "Open article",
        },
        {
          title: "Why a chatbot is not process automation",
          text: "What separates a working system from a chat and why roles, statuses, documents and the next step matter.",
          link: { slug: "materialsChatbotVsProcessAutomation" },
          cta: "Open article",
        },
        {
          title: "What an automation MVP can validate in 2–4 weeks",
          text: "What belongs in the first stage and which signals are worth measuring early.",
          link: { slug: "materialsMvpAutomation" },
          cta: "Open article",
        },
      ],
    },
    popular: {
      title: "Popular topics",
      text: "If you need practical pages alongside the articles, start with these routes.",
      items: [
        { label: "Procurement AI agents", link: { slug: "procurement" } },
        { label: "RFQ", link: { slug: "procurement" } },
        { label: "Quote comparison", link: { slug: "procurement" } },
        { label: "Contract risks", link: { slug: "aiDocumentChecks" } },
        {
          label: "Implementation scenarios",
          link: { slug: "implementationScenarios" },
        },
      ],
    },
    cta: {
      title: "Need a practical review of your workflow?",
      text: "If theory is no longer enough and you need the first useful step, start with a short request.",
      primary: "Send request",
      secondary: "View solutions",
      primaryLink: { slug: "contact" },
      secondaryLink: { slug: "solutions" },
    },
  };

  const es = clone(en);
  es.common.locale = "es_ES";
  es.common.skipLink = "Saltar al contenido";
  es.common.menuLabel = "Menú";
  es.common.menuTitle = "Navegación del sitio";
  es.common.menuClose = "Cerrar menú";
  es.common.telegramLabel = "Telegram";
  es.common.headerCta = "Contactar";
  es.common.pagesLabel = "Secciones";
  es.common.nav = [
    { slug: "home", label: "Inicio" },
    { slug: "solutions", label: "Soluciones" },
    { slug: "about", label: "Enfoque" },
    { slug: "approach", label: "Cómo lanzamos" },
    { slug: "materials", label: "Materiales" },
  ];
  es.common.footerNav = [
    { slug: "home", label: "Inicio" },
    { slug: "about", label: "Enfoque" },
    { slug: "solutions", label: "Soluciones" },
    {
      slug: "implementationScenarios",
      label: "Escenarios de implementación",
    },
    { slug: "approach", label: "Cómo lanzamos" },
    { slug: "materials", label: "Materiales" },
    { slug: "contact", label: "Contacto" },
  ];
  es.common.footer.companyName = "Arvectum LLC";
  es.common.footer.inn = "TIN: 7716261422";
  es.common.footer.kpp = "KPP: 771601001";
  es.common.footer.ogrn = "OGRN: 1267700213725";
  es.common.footer.positioning = "Automatización de procesos de negocio con IA";
  es.common.footer.navigationTitle = "Navegación";
  es.common.footer.flagshipTitle = "Escenario principal";
  es.common.footer.navigationLinks = [
    { slug: "about", label: "Enfoque" },
    { slug: "solutions", label: "Soluciones" },
    { slug: "approach", label: "Cómo lanzamos" },
    { slug: "materials", label: "Materiales" },
    {
      slug: "implementationScenarios",
      label: "Escenarios de implementación",
    },
  ];
  es.common.footer.flagshipLinks = [
    { slug: "procurement", label: "Compras y licitaciones" },
    { slug: "procurement", label: "Agentes de IA para compras" },
    { slug: "procurement", label: "RFQ y propuestas" },
    { slug: "localAiProcurement", label: "Entorno cerrado" },
  ];
  es.common.footer.copyright = "© Arvectum LLC, 2026";
  es.common.footer.legalLinks = [
    { slug: "privacy", label: "Política de privacidad" },
    {
      slug: "personalDataConsent",
      label: "Consentimiento para datos personales",
    },
    { slug: "cookiesPolicy", label: "Política de cookies" },
  ];
  es.common.footer.socialLinks = [
    {
      kind: "telegram",
      url: "https://t.me/arvectum",
      label: "Telegram Arvectum",
    },
    {
      kind: "x",
      url: "https://x.com/arvectum",
      label: "X Arvectum",
    },
    {
      kind: "vk",
      url: "https://vk.com/arvectum",
      label: "VK Arvectum",
    },
    {
      kind: "dzen",
      url: "https://dzen.ru/arvectum",
      label: "Dzen Arvectum",
    },
  ];
  es.common.form = {
    ...es.common.form,
    title: "Hablar sobre automatización",
    intro:
      "Describa el flujo en pocas frases. Nos basta con entender dónde sigue habiendo mucha coordinación manual, qué documentos importan y qué primer resultado quiere ver.",
    nameLabel: "¿Cómo se llama?",
    contactMethodLabel: "Canal de contacto",
    contactMethodPlaceholder: "Elija un canal",
    contactMethodOtherLabel: "Nombre del servicio",
    contactMethodOtherPlaceholder: "Por ejemplo, Slack o Signal",
    contactValueLabel: "Su contacto",
    projectTypeLabel: "¿Qué quiere automatizar?",
    projectTypePlaceholder: "Elija la opción más cercana",
    messageLabel: "Describa brevemente la tarea",
    messagePlaceholder:
      "Qué parte del trabajo hoy exige demasiada coordinación manual, qué documentos o estados conviene controlar y qué primer resultado espera",
    deadlineLabel: "Plazo del piloto",
    budgetLabel: "Rango de presupuesto",
    submitLabel: "Enviar solicitud",
    legalNotice:
      "Al enviar la solicitud, acepta el tratamiento de datos personales para preparar la respuesta y hablar sobre el piloto.",
    successContacts:
      "Si necesita una respuesta más rápida, escríbanos a info@arvectum.com o en Telegram.",
    errorFallback:
      "No pudimos enviar la solicitud. Escríbanos directamente a info@arvectum.com o por Telegram.",
  };
  es.common.cookies = {
    ...es.common.cookies,
    bannerTitle: "Configuración de cookies",
    bannerText:
      "Las cookies esenciales mantienen el sitio en funcionamiento. La analítica se activa solo con su consentimiento.",
    bannerLinksLabel: "Más información:",
    decline: "Solo esenciales",
    customize: "Configurar",
    accept: "Aceptar todas",
    prefsEyebrow: "Configuración de cookies",
    prefsTitle: "Configuración de cookies",
    essentialTitle: "Cookies esenciales",
    essentialText:
      "Son necesarias para el funcionamiento básico del sitio, el formulario y el almacenamiento de su elección.",
    essentialAlwaysOn: "Siempre activas",
    analyticsTitle: "Cookies analíticas",
    analyticsText:
      "Guardan un identificador de visita, la fuente de tráfico y parámetros UTM solo si acepta la analítica.",
    analyticsOn: "Activas",
    analyticsOff: "Desactivadas",
    saveEssential: "Guardar solo las esenciales",
    savePrefs: "Guardar ajustes",
    closeLabel: "Cerrar",
  };
  es.common.labels = {
    challenge: "Reto de negocio",
    solution: "Qué construimos",
    result: "Resultado esperado",
    timing: "Tiempo de la primera etapa",
    audience: "Para quién",
    firstResult: "Primer resultado",
    status: "Estado del escenario",
    demo: "Qué verá en la demo",
  };

  es.pages.home.meta = {
    title: "Arvectum — automatización de procesos de negocio con IA",
    description:
      "Arvectum ayuda a automatizar procesos operativos, reglamentos corporativos, compras, documentos y coordinación interna con agentes de IA y una lógica de trabajo clara.",
    ogTitle: "Arvectum — automatización de procesos de negocio con IA",
    ogDescription:
      "Arvectum ayuda a automatizar procesos operativos, reglamentos corporativos, compras, documentos y coordinación interna con agentes de IA y una lógica de trabajo clara.",
  };
  es.pages.home.hero = {
    eyebrow: "Automatización de procesos de negocio con IA",
    title:
      "Automatización de procesos operativos y reglamentos corporativos con IA",
    text: "Arvectum ayuda a reducir el trabajo manual, ordenar documentos y construir rutas digitales con roles, estados y decisiones claras.",
    callout:
      "Escenario principal: agentes de IA para compras y licitaciones: RFQ, comparación de propuestas técnico-comerciales, economía de participación, riesgos contractuales, documentos y estados.",
    bullets: [
      "Empezamos con un flujo concreto, no con una gran plataforma",
      "El primer contorno operativo puede validarse en 2–4 semanas",
      "Roles, documentos y estados quedan en un mismo recorrido",
      "Los módulos de IA preparan análisis, comparaciones y borradores",
    ],
    primaryCta: "Hablar sobre automatización",
    secondaryCta: "Agentes de IA para compras",
    primaryLink: { slug: "contact" },
    secondaryLink: { slug: "procurement" },
    sideItems: [],
  };
  es.pages.home.scenarios = {
    title: "Dónde se puede empezar",
    text: "Solemos empezar con una parte del trabajo donde ya pesan demasiado los documentos, las aprobaciones o las revisiones manuales.",
    items: [
      {
        title: "Compras y licitaciones",
        text: "RFQ, propuestas, economía de participación, riesgos y documentos en una sola ruta.",
        link: { slug: "procurement" },
        cta: "Ver más",
        icon: "assets/icons/icon-procurement.svg",
      },
      {
        title: "Documentos y aprobaciones",
        text: "Revisión documental, rutas de aprobación y estados claros.",
        link: { slug: "documentWorkflow" },
        cta: "Ver más",
        icon: "assets/icons/icon-docs.svg",
      },
      {
        title: "Procesos operativos",
        text: "Reglas, roles, tareas y bitácora de acciones sin caos manual.",
        link: { slug: "operationsAutomation" },
        cta: "Ver más",
        icon: "assets/icons/icon-workflow.svg",
      },
      {
        title: "Verificación documental con IA",
        text: "Revisión de integridad, señales de riesgo y borradores de memo.",
        link: { slug: "aiDocumentChecks" },
        cta: "Ver más",
        icon: "assets/icons/icon-values.svg",
      },
    ],
  };
  es.pages.home.flagship = {
    title: "Escenario principal: compras y licitaciones",
    text: "El recorrido detallado vive en su propio hub. En la página principal dejamos solo el mapa corto de capacidades.",
    items: [
      {
        title: "Agente de IA",
        text: "Reúne requisitos, documentos y estados en una sola vista.",
        link: { slug: "procurement" },
        cta: "Abrir hub",
        icon: "assets/icons/icon-procurement.svg",
      },
      {
        title: "RFQ",
        text: "Ordena preguntas y propuestas sin caos en el correo.",
        link: { slug: "procurement" },
        cta: "Ver más",
        icon: "assets/icons/icon-workflow.svg",
      },
      {
        title: "Propuestas",
        text: "Compara precio, plazo y condiciones en una vista de trabajo.",
        link: { slug: "procurement" },
        cta: "Ver más",
        icon: "assets/icons/icon-docs.svg",
      },
      {
        title: "Documentos",
        text: "Muestra integridad, versiones y comentarios del paquete.",
        link: { slug: "procurement" },
        cta: "Ver más",
        icon: "assets/icons/icon-security.svg",
      },
      {
        title: "Riesgos",
        text: "Resume condiciones dudosas y puntos críticos para revisión.",
        link: { slug: "aiDocumentChecks" },
        cta: "Ver más",
        icon: "assets/icons/icon-clarity.svg",
      },
      {
        title: "Entorno cerrado",
        text: "Útil cuando los documentos no pueden salir a un servicio externo.",
        link: { slug: "localAiProcurement" },
        cta: "Ver más",
        icon: "assets/icons/icon-contour.svg",
      },
    ],
  };
  es.pages.home.aboutPreview = {
    title: "El enfoque de Arvectum",
    text: "Primero ordenamos el flujo: roles, documentos, estados y puntos de decisión. La IA se conecta solo donde realmente ahorra tiempo.",
    items: [
      {
        title: "Sistema claro",
        text: "Cada paso tiene responsable, documento y siguiente acción.",
        icon: "assets/icons/icon-process.svg",
      },
      {
        title: "Claridad",
        text: "El equipo entiende qué se hizo, qué falta y por qué se frenó.",
        icon: "assets/icons/icon-clarity.svg",
      },
      {
        title: "Supervisión humana",
        text: "La IA prepara análisis y borradores; el equipo confirma las acciones externas.",
        icon: "assets/icons/icon-human.svg",
      },
      {
        title: "Seguridad",
        text: "Tenemos en cuenta accesos, bitácoras y requisitos de despliegue desde el inicio.",
        icon: "assets/icons/icon-security.svg",
      },
    ],
    primary: "Ver el enfoque",
    primaryLink: { slug: "about" },
  };
  es.pages.home.launch = null;
  es.pages.home.delivery = {
    title: "Seguridad y escenarios de implementación",
    text: "Elegimos la arquitectura según los requisitos de seguridad, accesos, integraciones y el modelo de soporte.",
    items: [
      {
        title: "Forma de despliegue",
        text: "API, nube dedicada, instalación local o entorno aislado.",
        icon: "assets/icons/icon-contour.svg",
      },
      {
        title: "Accesos y bitácoras",
        text: "Derechos, trazabilidad y responsables por cada paso.",
        icon: "assets/icons/icon-security.svg",
      },
      {
        title: "Acciones externas",
        text: "La presentación, el envío y la confirmación siguen en manos del equipo.",
        icon: "assets/icons/icon-human.svg",
      },
      {
        title: "Entorno TI",
        text: "Diseñamos intercambio de datos e integraciones sin capas manuales innecesarias.",
        icon: "assets/icons/icon-reliability.svg",
      },
    ],
    actions: [
      {
        label: "Escenarios de implementación",
        link: { slug: "implementationScenarios" },
      },
      {
        label: "Entorno cerrado de IA",
        link: { slug: "localAiProcurement" },
      },
    ],
  };
  es.pages.home.cta = {
    title: "Podemos mostrar cómo podría verse el primer entorno de trabajo",
    text: "Revisamos un proceso, sus documentos, los roles y las restricciones de acceso.",
    primary: "Solicitar una demo",
    secondary: "Cómo lanzamos",
    primaryLink: { slug: "contact" },
    secondaryLink: { slug: "approach" },
  };

  es.pages.about.meta = {
    title: "El enfoque de Arvectum — automatización práctica para empresas",
    description:
      "El enfoque de Arvectum: no magia con IA, sino una lógica de trabajo clara con roles, estados, documentos, seguridad y supervisión humana.",
    ogTitle: "El enfoque de Arvectum — automatización práctica para empresas",
    ogDescription:
      "El enfoque de Arvectum: no magia con IA, sino una lógica de trabajo clara con roles, estados, documentos, seguridad y supervisión humana.",
  };
  es.pages.about.hero = {
    eyebrow: "Enfoque",
    title: "El enfoque de Arvectum",
    text: "Arvectum crea productos digitales, automatización y soluciones de IA para empresas. Simplificamos tareas complejas con tecnología, sin quitar el control final a las personas responsables.",
  };
  if (es.pages.about.philosophy) {
    es.pages.about.philosophy.title =
      "No es magia: es un sistema que se puede controlar";
    es.pages.about.philosophy.text =
      "Primero ponemos orden en roles, documentos, estados y puntos de decisión. Después conectamos los módulos de IA allí donde ayudan de verdad.";
  }
  if (es.pages.about.guardrails) {
    es.pages.about.guardrails.title = "Lo que no prometemos";
    es.pages.about.guardrails.note =
      "Decimos desde el principio dónde la IA ayuda y dónde sigue haciendo falta una persona responsable.";
  }
  if (es.pages.about.nextLinks) {
    es.pages.about.nextLinks.title = "Dónde seguir";
    es.pages.about.nextLinks.text =
      "Si quiere pasar del enfoque general a casos concretos, estas páginas son el mejor siguiente paso.";
  }
  es.pages.about.cta = {
    title: "Podemos revisar su proceso con usted",
    text: "Basta con una conversación breve para elegir el formato de arranque y entender si conviene un piloto, un despliegue local o un entorno cerrado.",
    primary: "Hablar sobre automatización",
    secondary: "Escenarios de implementación",
    tertiary: "Escenario principal: agentes de IA para compras",
    primaryLink: { slug: "contact" },
    secondaryLink: { slug: "implementationScenarios" },
    tertiaryLink: { slug: "procurement" },
  };

  es.pages.implementationScenarios.meta = {
    title: "Escenarios de implementación de agentes de IA — Arvectum",
    description:
      "Compare API, nube dedicada, instalación local y entorno aislado para agentes de IA en compras, documentos y procesos corporativos.",
    ogTitle: "Escenarios de implementación de agentes de IA — Arvectum",
    ogDescription:
      "Compare API, nube dedicada, instalación local y entorno aislado para agentes de IA en compras, documentos y procesos corporativos.",
  };
  es.pages.implementationScenarios.hero = {
    eyebrow: "Implementación y seguridad",
    title: "Escenarios de implementación de agentes de IA",
    text: "Le ayudamos a elegir dónde debe ejecutarse el modelo: vía API, en nube dedicada, de forma local o en un entorno aislado. Lo importante es que datos, accesos y soporte queden bajo control.",
  };
  if (es.pages.implementationScenarios.workflow) {
    es.pages.implementationScenarios.workflow.title =
      "Cómo fluye una solicitud";
    es.pages.implementationScenarios.workflow.text =
      "La misma lógica funciona en todos los escenarios de despliegue. Solo cambia la ubicación del modelo y las restricciones de datos.";
    es.pages.implementationScenarios.workflow.steps.forEach((step, i) => {
      if (i === 0) {
        step.title = "Usuario";
        step.text =
          "Carga documentos, selecciona un escenario y revisa el resultado.";
      }
      if (i === 1) {
        step.title = "Arvectum";
        step.text =
          "Prepara el contexto: roles, reglas, estados, restricciones y un registro de auditoría.";
      }
      if (i === 2) {
        step.title = "Modelo de lenguaje";
        step.text =
          "Analiza documentos, extrae condiciones, compara opciones y redacta una propuesta.";
      }
      if (i === 3) {
        step.title = "Borrador de decisión";
        step.text =
          "La persona responsable revisa el resultado, aprueba la acción o lo devuelve para revisión.";
      }
    });
    es.pages.implementationScenarios.workflow.disclaimer =
      "Las decisiones finales, el envío externo y las acciones jurídicamente vinculantes siguen siendo humanas.";
  }
  if (es.pages.implementationScenarios.comparisonTable) {
    es.pages.implementationScenarios.comparisonTable.title =
      "Comparación rápida de escenarios";
    es.pages.implementationScenarios.comparisonTable.text =
      "La matriz resume velocidad de arranque, control de datos, exigencias de TI y carga de soporte.";
    es.pages.implementationScenarios.comparisonTable.columns = [
      "Escenario",
      "Velocidad",
      "Control de datos",
      "Exigencia TI",
      "Riesgo de seguridad",
      "Soporte",
    ];
    es.pages.implementationScenarios.comparisonTable.rows = [
      {
        title: "Modelo cloud vía API",
        values: ["Alta", "Menor", "Mínimos", "Mayor", "Más simple"],
      },
      {
        title: "Perímetro cloud dedicado",
        values: ["Media", "Mayor", "Medios", "Medio", "Media"],
      },
      {
        title: "Instalación local",
        values: ["Menor", "Alto", "Altos", "Menor", "Más compleja"],
      },
      {
        title: "Perímetro aislado",
        values: ["Mínima", "Máximo", "Máximos", "Mínimo", "La más compleja"],
      },
    ];
  }
  if (es.pages.implementationScenarios.chooser) {
    es.pages.implementationScenarios.chooser.title = "Cómo elegir";
    es.pages.implementationScenarios.chooser.text =
      "Para un primer piloto, elija la opción más rápida acordable. Para producción, defina antes los requisitos de seguridad, soporte y responsabilidades.";
  }
  es.pages.implementationScenarios.cta = {
    title: "Elegimos el escenario que encaja con sus requisitos",
    text: "Revisamos datos, soporte e infraestructura para proponer un formato de lanzamiento realista.",
    primary: "Hablar del escenario",
    secondary: "Entorno cerrado de IA",
    primaryLink: { slug: "contact" },
    secondaryLink: { slug: "localAiProcurement" },
  };

  if (es.pages.solutions) {
    es.pages.solutions.meta = {
      title: "Soluciones Arvectum — automatización práctica con IA",
      description:
        "Automatización de compras, documentos, aprobaciones, controles operativos y verificación documental con agentes de IA y rutas de trabajo claras.",
      ogTitle: "Soluciones Arvectum — automatización práctica con IA",
      ogDescription:
        "Automatización de compras, documentos, aprobaciones, controles operativos y verificación documental con agentes de IA y rutas de trabajo claras.",
    };
    es.pages.solutions.hero = {
      eyebrow: "Soluciones",
      title: "Dónde suele empezar la automatización",
      text: "Reunimos las direcciones más habituales: compras, documentos, aprobaciones, control interno y revisión documental.",
    };
    es.pages.solutions.cta.text =
      "Si su flujo no encaja en una tarjeta estándar, descríbalo y le ayudaremos a elegir el punto de partida.";
  }

  if (es.pages.procurement) {
    es.pages.procurement.meta = {
      title: "Automatización de compras y licitaciones — Arvectum",
      description:
        "Arvectum ayuda a reunir documentos, RFQ, propuestas, riesgos y estados de compras en una ruta de trabajo controlada con agentes de IA.",
      ogTitle: "Automatización de compras y licitaciones — Arvectum",
      ogDescription:
        "Arvectum ayuda a reunir documentos, RFQ, propuestas, riesgos y estados de compras en una ruta de trabajo controlada con agentes de IA.",
    };
    es.pages.procurement.hero.title =
      "Automatización de compras y licitaciones";
    es.pages.procurement.hero.text =
      "Ayudamos a pasar de tablas, correo y chats a una ruta de trabajo donde RFQ, propuestas, riesgos, documentos y decisiones quedan en un mismo sitio.";
    es.pages.procurement.audience = {
      title: "Para quién es",
      text: "Útil cuando la compra o licitación ya depende de coordinación manual y documentos dispersos.",
      items: [
        {
          title: "Proveedores",
          text: "Cuando el paquete de oferta debe armarse más rápido y los comentarios no pueden perderse.",
        },
        {
          title: "Equipos de licitación",
          text: "Cuando RFQ, propuestas y estados viven en varios canales a la vez.",
        },
        {
          title: "Departamentos de compras",
          text: "Cuando se necesita una ruta transparente con roles, plazos e historial de decisiones.",
        },
        {
          title: "Líderes operativos",
          text: "Cuando la economía, los riesgos y el control posterior a la selección requieren mayor supervisión.",
        },
      ],
    };
    es.pages.procurement.capabilities = {
      title: "Qué se puede automatizar",
      text: "Normalmente empezamos con un escenario real y construimos un flujo claro a su alrededor.",
      items: [
        {
          title: "Preparación y análisis",
          points: [
            "Revisión de requisitos de compra",
            "RFQ y preguntas a proveedores",
            "Recopilación y comparación de propuestas",
            "Economía del acuerdo",
          ],
        },
        {
          title: "Revisión y ejecución",
          points: [
            "Riesgos contractuales y comerciales",
            "Paquete documental",
            "Estados y registro de decisiones",
            "Control de ejecución y pagos",
          ],
        },
      ],
    };
    es.pages.procurement.deployment = {
      title: "¿Cómo se puede desplegar la solución?",
      text: "Los agentes de IA pueden ejecutarse mediante API cloud, perímetro cloud dedicado, instalación on-premise o contorno aislado. La elección depende de los requisitos de seguridad, la velocidad del piloto y la infraestructura del cliente.",
      items: [
        {
          title: "Escenarios de implementación",
          text: "Compare cuatro opciones de despliegue y elija el modelo de soporte, acceso y responsabilidad que se ajuste a su flujo de compras.",
          icon: "assets/icons/icon-contour.svg",
          link: { slug: "implementationScenarios" },
          cta: "Escenarios de implementación",
        },
        {
          title: "Entorno cerrado de IA",
          text: "Si los documentos y estados no pueden enviarse a un servicio externo, diseñamos una opción de lanzamiento local o aislada.",
          icon: "assets/icons/icon-security.svg",
          link: { slug: "localAiProcurement" },
          cta: "Abrir página",
        },
      ],
    };
    es.pages.procurement.outcomes = [
      {
        title: "Primer resultado",
        text: "Un mapa del proceso y el primer tramo operativo de compras con documentos reales.",
      },
      {
        title: "Plazo de lanzamiento",
        text: "El diagnóstico suele llevar 1–2 semanas y el MVP a menudo se entrega en 2–4 semanas.",
      },
      {
        title: "Qué cambia",
        text: "El equipo ve el siguiente paso, la integridad y los riesgos clave sin buscar en hilos dispersos.",
      },
    ];
    es.pages.procurement.faq = {
      title: "Preguntas frecuentes",
      items: [
        {
          question: "¿Podemos empezar con un solo escenario de compras?",
          answer:
            "Sí. Normalmente esa es la mejor entrada: una ruta, una zona de valor clara y un MVP rápido en lugar de una plataforma grande.",
        },
        {
          question:
            "¿Esto sirve tanto para proveedores como para equipos de licitación?",
          answer:
            "Sí, cuando el objetivo es construir un flujo único en torno a requisitos, documentos, propuestas e historial de decisiones.",
        },
        {
          question: "¿Dónde ayuda la IA si el flujo debe ser controlado?",
          answer:
            "Los módulos de IA ayudan con revisiones y análisis de documentos, pero las decisiones finales y los estados siguen en manos del equipo.",
        },
        {
          question: "¿Puede funcionar en un entorno cerrado?",
          answer:
            "Sí. Si hay documentos sensibles y accesos estrictos, planificamos una arquitectura local o híbrida desde el inicio.",
        },
      ],
    };
    es.pages.procurement.resources = {
      title: "Lecturas útiles",
      text: "Para equipos que quieren definir el primer escenario y el formato de lanzamiento antes de arrancar.",
      items: [
        {
          title: "Cómo elegir el primer proceso",
          text: "Qué buscar al empezar con un flujo de trabajo real.",
          link: { slug: "materialsHowToChooseFirstProcess" },
          cta: "Abrir artículo",
        },
        {
          title: "Qué valida un MVP en 2–4 semanas",
          text: "Qué es realista probar en un primer ciclo de automatización de compras.",
          link: { slug: "materialsMvpAutomation" },
          cta: "Abrir artículo",
        },
        {
          title: "Aprobaciones y flujo documental",
          text: "Un escenario vecino cuando las compras dependen de versiones, comentarios y visibilidad de documentos.",
          link: { slug: "documentWorkflow" },
          cta: "Abrir página",
        },
        {
          title: "Escenarios de implementación",
          text: "Cómo elegir entre API, cloud dedicado, on-premise y entorno aislado.",
          link: { slug: "implementationScenarios" },
          cta: "Abrir página",
        },
      ],
    };
    es.pages.procurement.cta.title = "¿Quiere ordenar su flujo de compras?";
    es.pages.procurement.cta.text =
      "Con una breve descripción del trabajo actual podemos proponer qué tramo conviene pilotar primero.";
  }

  if (es.pages.localAiProcurement) {
    es.pages.localAiProcurement.meta = {
      title: "Entorno cerrado de IA para compras — Arvectum",
      description:
        "Instalación local, nube dedicada o entorno aislado para compras con IA: accesos, bitácoras, soporte y supervisión humana.",
      ogTitle: "Entorno cerrado de IA para compras — Arvectum",
      ogDescription:
        "Instalación local, nube dedicada o entorno aislado para compras con IA: accesos, bitácoras, soporte y supervisión humana.",
    };
    es.pages.localAiProcurement.hero.title =
      "Entorno cerrado de IA para compras";
    es.pages.localAiProcurement.hero.text =
      "Si los documentos no pueden salir a un servicio externo, diseñamos un despliegue local o aislado con reglas de acceso, bitácoras y soporte claros.";
    es.pages.localAiProcurement.audience = {
      title: "Para quién es",
      text: "Útil para equipos donde los documentos, riesgos y flujos de compras requieren un control más estricto sobre accesos e infraestructura.",
      items: [
        {
          title: "Política de seguridad estricta",
          text: "Cuando los documentos de trabajo no pueden enviarse a modelos o servicios externos.",
          icon: "assets/icons/icon-security.svg",
        },
        {
          title: "Licitaciones y contratos críticos",
          text: "Cuando se requiere registro de acceso, separación de roles y un modelo de soporte transparente.",
          icon: "assets/icons/icon-docs.svg",
        },
        {
          title: "Perímetro IT interno",
          text: "Cuando el despliegue debe hacerse en servidores del cliente o en infraestructura dedicada.",
          icon: "assets/icons/icon-contour.svg",
        },
        {
          title: "Después del piloto",
          text: "Cuando el valor de negocio ya está claro y el siguiente paso es un modelo operativo más cerrado.",
          icon: "assets/icons/icon-scale.svg",
        },
      ],
    };
    es.pages.localAiProcurement.capabilities = {
      title: "Qué se diseña dentro de un perímetro privado",
      text: "Un perímetro no es un término de marketing. Es la forma de respetar las restricciones de datos, acceso y soporte sin perder el valor de los módulos de IA.",
      items: [
        {
          title: "Arquitectura y control",
          points: [
            "Despliegue local o dedicado",
            "Roles, RBAC y bitácoras de auditoría",
            "Copias de seguridad",
            "Procedimiento de actualización y soporte",
          ],
        },
        {
          title: "Flujo de compras",
          points: [
            "Revisión de requisitos y RFQ",
            "Recopilación y comparación de propuestas",
            "Verificación de riesgos e integridad",
            "Estados e historial de decisiones",
          ],
        },
      ],
    };
    es.pages.localAiProcurement.deployment = {
      title: "Relación con los escenarios de implementación",
      items: [
        {
          title: "Instalación on-premise",
          text: "Adecuado cuando la aplicación y el modelo deben ejecutarse en los servidores del cliente, con acceso a internet permitido por procedimiento para actualizaciones.",
          icon: "assets/icons/icon-reliability.svg",
          link: { slug: "implementationScenarios" },
          cta: "Comparar escenarios",
        },
        {
          title: "Entorno air-gapped",
          text: "Adecuado cuando las conexiones externas están prohibidas y el soporte debe realizarse mediante actualizaciones empaquetadas y manuales.",
          icon: "assets/icons/icon-security.svg",
          link: { slug: "implementationScenarios" },
          cta: "Comparar escenarios",
        },
      ],
    };
    es.pages.localAiProcurement.outcomes = [
      {
        title: "Primer resultado",
        text: "Una comprensión clara de si necesita un contorno local, dedicado o completamente aislado.",
      },
      {
        title: "Qué se define",
        text: "Límites de datos, roles, bitácoras, reglas de actualización y la distribución de responsabilidades entre Arvectum y el cliente.",
      },
      {
        title: "Lo que no prometemos",
        text: "No prometemos autonomía total, envío automático de ofertas ni decisiones legalmente vinculantes con IA.",
      },
    ];
    es.pages.localAiProcurement.faq = {
      title: "Preguntas frecuentes",
      items: [
        {
          question: "¿Puede funcionar completamente sin conexión?",
          answer:
            "Sí, si el cliente está preparado para soporte por procedimiento, actualizaciones manuales y diagnóstico aislado.",
        },
        {
          question:
            "¿Cuál es la diferencia entre on-premise y contorno aislado?",
          answer:
            "On-premise describe la ubicación de la instalación, mientras que un contorno aislado describe el modo de red y la ausencia de conexiones externas.",
        },
        {
          question: "¿Una persona sigue supervisando el proceso?",
          answer:
            "Sí. La IA ayuda con análisis y borradores, pero las decisiones finales, envíos y firmas siguen siendo responsabilidad del equipo del cliente.",
        },
      ],
    };
    es.pages.localAiProcurement.resources = {
      title: "Páginas útiles",
      text: "Cuando se necesita un perímetro privado, suele ayudar comparar escenarios de implementación y revisar el flujo de compras.",
      items: [
        {
          title: "Escenarios de implementación",
          text: "Compare las opciones de despliegue: API, cloud dedicado, on-premise y entorno aislado.",
          link: { slug: "implementationScenarios" },
          cta: "Abrir página",
          icon: "assets/icons/icon-contour.svg",
        },
        {
          title: "Agentes de IA para compras",
          text: "Vea cómo funcionan RFQ, comparación de propuestas, verificación de riesgos y estados dentro del flujo de trabajo.",
          link: { slug: "procurement" },
          cta: "Abrir página",
          icon: "assets/icons/icon-procurement.svg",
        },
      ],
    };
    es.pages.localAiProcurement.cta.title =
      "¿Necesita un piloto local o aislado?";
    es.pages.localAiProcurement.cta.text =
      "Podemos ayudarle a elegir el modelo de despliegue adecuado, aclarar los límites de seguridad y lanzar el primer escenario sin autonomía insegura.";
    es.pages.localAiProcurement.cta.primary = "Conversar el escenario";
    es.pages.localAiProcurement.cta.secondary = "Escenarios de implementación";
  }

  if (es.pages.approach) {
    es.pages.approach.hero.title = "Cómo lanzamos la automatización";
    es.pages.approach.hero.text =
      "Primero diagnosticamos el trabajo real, luego construimos un primer escenario operativo y solo después escalamos.";
  }

  if (es.pages.materials) {
    es.pages.materials = {
      ...es.pages.materials,
      meta: {
        title: "Materiales Arvectum — automatización de procesos con IA",
        description:
          "Notas prácticas sobre automatización con IA, compras, documentos, aprobaciones, MVP y despliegue seguro.",
        ogTitle: "Materiales Arvectum — automatización de procesos con IA",
        ogDescription:
          "Notas prácticas sobre automatización con IA, compras, documentos, aprobaciones, MVP y despliegue seguro.",
      },
      hero: {
        eyebrow: "Materiales",
        title: "Materiales sobre automatización de procesos",
        text: "Notas prácticas y directas: cómo elegir el primer flujo, cuándo basta un MVP y por qué una operación ordenada necesita más que un chat.",
      },
      readingStart: {
        title: "Por dónde empezar",
        text: "Estas lecturas ayudan a ordenar compras, aprobaciones, documentos y revisiones antes de entrar en la implementación.",
        items: [
          {
            title: "Cómo elegir el primer proceso para automatizar",
            text: "Cuándo conviene empezar con un solo escenario y cómo delimitar un MVP útil.",
            link: { slug: "materialsHowToChooseFirstProcess" },
            cta: "Abrir artículo",
          },
          {
            title: "Automatización con IA, en palabras simples",
            text: "Dónde aportan valor los módulos de IA y por qué el diálogo por sí solo no resuelve el trabajo.",
            link: { slug: "materialsAiAutomationSimple" },
            cta: "Abrir artículo",
          },
          {
            title: "Por qué un chatbot no sustituye un proceso",
            text: "Qué diferencia a una ruta de trabajo real de un chat y por qué importan roles, estados y documentos.",
            link: { slug: "materialsChatbotVsProcessAutomation" },
            cta: "Abrir artículo",
          },
          {
            title: "Qué puede validar un MVP en 2–4 semanas",
            text: "Qué cabe en la primera etapa y qué señales vale la pena medir desde el principio.",
            link: { slug: "materialsMvpAutomation" },
            cta: "Abrir artículo",
          },
        ],
      },
      popular: {
        title: "Temas populares",
        text: "Si además de artículos necesita páginas aplicadas, estas son las rutas más útiles.",
        items: [
          {
            label: "Agentes de IA para compras",
            link: { slug: "procurement" },
          },
          { label: "RFQ", link: { slug: "procurement" } },
          { label: "Comparación de propuestas", link: { slug: "procurement" } },
          {
            label: "Riesgos contractuales",
            link: { slug: "aiDocumentChecks" },
          },
          {
            label: "Escenarios de implementación",
            link: { slug: "implementationScenarios" },
          },
        ],
      },
      cta: {
        title: "¿Necesita revisar su proceso?",
        text: "Si ya no busca teoría sino un primer paso concreto, envíenos una breve descripción.",
        primary: "Enviar solicitud",
        secondary: "Ver soluciones",
        primaryLink: { slug: "contact" },
        secondaryLink: { slug: "solutions" },
      },
    };
  }

  if (es.pages.contact) {
    es.pages.contact.meta = {
      title: "Contacto Arvectum — hablar sobre automatización",
      description:
        "Cuéntenos qué proceso quiere ordenar: compras, documentos, aprobaciones, operación o verificación con IA.",
      ogTitle: "Contacto Arvectum — hablar sobre automatización",
      ogDescription:
        "Cuéntenos qué proceso quiere ordenar: compras, documentos, aprobaciones, operación o verificación con IA.",
    };
    es.pages.contact.hero = {
      eyebrow: "Contacto",
      title: "Hablemos de su proceso",
      text: "Describa la tarea, las restricciones de datos y el resultado que quiere conseguir. Con eso basta para proponer el siguiente paso.",
    };
    if (es.pages.contact.firstCall) {
      es.pages.contact.firstCall.title =
        "Qué pasará en la primera conversación";
    }
  }

  config.languages.es = es;
})();
