#!/usr/bin/env python3
"""Adresse publique du site : source unique et contrôle.

    python3 scripts/domaine.py --appliquer   remplace l'ancienne adresse par ADRESSE
    python3 scripts/domaine.py --verifier    signale tout écart (aussi appelé par la QA)

Le site est servi à la racine de ADRESSE. Ses chemins internes sont tous
relatifs : seules les métadonnées qui exigent une adresse absolue en
dépendent (URL canoniques, Open Graph et cartes sociales, données
structurées JSON-LD, sitemap, ligne Sitemap de robots.txt, mention de
l'adresse dans les mentions légales).

Le contrôle exige :
- qu'aucun fichier publié ne contienne plus l'ancienne adresse ;
- que chaque page déclare sa canonique et son og:url à ADRESSE + nom de
  page (la racine pour index.html), et des images sociales sous ADRESSE
  qui existent dans le dépôt ;
- que le sitemap et robots.txt pointent vers ADRESSE ;
- qu'aucun chemin interne ne soit absolu (« /… ») : il casserait selon
  que le site est servi à la racine d'un domaine ou sous un chemin ;
- que le fichier CNAME, s'il existe, désigne exactement DOMAINE. Ce fichier
  n'est jamais créé à la main : GitHub l'ajoute sur main quand le domaine
  est déclaré dans les réglages Pages, et il remonte dans une branche par
  synchronisation avec main.
"""

import json
import re
import sys
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent

# Adresse cible : le domaine personnel, servi en HTTPS, à la racine.
ADRESSE = "https://www.ouagabokouayao.com/"
DOMAINE = "www.ouagabokouayao.com"

# Adresse GitHub Pages d'origine. Après la migration, GitHub y redirige.
ANCIENNE = "https://ouagabokouayao.github.io/oby-site-academique/"

# Fichiers publiés susceptibles de porter une adresse.
MOTIFS_PUBLIES = ("*.html", "sitemap.xml", "robots.txt", "assets/data/*.json", "assets/js/*.js", "assets/css/*.css")

GABARITS_SANS_CANONIQUE = {"404.html"}

CHEMIN_ABSOLU = re.compile(r'(?:href|src|action)="(/(?!/)[^"]*)"|url\(\s*["\']?(/(?!/)[^)"\']*)')


def fichiers_publies(racine=RACINE):
    for motif in MOTIFS_PUBLIES:
        yield from sorted(racine.glob(motif))


def adresse_de(page):
    return ADRESSE if page == "index.html" else ADRESSE + page


def appliquer(racine=RACINE):
    modifies = []
    for fichier in fichiers_publies(racine):
        texte = fichier.read_text(encoding="utf-8")
        if ANCIENNE in texte:
            fichier.write_text(texte.replace(ANCIENNE, ADRESSE), encoding="utf-8")
            modifies.append(fichier.relative_to(racine))
    return modifies


def ecarts(racine=RACINE):
    problemes = []
    for fichier in fichiers_publies(racine):
        texte = fichier.read_text(encoding="utf-8")
        nom = str(fichier.relative_to(racine))
        if ANCIENNE in texte or "ouagabokouayao.github.io" in texte:
            problemes.append(("ANCIENNE_ADRESSE", nom, f"{texte.count('ouagabokouayao.github.io')} occurrence(s)"))
        if fichier.suffix in {".html", ".css"}:
            for groupe in CHEMIN_ABSOLU.findall(texte):
                chemin = next(g for g in groupe if g)
                problemes.append(("CHEMIN_ABSOLU", nom, chemin))

    for page in sorted(racine.glob("*.html")):
        texte = page.read_text(encoding="utf-8")
        attendu = adresse_de(page.name)
        canoniques = re.findall(r'<link rel="canonical" href="([^"]+)"', texte)
        if page.name not in GABARITS_SANS_CANONIQUE and canoniques != [attendu]:
            problemes.append(("CANONIQUE", page.name, f"{canoniques} au lieu de {attendu}"))
        og_url = re.findall(r'<meta property="og:url" content="([^"]+)"', texte)
        if og_url and og_url != [attendu]:
            problemes.append(("OG_URL", page.name, f"{og_url} au lieu de {attendu}"))
        for image in re.findall(r'<meta (?:property="og:image"|name="twitter:image") content="([^"]+)"', texte):
            if not image.startswith(ADRESSE) or not (racine / image[len(ADRESSE):]).is_file():
                problemes.append(("IMAGE_SOCIALE", page.name, image))
        for bloc in re.findall(r'<script type="application/ld\+json">(.*?)</script>', texte, re.S):
            try:
                donnees = json.loads(bloc)
            except json.JSONDecodeError:
                continue
            if isinstance(donnees, dict) and donnees.get("url") and donnees["url"] != ADRESSE:
                problemes.append(("JSON_LD_URL", page.name, donnees["url"]))

    cname = racine / "CNAME"
    if cname.exists():
        contenu = cname.read_text(encoding="utf-8").strip()
        if contenu != DOMAINE:
            problemes.append(("CNAME_INCOHERENT", "CNAME", f"« {contenu} » au lieu de « {DOMAINE} »"))

    sitemap = racine / "sitemap.xml"
    if sitemap.exists():
        for adresse in re.findall(r"<loc>([^<]+)</loc>", sitemap.read_text(encoding="utf-8")):
            if not adresse.startswith(ADRESSE):
                problemes.append(("SITEMAP_ADRESSE", "sitemap.xml", adresse))
    robots = racine / "robots.txt"
    if robots.exists() and f"Sitemap: {ADRESSE}sitemap.xml" not in robots.read_text(encoding="utf-8").splitlines():
        problemes.append(("ROBOTS_SITEMAP", "robots.txt", f"ligne attendue : Sitemap: {ADRESSE}sitemap.xml"))
    return problemes


def main():
    if "--appliquer" in sys.argv:
        for fichier in appliquer():
            print(f"mis à jour  {fichier}")
    problemes = ecarts()
    for code, cible, detail in problemes:
        print(f"{code} {cible} : {detail}")
    print(f"domaine {ADRESSE} : {len(problemes)} écart(s)")
    return 1 if problemes else 0


if __name__ == "__main__":
    sys.exit(main())
