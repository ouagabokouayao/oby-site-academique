# OBY — Site personnel professionnel, académique et intellectuel

Site personnel de **OUAGA Bokoua Yao**.

Statut courant : version publique de travail — noindex maintenu.

Adresse publique : <https://www.ouagabokouayao.com/> (domaine personnel, hébergé par GitHub Pages).
Adresse GitHub Pages d'origine, redirigée vers le domaine : <https://ouagabokouayao.github.io/oby-site-academique/>

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
python3 scripts/domaine.py --verifier      # adresse, canoniques, métadonnées, sitemap, CNAME
python3 -m unittest discover -s tests/surveillance   # scénarios de surveillance et de DNS
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
- `.github/workflows/surveillance.yml` : contrôle quotidien du site publié, en lecture seule (disponibilité, `noindex`, ressources, configuration GitHub Pages, DNS, redirections), dans le mode fixé par le domaine déclaré dans Pages ; chaque lundi, liens externes et Lighthouse en ligne. Les déclencheurs planifiés n'agissent que depuis `main`.
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

## Adresse du site et domaine personnel

`scripts/domaine.py` est la source unique de l'adresse (`ADRESSE`). Les chemins internes sont tous relatifs : seules les métadonnées absolues en dépendent (canoniques, Open Graph, cartes sociales, JSON-LD, sitemap, robots.txt, mentions légales). La QA refuse l'ancienne adresse et tout chemin interne absolu ; `tests/e2e/chemins.spec.js` vérifie que chaque page fonctionne à la racine d'un domaine comme sous `/oby-site-academique/`.

Les actions sur les comptes (GitHub, OVHcloud) relèvent du seul titulaire, sur sa décision expresse. Aucune n'est automatisée.

### Configuration cible

| Où | Élément | Valeur cible |
| --- | --- | --- |
| GitHub, réglages du compte → Pages | Domaine vérifié | `ouagabokouayao.com` (la vérification couvre ses sous-domaines directs, dont `www`) |
| Zone DNS `ouagabokouayao.com` (OVHcloud) | TXT `_github-pages-challenge-ouagabokouayao` | la valeur affichée par GitHub à l'étape 1, jamais devinée ni recopiée d'ailleurs |
| | `www` | CNAME `ouagabokouayao.github.io.`, seul enregistrement de ce nom |
| | Domaine nu, A | `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`, et aucun autre |
| | Domaine nu, AAAA | au choix : les quatre adresses `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`, ou aucune ; jamais une autre |
| | CAA, s'il en existe | doit autoriser `letsencrypt.org` (certificat de GitHub Pages) |
| | MX, SPF, DKIM, DMARC, NS, DNSSEC | inchangés |
| GitHub, réglages du dépôt → Pages | Source | branche `main`, dossier `/` (inchangée) |
| | Custom domain | `www.ouagabokouayao.com` |
| | Enforce HTTPS | coché |
| Branche `main` | Fichier `CNAME` | créé par GitHub, contenu `www.ouagabokouayao.com` |

`python3 scripts/verifier_dns.py --domaine ouagabokouayao.com` dresse l'inventaire de la zone ; avec `--exiger-cible`, il échoue si `www` n'est pas ce CNAME, si un A ou un AAAA étranger subsiste ou si un CAA exclut Let's Encrypt.

### Précautions DNS

- Avant toute intervention, copier la zone entière : espace client OVHcloud → Noms de domaine → `ouagabokouayao.com` → Zone DNS → « Modifier en mode textuel », copier le texte dans un fichier daté conservé hors du dépôt, sans rien enregistrer. Cette copie sert au retour arrière.
- Ne jamais utiliser « Réinitialiser ma zone DNS », ni changer les serveurs DNS (onglet « Serveurs DNS ») : la messagerie serait coupée.
- Ne modifier que les enregistrements web (`www`, A et AAAA du domaine nu) et ajouter le TXT de vérification. Ne toucher ni aux MX, ni au SPF (TXT `v=spf1…` du domaine nu), ni à DKIM (`…._domainkey`), ni à DMARC (`_dmarc`), ni aux `autodiscover`, `autoconfig` et SRV, ni à aucun TXT hors ceux de la page d'attente OVH décrits ci-dessous.
- La page d'attente et les redirections web d'OVH reposent sur des A vers ses serveurs et sur des TXT de la forme `3|welcome` ou `1|…` : les retirer pour `www` et le domaine nu (onglet « Redirection » s'il y en a une). Un CNAME ne peut coexister avec aucun autre enregistrement du même nom.
- DNSSEC : n'activer ni ne désactiver DNSSEC pendant l'opération ; s'il est actif, OVH signe lui-même les enregistrements modifiés.
- TTL : la veille, abaisser à 300 s (ou au minimum proposé) le TTL des enregistrements web existants, afin que les étapes 4 et 5 se propagent en minutes et non en heures ; le rétablir (3600 s par défaut) quarante-huit heures après une bascule stable. Un nom qui n'existe pas encore suit le TTL négatif de la zone (champ minimum du SOA).
- Propagation : une ancienne valeur reste en cache jusqu'à l'expiration de son TTL ; OVH annonce jusqu'à 24 h pour l'application d'une modification, souvent quelques minutes en pratique.

### Procédure de bascule

Préalables, la veille : CI de la branche de préparation verte, copie de la zone faite, TTL abaissés, valeurs web actuelles notées (A, AAAA et TXT de `www` et du domaine nu, redirections OVH ; `python3 scripts/verifier_dns.py --domaine ouagabokouayao.com --json-report dns-avant.json` les relève, comme l'artefact « surveillance » de chaque exécution), SHA de `main` relevé (`git rev-parse origin/main`).

1. **Vérifier la propriété du domaine.** Réglages du compte GitHub → Pages → « Add a domain » → `ouagabokouayao.com`. GitHub affiche le nom et la valeur du TXT : les reporter tels quels dans la zone OVH (sous-domaine `_github-pages-challenge-ouagabokouayao`), puis « Verify ». Délai : celui de la propagation du nouvel enregistrement ; on peut réessayer. Effet sur le site : aucun. Laisser ce TXT en place.
2. **Déclarer le domaine dans Pages** (après 1). Réglages du dépôt → Pages → Custom domain → `www.ouagabokouayao.com` → « Save ». Effets immédiats : GitHub ajoute sur `main` un commit qui crée `CNAME`, et l'ancienne adresse redirige vers le domaine. Jusqu'à ce que l'étape 4 ait pris effet, le domaine ne sert pas le site : l'ancienne adresse est coupée. Enchaîner donc les étapes 2 à 4 sans pause, à une heure creuse. GitHub recommande cet ordre (domaine déclaré avant le DNS) pour qu'aucun tiers ne puisse servir un site sous le domaine.
3. **Contrôler `CNAME` et l'évolution de `main`** (après 2, immédiat). `git fetch origin main`, puis `git log --oneline <SHA relevé>..origin/main` : un seul commit, celui de GitHub ; `git diff --stat <SHA relevé> origin/main` : `CNAME` seul ; `git show origin/main:CNAME` : `www.ouagabokouayao.com`. Tout autre écart arrête la procédure. Ce fichier n'est jamais créé ni modifié à la main.
4. **Modifier les seuls enregistrements DNS web** (après 2 et la copie de zone). `www` : retirer A, AAAA, TXT et redirection OVH, ajouter le CNAME. Domaine nu : remplacer les A par les quatre adresses de GitHub Pages ; AAAA selon le choix fait (les quatre adresses de GitHub, ou aucun AAAA). Rien d'autre.
5. **Vérifier la résolution et la disponibilité** (après 4). `python3 scripts/verifier_dns.py --domaine ouagabokouayao.com --exiger-cible` doit afficher `DNS PASS` ; les réglages Pages doivent indiquer « DNS check successful » ; `http://www.ouagabokouayao.com/` doit servir le site. Délai : le TTL des anciennes valeurs (quelques minutes s'il a été abaissé), 24 h au pire.
6. **Certificat et HTTPS** (après 5). GitHub demande seul un certificat Let's Encrypt une fois le contrôle DNS réussi, en général en moins d'une heure. Cocher alors « Enforce HTTPS ». Contrôle : `https://www.ouagabokouayao.com/` répond avec un certificat valide, `http://` redirige (301) vers `https://`. Un certificat qui tarde vient le plus souvent d'un A ou AAAA étranger encore présent, d'un autre enregistrement sur `www` ou d'un CAA restrictif. Le remède documenté par GitHub (retirer puis redéclarer le domaine) crée deux commits sur `main` : refaire alors l'étape 3.
7. **Contrôler la redirection du domaine nu** (après 5 et 6). Quand les A du domaine nu désignent GitHub Pages, GitHub redirige `ouagabokouayao.com` vers `www.ouagabokouayao.com`. Contrôle : `http://ouagabokouayao.com/` et `https://ouagabokouayao.com/` répondent 301 vers `https://www.ouagabokouayao.com/`. Le HTTPS du domaine nu peut arriver après celui de `www`.
8. **Synchroniser la branche avec `main`, puis nouvelle QA** (après 3 ; voir ci-dessous). Une fois la CI verte, lancer manuellement « Surveillance du site publié » sur la branche : le domaine étant déclaré, elle contrôle strictement le domaine (pages, `noindex`, ressources, HTTPS, redirections, DNS, réglages Pages) et doit réussir.
9. **Fusion**, uniquement après une autorisation distincte du titulaire. GitHub Pages republie `main` en une ou deux minutes : canoniques, métadonnées, sitemap, mentions légales et surveillance prennent la nouvelle adresse.
10. **Recette publique et surveillance.** Lancer manuellement « Surveillance du site publié » sur `main` (mode strict et identité des pages avec le dépôt) ; parcourir l'accueil, le profil, la médiathèque et ses galeries, les participations, le contact, les mentions légales et une adresse inexistante (404) ; vérifier que l'ancienne adresse d'une page redirige vers la même page du domaine et que chaque page garde ses directives `noindex`. La surveillance quotidienne prend ensuite le relais. L'indexation, la Search Console et le retrait du `noindex` restent des décisions séparées.

| Étapes | Délai | Effet visible |
| --- | --- | --- |
| 1 | minutes à heures (propagation du TXT) | aucun |
| 2 à 5 | TTL des anciennes valeurs web | ancienne adresse redirigée vers un domaine pas encore servi : coupure |
| 6 et 7 | en général moins d'une heure après le contrôle DNS | HTTPS, puis domaine nu |
| 8 et 9 | durée de la CI, puis une à deux minutes de publication | métadonnées à la nouvelle adresse |

### Synchronisation avec `main` et fichier `CNAME`

Le commit de GitHub n'ajoute que `CNAME`, absent de la branche : la fusion ne peut pas entrer en conflit. Procédure, sans rebase ni poussée forcée :

```
git fetch origin main
git log --oneline <SHA relevé>..origin/main          # commits arrivés sur main
git diff --stat <SHA relevé> origin/main             # attendu : CNAME seul
git checkout <branche de préparation du domaine>
git merge --no-ff origin/main
python3 scripts/domaine.py --verifier                # refuse un CNAME qui ne désigne pas exactement le domaine
python3 scripts/qa_site.py --root . && python3 -m unittest discover -s tests/surveillance
git push origin <branche de préparation du domaine>  # la CI se relance
```

Si `main` a reçu d'autres commits, un conflit éventuel se résout en gardant le contenu de `main`, puis en réappliquant l'adresse par `python3 scripts/domaine.py --appliquer` ; jamais en retenant en bloc l'une des deux versions.

### Surveillance pendant et après la migration

Le mode suit le domaine déclaré dans les réglages Pages, jamais la réponse du domaine : un domaine déclaré mais défaillant reste surveillé et ses défauts font échouer le contrôle.

| Domaine déclaré dans Pages | Branche | Surveillance |
| --- | --- | --- |
| `www.ouagabokouayao.com` | toutes | stricte sur le domaine, sans repli |
| aucun | hors `main` | essai sur l'ancienne adresse |
| aucun | `main` | échec : `main` attend le domaine |
| un autre domaine | toutes | échec |

Bloquants : page indisponible ou redirigée, `noindex` absent, ressource ou image de galerie absente, 404 incorrecte, HTTPS non forcé, ancienne adresse non redirigée ou redirigée ailleurs, domaine nu redirigé ailleurs, `www` qui n'est pas un CNAME vers GitHub, A, AAAA ou CAA étranger, réglages Pages inattendus. Avertissements : domaine nu muet, A ou AAAA incomplets, TXT de vérification absent. `tests/surveillance` rejoue ces scénarios contre un serveur local et des réponses DNS simulées.

Entre l'étape 2 et la fusion, la surveillance quotidienne de `main` échoue : sa version antérieure exige qu'aucun domaine ne soit déclaré. Cet échec est attendu et cesse à la fusion.

### Retour arrière

Le titulaire décide d'un retour arrière, par exemple si le domaine ne sert pas le site 24 h après l'étape 4 ou si le certificat n'est pas émis 24 h après un contrôle DNS réussi.

Avant la fusion (étapes 2 à 8) :

1. Réglages du dépôt → Pages → Custom domain → « Remove ». L'ancienne adresse sert de nouveau le site, sans redirection. GitHub retire `CNAME` de `main` : le vérifier, car un `CNAME` resté sur `main` redéclarerait le domaine à la publication suivante (le cas échéant, le retirer par un nouveau commit, sur décision du titulaire).
2. Zone OVH : rétablir, d'après la copie, les seuls enregistrements web (`www`, A et AAAA du domaine nu). Le TXT de vérification peut rester ; la messagerie n'a pas été touchée et ne l'est pas davantage.
3. Synchroniser à nouveau la branche avec `main` ; elle reste prête pour une nouvelle tentative.

Après la fusion : mêmes étapes 1 et 2, puis retour du contenu par un nouveau commit. Depuis une branche partie de `main`, `git revert -m 1 <SHA du commit de fusion>`, QA, pull request, fusion sur décision du titulaire. Ni réinitialisation ni poussée forcée de `main` : l'historique reste entier. Jusqu'à cette fusion, les canoniques désignent encore le domaine et la surveillance de `main` échoue ; sans conséquence d'indexation, le `noindex` restant en place.

Contrôles après restauration : lancer « Surveillance du site publié » sur `main` (pages, ressources et galeries, `noindex`, robots.txt, 404, HTTPS sur l'ancienne adresse), vérifier que l'ancienne adresse ne redirige plus, et que `python3 scripts/verifier_dns.py --domaine ouagabokouayao.com` montre des MX, SPF et DMARC identiques à la copie de la zone.
