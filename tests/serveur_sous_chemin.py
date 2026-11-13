#!/usr/bin/env python3
"""Sert le dépôt sous un chemin, comme GitHub Pages le sert aujourd'hui.

    python3 tests/serveur_sous_chemin.py PORT /oby-site-academique/

Toute requête hors du chemin reçoit 404 : une ressource appelée par un chemin
absolu (« /assets/… ») échoue ici, comme elle échouerait en ligne.
"""

import functools
import http.server
import sys
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent


class Gestionnaire(http.server.SimpleHTTPRequestHandler):
    prefixe = "/"

    def log_message(self, *args):
        pass

    def translate_path(self, path):
        if not path.startswith(self.prefixe):
            return str(RACINE / "__hors-du-chemin__")
        return super().translate_path("/" + path[len(self.prefixe):])


def main():
    port = int(sys.argv[1])
    prefixe = sys.argv[2] if len(sys.argv) > 2 else "/oby-site-academique/"
    Gestionnaire.prefixe = prefixe if prefixe.endswith("/") else prefixe + "/"
    serveur = http.server.ThreadingHTTPServer(("127.0.0.1", port), functools.partial(Gestionnaire, directory=str(RACINE)))
    print(f"Serving HTTP on 127.0.0.1 port {port} under {Gestionnaire.prefixe}", flush=True)
    serveur.serve_forever()


if __name__ == "__main__":
    main()
