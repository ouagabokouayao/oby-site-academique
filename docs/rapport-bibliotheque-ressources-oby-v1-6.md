# Rapport Bibliothèque & ressources OBY V1.6

Date : 25 mai 2026  
Version : OBY V1.6 — Lot 3 Bibliothèque & ressources

## Objectif

Relier la Bibliothèque de travail OBY aux axes de recherche, aux dossiers thématiques et aux sujets structurés, sans inventer de référence, sans compléter de métadonnée non sourcée et sans transformer la page en liste brute.

## Fichiers analysés

- `bibliotheque-ressources.html`
- `assets/data/bibliotheque-oby.json`
- `assets/data/sujets-recherche-oby.json`
- `axes-recherche.html`
- `travaux-publications.html`
- `carnet-idees.html`

## Fichiers modifiés

- `bibliotheque-ressources.html`
- `docs/rapport-bibliotheque-ressources-oby-v1-6.md`

Le fichier `assets/data/bibliotheque-oby.json` n'a pas été modifié afin de ne pas introduire de classement ou de métadonnée non validée dans les notices.

## État de la bibliothèque

Nombre total de références : 93

Statuts des notices :

| Statut | Nombre |
|---|---:|
| confirmé | 19 |
| partiel | 32 |
| à vérifier | 42 |

Répartition par catégories existantes :

| Catégorie | Nombre |
|---|---:|
| Droit de la mer, droit maritime et sécurité maritime | 18 |
| Droit international public, relations internationales et organisations internationales | 13 |
| Droit public, droit administratif et droit constitutionnel | 9 |
| Médiation, négociation, arbitrage et règlement des différends | 13 |
| Géographie, littoral, environnement et territoires | 13 |
| Économie, management, logistique et organisations | 2 |
| Méthodologie, dictionnaires et outils de recherche | 14 |
| Culture générale, littérature et lectures personnelles | 11 |

## Méthode de classement

La page publique a été enrichie par une lecture éditoriale de la bibliothèque selon deux niveaux :

1. Lecture par axes de recherche OBY V1.6.
2. Ressources utiles aux dossiers thématiques.

Cette méthode croise les catégories déjà présentes dans `bibliotheque-oby.json` avec les axes et dossiers de `sujets-recherche-oby.json`. Elle ne présente pas les ouvrages comme lus, exploités, cités ou mobilisés dans un travail précis lorsque cette information n'est pas confirmée.

## Axes reliés

Les cinq axes V1.6 sont désormais représentés dans la page Bibliothèque :

- Droit de la mer, sécurité maritime & Golfe de Guinée.
- Littoral, pêche, ressources marines & économie bleue.
- Médiation, MARD & gouvernance des conflits.
- Innovation, propriété intellectuelle & technologies émergentes.
- Géopolitique, société & pensée interdisciplinaire.

## Dossiers thématiques reliés

La page met également en relation la bibliothèque avec les dossiers suivants :

- Sécurisation maritime & Golfe de Guinée.
- Pêche INN, ressources marines & économie bleue.
- Médiation, sinistres maritimes & diplomatie privée.
- Blockchain, confiance & intermédiation.
- Innovation, propriété intellectuelle & responsabilité.
- Réserve culturelle et interdisciplinaire.

## Corrections éditoriales appliquées

- Ajout d'une introduction plus explicite sur la nature de bibliothèque de travail.
- Ajout d'un avertissement éditorial indiquant que les références sont des repères bibliographiques, sans présumer de leur usage effectif.
- Ajout d'une section `Lecture par axes de recherche`.
- Ajout d'une section `Ressources utiles aux dossiers thématiques`.
- Amélioration du bloc final pour rappeler que les notices et statuts restent conservés dans le fichier de données public.

## Limites

- Les notices bibliographiques incomplètes n'ont pas été complétées sans source.
- Aucun auteur, éditeur, millésime, ISBN ou lien n'a été ajouté.
- La page ne confirme pas que les références sont citées dans les travaux OBY.
- Les statuts `partiel` et `à vérifier` restent nécessaires tant que les ouvrages concernés ne sont pas confirmés.
- Un contrôle visuel navigateur peut être réalisé avant push si Joseph souhaite valider le rendu premium de la nouvelle section.

## Contrôles réalisés

- JSON `assets/data/bibliotheque-oby.json` valide : 93 références.
- JSON `assets/data/sujets-recherche-oby.json` valide : 62 sujets.
- Un seul H1 vérifié sur :
  - `bibliotheque-ressources.html`
  - `axes-recherche.html`
  - `travaux-publications.html`
  - `carnet-idees.html`
- Aucun lien ou asset local manquant dans les pages contrôlées.
- Aucun mot long continu détecté dans les pages contrôlées.
- Aucun terme commercial interdit détecté dans le périmètre audité.
- Aucune mention BlueWave, Concordia, Betsaleel ou PromptMaster ajoutée.
- Aucune donnée sensible ajoutée.
- Aucun push et aucun redéploiement effectués.

## Recommandation avant commit

Le lot Bibliothèque & ressources OBY V1.6 est prêt pour un commit local de checkpoint, sous réserve d'une éventuelle validation visuelle complémentaire si Joseph souhaite contrôler le rendu dans le navigateur avant intégration Git.
