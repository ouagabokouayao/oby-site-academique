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

// Repli hors ligne : strictement la même projection publique que
// assets/data/veille-agenda-oby.json — aucune donnée de back-office.
const WATCH_AGENDA_FALLBACK_ITEMS = [
  {
    id: "plan-bleu-rendez-vous-aires-marines-protegees",
    titre: "Plan Bleu — Rendez-vous consacré aux aires marines protégées",
    type: "Ressource institutionnelle",
    date_evenement: "",
    organisateur: "Plan Bleu",
    zone: "Méditerranée",
    axes: ["aires marines protégées", "Méditerranée", "biodiversité", "coûts et bénéfices", "gouvernance environnementale"],
    statut: "Ressource de veille",
    resume: "Rendez-vous du Plan Bleu consacré aux coûts et bénéfices des aires marines protégées, mobilisé comme ressource de veille sur la gouvernance méditerranéenne, la biodiversité marine et les politiques de protection.",
    interet_oby: "Cette ressource éclaire l'évaluation économique des aires marines protégées et les arbitrages de gouvernance en Méditerranée.",
    lien_source: "",
    affichage_accueil: false,
    ordre: 4,
    image: "",
    video: "",
  },
  {
    id: "imo-securite-maritime-golfe-guinee",
    titre: "IMO — sécurité maritime, piraterie et Golfe de Guinée",
    type: "Ressource institutionnelle",
    date_evenement: "",
    organisateur: "International Maritime Organization",
    zone: "Golfe de Guinée · Afrique de l'Ouest et centrale",
    axes: ["sécurité maritime", "gouvernance maritime", "Golfe de Guinée"],
    statut: "Repère",
    resume: "Page institutionnelle de l'IMO consacrée à la sécurité maritime, à la piraterie, au Code ISPS, aux risques cyber et aux initiatives liées au Golfe de Guinée.",
    interet_oby: "Ce repère soutient une lecture juridique et institutionnelle de la sécurisation maritime dans les espaces africains.",
    lien_source: "https://www.imo.org/en/ourwork/security/pages/default.aspx",
    affichage_accueil: true,
    ordre: 6,
  },
  {
    id: "ocean-decade-call-actions-2026",
    titre: "Ocean Decade — Call for Decade Actions No. 11/2026",
    type: "Appel à contributions",
    date_evenement: "",
    organisateur: "UNESCO-IOC · Ocean Decade",
    zone: "International",
    axes: ["innovation", "science océanique", "prospective"],
    statut: "Opportunité",
    resume: "Appel de l'Ocean Decade invitant à soumettre des initiatives océaniques comme projets, programmes ou contributions de la Décennie.",
    interet_oby: "Ce repère ouvre une passerelle entre recherche, innovation, gouvernance de l'océan et contribution scientifique structurée.",
    lien_source: "https://oceandecade.org/",
    affichage_accueil: true,
    ordre: 7,
  },
  {
    id: "fao-peche-inn-cadre-international",
    titre: "FAO — pêche INN et instruments internationaux",
    type: "Ressource institutionnelle",
    date_evenement: "",
    organisateur: "Food and Agriculture Organization of the United Nations",
    zone: "International · États côtiers · pêcheries",
    axes: ["pêche INN", "ressources halieutiques", "économie bleue"],
    statut: "Repère",
    resume: "Ressource FAO sur la pêche illicite, non déclarée et non réglementée, ses effets sur les écosystèmes marins, la sécurité alimentaire et les capacités de contrôle.",
    interet_oby: "Ce repère relie économie bleue, souveraineté côtière, criminalité maritime et gouvernance durable des ressources marines.",
    lien_source: "https://www.fao.org/iuu-fishing/en/",
    affichage_accueil: true,
    ordre: 8,
  },
  {
    id: "ocean-decade-conference-2027-rio",
    titre: "Ocean Decade Conference 2027 — Rio de Janeiro",
    type: "Événement",
    date_evenement: "2027-04-07 au 2027-04-09",
    organisateur: "UNESCO-IOC · Ocean Decade",
    zone: "Rio de Janeiro · International",
    axes: ["science océanique", "coopération internationale", "prospective"],
    statut: "À suivre",
    resume: "Conférence Ocean Decade annoncée à Rio de Janeiro pour réunir la communauté océanique internationale autour de l'action pour l'océan.",
    interet_oby: "Ce repère permet de suivre un espace structurant pour les liens entre science, politique publique, prospective et gouvernance maritime.",
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
        // Le compteur public ne compte que les entrées réellement publiées.
        mediaCount.textContent = String(
          media.filter((item) => item.statut === "public-valide").length
        );
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
        // `note` reste une note de travail : elle est affichée sur la fiche,
        // mais n'entre pas dans l'index de recherche publique.
        searchText: [
          ...(item.auteurs || []),
          ...(item.direction || []),
          item.editeur,
          item.collection,
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
  const yearSelect = controls?.elements.annee;
  const lightbox = document.querySelector("[data-media-lightbox]");
  const lightboxImage = lightbox?.querySelector("[data-media-lightbox-image]");
  const lightboxCaption = lightbox?.querySelector("[data-media-lightbox-caption]");
  const lightboxCount = lightbox?.querySelector("[data-media-lightbox-count]");
  const lightboxPrevious = lightbox?.querySelector("[data-media-lightbox-previous]");
  const lightboxNext = lightbox?.querySelector("[data-media-lightbox-next]");
  const lightboxClose = lightbox?.querySelector("[data-media-lightbox-close]");
  const photoGroups = new Map();
  let activePhotos = [];
  let activePhotoIndex = 0;
  let lightboxTrigger = null;

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

  const MEDIA_MONTHS = {
    janvier: 0,
    fevrier: 1,
    mars: 2,
    avril: 3,
    mai: 4,
    juin: 5,
    juillet: 6,
    aout: 7,
    septembre: 8,
    octobre: 9,
    novembre: 10,
    decembre: 11,
  };

  // Une date canonique reliée prime. Pour une période, la borne la plus récente
  // est retenue ; à défaut de date exploitable, seule l'année publique départage.
  const mediaDateRank = (dateCanonique, publicYear) => {
    const value = normalize(dateCanonique).replace(/[–—]/g, "-");
    const years = [...value.matchAll(/\b(\d{4})\b/g)].map((match) => Number(match[1]));
    const fallbackYear = years.at(-1) || Number(publicYear) || 0;
    const datedParts = [];
    const fullDatePattern = new RegExp(
      `\\b(\\d{1,2})(?:er)?\\s+(${Object.keys(MEDIA_MONTHS).join("|")})(?:\\s+(\\d{4}))?`,
      "g"
    );

    for (const match of value.matchAll(fullDatePattern)) {
      const yearBefore = [...value.slice(0, match.index).matchAll(/\b(\d{4})\b/g)].at(-1);
      const year = Number(match[3] || yearBefore?.[1] || fallbackYear);
      if (year) {
        datedParts.push(Date.UTC(year, MEDIA_MONTHS[match[2]], Number(match[1])));
      }
    }

    if (!datedParts.length && fallbackYear) {
      const month = Object.keys(MEDIA_MONTHS).find((name) => value.includes(name));
      datedParts.push(Date.UTC(fallbackYear, month ? MEDIA_MONTHS[month] : 0, 1));
    }

    return datedParts.length ? Math.max(...datedParts) : 0;
  };

  const isRasterImage = (path) => /\.(?:jpe?g|png|webp|avif)$/i.test(path || "");

  const dimensionAttributes = (photo) =>
    Number.isInteger(photo.largeur) && Number.isInteger(photo.hauteur)
      ? ` width="${photo.largeur}" height="${photo.hauteur}"`
      : "";

  const mediaPhotos = (item) => {
    const photos = [];
    if (isRasterImage(item.fichier)) {
      photos.push({
        fichier: item.fichier,
        alt: item.alt || item.titre || "Photographie OBY",
        legende: item.legende || "",
        largeur: item.largeur,
        hauteur: item.hauteur,
      });
    }
    if (Array.isArray(item.galerie)) {
      photos.push(...item.galerie.filter((entry) => entry && isRasterImage(entry.fichier)));
    }
    return photos;
  };

  const renderMedia = (item) => {
    const brut = item.typeMedia || item.categorie || "";
    const type = MEDIA_TYPE_LABELS[brut] || brut || "Trace documentaire";
    const metadata = [item.annee, item.lieu].filter(Boolean).join(" · ");
    const imageClass = isRasterImage(item.fichier) ? " media-card-photo" : "";
    const photos = mediaPhotos(item);
    const galleryItems = photos.slice(1);
    photoGroups.set(item.id, photos);
    const renderGalleryEntries = (entries) =>
      entries
        .map(
          (entry, index) => `
            <figure>
              <button class="media-lightbox-trigger media-gallery-trigger" type="button" data-media-lightbox-id="${escapeHtml(item.id || "")}" data-media-lightbox-index="${index + 1}" aria-label="Agrandir la photographie ${index + 2} sur ${photos.length}">
                <img src="${escapeHtml(entry.fichier)}" alt="${escapeHtml(entry.alt || "")}" loading="lazy"${dimensionAttributes(entry)}>
              </button>
              ${entry.legende ? `<figcaption>${escapeHtml(entry.legende)}</figcaption>` : ""}
            </figure>`
        )
        .join("");
    const photoCount = photos.length;
    const gallery = galleryItems.length
      ? `<div class="media-card-gallery media-card-gallery-collapsed" aria-label="Photographies complémentaires">
          ${renderGalleryEntries(galleryItems)}
        </div>`
      : "";
    const contextLink = item.pageLiee
      ? `<a class="media-link" href="${escapeHtml(item.pageLiee)}">${item.pageLiee.startsWith("participation.html?id=") ? "Voir la participation" : "Voir le contexte associé"}</a>`
      : "";
    const counter = photoCount
      ? `<span class="media-photo-count">${photoCount} photo${photoCount > 1 ? "s" : ""}</span>`
      : "";
    const primary = photos.length
      ? `<button class="media-card-primary media-lightbox-trigger" type="button" data-media-lightbox-id="${escapeHtml(item.id || "")}" data-media-lightbox-index="0" aria-label="Agrandir la photographie principale de ${escapeHtml(item.titre || "cet événement")}">
          <img src="${escapeHtml(photos[0].fichier)}" alt="${escapeHtml(photos[0].alt || "")}" loading="lazy"${dimensionAttributes(photos[0])}>
          <span class="media-zoom-label" aria-hidden="true">Agrandir</span>
        </button>`
      : `<figure class="media-card-primary"><img src="assets/img/media/placeholder-document-oby.svg" alt="${escapeHtml(item.alt || item.titre || "Trace documentaire OBY")}" loading="lazy"></figure>`;
    const galleryDisclosure = galleryItems.length
      ? `<details class="media-card-disclosure">
          <summary class="media-card-summary-footer">${counter}<span class="media-open-label">Voir les photographies</span></summary>
          <div class="media-card-expanded">${gallery}</div>
        </details>`
      : `<div class="media-card-summary-footer media-card-summary-static">${counter}</div>`;

    return `
      <article class="media-card media-card-compact${imageClass}" id="${escapeHtml(item.id || "")}">
        ${primary}
        <div class="media-card-body">
          <div class="media-card-top">
            <span class="media-type">${escapeHtml(type)}</span>
            <span class="media-environment">${escapeHtml(environmentOf(item))}</span>
          </div>
          <h3>${escapeHtml(item.titre || "Trace documentaire")}</h3>
          ${metadata ? `<p class="media-meta">${escapeHtml(metadata)}</p>` : ""}
          ${item.legende ? `<p class="media-card-fact">${escapeHtml(item.legende)}</p>` : ""}
          ${galleryDisclosure}
          ${contextLink}
        </div>
      </article>
    `;
  };

  const showActivePhoto = () => {
    const photo = activePhotos[activePhotoIndex];
    if (!photo || !lightboxImage || !lightboxCaption || !lightboxCount) {
      return;
    }

    lightboxImage.src = photo.fichier;
    lightboxImage.alt = photo.alt || "";
    lightboxCount.textContent = `${activePhotoIndex + 1} / ${activePhotos.length}`;
    lightboxCaption.textContent = photo.legende || "";
    lightboxCaption.hidden = !photo.legende;
    if (photo.legende) {
      lightboxImage.setAttribute("aria-describedby", "media-lightbox-caption");
    } else {
      lightboxImage.removeAttribute("aria-describedby");
    }
    if (lightboxPrevious) {
      lightboxPrevious.disabled = activePhotoIndex === 0;
    }
    if (lightboxNext) {
      lightboxNext.disabled = activePhotoIndex === activePhotos.length - 1;
    }
  };

  const moveActivePhoto = (step) => {
    const nextIndex = activePhotoIndex + step;
    if (nextIndex < 0 || nextIndex >= activePhotos.length) {
      return;
    }
    activePhotoIndex = nextIndex;
    showActivePhoto();
  };

  results?.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-media-lightbox-id]");
    if (!trigger || !lightbox?.showModal) {
      return;
    }
    const photos = photoGroups.get(trigger.dataset.mediaLightboxId) || [];
    const index = Number(trigger.dataset.mediaLightboxIndex);
    if (!photos[index]) {
      return;
    }
    activePhotos = photos;
    activePhotoIndex = index;
    lightboxTrigger = trigger;
    showActivePhoto();
    lightbox.showModal();
    lightboxClose?.focus();
  });

  lightboxPrevious?.addEventListener("click", () => moveActivePhoto(-1));
  lightboxNext?.addEventListener("click", () => moveActivePhoto(1));
  lightboxClose?.addEventListener("click", () => lightbox.close());

  lightbox?.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      lightbox.close();
    }
  });

  lightbox?.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      lightbox.close();
      return;
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      moveActivePhoto(-1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      moveActivePhoto(1);
    }
  });

  lightbox?.addEventListener("close", () => {
    lightboxImage?.removeAttribute("src");
    if (lightboxTrigger?.isConnected) {
      lightboxTrigger.focus();
    }
    activePhotos = [];
    lightboxTrigger = null;
  });

  const fetchJson = (url, errorMessage) =>
    fetch(url).then((response) => {
      if (!response.ok) {
        throw new Error(errorMessage);
      }
      return response.json();
    });

  Promise.all([
    fetchJson("assets/data/mediatheque-oby.json?v=oby-v3-11", "Media data unavailable"),
    fetchJson("assets/data/participations-oby.json?v=oby-v3-11", "Participation data unavailable"),
  ])
    .then(([items, participations]) => {
      const canonicalDates = new Map(
        participations
          .filter((item) => item && item.id && item.date_canonique)
          .map((item) => [item.id, item.date_canonique])
      );
      const publicItems = items
        .map((item, sourceIndex) => ({
          ...item,
          sourceIndex,
          dateCanonique: canonicalDates.get(item.id) || "",
        }))
        .filter((item) => item.statut === "public-valide")
        .sort((a, b) => {
          const dateDifference =
            mediaDateRank(b.dateCanonique, b.annee) - mediaDateRank(a.dateCanonique, a.annee);
          if (dateDifference) {
            return dateDifference;
          }
          const yearDifference = (Number(b.annee) || 0) - (Number(a.annee) || 0);
          return yearDifference || a.sourceIndex - b.sourceIndex;
        });

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

      [...new Set(publicItems.map((item) => item.annee).filter(Boolean))]
        .sort((a, b) => Number(b) - Number(a) || String(b).localeCompare(String(a), "fr"))
        .forEach((year) => {
          const option = document.createElement("option");
          option.value = year;
          option.textContent = year;
          yearSelect?.appendChild(option);
        });

      const render = () => {
        const query = normalize(searchInput?.value || "");
        const type = typeSelect?.value || "";
        const environment = environmentSelect?.value || "";
        const year = yearSelect?.value || "";
        const filtered = publicItems.filter((item) => {
          const itemType = item.typeMedia || item.categorie || "";
          if (environment && environmentOf(item) !== environment) {
            return false;
          }
          if (year && item.annee !== year) {
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
            (total, item) => total + mediaPhotos(item).length,
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

// Détail d'une participation : participation.html?id=<slug>.
// La page de liste ne porte plus que l'essentiel ; tout le contexte, les
// thématiques, les sources et la galerie sont rendus ici depuis le JSON
// canonique, ce qui évite une page HTML par événement.
(() => {
  const racine = document.querySelector("[data-participation]");

  if (!racine) {
    return;
  }

  const titre = racine.querySelector("[data-participation-titre]");
  const meta = racine.querySelector("[data-participation-meta]");
  const resume = racine.querySelector("[data-participation-resume]");
  const contexte = racine.querySelector("[data-participation-contexte]");
  const vide = racine.querySelector("[data-participation-vide]");
  const sectionGalerie = racine.querySelector("[data-participation-section-galerie]");
  const galerie = racine.querySelector("[data-participation-galerie]");

  const proteger = (valeur) =>
    String(valeur ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const identifiant = new URLSearchParams(window.location.search).get("id") || "";

  const introuvable = (message) => {
    if (titre) titre.textContent = "Participation introuvable";
    if (meta) meta.textContent = "";
    if (resume) resume.textContent = message;
    if (contexte) contexte.innerHTML = "";
    if (vide) vide.hidden = true;
  };

  if (!identifiant) {
    introuvable("Aucune participation n’est désignée dans l’adresse. La liste complète reste accessible depuis la page des participations.");
    return;
  }

  fetch("assets/data/participations-oby.json?v=oby-v3-11")
    .then((reponse) => {
      if (!reponse.ok) {
        throw new Error("Participations indisponibles");
      }
      return reponse.json();
    })
    .then((fiches) => {
      const fiche = fiches.find((entree) => entree.id === identifiant);

      if (!fiche) {
        introuvable("Cette participation n’existe pas ou n’est plus publiée.");
        return;
      }

      document.title = `${fiche.titre} — Participations — OUAGA Bokoua Yao`;
      if (titre) titre.textContent = fiche.titre;
      if (meta) meta.textContent = fiche.meta || "";
      if (resume) resume.textContent = fiche.resume || fiche.ligne || "";

      const blocs = [];
      (fiche.contexte || []).forEach((paragraphe) => {
        blocs.push(`<p>${proteger(paragraphe)}</p>`);
      });
      if (fiche.themes) {
        blocs.push(`<p class="event-themes"><strong>Thématiques associées :</strong> ${proteger(fiche.themes)}</p>`);
      }
      if ((fiche.sources || []).length) {
        const liens = fiche.sources
          .map((source) => `<a href="${proteger(source.url)}" target="_blank" rel="noopener">${proteger(source.libelle)}</a>`)
          .join(" · ");
        blocs.push(`<p class="event-sources"><strong>Sources officielles :</strong> ${liens}</p>`);
      }
      const renvois = [...(fiche.liens || [])];
      if (fiche.mediatheque) {
        renvois.push({ libelle: "Voir la galerie dans la médiathèque", url: fiche.mediatheque });
      }
      if (renvois.length) {
        const liens = renvois
          .map((renvoi) => `<a href="${proteger(renvoi.url)}">${proteger(renvoi.libelle)}</a>`)
          .join(" · ");
        blocs.push(`<p class="card-link">${liens}</p>`);
      }

      if (contexte) {
        contexte.innerHTML = blocs.length ? `<div class="event-context-body">${blocs.join("")}</div>` : "";
      }
      if (vide) {
        vide.hidden = blocs.length > 0;
      }

      const photos = Array.isArray(fiche.galerie) ? fiche.galerie.filter((photo) => photo && photo.fichier) : [];
      if (photos.length && galerie && sectionGalerie) {
        galerie.innerHTML = photos
          .map((photo, index) => {
            const dimensions = photo.largeur && photo.hauteur ? ` width="${photo.largeur}" height="${photo.hauteur}"` : "";
            const principale = index === 0 ? ' class="event-media-primary"' : "";
            const legende = photo.legende ? `<figcaption>${proteger(photo.legende)}</figcaption>` : "";
            return `<figure${principale}><img src="${proteger(photo.fichier)}" alt="${proteger(photo.alt)}"${dimensions} loading="lazy">${legende}</figure>`;
          })
          .join("");
        sectionGalerie.hidden = false;
        // La section était `hidden` — donc de taille nulle — au moment où
        // l'IntersectionObserver a enregistré les cibles de révélation. Elle
        // n'apparaîtrait qu'au premier défilement ; on la marque visible
        // directement pour ne pas dépendre de ce hasard de séquence.
        sectionGalerie.classList.add("is-visible");
      }
    })
    .catch(() => {
      introuvable("La fiche ne peut pas être affichée dans ce contexte.");
    });
})();
