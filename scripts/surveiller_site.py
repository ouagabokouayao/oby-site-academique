#!/usr/bin/env python3
"""Surveillance du site publié, en lecture seule.

    python3 scripts/surveiller_site.py --base https://www.ouagabokouayao.com/ --root . \
        --ancienne https://ouagabokouayao.github.io/oby-site-academique/ --apex https://ouagabokouayao.com/

Contrôles :
- disponibilité : chaque page du dépôt répond 200 sur le site publié ;
- non-indexation : chaque page publiée porte noindex, nofollow, noarchive,
  nosnippet, et robots.txt garde ses lignes de protection ;
- ressources : images, feuilles de style, scripts et icônes des pages, ainsi
  que les images déclarées dans les registres JSON publiés, répondent 200 ;
  une erreur transitoire du serveur (429, 5xx) est retentée deux fois avant
  d'être retenue ;
- page d'erreur : une adresse inexistante renvoie 404 ;
- HTTPS : l'adresse en http redirige vers https (site distant seulement) ;
- dérive (--comparer) : chaque page publiée est identique au fichier du dépôt.
  À n'activer que sur main : une branche de travail diffère par nature ;
- ancienne adresse (--ancienne) : elle redirige (301) vers la nouvelle, au
  même chemin, pour la racine et pour une page ;
- domaine nu (--apex) : il redirige vers la nouvelle adresse. Une redirection
  vers une autre adresse est bloquante ; un domaine nu qui ne répond pas
  n'est qu'un avertissement (il dépend des enregistrements A et AAAA) ;
- page redirigée : une page du site doit répondre elle-même, sans redirection.

Choix du mode (--choisir-mode), d'après le domaine déclaré dans GitHub Pages :
- domaine déclaré : surveillance stricte du domaine, sans aucun repli ;
- aucun domaine déclaré, hors de main : essai sur l'adresse actuelle ;
- aucun domaine déclaré sur main, ou domaine différent : échec.

Aucune donnée n'est envoyée : uniquement des requêtes GET et HEAD.
"""

import argparse
import hashlib
import json
import re
import sys
import time
from concurrent.futures import ThreadPoolExecutor
from html.parser import HTMLParser
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urljoin, urlsplit
from urllib.request import HTTPRedirectHandler, Request, build_opener, urlopen

AGENT = "OBY-surveillance/1.0 (+https://github.com/ouagabokouayao/oby-site-academique)"
DIRECTIVES = {"noindex", "nofollow", "noarchive", "nosnippet"}
LIGNES_ROBOTS = {
    "User-agent: *",
    "Disallow: /assets/documents/cv/",
    "Allow: /",
}
REGISTRES_MEDIAS = ("assets/data/mediatheque-oby.json", "assets/data/participations-oby.json")
# Réponses d'un serveur momentanément surchargé : retentées avant de conclure.
TRANSITOIRES = {429, 500, 502, 503, 504}
REPRISES = 2


class Lecteur(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.robots = None
        self.ressources = []

    def handle_starttag(self, tag, attrs):
        a = {k.lower(): (v or "") for k, v in attrs}
        if tag == "meta" and a.get("name", "").lower() == "robots":
            self.robots = a.get("content", "")
        elif tag in {"img", "script", "source"} and (a.get("src") or a.get("srcset")):
            self.ressources.append((a.get("src") or a.get("srcset").split()[0]))
        elif tag == "link" and a.get("href") and set(a.get("rel", "").lower().split()) & {"stylesheet", "icon", "apple-touch-icon"}:
            self.ressources.append(a["href"])


def lire_avec_adresse(url, methode="GET", delai=20):
    """(statut, corps, adresse finale après d'éventuelles redirections).

    Une réponse transitoire du serveur (429, 5xx) est retentée REPRISES fois,
    à quelques secondes d'intervalle ; si elle persiste, elle est rendue telle
    quelle et reste bloquante. Un serveur injoignable n'est pas retenté.
    """
    for essai in range(REPRISES + 1):
        if essai:
            time.sleep(2 * essai)
        requete = Request(url, method=methode, headers={"User-Agent": AGENT})
        try:
            with urlopen(requete, timeout=delai) as reponse:
                return reponse.status, reponse.read() if methode == "GET" else b"", reponse.geturl()
        except HTTPError as erreur:
            if erreur.code in TRANSITOIRES and essai < REPRISES:
                continue
            return erreur.code, b"", url
        except (URLError, TimeoutError, OSError) as erreur:
            return None, str(erreur).encode(), url


def lire(url, methode="GET", delai=20):
    statut, corps, _ = lire_avec_adresse(url, methode, delai)
    return statut, corps


def statut_ressource(url):
    statut, _ = lire(url, "HEAD")
    if statut in (403, 405, None):
        statut, _ = lire(url, "GET")
    return url, statut


class SansRedirection(HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs):
        return None


def redirection(url):
    """Adresse vers laquelle `url` redirige de façon permanente (301 ou 308), sinon None."""
    try:
        build_opener(SansRedirection).open(Request(url, headers={"User-Agent": AGENT}), timeout=20)
    except HTTPError as erreur:
        if erreur.code in (301, 308):
            return erreur.headers.get("Location", "")
    except (URLError, OSError):
        pass
    return None


def choisir_mode(cname, evenement, ref, domaine, adresse, ancienne):
    """(mode, base, message) d'après le domaine déclaré dans GitHub Pages.

    mode vaut « domaine », « ancienne » ou « erreur ». Le repli sur l'ancienne
    adresse ne dépend jamais de la réponse du domaine : un domaine déclaré
    mais défaillant reste surveillé, et ses défauts font échouer le contrôle.
    """
    cname = (cname or "").strip().lower()
    if cname == domaine.lower():
        return "domaine", adresse, f"{domaine} est déclaré dans GitHub Pages : surveillance stricte du domaine."
    if cname in ("", "null", "none"):
        if ref != "refs/heads/main":
            return "ancienne", ancienne, f"Aucun domaine déclaré dans GitHub Pages : essai sur l'adresse actuelle ({ancienne})."
        return "erreur", "", (f"Aucun domaine déclaré dans GitHub Pages, alors que main attend {domaine} : "
                              "bascule non effectuée ou annulée sans retour arrière du contenu.")
    return "erreur", "", f"GitHub Pages déclare {cname}, et non {domaine}."


def main():
    if "--choisir-mode" in sys.argv:
        choix = argparse.ArgumentParser()
        choix.add_argument("--choisir-mode", action="store_true")
        for option in ("--cname", "--evenement", "--ref", "--domaine", "--adresse", "--ancienne"):
            choix.add_argument(option, default="")
        a = choix.parse_args()
        mode, base, message = choisir_mode(a.cname, a.evenement, a.ref, a.domaine, a.adresse, a.ancienne)
        print(f"mode={mode}")
        print(f"base={base}")
        print(message, file=sys.stderr)
        return 1 if mode == "erreur" else 0

    analyseur = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    analyseur.add_argument("--base", required=True, help="adresse racine du site publié, terminée par /")
    analyseur.add_argument("--root", type=Path, default=Path("."))
    analyseur.add_argument("--comparer", action="store_true", help="exiger l'identité des pages publiées et du dépôt")
    analyseur.add_argument("--ancienne", help="ancienne adresse du site, qui doit rediriger vers --base")
    analyseur.add_argument("--apex", help="domaine nu, qui devrait rediriger vers --base")
    analyseur.add_argument("--json-report", type=Path)
    args = analyseur.parse_args()
    base = args.base if args.base.endswith("/") else args.base + "/"
    racine = args.root.resolve()

    erreurs, avertissements, constats = [], [], {}
    pages = sorted(p.name for p in racine.glob("*.html"))
    ressources = set()

    for nom in pages:
        url = urljoin(base, "" if nom == "index.html" else nom)
        statut, corps, finale = lire_avec_adresse(url)
        if statut != 200:
            erreurs.append(f"PAGE_INDISPONIBLE {nom} : {statut}")
            continue
        if finale != url:
            erreurs.append(f"PAGE_REDIRIGEE {nom} : {url} → {finale}")
        lecteur = Lecteur()
        lecteur.feed(corps.decode("utf-8", "replace"))
        directives = {d.strip().lower() for d in (lecteur.robots or "").split(",")}
        if not DIRECTIVES <= directives:
            erreurs.append(f"NOINDEX_ABSENT {nom} : {lecteur.robots!r}")
        for ressource in lecteur.ressources:
            if not ressource.startswith(("data:", "mailto:")):
                ressources.add(urljoin(url, ressource))
        if args.comparer:
            local = (racine / nom).read_bytes()
            if hashlib.sha256(local).hexdigest() != hashlib.sha256(corps).hexdigest():
                erreurs.append(f"DERIVE {nom} : la page publiée diffère du dépôt")
    constats["pages"] = len(pages)

    statut, corps = lire(urljoin(base, "robots.txt"))
    lignes = {ligne.strip() for ligne in corps.decode("utf-8", "replace").splitlines()} if statut == 200 else set()
    for ligne in sorted(LIGNES_ROBOTS - lignes):
        erreurs.append(f"ROBOTS_TXT ligne absente : {ligne}")

    for registre in REGISTRES_MEDIAS:
        statut, corps = lire(urljoin(base, registre))
        if statut != 200:
            erreurs.append(f"REGISTRE_INDISPONIBLE {registre} : {statut}")
            continue
        for entree in json.loads(corps):
            if not isinstance(entree, dict) or entree.get("statut", "public-valide") != "public-valide":
                continue
            fichiers = [entree.get("fichier")] + [g.get("fichier") for g in entree.get("galerie") or [] if isinstance(g, dict)]
            ressources.update(urljoin(base, f) for f in fichiers if f)

    with ThreadPoolExecutor(max_workers=8) as reserve:
        for url, statut in reserve.map(statut_ressource, sorted(ressources)):
            if statut != 200:
                erreurs.append(f"RESSOURCE_ABSENTE {urlsplit(url).path} : {statut}")
    constats["ressources"] = len(ressources)

    statut, _ = lire(urljoin(base, "page-inexistante-surveillance.html"))
    if statut != 404:
        erreurs.append(f"PAGE_404 une adresse inexistante répond {statut}")

    if base.startswith("https://"):
        try:
            build_opener(SansRedirection).open(Request("http://" + base[len("https://"):], headers={"User-Agent": AGENT}), timeout=20)
            erreurs.append("HTTPS_NON_FORCE l'adresse en http ne redirige pas")
        except HTTPError as erreur:
            cible = erreur.headers.get("Location", "")
            if erreur.code not in (301, 308) or not cible.startswith("https://"):
                erreurs.append(f"HTTPS_NON_FORCE redirection {erreur.code} vers {cible!r}")
        except (URLError, OSError) as erreur:
            avertissements.append(f"HTTPS non vérifié : {erreur}")

    if args.ancienne:
        ancienne = args.ancienne if args.ancienne.endswith("/") else args.ancienne + "/"
        for chemin in ("", "profil.html"):
            cible = redirection(ancienne + chemin)
            if cible != base + chemin:
                erreurs.append(f"REDIRECTION_ANCIENNE {ancienne + chemin} → {cible!r} au lieu de {base + chemin}")
    if args.apex:
        cible = redirection(args.apex)
        if cible is None:
            avertissements.append(f"REDIRECTION_APEX {args.apex} ne redirige pas (A et AAAA du domaine nu à vérifier)")
        elif not cible.startswith(base):
            erreurs.append(f"REDIRECTION_APEX {args.apex} → {cible!r} au lieu de {base}")

    for ligne in erreurs:
        print(f"ERROR {ligne}")
    for ligne in avertissements:
        print(f"WARN  {ligne}")
    print(f"SURVEILLANCE {'FAIL' if erreurs else 'PASS'} | base={base} pages={constats.get('pages', 0)} "
          f"ressources={constats.get('ressources', 0)} erreurs={len(erreurs)}")
    if args.json_report:
        args.json_report.write_text(json.dumps({"base": base, "constats": constats, "erreurs": erreurs,
                                                "avertissements": avertissements}, ensure_ascii=False, indent=2),
                                    encoding="utf-8")
    return 1 if erreurs else 0


if __name__ == "__main__":
    sys.exit(main())
