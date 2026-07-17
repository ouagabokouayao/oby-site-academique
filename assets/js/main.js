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
    ordre: 1,
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
    ordre: 2,
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
    ordre: 3,
  },
  {
    id: "unoc-2025-nice-ocean-action",
    titre: "UN Ocean Conference 2025 — Nice Action Plan",
    type: "Événement",
    date_publication_interne: "2026-06-23",
    date_evenement: "2025-06-09 au 2025-06-13",
    organisateur: "United Nations · France · Costa Rica",
    zone: "Nice · Méditerranée · International",
    axes: ["littoral", "gouvernance de l'océan", "économie bleue"],
    statut: "Archivé",
    resume:
      "Conférence des Nations Unies sur l'océan tenue à Nice autour de l'action pour conserver et utiliser durablement l'océan.",
    interet_oby:
      "Ce repère situe les enjeux méditerranéens et internationaux de l'océan dans une perspective de gouvernance, d'action publique et de coopération.",
    lien_source: "https://sdgs.un.org/conferences/ocean2025",
    affichage_accueil: false,
    ordre: 4,
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
    ordre: 5,
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
    "securite-surete-maritime-notions",
    "peche-inn-droit-international",
    "diplomatie-privee",
    "blockchain-intermediation",
    "recompositions-politiques-ivoiriennes",
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
    const summary = subject.resume || subject.description || "Repère en cours de structuration.";

    return `
      <article class="map-card">
        <div class="map-card-meta">
          <span class="map-pill">${axis}</span>
          <span class="map-pill status">${status}</span>
        </div>
        <h3>${title}</h3>
        <p>${escapeHtml(summary)}</p>
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
          <p>La sélection de veille sera affichée en environnement web. Les repères sont conservés dans le fichier de données du site.</p>
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
    { title: "Médiathèque", type: "Page", category: "Traces documentaires", url: "mediatheque.html" },
    { title: "Cartographie intellectuelle", type: "Page", category: "Exploration", url: "cartographie.html" },
    { title: "À la une · Veille & agenda", type: "Page", category: "Veille", url: "veille-agenda.html" },
    { title: "Contact qualifié", type: "Page", category: "Contact", url: "contact.html" },
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
        note.textContent = "Le fichier de données ne peut pas être chargé dans ce contexte.";
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
    const type = item.typeMedia || item.categorie || "Trace documentaire";
    const metadata = [item.annee, item.lieu].filter(Boolean).join(" · ");
    const imageClass = /\.(?:jpe?g|png|webp|avif)$/i.test(item.fichier || "") ? " media-card-photo" : "";
    const contextLink = item.pageLiee
      ? `<a class="media-link" href="${escapeHtml(item.pageLiee)}">Voir le contexte associé</a>`
      : "";

    return `
      <article class="media-card${imageClass}" id="${escapeHtml(item.id || "")}">
        <img src="${escapeHtml(item.fichier || "assets/img/media/placeholder-document-oby.svg")}" alt="${escapeHtml(item.titre || "Trace documentaire OBY")}" loading="lazy">
        <div class="media-card-body">
          <div class="media-card-top">
            <span class="media-type">${escapeHtml(type)}</span>
            <span class="media-status published">Public validé</span>
          </div>
          <h3>${escapeHtml(item.titre || "Trace documentaire")}</h3>
          ${metadata ? `<p class="media-meta">${escapeHtml(metadata)}</p>` : ""}
          <p>${escapeHtml(item.description || item.evenementLie || "Trace documentaire publique associée au parcours OBY.")}</p>
          ${contextLink}
        </div>
      </article>
    `;
  };

  fetch("assets/data/mediatheque-oby.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Media data unavailable");
      }
      return response.json();
    })
    .then((items) => {
      const publicItems = items.filter((item) => item.statut === "public-valide");

      [...new Set(publicItems.map((item) => item.typeMedia || item.categorie).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b, "fr"))
        .forEach((type) => {
          const option = document.createElement("option");
          option.value = type;
          option.textContent = type;
          typeSelect?.appendChild(option);
        });

      const render = () => {
        const query = normalize(searchInput?.value || "");
        const type = typeSelect?.value || "";
        const filtered = publicItems.filter((item) => {
          const itemType = item.typeMedia || item.categorie || "";
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
          count.textContent = `${filtered.length} trace${filtered.length > 1 ? "s" : ""} publique${filtered.length > 1 ? "s" : ""} sur ${publicItems.length}`;
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
        count.textContent = "Médiathèque indisponible";
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
