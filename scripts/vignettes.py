#!/usr/bin/env python3
"""Vignettes des cartes de la médiathèque.

    python3 scripts/vignettes.py            produit ou met à jour les vignettes
    python3 scripts/vignettes.py --verifier  signale les vignettes absentes ou périmées

Chaque carte de la médiathèque affichait la photographie principale de son
album en pleine résolution (1 400 à 1 800 px de large) dans un cadre de
quelques centaines de pixels. La vignette en est une réduction (900 px de
large au plus), réservée à la carte ; la visionneuse ouvre toujours le
fichier d'origine, qui n'est jamais modifié.

index.json garde, pour chaque album, la source et son empreinte : une
photographie principale remplacée rend la vignette périmée, et la QA le
signale. La production demande ImageMagick (`convert`) ; la vérification
n'utilise que la bibliothèque standard.
"""

import hashlib
import json
import shutil
import subprocess
import sys
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
REGISTRE = RACINE / "assets/data/mediatheque-oby.json"
DOSSIER = RACINE / "assets/img/media/vignettes"
INDEX = DOSSIER / "index.json"
LARGEUR_MAX = 900
QUALITE = 78
RASTER = (".jpg", ".jpeg", ".png", ".webp", ".avif")


def photo_principale(album):
    """Même règle que mediaPhotos() dans main.js."""
    if str(album.get("fichier") or "").lower().endswith(RASTER):
        return album["fichier"]
    for photo in album.get("galerie") or []:
        if isinstance(photo, dict) and str(photo.get("fichier") or "").lower().endswith(RASTER):
            return photo["fichier"]
    return None


def albums_publics():
    for album in json.loads(REGISTRE.read_text(encoding="utf-8")):
        if isinstance(album, dict) and album.get("statut") == "public-valide" and album.get("id"):
            source = photo_principale(album)
            if source:
                yield album["id"], source


def empreinte(chemin):
    return hashlib.sha256(chemin.read_bytes()).hexdigest()


def ecarts():
    index = json.loads(INDEX.read_text(encoding="utf-8")) if INDEX.exists() else {}
    problemes = []
    attendus = dict(albums_publics())
    for ident, source in attendus.items():
        entree = index.get(ident)
        vignette = DOSSIER / f"{ident}.webp"
        if not entree or not vignette.exists():
            problemes.append(("VIGNETTE_ABSENTE", ident))
        elif entree.get("source") != source or entree.get("empreinte") != empreinte(RACINE / source):
            problemes.append(("VIGNETTE_PERIMEE", ident))
    for ident in sorted(set(index) - set(attendus)):
        problemes.append(("VIGNETTE_ORPHELINE", ident))
    return problemes


def produire():
    convert = shutil.which("convert")
    if not convert:
        sys.exit("ImageMagick (convert) est nécessaire pour produire les vignettes.")
    DOSSIER.mkdir(parents=True, exist_ok=True)
    index = {}
    for ident, source in albums_publics():
        cible = DOSSIER / f"{ident}.webp"
        subprocess.run([convert, str(RACINE / source), "-resize", f"{LARGEUR_MAX}x>", "-strip",
                        "-quality", str(QUALITE), "-define", "webp:method=6", str(cible)], check=True)
        index[ident] = {"source": source, "empreinte": empreinte(RACINE / source)}
    for orpheline in DOSSIER.glob("*.webp"):
        if orpheline.stem not in index:
            orpheline.unlink()
    INDEX.write_text(json.dumps(index, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(f"{len(index)} vignettes")


def main():
    if "--verifier" in sys.argv:
        problemes = ecarts()
        for code, ident in problemes:
            print(f"{code} {ident}")
        print(f"vignettes : {len(problemes)} écart(s)")
        return 1 if problemes else 0
    produire()
    return 0


if __name__ == "__main__":
    sys.exit(main())
