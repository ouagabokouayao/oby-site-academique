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
- `scripts/qa_site.py`
- `netlify.toml`
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

`scripts/qa_site.py` vérifie les pages, les JSON, le `noindex`, les liens internes, les assets et la cohérence des médias :

```
python3 scripts/qa_site.py --root .
```

## Workflow GitHub / GitHub Pages

1. Modifier localement dans le dossier du site.
2. Vérifier les pages, les liens, les assets, les JSON et le responsive.
3. Exécuter `scripts/qa_site.py` et obtenir `QA_SITE PASS`.
4. Créer un commit Git local.
5. Pousser vers GitHub après validation.
6. GitHub Pages publie le site depuis `main/root`.

GitHub reste la source de référence du site public. Netlify n'est plus l'hébergement public principal.
