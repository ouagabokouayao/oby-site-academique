# Rapport de correction responsive accueil OBY V1.6.1

Date : 2026-06-22 08:20 CEST  
Périmètre : correction locale du rendu mobile de l'accueil OBY.

## 1. État initial

Le dépôt a été vérifié avant modification.

Anomalie issue de la validation locale V1.6 :

- sur `index.html` en largeur mobile `390px`, le bloc visuel "Au cœur des disciplines" coupait une ligne à droite ;
- la capture donnait une impression de clipping / débordement mobile.

## 2. Cause détectée

Le problème venait du hero mobile de l'accueil :

- le panneau `.hero-panel` restait visuellement trop large ou trop contraint par rapport au viewport ;
- le paragraphe interne du panneau ne disposait pas d'une largeur de ligne suffisamment maîtrisée ;
- en vérifiant les largeurs plus étroites, les textes `.hero-position` et `.hero-signature` pouvaient également se prolonger trop loin à droite sur mobile.

La cause était donc principalement CSS responsive, non éditoriale.

## 3. Fichiers modifiés

Fichier modifié :

- `assets/css/style.css`

Fichiers analysés sans modification :

- `index.html`
- `assets/js/main.js`

## 4. Correction appliquée

Correction CSS minimale dans les paliers mobiles :

- contrainte de largeur des lignes `.hero-position` et `.hero-signature` ;
- passage explicite de ces éléments en blocs sur mobile ;
- ajustement de la hauteur de ligne de la signature ;
- largeur mobile du panneau `.hero-panel` contrainte au viewport ;
- réduction légère du padding du panneau mobile ;
- largeur de ligne du paragraphe du panneau limitée à `28ch` ;
- réduction légère de la taille du titre et du paragraphe du panneau sur mobile ;
- ajustement du filet intérieur du panneau à `390px`.

Aucun contenu éditorial n'a été modifié.

## 5. Largeurs contrôlées

Largeurs visuellement contrôlées par captures Chrome locales :

- `375px`
- `390px`
- `430px`
- `1440px`

Largeurs contrôlées statiquement :

- `375px`
- `390px`
- `430px`
- `768px`
- `1440px`

Captures locales temporaires produites :

- `/tmp/oby-v16-1-index-375d.png`
- `/tmp/oby-v16-1-index-390b.png`
- `/tmp/oby-v16-1-index-430c.png`
- `/tmp/oby-v16-1-index-1440b.png`

Ces captures ne sont pas ajoutées au dépôt.

## 6. Résultat final

Résultat visuel :

- le bloc "Au cœur des disciplines" est lisible sur mobile ;
- le paragraphe ne coupe plus "Afrique" à droite ;
- la signature du hero passe proprement sur deux lignes en `375px` ;
- le rendu `430px` reste équilibré ;
- le rendu desktop `1440px` n'est pas dégradé.

Résultat technique :

- contrôle statique des pages : OK ;
- liens / assets locaux : OK ;
- un seul H1 par page : OK ;
- JSON publics toujours valides :
  - `bibliotheque-oby.json` : 93 références ;
  - `sujets-recherche-oby.json` : 62 sujets ;
  - `mediatheque-oby.json` : 38 entrées.

## 7. Limites

Le serveur local `http.server` restait instable dans l'environnement précédent. La validation visuelle a donc été faite par ouverture locale `file://` avec Chrome headless et captures temporaires.

Une validation manuelle Joseph dans un navigateur normal reste recommandée avant toute préparation `gh-pages`.

## 8. Recommandation avant commit

Recommandation : prêt pour commit local après revue rapide.

Message de commit suggéré :

```bash
git add assets/css/style.css
git add -f docs/rapport-correction-responsive-accueil-oby-v1-6-1.md
git commit -m "Fix OBY home hero mobile responsive display v1.6.1"
```

Aucun push, aucune publication, aucune activation GitHub Pages et aucun redéploiement Netlify n'ont été effectués.

