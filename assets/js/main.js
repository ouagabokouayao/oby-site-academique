const navToggle = document.querySelector("[data-nav-toggle]");
const navMenu = document.querySelector("[data-nav-menu]");
const navGroups = document.querySelectorAll("[data-nav-group]");

if (navToggle && navMenu) {
  const closeSubmenus = (exceptGroup = null) => {
    navGroups.forEach((group) => {
      if (group === exceptGroup) {
        return;
      }

      group.classList.remove("is-open");
      group.querySelector("[data-submenu-toggle]")?.setAttribute("aria-expanded", "false");
    });
  };

  const closeMainMenu = () => {
    navMenu.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    closeSubmenus();
  };

  navToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    if (!isOpen) {
      closeSubmenus();
    }
  });

  navGroups.forEach((group) => {
    const toggle = group.querySelector("[data-submenu-toggle]");

    if (!toggle) {
      return;
    }

    toggle.addEventListener("click", (event) => {
      event.stopPropagation();
      const isOpen = group.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      closeSubmenus(isOpen ? group : null);
    });
  });

  navMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      closeMainMenu();
    });
  });

  document.addEventListener("click", (event) => {
    if (!navMenu.contains(event.target) && !navToggle.contains(event.target)) {
      closeSubmenus();
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
  document.querySelectorAll("[data-page-link]").forEach((link) => {
    if (link.dataset.pageLink === currentPage) {
      link.setAttribute("aria-current", "page");
    }
  });

  navGroups.forEach((group) => {
    const pages = (group.dataset.navPages || "").split(/\s+/);

    if (pages.includes(currentPage)) {
      group.classList.add("is-current");
    }
  });
}

const revealTargets = document.querySelectorAll(".section, .card, .media-placeholder, .notice");

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
  const axisSelect = controls?.elements.axe;
  const typeSelect = controls?.elements.type;
  const searchInput = controls?.elements.q;
  const cardsIncrement = 12;
  let visibleLimit = cardsIncrement;

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
    const currentLimit = Math.max(cardsIncrement, visibleLimit);
    const visible = filtered.slice(0, currentLimit);

    if (count) {
      count.textContent = String(visible.length);
    }

    if (mapNote) {
      mapNote.textContent = hasFilter
        ? "résultat filtré. Ajustez la recherche, utilisez les filtres ou affichez davantage de sujets."
        : "Sélection initiale — explorez les sujets à l'aide de la recherche, des filtres ou du bouton d'affichage progressif.";
    }

    if (showMoreButton) {
      showMoreButton.hidden = filtered.length <= visible.length;
      showMoreButton.textContent = "Afficher plus";
    }

    if (results) {
      results.innerHTML = visible.map(renderSubject).join("");
    }

    if (empty) {
      empty.hidden = visible.length > 0;
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
        visibleLimit = cardsIncrement;
        render(subjects);
      });
      controls?.addEventListener("reset", () => {
        visibleLimit = cardsIncrement;
        window.setTimeout(() => render(subjects), 0);
      });
      showMoreButton?.addEventListener("click", () => {
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
    { title: "Axes de recherche", type: "Page", category: "Axes", url: "axes-recherche.html" },
    { title: "Travaux & publications", type: "Page", category: "Travaux", url: "travaux-publications.html" },
    { title: "Participations & interventions", type: "Page", category: "Événements", url: "interventions.html" },
    { title: "Bibliothèque & ressources", type: "Page", category: "Ressources", url: "bibliotheque-ressources.html" },
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
      status.textContent = hasSearch ? `${visible.length} résultat${visible.length > 1 ? "s" : ""}` : "Recherche prête";
    }

    if (note) {
      note.textContent = hasSearch
        ? "Résultats issus des pages et données publiques du site."
        : "Entrez un mot-clé ou choisissez un type pour explorer le site.";
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
      const mediaItems = media.map((item) => ({
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
  const filterPanel = document.querySelector("[data-media-filters]");

  if (!filterPanel) {
    return;
  }

  const count = document.querySelector("[data-media-filter-count]");
  const cards = [...document.querySelectorAll(".media-card[id]")];
  const normalize = (value) =>
    String(value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const bucketFor = (item) => {
    const text = normalize(
      [
        item.titre,
        item.lieu,
        item.categorie,
        item.typeMedia,
        item.evenementLie,
        item.description,
        item.axe_associe,
      ].join(" ")
    );
    const buckets = new Set(["all"]);

    if (/maritime|mer|ocean|littoral|golfe|mouillage|navire|peche|bleue/.test(text)) {
      buckets.add("maritime");
    }
    if (/environnement|pollution|proteus|mediterranee|climat|aires marines|waca/.test(text)) {
      buckets.add("environnement");
    }
    if (/mediation|ohada|arbitrage|differend/.test(text)) {
      buckets.add("mediation");
    }
    if (/innovation|propriete intellectuelle|pepite|emerging|entreprendre|innov/.test(text)) {
      buckets.add("innovation");
    }
    if (/entrepreneur|pepite|snee|booster|pitch|emerging|entreprendre/.test(text)) {
      buckets.add("entrepreneuriat");
    }
    if (/afrique|europe|mediterranee|abidjan|lome|paris|monaco|marseille|aix|golfe/.test(text)) {
      buckets.add("circulations");
    }

    return buckets;
  };

  fetch("assets/data/mediatheque-oby.json")
    .then((response) => response.json())
    .then((media) => {
      const byId = new Map(media.map((item) => [item.id, bucketFor(item)]));

      const applyFilter = (filter) => {
        let visible = 0;
        cards.forEach((card) => {
          const buckets = byId.get(card.id) || new Set(["all"]);
          const show = filter === "all" || buckets.has(filter);
          card.hidden = !show;
          if (show) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = `${visible} entrée${visible > 1 ? "s" : ""} documentaire${visible > 1 ? "s" : ""}`;
        }
      };

      filterPanel.addEventListener("click", (event) => {
        const button = event.target.closest("[data-media-filter]");
        if (!button) {
          return;
        }

        filterPanel.querySelectorAll("[data-media-filter]").forEach((item) => {
          item.classList.toggle("is-active", item === button);
        });
        applyFilter(button.dataset.mediaFilter || "all");
      });

      applyFilter("all");
    });
})();
