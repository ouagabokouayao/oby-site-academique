const navToggle = document.querySelector("[data-nav-toggle]");
const navMenu = document.querySelector("[data-nav-menu]");

if (navToggle && navMenu) {
  const closeMainMenu = () => {
    navMenu.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  };

  navToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      closeMainMenu();
    });
  });

  document.addEventListener("click", (event) => {
    if (!navMenu.contains(event.target) && !navToggle.contains(event.target)) {
      closeMainMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMainMenu();
      navToggle.focus();
    }
  });
}

const currentPage = document.body.dataset.page;

if (currentPage) {
  const primaryPage = {
    cartographie: "axes",
    interventions: "travaux",
    mediatheque: "ressources",
    recherche: "ressources",
    veille: "ressources",
    carnet: "ressources",
  }[currentPage] || currentPage;

  document.querySelectorAll("[data-page-link]").forEach((link) => {
    if (link.dataset.pageLink === primaryPage) {
      link.setAttribute("aria-current", "page");
    }
  });
}

const revealTargets = document.querySelectorAll(
  ".section, .card, .feature, .proof, .pillar, .path, .contact-path, .media-placeholder, .notice"
);

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.01 }
  );

  revealTargets.forEach((target) => {
    target.classList.add("reveal");
    observer.observe(target);
  });
} else {
  revealTargets.forEach((target) => target.classList.add("is-visible"));
}

const WATCH_AGENDA_FALLBACK_ITEMS = [
  {
    id: "treasure-business-maritime-day-la-seyne-2026",
    titre: "TREASURE — événement final et Business Maritime Day",
    type: "Événement",
    date_publication_interne: "2026-08-16",
    date_evenement: "2026-09-29 au 2026-09-30",
    organisateur: "TREASURE",
    zone: "La Seyne-sur-Mer · Var · Méditerranée",
    axes: ["économie bleue", "innovation maritime", "coopération européenne", "transitions littorales"],
    statut: "Inscription confirmée",
    resume:
      "Inscription confirmée à l'événement final TREASURE à La Seyne-sur-Mer, les 29 et 30 septembre 2026, dans le prolongement des axes économie bleue, innovation maritime, coopération européenne et transitions littorales. Le Business Maritime Day est une journée associée à ce rendez-vous.",
    interet_oby:
      "Ce rendez-vous situe l'économie bleue et l'innovation maritime dans un cadre de coopération européenne et de transitions littorales.",
    lien_source: "",
    affichage_accueil: false,
    ordre: 1,
    image: "",
    video: "",
    media_status: "à ajouter plus tard",
  },
  {
    id: "loi-littoral-40-ans-nice-2026",
    titre:
      "La loi littoral a 40 ans — Érosion ou mutation au service des territoires ?",
    type: "Événement",
    date_publication_interne: "2026-08-16",
    date_evenement: "2026-10-01 au 2026-10-02",
    organisateur: "Université Côte d'Azur — CERDACFF UPR 7267",
    zone: "Campus Trotabas · Faculté de droit et science politique · Nice",
    axes: ["droit du littoral", "érosion côtière", "territoires", "gouvernance littorale", "adaptation", "politiques publiques"],
    statut: "Inscription confirmée",
    resume:
      "Inscription confirmée à l'événement « La loi littoral a 40 ans — Érosion ou mutation au service des territoires ? », organisé à Nice par l'Université Côte d'Azur / CERDACFF, les 1er et 2 octobre 2026, du 1er octobre à 09h00 au 2 octobre à 17h00, sur le campus Trotabas de la Faculté de droit et science politique.",
    interet_oby:
      "Un cadre juridique et territorial directement relié au droit du littoral, à l'érosion côtière et aux politiques d'adaptation.",
    lien_source: "",
    affichage_accueil: false,
    ordre: 2,
    image: "",
    video: "",
    media_status: "à ajouter plus tard",
  },
  {
    id: "refmar-2026-niveau-marin-golfe-de-guinee",
    titre: "Journées REFMAR 2026",
    type: "Événement",
    date_publication_interne: "2026-08-16",
    date_evenement: "2026",
    organisateur: "REFMAR",
    zone: "Golfe de Guinée · observation du niveau marin",
    axes: ["niveau marin", "Golfe de Guinée", "politiques publiques côtières", "observation maritime", "données", "littoral"],
    statut: "Inscription confirmée",
    resume:
      "Inscription confirmée aux Journées REFMAR 2026, avec proposition de poster notée sur le thème : « Niveau marin dans le Golfe de Guinée : déficit observationnel et enjeux pour les politiques publiques côtières ».",
    interet_oby:
      "Ce rendez-vous relie l'observation du niveau marin, les données côtières et les politiques publiques littorales dans le Golfe de Guinée.",
    lien_source: "",
    affichage_accueil: false,
    ordre: 3,
    image: "",
    video: "",
    media_status: "à ajouter plus tard",
  },
  {
    id: "plan-bleu-rendez-vous-aires-marines-protegees",
    titre: "Plan Bleu — Rendez-vous consacré aux aires marines protégées",
    type: "Ressource institutionnelle",
    date_publication_interne: "2026-08-16",
    date_evenement: "",
    organisateur: "Plan Bleu",
    zone: "Méditerranée",
    axes: ["aires marines protégées", "Méditerranée", "biodiversité", "coûts et bénéfices", "gouvernance environnementale"],
    statut: "Ressource de veille",
    resume:
      "Rendez-vous du Plan Bleu consacré aux coûts et bénéfices des aires marines protégées, mobilisé comme ressource de veille sur la gouvernance méditerranéenne, la biodiversité marine et les politiques de protection.",
    interet_oby:
      "Cette ressource éclaire l'évaluation économique des aires marines protégées et les arbitrages de gouvernance en Méditerranée.",
    lien_source: "",
    affichage_accueil: false,
    ordre: 4,
    image: "",
    video: "",
    media_status: "à ajouter plus tard",
  },
  {
    id: "meetup-pepite-provence-eau-biodiversite-economie-bleue",
    titre: "Meet-Up Pépite Provence — eau, biodiversité et économie bleue",
    type: "Événement",
    date_publication_interne: "2026-08-16",
    date_evenement: "",
    organisateur: "Pépite Provence",
    zone: "Provence · Méditerranée",
    axes: ["économie bleue", "biodiversité", "eau", "entrepreneuriat académique"],
    statut: "Trace préparatoire",
    resume:
      "Échanges préparatoires autour d'un Meet-Up Pépite Provence consacré à l'eau, la biodiversité et l'économie bleue.",
    interet_oby:
      "Trace préparatoire : aucune participation réalisée n'est revendiquée à ce stade.",
    lien_source: "",
    affichage_accueil: false,
    ordre: 5,
    image: "",
    video: "",
    media_status: "à ajouter plus tard",
  },
  {
    id: "imo-securite-maritime-golfe-guinee",
    titre: "IMO — sécurité maritime, piraterie et Golfe de Guinée",
    type: "Ressource institutionnelle",
    date_publication_interne: "2026-06-23",
    date_evenement: "",
    organisateur: "International Maritime Organization",
    zone: "Golfe de Guinée · Afrique de l'Ouest et centrale",
    axes: ["sécurité maritime", "gouvernance maritime", "Golfe de Guinée"],
    statut: "Repère",
    resume:
      "Page institutionnelle de l'IMO consacrée à la sécurité maritime, à la piraterie, au Code ISPS, aux risques cyber et aux initiatives liées au Golfe de Guinée.",
    interet_oby:
      "Ce repère soutient une lecture juridique et institutionnelle de la sécurisation maritime dans les espaces africains.",
    lien_source: "https://www.imo.org/en/ourwork/security/pages/default.aspx",
    affichage_accueil: true,
    ordre: 6,
  },
  {
    id: "ocean-decade-call-actions-2026",
    titre: "Ocean Decade — Call for Decade Actions No. 11/2026",
    type: "Appel à contributions",
    date_publication_interne: "2026-06-23",
    date_evenement: "",
    organisateur: "UNESCO-IOC · Ocean Decade",
    zone: "International",
    axes: ["innovation", "science océanique", "prospective"],
    statut: "Opportunité",
    resume:
      "Appel de l'Ocean Decade invitant à soumettre des initiatives océaniques comme projets, programmes ou contributions de la Décennie.",
    interet_oby:
      "Ce repère ouvre une passerelle entre recherche, innovation, gouvernance de l'océan et contribution scientifique structurée.",
    lien_source: "https://oceandecade.org/",
    affichage_accueil: true,
    ordre: 7,
  },
  {
    id: "fao-peche-inn-cadre-international",
    titre: "FAO — pêche INN et instruments internationaux",
    type: "Ressource institutionnelle",
    date_publication_interne: "2026-06-23",
    date_evenement: "",
    organisateur: "Food and Agriculture Organization of the United Nations",
    zone: "International · États côtiers · pêcheries",
    axes: ["pêche INN", "ressources halieutiques", "économie bleue"],
    statut: "Repère",
    resume:
      "Ressource FAO sur la pêche illicite, non déclarée et non réglementée, ses effets sur les écosystèmes marins, la sécurité alimentaire et les capacités de contrôle.",
    interet_oby:
      "Ce repère relie économie bleue, souveraineté côtière, criminalité maritime et gouvernance durable des ressources marines.",
    lien_source: "https://www.fao.org/iuu-fishing/en/",
    affichage_accueil: true,
    ordre: 8,
  },
  {
    id: "ocean-decade-conference-2027-rio",
    titre: "Ocean Decade Conference 2027 — Rio de Janeiro",
    type: "Événement",
    date_publication_interne: "2026-06-23",
    date_evenement: "2027-04-07 au 2027-04-09",
    organisateur: "UNESCO-IOC · Ocean Decade",
    zone: "Rio de Janeiro · International",
    axes: ["science océanique", "coopération internationale", "prospective"],
    statut: "À suivre",
    resume:
      "Conférence Ocean Decade annoncée à Rio de Janeiro pour réunir la communauté océanique internationale autour de l'action pour l'océan.",
    interet_oby:
      "Ce repère permet de suivre un espace structurant pour les liens entre science, politique publique, prospective et gouvernance maritime.",
    lien_source: "https://oceandecade.org/",
    affichage_accueil: false,
    ordre: 9,
  },
];

const loadWatchAgendaItems = () =>
  fetch("assets/data/veille-agenda-oby.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Veille agenda data unavailable");
      }
      return response.json();
    })
    .then((items) => {
      if (!Array.isArray(items) || items.length === 0) {
        throw new Error("Veille agenda data empty");
      }
      return { items, source: "json" };
    })
    .catch(() => ({ items: WATCH_AGENDA_FALLBACK_ITEMS, source: "fallback" }));

(() => {
  const mapRoot = document.querySelector("[data-cartographie]");

  if (!mapRoot) {
    return;
  }

  const controls = mapRoot.querySelector("[data-map-controls]");
  const results = mapRoot.querySelector("[data-map-results]");
  const empty = mapRoot.querySelector("[data-map-empty]");
  const count = mapRoot.querySelector("[data-map-count]");
  const total = mapRoot.querySelector("[data-map-total]");
  const refCount = mapRoot.querySelector("[data-ref-count]");
  const mediaCount = mapRoot.querySelector("[data-media-count]");
  const totalInline = mapRoot.querySelector("[data-map-total-inline]");
  const mapNote = mapRoot.querySelector("[data-map-note]");
  const showMoreButton = mapRoot.querySelector("[data-map-show-all]");
  const resetButton = mapRoot.querySelector("[data-map-reset]");
  const axisSelect = controls?.elements.axe;
  const typeSelect = controls?.elements.type;
  const searchInput = controls?.elements.q;
  const cardsIncrement = 6;
  const featuredSubjectIds = [
    "onu-obligations-maritimes-etats",
    "gouvernance-maritime-action-etat-mer",
    "peche-inn-droit-international",
    "gouvernance-economique-espaces-maritimes",
    "mediation-gouvernance-internationale",
    "blockchain-intermediation",
  ];
  let visibleLimit = cardsIncrement;
  let hasInteracted = false;

  const escapeHtml = (value) =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const normalize = (value) =>
    String(value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const uniqueValues = (items, key) =>
    [...new Set(items.map((item) => item[key]).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b, "fr")
    );

  const fillSelect = (select, values) => {
    if (!select) {
      return;
    }

    values.forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  };

  const subjectText = (subject) =>
    normalize(
      [
        subject.titre,
        subject.titreOriginal,
        subject.axe,
        subject.dossier,
        subject.statut,
        subject.publication,
      ].join(" ")
    );

  const renderSubject = (subject) => {
    const title = escapeHtml(subject.titre || subject.titreOriginal || "Sujet de recherche");
    const axis = escapeHtml(subject.axe || "Axe non renseigné");
    const status = escapeHtml(subject.statut || "Sujet de recherche");
    const dossier = escapeHtml(subject.dossier || "");
    const summary = subject.resume || subject.description || "";

    return `
      <article class="map-card">
        <div class="map-card-meta">
          <span class="map-pill">${axis}</span>
          <span class="map-pill status">${status}</span>
        </div>
        <h3>${title}</h3>
        ${summary ? `<p>${escapeHtml(summary)}</p>` : ""}
        <div class="map-tags">
          ${dossier ? `<span class="map-pill">${dossier}</span>` : ""}
        </div>
        <div class="map-card-links">
          <a href="axes-recherche.html">Axes</a>
          <a href="travaux-publications.html">Travaux</a>
        </div>
      </article>
    `;
  };

  const render = (subjects) => {
    const query = normalize(searchInput?.value || "");
    const axis = axisSelect?.value || "";
    const type = typeSelect?.value || "";
    const hasFilter = Boolean(query || axis || type);
    const filtered = subjects.filter((subject) => {
      const matchesQuery = !query || subjectText(subject).includes(query);
      const matchesAxis = !axis || subject.axe === axis;
      const matchesType = !type || subject.statut === type;
      return matchesQuery && matchesAxis && matchesType;
    });
    const ordered = hasFilter
      ? filtered
      : [
          ...featuredSubjectIds
            .map((id) => subjects.find((subject) => subject.id === id))
            .filter(Boolean),
          ...filtered.filter((subject) => !featuredSubjectIds.includes(subject.id)),
        ];
    const currentLimit = Math.max(cardsIncrement, visibleLimit);
    const visible = ordered.slice(0, currentLimit);

    if (count) {
      count.textContent = String(visible.length);
    }

    if (mapNote) {
      mapNote.textContent = hasFilter
        ? `${filtered.length} sujet${filtered.length > 1 ? "s" : ""} correspond${filtered.length > 1 ? "ent" : ""} aux critères actifs.`
        : "Sélection initiale — utilisez les filtres, la recherche ou Afficher plus pour poursuivre l'exploration.";
    }

    if (showMoreButton) {
      showMoreButton.hidden = ordered.length <= visible.length;
      showMoreButton.textContent = "Afficher plus";
    }

    if (resetButton) {
      resetButton.hidden = !hasFilter && !hasInteracted;
    }

    if (results) {
      results.innerHTML = visible.map(renderSubject).join("");
    }

    if (empty) {
      empty.hidden = !hasFilter || visible.length > 0;
    }
  };

  Promise.all([
    fetch("assets/data/sujets-recherche-oby.json").then((response) => response.json()),
    fetch("assets/data/bibliotheque-oby.json").then((response) => response.json()),
    fetch("assets/data/mediatheque-oby.json").then((response) => response.json()),
  ])
    .then(([subjects, references, media]) => {
      if (total) {
        total.textContent = String(subjects.length);
      }

      if (totalInline) {
        totalInline.textContent = String(subjects.length);
      }

      if (refCount) {
        refCount.textContent = String(references.length);
      }

      if (mediaCount) {
        mediaCount.textContent = String(media.length);
      }

      fillSelect(axisSelect, uniqueValues(subjects, "axe"));
      fillSelect(typeSelect, uniqueValues(subjects, "statut"));
      render(subjects);

      controls?.addEventListener("input", () => {
        hasInteracted = true;
        visibleLimit = cardsIncrement;
        render(subjects);
      });
      controls?.addEventListener("reset", () => {
        hasInteracted = false;
        visibleLimit = cardsIncrement;
        window.setTimeout(() => render(subjects), 0);
      });
      showMoreButton?.addEventListener("click", () => {
        hasInteracted = true;
        visibleLimit += cardsIncrement;
        render(subjects);
      });
    })
    .catch(() => {
      if (results) {
        results.innerHTML = "";
      }

      if (count) {
        count.textContent = "0";
      }

      if (empty) {
        empty.hidden = false;
        empty.textContent = "Les données de cartographie ne sont pas accessibles dans ce contexte local.";
      }
    });
})();

(() => {
  const watchRoot = document.querySelector("[data-watch-agenda]");

  if (!watchRoot) {
    return;
  }

  const controls = watchRoot.querySelector("[data-watch-controls]");
  const results = watchRoot.querySelector("[data-watch-results]");
  const empty = watchRoot.querySelector("[data-watch-empty]");
  const count = watchRoot.querySelector("[data-watch-count]");
  const typeSelect = controls?.elements.type;
  const statusSelect = controls?.elements.statut;

  const escapeHtml = (value) =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const uniqueValues = (items, key) =>
    [...new Set(items.map((item) => item[key]).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b, "fr")
    );

  const fillSelect = (select, values) => {
    if (!select) {
      return;
    }

    values.forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  };

  const renderAxes = (axes) =>
    Array.isArray(axes)
      ? axes.map((axis) => `<span class="map-pill">${escapeHtml(axis)}</span>`).join("")
      : "";

  const renderWatchCard = (item) => {
    const title = escapeHtml(item.titre || "Repère de veille");
    const type = escapeHtml(item.type || "Repère");
    const status = escapeHtml(item.statut || "À suivre");
    const zone = escapeHtml(item.zone || "");
    const summary = escapeHtml(item.resume || "Repère documentaire.");
    const interest = escapeHtml(item.interet_oby || "");
    const source = item.lien_source
      ? `<a class="watch-link" href="${escapeHtml(item.lien_source)}" rel="noopener">Source officielle</a>`
      : "";

    return `
      <article class="watch-card">
        <div class="watch-card-top">
          <span class="watch-type">${type}</span>
          <span class="watch-status">${status}</span>
        </div>
        <h3>${title}</h3>
        <p>${summary}</p>
        ${zone ? `<p class="watch-meta">${zone}</p>` : ""}
        ${interest ? `<p class="watch-interest">${interest}</p>` : ""}
        <div class="map-tags">${renderAxes(item.axes)}</div>
        ${source}
      </article>
    `;
  };

  const render = (items) => {
    const type = typeSelect?.value || "";
    const status = statusSelect?.value || "";
    const filtered = items.filter((item) => {
      const matchesType = !type || item.type === type;
      const matchesStatus = !status || item.statut === status;
      return matchesType && matchesStatus;
    });

    if (count) {
      count.textContent = String(filtered.length);
    }

    if (results) {
      results.innerHTML = filtered.map(renderWatchCard).join("");
    }

    if (empty) {
      empty.hidden = filtered.length > 0;
    }
  };

  loadWatchAgendaItems()
    .then(({ items }) => {
      const sortedItems = [...items].sort((a, b) => (a.ordre || 999) - (b.ordre || 999));
      fillSelect(typeSelect, uniqueValues(sortedItems, "type"));
      fillSelect(statusSelect, uniqueValues(sortedItems, "statut"));
      render(sortedItems);

      controls?.addEventListener("input", () => render(sortedItems));
      controls?.addEventListener("change", () => render(sortedItems));
      controls?.addEventListener("reset", () => window.setTimeout(() => render(sortedItems), 0));
    })
    .catch(() => {
      if (results) {
        results.innerHTML = "";
      }

      if (count) {
        count.textContent = "—";
      }

      if (empty) {
        empty.hidden = false;
        empty.textContent = "La sélection de veille est en cours de chargement ou sera enrichie progressivement.";
      }
    });
})();

(() => {
  const featuredRoot = document.querySelector("[data-featured-watch]");

  if (!featuredRoot) {
    return;
  }

  const escapeHtml = (value) =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const renderFeatured = (item) => `
    <article class="watch-card featured">
      <div class="watch-card-top">
        <span class="watch-type">${escapeHtml(item.type || "Repère")}</span>
        <span class="watch-status">${escapeHtml(item.statut || "À suivre")}</span>
      </div>
      <h3>${escapeHtml(item.titre || "Repère de veille")}</h3>
      <p>${escapeHtml(item.resume || "Repère documentaire.")}</p>
      <a class="watch-link" href="veille-agenda.html">Voir la veille & agenda</a>
    </article>
  `;

  loadWatchAgendaItems()
    .then(({ items }) => {
      const featuredItems = items
        .filter((item) => item.affichage_accueil === true)
        .sort((a, b) => (a.ordre || 999) - (b.ordre || 999))
        .slice(0, 3);

      featuredRoot.innerHTML = featuredItems.map(renderFeatured).join("");
    })
    .catch(() => {
      featuredRoot.innerHTML = `
        <article class="watch-card featured">
          <div class="watch-card-top">
            <span class="watch-type">Veille</span>
            <span class="watch-status">Repère</span>
          </div>
          <h3>Veille & agenda</h3>
          <p>Cette sélection s’affiche lorsque la page est consultée en ligne.</p>
          <a class="watch-link" href="veille-agenda.html">Voir la veille & agenda</a>
        </article>
      `;
    });
})();

(() => {
  const searchRoot = document.querySelector("[data-global-search]");

  if (!searchRoot) {
    return;
  }

  const controls = searchRoot.querySelector("[data-search-controls]");
  const results = searchRoot.querySelector("[data-search-results]");
  const empty = searchRoot.querySelector("[data-search-empty]");
  const status = searchRoot.querySelector("[data-search-status]");
  const note = searchRoot.querySelector("[data-search-note]");
  const searchInput = controls?.elements.q;
  const typeSelect = controls?.elements.type;

  const escapeHtml = (value) =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const normalize = (value) =>
    String(value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const pages = [
    { title: "Accueil", type: "Page", category: "Présentation", url: "index.html" },
    { title: "Profil", type: "Page", category: "Trajectoire", url: "profil.html" },
    { title: "Expertise & axes", type: "Page", category: "Axes", url: "axes-recherche.html" },
    { title: "Travaux & recherches", type: "Page", category: "Travaux", url: "travaux-publications.html" },
    { title: "Participations & réseaux", type: "Page", category: "Événements", url: "interventions.html" },
    { title: "Bibliothèque de travail & ressources", type: "Page", category: "Ressources", url: "bibliotheque-ressources.html" },
    { title: "Médiathèque", type: "Page", category: "Photographies et lieux", url: "mediatheque.html" },
    { title: "Cartographie intellectuelle", type: "Page", category: "Exploration", url: "cartographie.html" },
    { title: "À la une · Veille & agenda", type: "Page", category: "Veille", url: "veille-agenda.html" },
    { title: "Carnet d’idées", type: "Page", category: "Réflexions", url: "carnet-idees.html" },
    { title: "Reconnaissances", type: "Page", category: "Appuis et engagements", url: "distinctions-bourses.html" },
    { title: "Initiatives reliées", type: "Page", category: "Écosystème", url: "ecosysteme.html" },
    { title: "Contact", type: "Page", category: "Contact", url: "contact.html" },
  ];

  const textFor = (item) => normalize([item.title, item.type, item.category, item.searchText].join(" "));

  const renderItem = (item) => `
    <a class="search-result-card" href="${escapeHtml(item.url)}">
      <span>${escapeHtml(item.type)}</span>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.category || "Site OBY")}</p>
    </a>
  `;

  const render = (items) => {
    const query = normalize(searchInput?.value || "");
    const type = typeSelect?.value || "";
    const hasSearch = Boolean(query || type);
    const filtered = hasSearch
      ? items.filter((item) => {
          const matchesQuery = !query || textFor(item).includes(query);
          const matchesType = !type || item.type === type;
          return matchesQuery && matchesType;
        })
      : [];
    const visible = filtered.slice(0, 36);

    if (status) {
      status.textContent = hasSearch
        ? `${visible.length} résultat${visible.length > 1 ? "s" : ""}`
        : "Recherche prête — saisissez un mot-clé pour explorer les pages, travaux, sujets, ressources et médias.";
    }

    if (note) {
      note.textContent = hasSearch
        ? "Résultats issus des pages et données publiques du site."
        : "";
    }

    if (results) {
      results.innerHTML = visible.map(renderItem).join("");
    }

    if (empty) {
      empty.hidden = hasSearch ? visible.length > 0 : true;
    }
  };

  Promise.all([
    fetch("assets/data/sujets-recherche-oby.json").then((response) => response.json()),
    fetch("assets/data/bibliotheque-oby.json").then((response) => response.json()),
    fetch("assets/data/mediatheque-oby.json").then((response) => response.json()),
    loadWatchAgendaItems().then(({ items }) => items),
  ])
    .then(([subjects, references, media, watch]) => {
      const subjectItems = subjects.map((item) => ({
        title: item.titre || item.titreOriginal || "Sujet",
        type: "Sujet",
        category: item.axe || item.dossier || "Sujet de recherche",
        searchText: [item.titreOriginal, item.dossier, item.statut, item.publication, item.resume].join(" "),
        url: "cartographie.html",
      }));
      const referenceItems = references.map((item) => ({
        title: item.titre || "Référence",
        type: "Référence",
        category: item.categorie || item.sousCategorie || "Bibliothèque",
        searchText: [
          ...(item.auteurs || []),
          ...(item.direction || []),
          item.editeur,
          item.collection,
          item.note,
        ].join(" "),
        url: "bibliotheque-ressources.html",
      }));
      const mediaItems = media.filter((item) => item.statut === "public-valide").map((item) => ({
        title: item.titre || "Média documentaire",
        type: "Média",
        category: item.axe_associe || item.categorie || item.typeMedia || "Médiathèque",
        searchText: [item.lieu, item.annee, item.evenementLie, item.description, item.statut].join(" "),
        url: item.pageLiee || "mediatheque.html",
      }));
      const watchItems = watch.map((item) => ({
        title: item.titre || "Repère de veille",
        type: "Veille",
        category: Array.isArray(item.axes) && item.axes.length ? item.axes.join(" · ") : item.type || "Veille & agenda",
        searchText: [item.type, item.statut, item.zone, item.resume, item.interet_oby, ...(item.axes || [])].join(" "),
        url: "veille-agenda.html",
      }));
      const items = [...pages, ...subjectItems, ...referenceItems, ...mediaItems, ...watchItems];

      const params = new URLSearchParams(window.location.search);
      if (searchInput && params.get("q")) {
        searchInput.value = params.get("q");
      }
      if (typeSelect && params.get("type")) {
        typeSelect.value = params.get("type");
      }

      render(items);
      controls?.addEventListener("input", () => render(items));
      controls?.addEventListener("change", () => render(items));
      controls?.addEventListener("reset", () => window.setTimeout(() => render(items), 0));
    })
    .catch(() => {
      if (note) {
        note.textContent = "Les données de recherche ne sont pas accessibles dans ce contexte local.";
      }
    });
})();

(() => {
  const libraryRoot = document.querySelector("[data-library]");

  if (!libraryRoot) {
    return;
  }

  const controls = libraryRoot.querySelector("[data-library-controls]");
  const results = libraryRoot.querySelector("[data-library-results]");
  const count = libraryRoot.querySelector("[data-library-count]");
  const note = libraryRoot.querySelector("[data-library-note]");
  const empty = libraryRoot.querySelector("[data-library-empty]");
  const searchInput = controls?.elements.q;
  const categorySelect = controls?.elements.categorie;
  const statusSelect = controls?.elements.statut;

  const escapeHtml = (value) =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const normalize = (value) =>
    String(value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const statusClass = (status) => {
    if (status === "confirmé") {
      return "confirmed";
    }
    if (status === "partiel") {
      return "partial";
    }
    return "verify";
  };

  const renderReference = (item) => {
    const contributors = [...(item.auteurs || []), ...(item.direction || [])].join(" · ");
    const metadata = [item.editeur, item.collection, item.annee, item.edition].filter(Boolean).join(" · ");
    const sourceLink = /^https?:\/\//i.test(item.sourceVerification || "")
      ? `<p class="card-link"><a href="${escapeHtml(item.sourceVerification)}" target="_blank" rel="noopener">Notice ou source de vérification</a></p>`
      : "";

    return `
      <article class="library-card">
        <div class="library-card-top">
          <span class="library-domain">${escapeHtml(item.sousCategorie || item.categorie || "Ressource")}</span>
          <span class="library-status ${statusClass(item.statutMetadata)}">${escapeHtml(item.statutMetadata || "à vérifier")}</span>
        </div>
        <h3>${escapeHtml(item.titre || "Référence de travail")}</h3>
        ${contributors ? `<p class="library-authors">${escapeHtml(contributors)}</p>` : ""}
        ${metadata ? `<p class="library-meta">${escapeHtml(metadata)}</p>` : ""}
        ${item.isbn ? `<p class="library-isbn">ISBN ${escapeHtml(item.isbn)}</p>` : ""}
        ${item.note ? `<p class="library-note">${escapeHtml(item.note)}</p>` : ""}
        ${sourceLink}
      </article>
    `;
  };

  fetch("assets/data/bibliotheque-oby.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Library data unavailable");
      }
      return response.json();
    })
    .then((references) => {
      [...new Set(references.map((item) => item.categorie).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b, "fr"))
        .forEach((category) => {
          const option = document.createElement("option");
          option.value = category;
          option.textContent = category;
          categorySelect?.appendChild(option);
        });

      const params = new URLSearchParams(window.location.search);
      if (searchInput && params.get("q")) {
        searchInput.value = params.get("q");
      }
      if (categorySelect && params.get("categorie")) {
        categorySelect.value = params.get("categorie");
      }
      if (statusSelect && params.has("statut")) {
        statusSelect.value = params.get("statut");
      }

      const render = () => {
        const query = normalize(searchInput?.value || "");
        const category = categorySelect?.value || "";
        const status = statusSelect?.value ?? "confirmé";
        const filtered = references.filter((item) => {
          const searchable = normalize(
            [
              item.titre,
              ...(item.auteurs || []),
              ...(item.direction || []),
              item.editeur,
              item.collection,
              item.categorie,
              item.sousCategorie,
              item.annee,
              item.isbn,
              item.note,
            ].join(" ")
          );

          return (
            (!query || searchable.includes(query)) &&
            (!category || item.categorie === category) &&
            (!status || item.statutMetadata === status)
          );
        });

        if (count) {
          count.textContent = `${filtered.length} référence${filtered.length > 1 ? "s" : ""} affichée${filtered.length > 1 ? "s" : ""} sur ${references.length}`;
        }
        if (note) {
          note.textContent = status ? `Statut documentaire : ${status}.` : "Tous les statuts documentaires.";
        }
        if (results) {
          results.innerHTML = filtered.map(renderReference).join("");
        }
        if (empty) {
          empty.hidden = filtered.length > 0;
        }
      };

      render();
      controls?.addEventListener("input", render);
      controls?.addEventListener("change", render);
      controls?.addEventListener("reset", () => window.setTimeout(render, 0));
    })
    .catch(() => {
      if (count) {
        count.textContent = "Bibliothèque indisponible";
      }
      if (note) {
        note.textContent = "Cette sélection ne peut pas être affichée dans ce contexte.";
      }
    });
})();

(() => {
  const mediaRoot = document.querySelector("[data-media-library]");

  if (!mediaRoot) {
    return;
  }

  const controls = mediaRoot.querySelector("[data-public-media-controls]");
  const results = mediaRoot.querySelector("[data-public-media-results]");
  const count = mediaRoot.querySelector("[data-public-media-count]");
  const empty = mediaRoot.querySelector("[data-public-media-empty]");
  const searchInput = controls?.elements.q;
  const typeSelect = controls?.elements.type;
  const environmentSelect = controls?.elements.environnement;

  // Libellés lisibles pour les valeurs techniques du fichier éditorial : le
  // visiteur voit une nature de document, pas un identifiant de champ.
  const MEDIA_TYPE_LABELS = {
    "photographie-evenement": "Photographies",
    "visuel-documentaire": "Visuel documentaire",
    "portrait-identite": "Portrait",
    support: "Support",
    "document-public": "Document public",
    "evenement-academique": "Événement",
    "terrain-institution": "Terrain et institution",
    "trace-officielle": "Trace officielle",
    "réseau-international": "Réseau international",
    "réseau-plateforme": "Réseau et plateforme",
  };

  // Grands environnements de circulation. L'appartenance est déduite des champs
  // déjà présents (lieu, événement, titre, axe) : une entrée ajoutée plus tard
  // se range donc d'elle-même, sans champ supplémentaire à saisir.
  // Chaque motif court est borné par \b : sans cela, « diplômes » — une fois les
  // accents retirés — contient « lome », et une remise de diplômes se rangeait
  // dans l'Afrique maritime. Les collisions de ce type sont silencieuses.
  const MEDIA_ENVIRONMENTS = [
    {
      label: "Terrains et observation",
      motifs: /\bterrains?\b|\bcoast\b|\bgizc\b|calanque|\bgoudes\b|\bestaque\b|aygulf|frejus|malpasset|sedimentaire|trait de cote|pressions urbaines|forcages?\b/,
    },
    {
      label: "Afrique maritime",
      motifs: /\blome\b|abidjan|afrique|golfe de guinee|\bwaca\b|\bivoir|\btogo\b|\bdakar\b|\bohada\b|\bersuma\b/,
    },
    {
      label: "Innovation et transitions",
      motifs: /emerging valley|euromaritime|pepite|entrepreneur|innovactions|crowdfunding|\bd2e/,
    },
    {
      label: "Institutions et recherche",
      motifs: /indemer|\bensm\b|academies de marine|ecole d ?ete|\bcop ?\d|\bcoy ?\d|\bpnud\b|\bunesco\b|proteus|oceanexpert|ocean decade|mesopolhis|\bcesm\b|\brfdi\b|cour administrative|loi littoral|delimitation|arbitrage/,
    },
    {
      label: "Méditerranée et milieu marin",
      motifs: /mediterran|marseille|monaco|port-cros|porquerolles|\blonde\b|hyeres|luminy|aire marine|medpan|mouillage|tethys|\bnice\b/,
    },
  ];

  // Le classement s'appuie sur le titre, le lieu et l'événement rattaché, jamais
  // sur la description : celle-ci est un texte long, où un mot incident suffirait
  // à ranger une entrée dans le mauvais environnement.
  const environmentOf = (item) => {
    const champ = normalize(
      [item.titre, item.lieu, item.evenementLie, item.axe_associe].join(" ")
    ).replace(/['’]/g, " ");
    const trouve = MEDIA_ENVIRONMENTS.find((env) => env.motifs.test(champ));
    return trouve ? trouve.label : "Autres repères";
  };

  const escapeHtml = (value) =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const normalize = (value) =>
    String(value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const renderMedia = (item) => {
    const brut = item.typeMedia || item.categorie || "";
    const type = MEDIA_TYPE_LABELS[brut] || brut || "Trace documentaire";
    const metadata = [item.annee, item.lieu].filter(Boolean).join(" · ");
    const imageClass = /\.(?:jpe?g|png|webp|avif)$/i.test(item.fichier || "") ? " media-card-photo" : "";
    const galleryItems = Array.isArray(item.galerie)
      ? item.galerie.filter((entry) => entry && entry.fichier)
      : [];
    const renderGalleryEntries = (entries) =>
      entries
        .map(
          (entry) => `
            <figure>
              <img src="${escapeHtml(entry.fichier)}" alt="${escapeHtml(entry.alt || "")}" loading="lazy">
              ${entry.legende ? `<figcaption>${escapeHtml(entry.legende)}</figcaption>` : ""}
            </figure>`
        )
        .join("");
    const visibleGalleryItems = galleryItems.slice(0, 4);
    const additionalGalleryItems = galleryItems.slice(4);
    const gallery = galleryItems.length
      ? `<div class="media-card-gallery" aria-label="Photographies complémentaires">
          ${renderGalleryEntries(visibleGalleryItems)}
        </div>
        ${additionalGalleryItems.length
          ? `<details class="media-gallery-more">
              <summary>Voir ${additionalGalleryItems.length} photo${additionalGalleryItems.length > 1 ? "s" : ""} supplémentaire${additionalGalleryItems.length > 1 ? "s" : ""}</summary>
              <div class="media-card-gallery media-card-gallery-more" aria-label="Photographies supplémentaires">
                ${renderGalleryEntries(additionalGalleryItems)}
              </div>
            </details>`
          : ""}`
      : "";
    const contextLink = item.pageLiee
      ? `<a class="media-link" href="${escapeHtml(item.pageLiee)}">Voir le contexte associé</a>`
      : "";

    return `
      <article class="media-card${imageClass}" id="${escapeHtml(item.id || "")}">
        <figure class="media-card-primary">
          <img src="${escapeHtml(item.fichier || "assets/img/media/placeholder-document-oby.svg")}" alt="${escapeHtml(item.alt || item.titre || "Trace documentaire OBY")}" loading="lazy">
          ${item.legende ? `<figcaption>${escapeHtml(item.legende)}</figcaption>` : ""}
        </figure>
        <div class="media-card-body">
          <div class="media-card-top">
            <span class="media-type">${escapeHtml(type)}</span>
            <span class="media-environment">${escapeHtml(environmentOf(item))}</span>
          </div>
          <h3>${escapeHtml(item.titre || "Trace documentaire")}</h3>
          ${metadata ? `<p class="media-meta">${escapeHtml(metadata)}</p>` : ""}
          <p>${escapeHtml(item.description || item.evenementLie || "Trace documentaire publique associée au parcours OBY.")}</p>
          ${gallery}
          ${contextLink}
        </div>
      </article>
    `;
  };

  fetch("assets/data/mediatheque-oby.json?v=oby-v3-8")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Media data unavailable");
      }
      return response.json();
    })
    .then((items) => {
      const publicItems = items.filter((item) => item.statut === "public-valide");

      [...new Set(publicItems.map((item) => item.typeMedia || item.categorie).filter(Boolean))]
        .map((brut) => [brut, MEDIA_TYPE_LABELS[brut] || brut])
        .sort((a, b) => a[1].localeCompare(b[1], "fr"))
        .forEach(([brut, libelle]) => {
          const option = document.createElement("option");
          option.value = brut;
          option.textContent = libelle;
          typeSelect?.appendChild(option);
        });

      // L'ordre des environnements suit celui de la déclaration, pas l'alphabet :
      // il va du terrain vécu vers les cadres institutionnels.
      const presents = new Set(publicItems.map(environmentOf));
      MEDIA_ENVIRONMENTS.map((env) => env.label)
        .concat("Autres repères")
        .filter((label) => presents.has(label))
        .forEach((label) => {
          const option = document.createElement("option");
          option.value = label;
          option.textContent = label;
          environmentSelect?.appendChild(option);
        });

      const render = () => {
        const query = normalize(searchInput?.value || "");
        const type = typeSelect?.value || "";
        const environment = environmentSelect?.value || "";
        const filtered = publicItems.filter((item) => {
          const itemType = item.typeMedia || item.categorie || "";
          if (environment && environmentOf(item) !== environment) {
            return false;
          }
          const searchable = normalize(
            [
              item.titre,
              item.annee,
              item.lieu,
              item.categorie,
              item.typeMedia,
              item.evenementLie,
              item.description,
              item.axe_associe,
            ].join(" ")
          );
          return (!query || searchable.includes(query)) && (!type || itemType === type);
        });

        if (count) {
          const photos = filtered.reduce(
            (total, item) => total + 1 + (Array.isArray(item.galerie) ? item.galerie.length : 0),
            0
          );
          count.textContent =
            filtered.length === publicItems.length
              ? `${publicItems.length} événements · ${photos} images`
              : `${filtered.length} sur ${publicItems.length} · ${photos} images`;
        }
        if (results) {
          results.innerHTML = filtered.map(renderMedia).join("");
        }
        if (empty) {
          empty.hidden = filtered.length > 0;
        }
      };

      render();
      controls?.addEventListener("input", render);
      controls?.addEventListener("change", render);
      controls?.addEventListener("reset", () => window.setTimeout(render, 0));
    })
    .catch(() => {
      if (count) {
        count.textContent = "Les images ne peuvent pas être affichées dans ce contexte.";
      }
    });
})();

const revealHashTarget = () => {
  if (!window.location.hash) {
    return;
  }

  const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
  const disclosure =
    target?.matches("details")
      ? target
      : target?.closest("details") || target?.querySelector("details");

  if (disclosure) {
    disclosure.open = true;
  }
};

revealHashTarget();
window.addEventListener("hashchange", revealHashTarget);
