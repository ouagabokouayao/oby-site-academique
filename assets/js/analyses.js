// Rubrique « Idées & Analyses ».
//
// Deux écrans, un seul catalogue : `idees-analyses.html` affiche les collections
// et la liste filtrable, `analyse.html?id=<slug>` rend un texte complet. Comme
// pour les participations, aucune page HTML n'est créée par article : tout est
// rendu depuis `assets/data/analyses-oby.json`.
//
// Schéma d'une entrée de `analyses` (le catalogue peut rester vide : les deux
// écrans gèrent ce cas) :
//
//   id                 slug unique, minuscules, tirets      — obligatoire
//   titre              titre public                         — obligatoire
//   collection         id de collection déclaré ci-dessus   — obligatoire
//   statut             "publie" — seule valeur admise       — obligatoire
//   chapeau            résumé d'accroche, une phrase        — recommandé
//   date_publication   "AAAA-MM-JJ"                         — facultatif
//   lecture_minutes    entier                               — facultatif
//   axes               ["…", "…"] mots-clés affichés        — facultatif
//   sections           [{ titre, paragraphes: ["…"] }]      — corps du texte
//   references         [{ libelle, url }]                   — facultatif
//   liens              [{ libelle, url }] renvois internes  — facultatif
//   ordre              entier, tri décroissant d'importance — facultatif
//
// Aucun champ de travail, de brouillon ou de back-office ne doit entrer dans ce
// fichier : le dépôt est public, ce qui y est servi est lisible.

// Tout le fichier vit dans une portée close : `main.js` est chargé sur les mêmes
// pages et aucun nom ne doit fuir dans la portée globale.
(() => {
const CATALOGUE_ANALYSES = "assets/data/analyses-oby.json?v=oby-v3-11";

const proteger = (valeur) =>
  String(valeur ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const normaliser = (valeur) =>
  String(valeur ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

// Une entrée n'est affichée que si elle est explicitement publiable et rattachée
// à une collection connue : un identifiant de collection obsolète masque le
// texte plutôt que de produire une rubrique fantôme.
const estPubliee = (analyse, collections) =>
  Boolean(analyse) &&
  analyse.statut === "publie" &&
  Boolean(analyse.id) &&
  collections.some((collection) => collection.id === analyse.collection);

const chargerCatalogue = () =>
  fetch(CATALOGUE_ANALYSES)
    .then((reponse) => {
      if (!reponse.ok) {
        throw new Error("Catalogue des analyses indisponible");
      }
      return reponse.json();
    })
    .then((donnees) => {
      const collections = Array.isArray(donnees?.collections) ? donnees.collections : [];
      const brutes = Array.isArray(donnees?.analyses) ? donnees.analyses : [];
      const analyses = brutes
        .filter((analyse) => estPubliee(analyse, collections))
        .sort((a, b) => (a.ordre || 999) - (b.ordre || 999));
      return {
        collections: [...collections].sort((a, b) => (a.ordre || 999) - (b.ordre || 999)),
        analyses,
      };
    });

const titreCollection = (collections, identifiant) =>
  collections.find((collection) => collection.id === identifiant)?.titre || "";

const dateLisible = (valeur) => {
  if (!valeur) {
    return "";
  }
  const date = new Date(valeur);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(date);
};

const ligneMeta = (analyse, collections) =>
  [
    titreCollection(collections, analyse.collection),
    dateLisible(analyse.date_publication),
    analyse.lecture_minutes ? `${analyse.lecture_minutes} min de lecture` : "",
  ]
    .filter(Boolean)
    .join(" · ");

// --- Catalogue : idees-analyses.html ----------------------------------------
(() => {
  const racine = document.querySelector("[data-analyses]");

  if (!racine) {
    return;
  }

  const grilleCollections = document.querySelector("[data-analyses-collections]");
  const controles = racine.querySelector("[data-analyses-controls]");
  const resultats = racine.querySelector("[data-analyses-results]");
  const vide = racine.querySelector("[data-analyses-empty]");
  const compteur = racine.querySelector("[data-analyses-count]");
  const total = document.querySelector("[data-analyses-total]");
  const totalCollections = document.querySelector("[data-collections-total]");
  const reinitialiser = racine.querySelector("[data-analyses-reset]");
  const champRecherche = controles?.elements.q;
  const selectCollection = controles?.elements.collection;

  const carte = (analyse, collections) => {
    const meta = ligneMeta(analyse, collections);
    const axes = Array.isArray(analyse.axes)
      ? analyse.axes.map((axe) => `<span class="map-pill">${proteger(axe)}</span>`).join("")
      : "";

    return `
      <article class="card analysis-card">
        <span class="tagline">${proteger(titreCollection(collections, analyse.collection))}</span>
        <h3><a href="analyse.html?id=${encodeURIComponent(analyse.id)}">${proteger(analyse.titre)}</a></h3>
        ${meta ? `<p class="meta">${proteger(meta)}</p>` : ""}
        ${analyse.chapeau ? `<p>${proteger(analyse.chapeau)}</p>` : ""}
        ${axes ? `<div class="map-tags">${axes}</div>` : ""}
        <p class="card-link"><a href="analyse.html?id=${encodeURIComponent(analyse.id)}">Lire l’analyse</a></p>
      </article>
    `;
  };

  const carteCollection = (collection, analyses) => {
    const nombre = analyses.filter((analyse) => analyse.collection === collection.id).length;
    const etat = nombre
      ? `${nombre} analyse${nombre > 1 ? "s" : ""}`
      : "Collection ouverte — premiers textes à venir";

    return `
      <article class="card analysis-collection">
        <span class="tagline">Collection</span>
        <h3>${proteger(collection.titre)}</h3>
        <p>${proteger(collection.resume || "")}</p>
        <p class="meta">${proteger(etat)}</p>
        ${
          nombre
            ? `<p class="card-link"><a href="#catalogue" data-analyses-filter="${proteger(collection.id)}">Voir les analyses</a></p>`
            : ""
        }
      </article>
    `;
  };

  const rendre = ({ collections, analyses }) => {
    const requete = normaliser(champRecherche?.value || "");
    const collection = selectCollection?.value || "";
    const filtrees = analyses.filter((analyse) => {
      const texte = normaliser(
        [
          analyse.titre,
          analyse.chapeau,
          titreCollection(collections, analyse.collection),
          ...(analyse.axes || []),
        ].join(" ")
      );
      const correspondRequete = !requete || texte.includes(requete);
      const correspondCollection = !collection || analyse.collection === collection;
      return correspondRequete && correspondCollection;
    });

    if (compteur) {
      compteur.textContent = String(filtrees.length);
    }

    if (resultats) {
      resultats.innerHTML = filtrees.map((analyse) => carte(analyse, collections)).join("");
    }

    if (vide) {
      vide.hidden = filtrees.length > 0;
      vide.textContent = analyses.length
        ? "Aucune analyse ne correspond à cette recherche. Essayez un autre mot-clé ou revenez à toutes les collections."
        : "Les cinq collections sont ouvertes ; les premières analyses y seront publiées progressivement. La bibliothèque de travail, la cartographie et le carnet d’idées restent consultables dès maintenant.";
    }

    if (reinitialiser) {
      reinitialiser.hidden = !requete && !collection;
    }
  };

  chargerCatalogue()
    .then(({ collections, analyses }) => {
      if (grilleCollections) {
        grilleCollections.innerHTML = collections
          .map((collection) => carteCollection(collection, analyses))
          .join("");
      }

      if (totalCollections) {
        totalCollections.textContent = String(collections.length);
      }

      // Le compteur public ne décompte que les analyses réellement publiées.
      if (total) {
        total.textContent = String(analyses.length);
      }

      if (selectCollection) {
        collections.forEach((collection) => {
          const option = document.createElement("option");
          option.value = collection.id;
          option.textContent = collection.titre;
          selectCollection.appendChild(option);
        });
      }

      const parametres = new URLSearchParams(window.location.search);
      const demandee = parametres.get("collection");
      if (selectCollection && demandee && collections.some((item) => item.id === demandee)) {
        selectCollection.value = demandee;
      }

      rendre({ collections, analyses });

      controles?.addEventListener("input", () => rendre({ collections, analyses }));
      controles?.addEventListener("change", () => rendre({ collections, analyses }));
      controles?.addEventListener("reset", () =>
        window.setTimeout(() => rendre({ collections, analyses }), 0)
      );

      // Les liens de collection filtrent la liste sans recharger la page.
      grilleCollections?.addEventListener("click", (evenement) => {
        const declencheur = evenement.target.closest("[data-analyses-filter]");
        if (!declencheur || !selectCollection) {
          return;
        }
        selectCollection.value = declencheur.dataset.analysesFilter;
        rendre({ collections, analyses });
      });
    })
    .catch(() => {
      if (resultats) {
        resultats.innerHTML = "";
      }
      if (compteur) {
        compteur.textContent = "—";
      }
      if (vide) {
        vide.hidden = false;
        vide.textContent = "Le catalogue des analyses n’est pas accessible dans ce contexte.";
      }
    });
})();

// --- Lecture : analyse.html?id=<slug> ---------------------------------------
(() => {
  const racine = document.querySelector("[data-analyse]");

  if (!racine) {
    return;
  }

  const titre = racine.querySelector("[data-analyse-titre]");
  const meta = racine.querySelector("[data-analyse-meta]");
  const chapeau = racine.querySelector("[data-analyse-chapeau]");
  const corps = racine.querySelector("[data-analyse-corps]");
  const vide = racine.querySelector("[data-analyse-vide]");
  const sectionVoisins = racine.querySelector("[data-analyse-section-voisins]");
  const voisins = racine.querySelector("[data-analyse-voisins]");

  const identifiant = new URLSearchParams(window.location.search).get("id") || "";

  const introuvable = (message) => {
    if (titre) titre.textContent = "Analyse introuvable";
    if (meta) meta.textContent = "";
    if (chapeau) chapeau.textContent = message;
    if (corps) corps.innerHTML = "";
    if (vide) vide.hidden = true;
    if (sectionVoisins) sectionVoisins.hidden = true;
  };

  if (!identifiant) {
    introuvable(
      "Aucune analyse n’est désignée dans l’adresse. Le catalogue complet reste accessible depuis la rubrique Idées & Analyses."
    );
    return;
  }

  chargerCatalogue()
    .then(({ collections, analyses }) => {
      const analyse = analyses.find((entree) => entree.id === identifiant);

      if (!analyse) {
        introuvable("Cette analyse n’existe pas ou n’est pas publiée.");
        return;
      }

      document.title = `${analyse.titre} — Idées & Analyses — OUAGA Bokoua Yao`;
      if (titre) titre.textContent = analyse.titre;
      if (meta) meta.textContent = ligneMeta(analyse, collections);
      if (chapeau) chapeau.textContent = analyse.chapeau || "";

      const blocs = [];
      (analyse.sections || []).forEach((section) => {
        if (section?.titre) {
          blocs.push(`<h2 class="analysis-heading">${proteger(section.titre)}</h2>`);
        }
        (section?.paragraphes || []).forEach((paragraphe) => {
          blocs.push(`<p>${proteger(paragraphe)}</p>`);
        });
      });

      if (Array.isArray(analyse.axes) && analyse.axes.length) {
        blocs.push(
          `<p class="event-themes"><strong>Thématiques associées :</strong> ${proteger(analyse.axes.join(" · "))}</p>`
        );
      }

      if (Array.isArray(analyse.references) && analyse.references.length) {
        const liste = analyse.references
          .map((reference) =>
            reference?.url
              ? `<li><a href="${proteger(reference.url)}" target="_blank" rel="noopener">${proteger(reference.libelle)}</a></li>`
              : `<li>${proteger(reference?.libelle)}</li>`
          )
          .join("");
        blocs.push(`<div class="analysis-references"><h2>Références</h2><ul>${liste}</ul></div>`);
      }

      if (Array.isArray(analyse.liens) && analyse.liens.length) {
        const renvois = analyse.liens
          .map((lien) => `<a href="${proteger(lien.url)}">${proteger(lien.libelle)}</a>`)
          .join(" · ");
        blocs.push(`<p class="card-link">${renvois}</p>`);
      }

      if (corps) {
        corps.innerHTML = blocs.length ? `<div class="event-context-body analysis-body">${blocs.join("")}</div>` : "";
      }
      if (vide) {
        vide.hidden = blocs.length > 0;
      }

      // Navigation de lecture : les textes voisins de la même collection.
      const famille = analyses.filter((entree) => entree.collection === analyse.collection);
      const position = famille.findIndex((entree) => entree.id === analyse.id);
      const cartes = [famille[position - 1], famille[position + 1]]
        .filter(Boolean)
        .map(
          (entree, index) => `
            <a class="card" href="analyse.html?id=${encodeURIComponent(entree.id)}">
              <span class="tagline">${index === 0 && position > 0 ? "Précédent" : "Suivant"}</span>
              <h3>${proteger(entree.titre)}</h3>
              ${entree.chapeau ? `<p>${proteger(entree.chapeau)}</p>` : ""}
            </a>
          `
        )
        .join("");

      if (cartes && voisins && sectionVoisins) {
        voisins.innerHTML = cartes;
        sectionVoisins.hidden = false;
        // La section était masquée quand l'observateur de révélation a enregistré
        // ses cibles : on la marque visible pour ne pas dépendre d'un défilement.
        sectionVoisins.classList.add("is-visible");
      }
    })
    .catch(() => {
      introuvable("L’analyse ne peut pas être affichée dans ce contexte.");
    });
})();
})();
