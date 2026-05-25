# Rapport d'audit global OBY V1.6 avant push

Date de contrôle : 2026-05-25 13:29 CEST  
Périmètre : site public local `site-oby/`  
Objectif : vérifier la V1.6 avant tout push GitHub et redéploiement Netlify.

## 1. État Git

État annoncé et vérifié avant audit : dépôt propre.

Derniers checkpoints V1.6 pris en compte :

- `52ba193` — Refine OBY pathways engagements entrepreneurship page v1.6
- `ca0aa7b` — Organize OBY research topics editorial architecture v1.6
- `5b86a59` — Refine OBY research library by axes v1.6
- `62db6bb` — Enrich OBY participations interventions and media v1.6
- `c536532` — Refine OBY contact qualified requests v1.6

Aucun push GitHub et aucun redéploiement Netlify n'ont été effectués pendant cet audit.

## 2. Pages auditées

Pages HTML vérifiées :

- `index.html`
- `profil.html`
- `axes-recherche.html`
- `travaux-publications.html`
- `carnet-idees.html`
- `bibliotheque-ressources.html`
- `distinctions-bourses.html`
- `interventions.html`
- `mediatheque.html`
- `ecosysteme.html`
- `contact.html`
- `mentions-legales.html`
- `404.html`

Résultats :

- un seul H1 détecté par page ;
- balises `title` présentes ;
- meta descriptions présentes ;
- liens et assets locaux vérifiés sans rupture détectée ;
- aucun identifiant HTML dupliqué détecté ;
- pas de libellé interne bloquant visible ;
- pas de formulation publique de chantier détectée.

Point mineur observé : `mentions-legales.html` affiche l'URL publique Netlify en texte long. Le CSS du site prévoit des règles de retour à la ligne et d'anti-débordement ; aucune correction n'a été appliquée.

## 3. Navigation et liens

Contrôles réalisés :

- navigation principale présente sur les pages publiques ;
- liens internes locaux vérifiés ;
- liens croisés `interventions.html` vers `mediatheque.html` présents ;
- liens de retour depuis la médiathèque vers les participations associés présents ;
- liens vers `contact.html` présents ;
- liens email et LinkedIn confirmés sur la page Contact.

Résultat : aucun lien local cassé détecté par contrôle statique.

## 4. Fichiers JSON

Fichiers data vérifiés :

| Fichier | Statut | Nombre attendu | Nombre constaté |
|---|---:|---:|---:|
| `assets/data/bibliotheque-oby.json` | valide | 93 références | 93 |
| `assets/data/sujets-recherche-oby.json` | valide | 62 sujets | 62 |
| `assets/data/mediatheque-oby.json` | valide | 38 entrées | 38 |

Résultat : les trois fichiers JSON sont valides et conformes aux volumes attendus.

## 5. Contenu sensible

Contrôles effectués :

- aucun badge sensible publié dans les pages publiques ;
- aucun QR code publié ;
- aucun code-barres publié ;
- aucun numéro de badge publié ;
- aucune photo d'identité publiée ;
- aucune donnée privée détectée dans les pages HTML publiques ;
- aucun document interne sensible rendu visible dans les pages publiques.

Note : `assets/data/mediatheque-oby.json` contient des mentions de prudence relatives aux QR codes, badges ou médias sensibles. Ces mentions relèvent de métadonnées de contrôle et n'indiquent pas une publication effective de médias sensibles.

## 6. Cohérence éditoriale

Résultats :

- OBY reste présenté comme un site personnel, académique, intellectuel, institutionnel et engagé ;
- aucune orientation commerciale agressive détectée ;
- pas de tarifs, achat, boutique, promesse commerciale ou formulaire actif ajouté ;
- AquaLab reste court, distinct et non dominant sur `ecosysteme.html` ;
- aucune mention publique détectée de BlueWave, Concordia, Betsaleel ou PromptMaster ;
- les participations ne sont pas présentées comme interventions lorsque le rôle n'est pas confirmé ;
- les sujets de recherche ne sont pas présentés comme publications finalisées ;
- les références bibliographiques ne sont pas présentées comme toutes lues, citées ou exploitées.

Quelques formulations de prudence visibles sont assumées comme des garde-fous éditoriaux, notamment autour des sujets de recherche, des notices bibliographiques et des médias non publiés.

## 7. Responsive

Largeurs demandées :

- 375 px
- 390 px
- 430 px
- 768 px
- 1440 px

Contrôle réalisé :

- audit CSS statique des règles responsive ;
- vérification de la présence de `box-sizing`, `max-width`, `overflow-wrap`, grilles adaptatives, menu mobile et règles de réduction aux paliers mobiles ;
- vérification de la logique JavaScript du menu mobile.

Résultat statique :

- les grilles principales basculent en colonnes adaptées ;
- les longues chaînes disposent de règles de retour à la ligne ;
- le menu mobile est géré par `assets/js/main.js` avec ouverture, fermeture, `aria-expanded`, fermeture au clic et à la touche Escape ;
- aucun risque structurel évident de débordement n'a été identifié dans les fichiers audités.

Limite :

Le contrôle navigateur avec Chrome headless n'a pas pu être mené à terme dans l'environnement local : le processus Chrome s'est bloqué pendant la tentative de mesure. Le `maxOverflow = 0` n'a donc pas été remesuré visuellement sur cette passe.

Recommandation : refaire une validation visuelle Joseph ou navigateur local avant push GitHub et redéploiement Netlify, en particulier sur `axes-recherche.html`, `travaux-publications.html`, `carnet-idees.html`, `bibliotheque-ressources.html`, `interventions.html`, `mediatheque.html`, `ecosysteme.html` et `contact.html`.

## 8. SEO et fichiers publics

Éléments vérifiés :

- `robots.txt` présent ;
- `sitemap.xml` présent ;
- `404.html` présent ;
- favicon référencé ;
- balises Open Graph présentes ;
- balise Twitter card présente ;
- titres publics cohérents avec le positionnement OBY.

Résultat : les éléments SEO et fichiers publics de base sont présents.

## 9. Problèmes trouvés

Aucun problème bloquant détecté par audit statique.

Points de vigilance :

- validation visuelle responsive à refaire avant push, car Chrome headless n'a pas permis de confirmer `maxOverflow = 0` ;
- vérifier manuellement le rendu des titres longs et cartes sur mobile ;
- vérifier manuellement la lisibilité de l'URL Netlify dans les mentions légales.

## 10. Corrections effectuées

Aucune correction HTML, CSS, JS ou data n'a été appliquée pendant cet audit.

Fichier créé :

- `docs/rapport-audit-global-oby-v1-6-avant-push.md`

## 11. Recommandation finale

Décision recommandée : validation visuelle Joseph nécessaire avant push.

La V1.6 est cohérente et publiable sur la base des contrôles statiques réalisés : structure HTML propre, JSON valide, absence de lien local cassé détecté, absence de contenu sensible publié, cohérence éditoriale respectée.

La seule réserve porte sur le contrôle responsive navigateur : faute de mesure effective `maxOverflow = 0`, il est recommandé de faire une dernière revue visuelle mobile et desktop avant push GitHub et redéploiement Netlify.

