const navToggle = document.querySelector("[data-nav-toggle]");
const navMenu = document.querySelector("[data-nav-menu]");

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      navMenu.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
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
    { threshold: 0.12 }
  );

  revealTargets.forEach((target) => {
    target.classList.add("reveal");
    observer.observe(target);
  });
} else {
  revealTargets.forEach((target) => target.classList.add("is-visible"));
}

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
  const showAllButton = mapRoot.querySelector("[data-map-show-all]");
  const axisSelect = controls?.elements.axe;
  const typeSelect = controls?.elements.type;
  const searchInput = controls?.elements.q;
  const maxInitialCards = 18;
  const maxFilteredCards = 24;
  let showAll = false;

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
    const publication = subject.publication || "Texte complet non publié";
    const summary = subject.resume || subject.description || "Résumé à venir.";

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
          <span class="map-pill status">${escapeHtml(publication)}</span>
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
    const limit = showAll ? filtered.length : hasFilter ? maxFilteredCards : maxInitialCards;
    const visible = filtered.slice(0, limit);

    if (count) {
      count.textContent = String(visible.length);
    }

    if (mapNote) {
      if (showAll) {
        mapNote.textContent = "ensemble des sujets correspondant aux filtres actifs.";
      } else if (hasFilter) {
        mapNote.textContent = "résultat filtré. Ajustez la recherche ou les filtres pour élargir l'exploration.";
      } else {
        mapNote.textContent =
          "sélection initiale. Utilisez les filtres ou la recherche pour explorer l'ensemble de la cartographie.";
      }
    }

    if (showAllButton) {
      showAllButton.hidden = showAll || filtered.length <= visible.length;
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
        showAll = false;
        render(subjects);
      });
      controls?.addEventListener("reset", () => {
        showAll = false;
        window.setTimeout(() => render(subjects), 0);
      });
      showAllButton?.addEventListener("click", () => {
        showAll = true;
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

  fetch("assets/data/veille-agenda-oby.json")
    .then((response) => response.json())
    .then((items) => {
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
        count.textContent = "0";
      }

      if (empty) {
        empty.hidden = false;
        empty.textContent = "Les repères de veille ne sont pas accessibles dans ce contexte local.";
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

  fetch("assets/data/veille-agenda-oby.json")
    .then((response) => response.json())
    .then((items) => {
      const featuredItems = items
        .filter((item) => item.affichage_accueil === true)
        .sort((a, b) => (a.ordre || 999) - (b.ordre || 999))
        .slice(0, 3);

      featuredRoot.innerHTML = featuredItems.map(renderFeatured).join("");
    })
    .catch(() => {
      featuredRoot.innerHTML = "";
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
    fetch("assets/data/veille-agenda-oby.json").then((response) => response.json()),
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
