# Rapport — Page Passerelles, engagements & entrepreneuriat OBY V1.6

Date : 25 mai 2026

## Objet

Transformation locale de la page `ecosysteme.html` en page publique premium intitulée :

**Passerelles, engagements & entrepreneuriat**

L'URL `ecosysteme.html` est conservée afin de ne pas casser les liens internes.

## Fichiers modifiés

- `ecosysteme.html`

## Fichiers créés

- `docs/rapport-page-passerelles-engagements-entrepreneuriat-v1-6.md`

## Sources consultées

- `../docs/sources/OUAGA Bokoua Yao DETAILLE ET COMPLET.doc`
- `../docs/sources/OUAGA Bokoua Yao DETAILLE ET COMPLET.txt`
- `profil.html`
- `interventions.html`
- `distinctions-bourses.html`
- `mediatheque.html`
- `bibliotheque-ressources.html`
- `assets/data/mediatheque-oby.json`
- `assets/data/bibliotheque-oby.json`
- `docs/audit-experiences-structurantes-cv-oby.md`
- `docs/rapport-refonte-experiences-structurantes-cv-oby.md`
- `docs/rapport-audit-medias-badges-oby-v1.md`
- `docs/medias-a-valider-oby-v1.json`

## Éléments confirmés intégrés

- Pépite Provence et Statut National Étudiant-Entrepreneur.
- Rôle d'ambassadeur Pépite, présenté sobrement comme promotion du dispositif, présence sur stands, appui logistique et sensibilisation.
- Événements et espaces entrepreneuriaux confirmés : rencontres Pépite, forums, Pass Entreprendre, Emerging Valley, présentations Pépite et Doctoriales du Sud Pépite.
- Société Française de Prospective.
- Association de Géographes Français.
- Convention d'Abidjan, intégrée uniquement comme cadre confirmé lié au littoral et à l'environnement.
- École d'été sur les plastiques et polluants en mer.
- Médiation, DESU Médiation, formation OHADA en cours et participation ERSUMA/OHADA.
- Innovation, propriété intellectuelle, brevets, valorisation et économie bleue.
- AquaLab, uniquement comme initiative distincte, courte et non dominante.

## Éléments non intégrés faute de source suffisante

- Booster+ : aucune occurrence suffisamment explicite n'a été trouvée dans les sources consultées.
- Hackathons : aucune confirmation explicite trouvée dans les sources consultées.
- BlueWave, Concordia, Betsaleel et PromptMaster : non intégrés, conformément à la consigne.
- Badges, QR codes, codes-barres, numéros d'accréditation ou médias sensibles : non publiés.
- Données personnelles sensibles du CV source : non publiées.

## Corrections éditoriales appliquées

- Titre public, H1 et sous-titre remplacés par les formulations demandées.
- Introduction réécrite autour des affiliations, réseaux, engagements, entrepreneuriat académique, innovation et passerelles entre recherche, action et institutions.
- Création des sections :
  - `Affiliations, réseaux & cadres d'engagement`
  - `Entrepreneuriat académique & innovation`
  - `Initiatives à impact`
  - `Terrains, passerelles & cohérence d'ensemble`
  - `Ce que ces passerelles rendent possible`
- AquaLab est présenté comme initiative distincte et non comme objet principal du site.
- La logique de monétisation indirecte est formulée sans vente directe, sans offre commerciale et sans promesse.
- Le libellé local de navigation de la page a été simplifié en `Passerelles`; le footer de cette page affiche `Passerelles & engagements`.

## Contrôles réalisés

- Un seul H1 : OK.
- Liens internes et assets de `ecosysteme.html` : OK, aucun fichier manquant.
- JSON Bibliothèque : valide.
- JSON Médiathèque : valide.
- Aucun lien cassé détecté dans la page modifiée.
- Aucun contenu sensible ajouté.
- Aucun rôle non vérifié ajouté.
- Aucune mention de date de début de thèse.
- Aucune mention publique de BlueWave, Concordia, Betsaleel ou PromptMaster.
- AquaLab reste court, distinct et non dominant.
- Aucun badge ou média sensible publié.

## Contrôle responsive

Contrôle réalisé avec Chrome headless sur `ecosysteme.html`.

| Largeur | H1 | Footer | maxOverflow |
|---|---:|---|---:|
| 375 px | 1 | OK | 0 |
| 390 px | 1 | OK | 0 |
| 430 px | 1 | OK | 0 |
| 1440 px | 1 | OK | 0 |

## Limites

- Booster+ et les hackathons restent à confirmer par document source ou indication explicite de Joseph avant toute intégration publique.
- Les médias sensibles, badges et documents à valider restent exclus de la page publique.
- La cohérence globale de navigation peut être harmonisée ultérieurement sur toutes les pages si Joseph souhaite remplacer partout le libellé `Écosystème` par `Passerelles`.

## Recommandations avant push

- Relire visuellement la page dans le navigateur.
- Confirmer si Joseph souhaite harmoniser le libellé de navigation `Écosystème` sur toutes les pages.
- Ne pousser vers GitHub qu'après validation éditoriale.

## Statut

- Push GitHub : non effectué.
- Redéploiement Netlify : non effectué.
