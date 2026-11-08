#!/usr/bin/env python3
"""Résumé des rapports Lighthouse CI (cible « filesystem »).

    python3 scripts/resume_lighthouse.py rapports-lighthouse

Lit chaque manifest.json, puis les rapports JSON qu'il désigne, et écrit un
tableau par profil (mobile, ordinateur) : scores et mesures principales.
Le tableau va dans le journal et, en intégration continue, dans la page de
synthèse du workflow (GITHUB_STEP_SUMMARY).
"""

import json
import os
import sys
from pathlib import Path

MESURES = [
    ("largest-contentful-paint", "LCP", lambda v: f"{v / 1000:.1f} s"),
    ("cumulative-layout-shift", "CLS", lambda v: f"{v:.3f}"),
    ("total-blocking-time", "TBT", lambda v: f"{v:.0f} ms"),
    ("total-byte-weight", "Poids", lambda v: f"{v / 1024:.0f} Kio"),
]


def score(valeur):
    return "—" if valeur is None else f"{round(valeur * 100)}"


def main():
    racine = Path(sys.argv[1] if len(sys.argv) > 1 else "rapports-lighthouse")
    lignes = ["## Lighthouse", ""]
    manifests = sorted(racine.rglob("manifest.json"))
    if not manifests:
        lignes.append("Aucun rapport Lighthouse produit.")
    for manifest in manifests:
        profil = manifest.parent.name
        lignes += [f"### Profil {profil}", "",
                   "| Page | Perf. | Access. | Bonnes pr. | LCP | CLS | TBT | Poids |",
                   "|---|---|---|---|---|---|---|---|"]
        for entree in json.loads(manifest.read_text(encoding="utf-8")):
            # Plusieurs mesures par page : seule la mesure représentative
            # (la médiane retenue par Lighthouse CI) figure au tableau.
            if not entree.get("isRepresentativeRun", True):
                continue
            resume = entree.get("summary", {})
            mesures = []
            chemin = manifest.parent / Path(entree.get("jsonPath", "")).name
            if chemin.exists():
                audits = json.loads(chemin.read_text(encoding="utf-8")).get("audits", {})
                for cle, _nom, format_ in MESURES:
                    valeur = audits.get(cle, {}).get("numericValue")
                    mesures.append(format_(valeur) if valeur is not None else "—")
            else:
                mesures = ["—"] * len(MESURES)
            page = entree.get("url", "").rsplit("/", 1)[-1]
            lignes.append(f"| {page} | {score(resume.get('performance'))} | {score(resume.get('accessibility'))} | "
                          f"{score(resume.get('best-practices'))} | " + " | ".join(mesures) + " |")
        lignes.append("")
    texte = "\n".join(lignes) + "\n"
    print(texte)
    if os.environ.get("GITHUB_STEP_SUMMARY"):
        with open(os.environ["GITHUB_STEP_SUMMARY"], "a", encoding="utf-8") as sortie:
            sortie.write(texte)


if __name__ == "__main__":
    main()
