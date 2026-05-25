# Rapport de stabilisation finale OBY V1.5.4

Date : 2026-05-25  
Version : OBY V1.5.4 — stabilisation gratuite avant domaine personnalisé  
URL publique actuelle : https://sweet-hummingbird-fbab70.netlify.app/

## Fichiers modifiés

- `README.md`
- `mentions-legales.html`

## Fichiers créés

- `docs-publication/checklist-qualite-publique-oby-v1-5-4.md`
- `docs-publication/rapport-stabilisation-finale-oby-v1-5-4.md`

## Corrections réalisées

- Mise à jour du README pour refléter l'état actuel du site : V1.5.4, Netlify, GitHub, contenus publics, règles de publication et workflow.
- Clarification des mentions légales sur le formulaire statique, l'absence d'analytics actif, le CV académique public, la bibliothèque de travail, la médiathèque et la non-publication des médias sensibles.
- Création d'une checklist qualité publique avant push GitHub et redéploiement Netlify automatique.

## Points vérifiés

- État Git initial propre avant modification.
- `.gitignore` conserve l'exclusion de `docs/`, `backups/`, `exports/`, `assets/img/media/a-valider/`, fichiers ZIP, sources privées et documents non publics.
- `assets/img/media/a-valider/` reste ignoré par Git et non suivi.
- Pages publiques vérifiées : `index.html`, `profil.html`, `axes-recherche.html`, `travaux-publications.html`, `distinctions-bourses.html`, `interventions.html`, `carnet-idees.html`, `bibliotheque-ressources.html`, `mediatheque.html`, `ecosysteme.html`, `contact.html`, `mentions-legales.html`, `404.html`.
- Un seul H1 par page.
- Liens internes et assets locaux vérifiés.
- `assets/data/bibliotheque-oby.json` valide.
- `assets/data/mediatheque-oby.json` valide.
- `robots.txt`, `sitemap.xml`, `404.html`, favicons et image Open Graph présents.
- Aucun outil analytics détecté dans les fichiers publics.
- Aucune formulation de chantier critique détectée dans les textes visibles contrôlés.
- Aucune donnée sensible ajoutée.
- AquaLab reste séparé et aucune confusion publique avec BlueWave, Concordia, Betsaleel ou PromptMaster n'a été introduite.

## Contrôle responsive

Contrôle navigateur local réalisé sur 13 pages aux largeurs suivantes :

- 375 px
- 390 px
- 430 px
- 1440 px

Résultat :

- `maxOverflowMax = 0`
- Aucun débordement horizontal détecté.
- Aucun problème H1 détecté.

## Limites restantes

- Le domaine personnalisé reste reporté.
- Les URL canonical, Open Graph, sitemap et robots utilisent encore l'URL provisoire Netlify.
- Les médias présents dans `assets/img/media/a-valider/` restent non publiés et doivent continuer à être validés séparément avant toute intégration publique.

## Prochaine étape recommandée

Après validation Joseph :

1. Pousser le commit local vers GitHub.
2. Laisser Netlify déclencher le déploiement automatique.
3. Vérifier la version publique après déploiement.
4. Après achat du domaine personnalisé, mettre à jour les canonical, Open Graph URL, sitemap, robots et mentions légales.

## Statut Git

Commit local créé après validation des contrôles :

`Stabilize OBY academic site before custom domain v1.5.4`

Le push GitHub n'a pas été effectué dans cette mission.
