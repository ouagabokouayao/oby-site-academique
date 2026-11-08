#!/usr/bin/env python3
"""Contrôles statiques du code et des secrets, sans dépendance.

    python3 scripts/controle_code.py --root .

- Secrets : clés d'API, jetons, clés privées et mots de passe en clair dans les
  fichiers suivis par Git. Un dépôt public ne doit en contenir aucun.
- CSS : accolades équilibrées et propriétés personnalisées (`var(--…)`)
  toutes définies.
- JavaScript : syntaxe vérifiée par `node --check` quand Node est présent.
- Politique de sécurité : chaque page porte la même Content-Security-Policy,
  et aucune ne contient de style ou de script en ligne qu'elle bloquerait.
"""

import argparse
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

SECRETS = [
    ("cle-privee", re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----")),
    ("aws", re.compile(r"\bAKIA[0-9A-Z]{16}\b")),
    ("github", re.compile(r"\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{30,}\b|\bgithub_pat_[A-Za-z0-9_]{40,}\b")),
    ("google", re.compile(r"\bAIza[0-9A-Za-z_\-]{35}\b")),
    ("slack", re.compile(r"\bxox[baprs]-[0-9A-Za-z\-]{10,}")),
    ("stripe", re.compile(r"\b[rs]k_live_[0-9A-Za-z]{20,}\b")),
    ("jwt", re.compile(r"\beyJ[A-Za-z0-9_\-]{10,}\.eyJ[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}")),
    ("affectation", re.compile(
        r"""(?i)\b(?:api[_-]?key|secret|token|password|passwd|mot_de_passe)\b\s*[:=]\s*["'][^"'\s]{12,}["']""")),
]

EXTENSIONS_TEXTE = {".html", ".css", ".js", ".json", ".py", ".yml", ".yaml", ".md", ".txt", ".toml", ".xml", ".svg"}

CSP = (
    "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; "
    "font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; "
    "form-action 'self'"
)


def fichiers_suivis(racine):
    try:
        sortie = subprocess.run(["git", "ls-files"], cwd=racine, capture_output=True, text=True, check=True).stdout
        return [racine / ligne for ligne in sortie.splitlines() if ligne]
    except (OSError, subprocess.CalledProcessError):
        return [p for p in racine.rglob("*") if p.is_file() and ".git" not in p.parts and "node_modules" not in p.parts]


def controler_secrets(racine, erreurs):
    for chemin in fichiers_suivis(racine):
        if chemin.suffix.lower() not in EXTENSIONS_TEXTE or not chemin.exists():
            continue
        try:
            texte = chemin.read_text(encoding="utf-8")
        except (OSError, UnicodeError):
            continue
        for numero, ligne in enumerate(texte.splitlines(), 1):
            for nom, motif in SECRETS:
                if motif.search(ligne):
                    erreurs.append(("SECRET_POSSIBLE", f"{chemin.relative_to(racine)}:{numero}", nom))


def controler_css(racine, erreurs):
    for chemin in sorted((racine / "assets/css").glob("*.css")):
        texte = chemin.read_text(encoding="utf-8")
        sans_commentaires = re.sub(r"/\*.*?\*/", "", texte, flags=re.S)
        sans_chaines = re.sub(r'"[^"\n]*"|\'[^\'\n]*\'', '""', sans_commentaires)
        if sans_chaines.count("{") != sans_chaines.count("}"):
            erreurs.append(("CSS_ACCOLADES", str(chemin.relative_to(racine)),
                            f"{sans_chaines.count('{')} ouvrantes / {sans_chaines.count('}')} fermantes"))
        definies = set(re.findall(r"(--[A-Za-z0-9_-]+)\s*:", sans_commentaires))
        for nom in sorted(set(re.findall(r"var\(\s*(--[A-Za-z0-9_-]+)\s*\)", sans_commentaires))):
            if nom not in definies:
                erreurs.append(("CSS_VARIABLE_INDEFINIE", str(chemin.relative_to(racine)), nom))


def controler_js(racine, erreurs):
    node = shutil.which("node")
    if not node:
        print("INFO  node absent : syntaxe JavaScript non vérifiée ici")
        return
    for chemin in sorted((racine / "assets/js").glob("*.js")) + sorted((racine / "tests").rglob("*.js")) + [racine / "playwright.config.js"]:
        if not chemin.exists():
            continue
        resultat = subprocess.run([node, "--check", str(chemin)], capture_output=True, text=True)
        if resultat.returncode != 0:
            erreurs.append(("JS_SYNTAXE", str(chemin.relative_to(racine)), resultat.stderr.strip().splitlines()[-1]))


def controler_csp(racine, erreurs):
    for page in sorted(racine.glob("*.html")):
        texte = page.read_text(encoding="utf-8")
        politiques = re.findall(r'<meta http-equiv="Content-Security-Policy" content="([^"]*)"', texte)
        if politiques != [CSP]:
            erreurs.append(("CSP_ABSENTE_OU_DIFFERENTE", page.name, f"{len(politiques)} politique(s)"))
        if re.search(r"\sstyle=\"", texte):
            erreurs.append(("STYLE_EN_LIGNE", page.name, "attribut style bloqué par la CSP"))
        if re.search(r"<style[\s>]", texte):
            erreurs.append(("STYLE_EN_LIGNE", page.name, "élément <style> bloqué par la CSP"))
        for script in re.findall(r"<script(?![^>]*\bsrc=)([^>]*)>", texte):
            if 'type="application/ld+json"' not in script:
                erreurs.append(("SCRIPT_EN_LIGNE", page.name, "script en ligne bloqué par la CSP"))
        if re.search(r"\son[a-z]+=\"", texte):
            erreurs.append(("GESTIONNAIRE_EN_LIGNE", page.name, "attribut on… bloqué par la CSP"))


def main():
    analyseur = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    analyseur.add_argument("--root", type=Path, default=Path("."))
    analyseur.add_argument("--json-report", type=Path)
    args = analyseur.parse_args()
    racine = args.root.resolve()

    erreurs = []
    controler_secrets(racine, erreurs)
    controler_css(racine, erreurs)
    controler_js(racine, erreurs)
    controler_csp(racine, erreurs)

    for code, cible, detail in erreurs:
        print(f"ERROR {code} {cible}: {detail}")
    print(f"CONTROLE_CODE {'FAIL' if erreurs else 'PASS'} | erreurs={len(erreurs)}")
    if args.json_report:
        args.json_report.write_text(json.dumps([{"code": c, "cible": t, "detail": d} for c, t, d in erreurs],
                                               ensure_ascii=False, indent=2), encoding="utf-8")
    return 1 if erreurs else 0


if __name__ == "__main__":
    sys.exit(main())
