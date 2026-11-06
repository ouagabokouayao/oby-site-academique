# OBY — Site personnel professionnel, académique et intellectuel

Site personnel de **OUAGA Bokoua Yao**.

Statut courant : version publique de travail — noindex maintenu.

URL publique GitHub Pages : <https://ouagabokouayao.github.io/oby-site-academique/>

## Description

OBY est un site statique qui rend lisibles, dans un même ensemble, un parcours et ce qu'il permet de mobiliser :

- profil professionnel et académique ;
- expertise — domaines de compétences et capacités ;
- recherche et axes de travail ;
- travaux et publications ;
- enseignement, transmission et accompagnement ;
- missions et contributions ;
- participations, terrains et immersions ;
- médiathèque documentaire ;
- réseaux et initiatives reliées ;
- contact et opportunités qualifiées.

L'architecture intellectuelle est **rechercher → transmettre → contribuer**.

Le site attire, qualifie et crédibilise. Il n'est le site commercial officiel d'aucune structure : le cadre d'exécution éventuel d'une demande se décide ensuite, selon sa nature.

## Technologies

- HTML
- CSS
- JavaScript statique
- GitHub
- GitHub Pages

## Contenus publics

- Profil et parcours
- Expertise
- Enseignement & accompagnement
- Missions & contributions
- Travaux & publications
- Reconnaissances
- Participations
- Réseaux & initiatives
- Cartographie intellectuelle
- Bibliothèque & ressources
- Médiathèque
- Carnet d'idées, veille & agenda
- Contact

Le CV académique n’est pas publié comme fichier de référence tant qu’une version pleinement publiable n’est pas validée. Le CV standard brut et les sources privées ne doivent pas être ajoutés à ce dépôt.

## Structure principale

- `index.html`
- `profil.html`
- `axes-recherche.html`
- `enseignement-transmission-accompagnement.html`
- `expertise-missions-contributions.html`
- `travaux-publications.html`
- `recherche-droit-mer-golfe-guinee.html`
- `distinctions-bourses.html`
- `interventions.html`
- `participation.html`
- `cartographie.html`
- `carnet-idees.html`
- `bibliotheque-ressources.html`
- `mediatheque.html`
- `veille-agenda.html`
- `recherche.html`
- `ecosysteme.html`
- `contact.html`
- `mentions-legales.html`
- `404.html`
- `assets/css/style.css`
- `assets/js/main.js`
- `assets/img/`
- `assets/data/`
- `scripts/` — contrôles, navigation, vignettes, surveillance
- `tests/e2e/` — tests navigateur
- `netlify.toml` — ancienne configuration Netlify, sans effet sur GitHub Pages
- `robots.txt`
- `sitemap.xml`

## Règles de publication

- Conserver un site personnel sobre, professionnel et académique.
- Conserver `noindex, nofollow, noarchive, nosnippet` sur toutes les pages tant qu’aucune décision contraire n’est prise.
- Ne pas publier de sources privées.
- Ne pas publier de badges sensibles, QR codes, codes-barres, accréditations privées ou médias non validés.
- Ne pas publier le CV standard brut.
- Ne pas publier `docs/sources/`, `backups/`, anciens ZIP, rapports privés ou fichiers de travail non publics.
- Ne pas ajouter de données personnelles sensibles ou d'informations privées.
- Conserver une séparation claire entre OBY et les structures autonomes qui lui sont reliées.
- Ne jamais inventer une mission, un client, un partenariat, une affiliation, un diplôme, une publication, un statut, un prix ou un rôle officiel.

## Contrôle qualité

Le site publié n'a aucune dépendance. Les outils ci-dessous servent uniquement à le contrôler.

### Contrôles statiques (Python, sans dépendance)

```
python3 scripts/qa_site.py --root .        # pages, noindex, liens, ancres, ressources, JSON, médias, sitemap
python3 scripts/controle_code.py --root .  # CSS, syntaxe JavaScript, secrets, Content-Security-Policy
python3 scripts/navigation.py --verifier   # menu et pied de page identiques sur toutes les pages
python3 scripts/vignettes.py --verifier    # vignettes de la médiathèque présentes et à jour
```

`scripts/navigation.py` (sans option) réécrit le menu de toutes les pages ; `scripts/vignettes.py` (sans option, ImageMagick requis) régénère les vignettes après un changement de photographie principale.

### Tests navigateur (Playwright)

```
npm install
npx playwright install chromium        # ajouter firefox webkit pour les trois moteurs
npm test                               # pages, navigation, liens, interactions, contact, accessibilité
npm run test:captures                  # captures pleine page à cinq largeurs
npx playwright show-report             # rapport HTML
```

`OBY_MOTEURS=chromium,firefox,webkit` active Firefox et WebKit. L'accessibilité est contrôlée par axe-core (WCAG 2.2 A et AA) sur chaque page.

### Intégration continue

- `.github/workflows/qa-site.yml` : à chaque poussée, contrôles statiques, validation HTML, tests navigateur sur Chromium, Firefox et WebKit, `npm audit`, Lighthouse mobile et ordinateur (`lighthouserc.json`). Rapports et captures dans les artefacts, résumé dans la page de synthèse. Rien n'y est publié.
- `.github/workflows/surveillance.yml` : contrôle quotidien du site publié, en lecture seule (disponibilité, `noindex`, ressources, configuration GitHub Pages) ; chaque lundi, liens externes et Lighthouse en ligne. Les déclencheurs planifiés n'agissent que depuis `main`.
- `.github/dependabot.yml` : mises à jour mensuelles des dépendances de test et des actions, actives une fois sur `main`.

Seuils Lighthouse : accessibilité ≥ 95 et bonnes pratiques ≥ 90 bloquants, CLS ≤ 0,1 bloquant ; performance ≥ 80, LCP ≤ 4 s et poids ≤ 3 Mo en avertissement, les mesures variant d'un exécuteur à l'autre. La catégorie SEO n'est pas évaluée : le `noindex` est volontaire.

### Sécurité

Chaque page porte une Content-Security-Policy stricte (ressources limitées au site). Aucun style, script ni gestionnaire d'événement en ligne : `controle_code.py` le vérifie. GitHub Pages ne permet pas d'en-têtes HTTP personnalisés : `frame-ancestors` et `X-Content-Type-Options` restent hors de portée.

## Workflow GitHub / GitHub Pages

1. Modifier localement dans le dossier du site.
2. Vérifier les pages, les liens, les assets, les JSON et le responsive.
3. Exécuter `scripts/qa_site.py` et obtenir `QA_SITE PASS`.
4. Créer un commit Git local.
5. Pousser vers GitHub après validation.
6. GitHub Pages publie le site depuis `main/root`.

GitHub reste la source de référence du site public. Netlify n'est plus l'hébergement public principal.
