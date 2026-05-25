# Rapport — Organisation des sujets de recherche et du Carnet OBY V1.6

Date : 25 mai 2026

## Objet

Organisation de la banque de sujets retrouvés de OUAGA Bokoua Yao dans une architecture éditoriale premium, prudente et évolutive pour le site OBY V1.6.

Les sujets sont intégrés comme **sujets de recherche**, **projets d'articles** ou **notes en préparation**. Aucun sujet n'est présenté comme publication finalisée.

## Fichiers analysés

- `axes-recherche.html`
- `travaux-publications.html`
- `bibliotheque-ressources.html`
- `mediatheque.html`
- `ecosysteme.html`
- `assets/data/bibliotheque-oby.json`
- `assets/data/mediatheque-oby.json`
- `../docs/sources/OUAGA Bokoua Yao DETAILLE ET COMPLET.doc`
- `../docs/sources/OUAGA Bokoua Yao DETAILLE ET COMPLET.txt`

## Fichiers modifiés

- `axes-recherche.html`
- `travaux-publications.html`
- `carnet-idees.html`

## Fichiers créés

- `assets/data/sujets-recherche-oby.json`
- `docs/rapport-organisation-sujets-recherche-carnet-oby-v1-6.md`

## Fichiers consultés mais non modifiés

- `bibliotheque-ressources.html`
- `mediatheque.html`
- `ecosysteme.html`
- `assets/data/bibliotheque-oby.json`
- `assets/data/mediatheque-oby.json`

Note : `ecosysteme.html` apparaissait déjà modifié avant cette mission, à la suite de la mission précédente sur la page `Passerelles, engagements & entrepreneuriat`.

## Architecture créée ou renforcée

### Axes de recherche

Les axes publics ont été réorganisés autour de cinq ensembles :

- Droit de la mer, sécurité maritime & Golfe de Guinée
- Littoral, pêche, ressources marines & économie bleue
- Médiation, MARD & gouvernance des conflits
- Innovation, propriété intellectuelle & technologies émergentes
- Géopolitique, société & pensée interdisciplinaire

Un bloc de dossiers thématiques premium a également été ajouté :

- Sécurisation maritime & Golfe de Guinée
- Pêche INN, ressources marines & économie bleue
- Médiation, sinistres maritimes & diplomatie privée
- Blockchain, confiance & intermédiation
- Innovation, propriété intellectuelle & responsabilité

### Travaux & publications

La page distingue désormais :

- Travaux académiques structurants
- Articles et notes de recherche
- Projets d'articles
- Résumés à préparer
- Textes complets non publiés sans validation

### Carnet d'idées

La logique éditoriale est structurée autour de :

- Chroniques maritimes
- Innovation & société
- Médiation & conflits contemporains
- Afrique, gouvernance & souveraineté
- Culture, droit & spiritualité
- Notes de lecture et réflexions

Une logique de prudence est ajoutée pour les sujets politiques, culturels ou spirituels.

## Sujets intégrés

Total intégré dans `assets/data/sujets-recherche-oby.json` : **62 sujets uniques**.

Le sujet `Médiation et blockchain` apparaissait dans deux familles de la liste initiale ; il a été intégré une seule fois, puis relié au dossier `Blockchain, confiance & intermédiation`.

Répartition par axe :

- Droit de la mer, sécurité maritime & Golfe de Guinée : 12 sujets
- Littoral, pêche, ressources marines & économie bleue : 7 sujets
- Médiation, MARD & gouvernance des conflits : 8 sujets
- Innovation, propriété intellectuelle & technologies émergentes : 23 sujets
- Géopolitique, société & pensée interdisciplinaire : 12 sujets

Répartition par statut :

- Sujet de recherche : 34
- Projet d'article : 12
- Note en préparation : 16

Les mentions `Résumé disponible prochainement` et `Texte complet non publié` sont conservées comme informations de publication prudentes dans le fichier de données.

## Sujets laissés en réserve éditoriale

Les sujets politiques, religieux, culturels ou très sensibles ont été intégrés avec prudence dans l'axe `Géopolitique, société & pensée interdisciplinaire`, sans développement long :

- Recompositions politiques ivoiriennes : lectures stratégiques
- Acteurs de la politique ivoirienne : vétérans et nouvelles générations
- Religion et stratégie politique
- Gouvernance oligarchique internationale
- Textes sacrés, œuvres de l'esprit et propriété intellectuelle
- Spiritualité et propriété intellectuelle

Ces sujets doivent rester en réserve tant que les sources, le cadrage et le niveau de publication ne sont pas validés.

## Titres reformulés

Les titres originaux sont conservés dans `assets/data/sujets-recherche-oby.json` sous le champ `titreOriginal`.

Titres reformulés pour affichage public :

- `Sécurité et sûreté maritime : étude de notions à théoriser`
  - Original : `La sécurité et la sûreté maritime : étude de notions à théoriser`
- `Afrique de l'Ouest, trafics illicites et routes maritimes`
  - Original : `L'Afrique de l'Ouest comme base arrière du trafic de cocaïne`
- `Médiation et blockchain`
  - Original : `La médiation et la blockchain`
- `Coût, valeur et soutenabilité du minage numérique`
  - Original : `Le minage est-il un luxe ?`
- `Figures fondatrices, mythes techniques et confiance numérique`
  - Original : `Nakamoto serait-il un messie ?`
- `Création du vivant, invention et manipulation`
  - Original : `Création d'un vivant : invention ou manipulation ?`
- `Systèmes létaux autonomes et responsabilité humaine`
  - Original : `Robots tueurs et humanité`
- `Recompositions politiques ivoiriennes : lectures stratégiques`
  - Original : `Le retour de Gbagbo : lecture stratégique`
- `Acteurs de la politique ivoirienne : vétérans et nouvelles générations`
  - Original : `Les acteurs de la politique ivoirienne : vétérans et nouvelles générations`
- `Textes sacrés, œuvres de l'esprit et propriété intellectuelle`
  - Original : `Les livres saints sont-ils des œuvres de l'esprit ?`
- `Tourisme de catastrophe : licéité, morale et responsabilité`
  - Original : `Tourisme de catastrophe : licite ou immoral ?`

## Statuts utilisés

- Sujet de recherche
- Projet d'article
- Note en préparation
- Résumé disponible prochainement
- Texte complet non publié

## Contrôles réalisés

- JSON `assets/data/sujets-recherche-oby.json` valide : OK.
- JSON `assets/data/bibliotheque-oby.json` valide : OK.
- JSON `assets/data/mediatheque-oby.json` valide : OK.
- Un seul H1 par page vérifiée : OK.
- Liens internes et assets sur `axes-recherche.html`, `travaux-publications.html`, `carnet-idees.html` : OK.
- Aucun titre présenté comme publication finalisée : OK.
- Aucun contenu long inventé : OK.
- Aucune donnée sensible ajoutée : OK.
- Aucun contenu commercial ajouté : OK.
- Aucun push GitHub : OK.
- Aucun redéploiement Netlify : OK.

## Contrôle responsive final

### Méthode utilisée

Le contrôle Chrome headless automatisé n'a pas pu être relancé dans l'environnement courant : l'action d'automatisation a été refusée. Un serveur local a également été tenté, mais l'ouverture d'un port local a échoué avec une erreur `listen EPERM`. Aucun contournement n'a été tenté.

Une méthode alternative a donc été appliquée :

- audit HTML des pages modifiées ;
- vérification des grilles utilisées par page ;
- vérification des liens et assets ;
- vérification des règles CSS responsive existantes ;
- recherche des largeurs fixes, `100vw`, marges négatives et mots très longs susceptibles de provoquer un débordement ;
- contrôle des H1 ;
- contrôle du JSON.

### Largeurs ciblées

Les largeurs demandées ont été prises comme référentiel d'audit :

- 375 px ;
- 390 px ;
- 430 px ;
- 768 px ;
- 1440 px.

### Pages testées

- `axes-recherche.html`
- `travaux-publications.html`
- `carnet-idees.html`

### Constats

- Les grilles des pages utilisent les classes existantes `grid two` et `grid three`, qui passent en une colonne sous `860px`.
- Les titres longs bénéficient des règles mobiles existantes : `overflow-wrap: anywhere`, `hyphens: auto`, `max-width: 100%`.
- Les cartes disposent de `min-width: 0`, `max-width: 100%` et d'un padding mobile réduit.
- Les conteneurs globaux utilisent des largeurs fluides et les règles `box-sizing: border-box`.
- Aucun `width: 100vw`, marge négative ou largeur fixe problématique n'a été détecté dans les pages modifiées.
- Aucun mot continu de plus de 32 caractères ne reste visible dans les pages après correction.
- Le menu mobile et le footer reposent sur les règles globales déjà validées : menu replié, colonnes empilées, liens et textes avec retours à la ligne.

### Problème détecté

Un risque de débordement potentiel a été identifié dans `travaux-publications.html` : le chemin technique `assets/data/sujets-recherche-oby.json` était affiché dans une balise `code`, sous forme de chaîne longue.

### Correction effectuée

La mention technique du chemin de fichier a été remplacée par une formulation publique courte :

> La base de sujets est conservée dans un fichier de données dédié.

Cette correction ne modifie pas le fond éditorial et réduit le risque de débordement mobile.

### État final

- H1 : OK sur les trois pages.
- Liens/assets : OK sur les trois pages.
- JSON sujets : OK.
- Aucun mot long continu détecté après correction.
- Aucun contenu sensible ajouté.
- Aucun sujet présenté comme publication finalisée.
- Aucun contenu commercial ajouté.

Le `maxOverflow = 0` n'a pas pu être mesuré par navigateur dans cet environnement. Le contrôle alternatif ne signale pas de cause structurelle probable de débordement horizontal.

### Recommandation

**Validation manuelle Joseph nécessaire** si l'exigence est de confirmer visuellement `maxOverflow = 0` avant commit.  
Sur la base des contrôles statiques et CSS réalisés, le lot est techniquement cohérent pour un commit de checkpoint après validation humaine.

## Recommandations avant publication publique

- Relire les sujets politiques, religieux et culturels avant toute mise en avant éditoriale.
- Ajouter progressivement des fiches courtes seulement lorsque les sources et le niveau de diffusion sont validés.
- Éviter toute publication longue sans vérification du statut académique, des droits et du risque éditorial.
- Refaire un contrôle responsive navigateur avant push si possible, notamment pour confirmer visuellement `maxOverflow = 0`.
- Confirmer si la base `assets/data/sujets-recherche-oby.json` doit rester publique ou devenir un fichier de travail interne non suivi.

## Statut final

- Modifications locales uniquement.
- Aucun commit effectué.
- Aucun push effectué.
- Aucun redéploiement effectué.
