#!/usr/bin/env python3
"""Configuration DNS publique du domaine : inventaire et contrôle de la cible.

    python3 scripts/verifier_dns.py --domaine ouagabokouayao.com [--exiger-cible] [--json-report dns.json]

Sans option, le script fait l'inventaire des enregistrements publics utiles
(web, messagerie, sécurité) : une copie de l'état visible, à garder avant et
après toute intervention. Il ne remplace pas la copie de la zone exportée
depuis OVHcloud, qui seule contient tous les enregistrements.

Avec --exiger-cible, il vérifie la configuration attendue pour GitHub Pages :
- www : CNAME vers ouagabokouayao.github.io. (bloquant) ;
- domaine nu : uniquement les quatre A de GitHub Pages (bloquant s'il pointe
  ailleurs ; avertissement s'il n'a aucun A) ;
- AAAA du domaine nu : absents, ou parmi les quatre de GitHub Pages
  (bloquant s'ils pointent ailleurs ; avertissement s'ils sont incomplets) ;
- CAA : s'il en existe, l'un doit autoriser letsencrypt.org, l'autorité
  qui délivre les certificats de GitHub Pages (bloquant) ;
- TXT de vérification GitHub : présent (avertissement sinon).
La messagerie (MX, SPF, DMARC) n'est qu'inventoriée : elle ne doit pas
changer pendant la bascule.

Aucune donnée n'est envoyée : uniquement des requêtes DNS en lecture.
"""

import argparse
import json
import shutil
import socket
import subprocess
import sys
from pathlib import Path

UTILISATEUR_GITHUB = "ouagabokouayao"
CIBLE_WWW = f"{UTILISATEUR_GITHUB}.github.io."
IPV4_PAGES = {"185.199.108.153", "185.199.109.153", "185.199.110.153", "185.199.111.153"}
IPV6_PAGES = {"2606:50c0:8000::153", "2606:50c0:8001::153", "2606:50c0:8002::153", "2606:50c0:8003::153"}


def interroger_dig(nom, type_):
    """Réponses DNS pour (nom, type), ou None si la requête est impossible ici."""
    if shutil.which("dig"):
        resultat = subprocess.run(["dig", "+short", "+time=5", "+tries=2", type_, nom],
                                  capture_output=True, text=True)
        if resultat.returncode != 0:
            return None
        return [ligne.strip() for ligne in resultat.stdout.splitlines() if ligne.strip()]
    if type_ in ("A", "AAAA"):
        famille = socket.AF_INET if type_ == "A" else socket.AF_INET6
        try:
            return sorted({info[4][0] for info in socket.getaddrinfo(nom, None, famille)})
        except socket.gaierror:
            return []
    return None


def inventaire(domaine, interroger=interroger_dig):
    www = f"www.{domaine}"
    requetes = {
        "www CNAME": (www, "CNAME"),
        "domaine nu A": (domaine, "A"),
        "domaine nu AAAA": (domaine, "AAAA"),
        "domaine nu MX": (domaine, "MX"),
        "domaine nu TXT": (domaine, "TXT"),
        "_dmarc TXT": (f"_dmarc.{domaine}", "TXT"),
        "domaine nu CAA": (domaine, "CAA"),
        "domaine nu NS": (domaine, "NS"),
        "domaine nu DS (DNSSEC)": (domaine, "DS"),
        "vérification GitHub TXT": (f"_github-pages-challenge-{UTILISATEUR_GITHUB}.{domaine}", "TXT"),
    }
    return {cle: interroger(nom, type_) for cle, (nom, type_) in requetes.items()}


def normaliser(nom):
    return nom.lower().rstrip(".") + "."


def evaluer(inv, exiger_cible):
    erreurs, avertissements = [], []
    if not exiger_cible:
        return erreurs, avertissements

    www = inv.get("www CNAME")
    if www is None:
        erreurs.append("DNS_NON_VERIFIABLE www : requête CNAME impossible")
    elif [normaliser(c) for c in www] != [normaliser(CIBLE_WWW)]:
        erreurs.append(f"WWW_CNAME www pointe vers {www or 'rien'} au lieu de {CIBLE_WWW}")

    a = set(inv.get("domaine nu A") or [])
    if not a:
        avertissements.append("APEX_A_ABSENT le domaine nu n'a aucun A : il ne redirigera pas vers www")
    elif a != IPV4_PAGES:
        if a - IPV4_PAGES:
            erreurs.append(f"APEX_A_ETRANGER le domaine nu pointe aussi vers {sorted(a - IPV4_PAGES)}")
        else:
            avertissements.append(f"APEX_A_INCOMPLET il manque {sorted(IPV4_PAGES - a)}")

    aaaa = set(inv.get("domaine nu AAAA") or [])
    if aaaa - IPV6_PAGES:
        erreurs.append(f"APEX_AAAA_ETRANGER le domaine nu pointe en IPv6 vers {sorted(aaaa - IPV6_PAGES)}")
    elif aaaa and aaaa != IPV6_PAGES:
        avertissements.append(f"APEX_AAAA_INCOMPLET il manque {sorted(IPV6_PAGES - aaaa)}")

    caa = inv.get("domaine nu CAA") or []
    if caa and not any("issue" in ligne and "letsencrypt.org" in ligne for ligne in caa):
        erreurs.append(f"CAA_BLOQUE_CERTIFICAT aucun CAA n'autorise letsencrypt.org : {caa}")

    if not inv.get("vérification GitHub TXT"):
        avertissements.append("VERIFICATION_GITHUB_ABSENTE aucun TXT de vérification du domaine dans GitHub")
    return erreurs, avertissements


def main():
    analyseur = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    analyseur.add_argument("--domaine", required=True, help="domaine nu, par exemple ouagabokouayao.com")
    analyseur.add_argument("--exiger-cible", action="store_true", help="exiger la configuration GitHub Pages")
    analyseur.add_argument("--json-report", type=Path)
    args = analyseur.parse_args()

    inv = inventaire(args.domaine)
    erreurs, avertissements = evaluer(inv, args.exiger_cible)

    print(f"## DNS de {args.domaine}\n")
    print("| Enregistrement | Valeurs publiques |")
    print("|---|---|")
    for cle, valeurs in inv.items():
        texte = "non vérifiable ici" if valeurs is None else (", ".join(valeurs) if valeurs else "aucun")
        print(f"| {cle} | {texte.replace('|', '/')} |")
    print()
    for ligne in erreurs:
        print(f"ERROR {ligne}")
    for ligne in avertissements:
        print(f"WARN  {ligne}")
    mode = "cible exigée" if args.exiger_cible else "inventaire"
    print(f"DNS {'FAIL' if erreurs else 'PASS'} | {mode} | erreurs={len(erreurs)} avertissements={len(avertissements)}")
    if args.json_report:
        args.json_report.write_text(json.dumps({"domaine": args.domaine, "mode": mode, "inventaire": inv,
                                                "erreurs": erreurs, "avertissements": avertissements},
                                               ensure_ascii=False, indent=2), encoding="utf-8")
    return 1 if erreurs else 0


if __name__ == "__main__":
    sys.exit(main())
