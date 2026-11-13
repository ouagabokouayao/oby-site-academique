"""Scénarios de la surveillance du site publié.

    python3 -m unittest discover -s tests/surveillance -v

Un serveur local sert le dépôt et simule, scénario par scénario, les
défauts à détecter : redirections absentes ou erronées, page redirigée,
directive noindex retirée, image de galerie absente ou en panne, domaine qui
répond sans servir le site. Une erreur transitoire du serveur, elle, ne doit
pas faire échouer la surveillance. Chaque défaut bloquant doit faire échouer la surveillance ;
les avertissements ne le doivent pas.
"""

import functools
import http.server
import io
import subprocess
import sys
import threading
import unittest
from pathlib import Path

RACINE = Path(__file__).resolve().parents[2]
SCRIPT = RACINE / "scripts" / "surveiller_site.py"
sys.path.insert(0, str(RACINE / "scripts"))
import surveiller_site  # noqa: E402

DOMAINE = "www.ouagabokouayao.com"
ADRESSE = "https://www.ouagabokouayao.com/"
ANCIENNE = "https://ouagabokouayao.github.io/oby-site-academique/"


class Gestionnaire(http.server.SimpleHTTPRequestHandler):
    """Sert le dépôt ; les attributs de classe décrivent le défaut simulé."""

    redirections = {}  # préfixe → adresse de destination (le reste du chemin est conservé)
    sans_noindex = set()
    absents = set()
    pages_redirigees = {}
    transitoires = {}  # chemin → nombre de réponses 503 avant de servir normalement
    en_panne = set()  # chemins qui répondent toujours 503
    racine_servie = RACINE

    def log_message(self, *args):
        pass

    def _rediriger(self, cible):
        self.send_response(301)
        self.send_header("Location", cible)
        self.end_headers()

    def send_head(self):
        chemin = self.path.split("?", 1)[0]
        for prefixe, destination in self.redirections.items():
            if chemin.startswith(prefixe):
                self._rediriger(destination + chemin[len(prefixe):])
                return None
        if chemin in self.pages_redirigees:
            self._rediriger(self.pages_redirigees[chemin])
            return None
        if chemin in self.absents:
            self.send_error(404)
            return None
        if chemin in self.en_panne:
            self.send_error(503)
            return None
        if self.transitoires.get(chemin, 0) > 0:
            self.transitoires[chemin] -= 1
            self.send_error(503)
            return None
        nom = chemin.lstrip("/") or "index.html"
        if nom in self.sans_noindex:
            texte = (self.racine_servie / nom).read_text(encoding="utf-8")
            corps = texte.replace("noindex, nofollow, noarchive, nosnippet", "nofollow").encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(corps)))
            self.end_headers()
            return io.BytesIO(corps)
        return super().send_head()


class Serveur:
    def __init__(self, **defauts):
        attributs = {"redirections": {}, "sans_noindex": set(), "absents": set(), "pages_redirigees": {},
                     "transitoires": {}, "en_panne": set(), "racine_servie": RACINE}
        attributs.update(defauts)
        classe = type("GestionnaireEssai", (Gestionnaire,), attributs)
        self.httpd = http.server.ThreadingHTTPServer(
            ("127.0.0.1", 0), functools.partial(classe, directory=str(attributs["racine_servie"])))
        self.port = self.httpd.server_address[1]
        self.base = f"http://127.0.0.1:{self.port}/"

    def __enter__(self):
        threading.Thread(target=self.httpd.serve_forever, daemon=True).start()
        return self

    def __exit__(self, *exc):
        self.httpd.shutdown()
        self.httpd.server_close()


def surveiller(base, *options):
    resultat = subprocess.run([sys.executable, str(SCRIPT), "--base", base, "--root", str(RACINE), *options],
                              capture_output=True, text=True, timeout=300)
    return resultat.returncode, resultat.stdout


class ChoixDuMode(unittest.TestCase):
    """Scénarios 1 et 2 : le mode suit le domaine déclaré dans GitHub Pages."""

    def choisir(self, cname, ref):
        return surveiller_site.choisir_mode(cname, "push", ref, DOMAINE, ADRESSE, ANCIENNE)

    def test_domaine_non_declare_hors_main_essai_sur_l_adresse_actuelle(self):
        mode, base, _ = self.choisir("null", "refs/heads/claude/branche")
        self.assertEqual((mode, base), ("ancienne", ANCIENNE))

    def test_domaine_non_declare_sur_main_echoue(self):
        mode, _, _ = self.choisir("", "refs/heads/main")
        self.assertEqual(mode, "erreur")

    def test_domaine_declare_surveillance_stricte_partout(self):
        for ref in ("refs/heads/main", "refs/heads/claude/branche"):
            mode, base, _ = self.choisir(DOMAINE, ref)
            self.assertEqual((mode, base), ("domaine", ADRESSE))

    def test_domaine_declare_mais_injoignable_n_entraine_aucun_repli(self):
        # Le choix ne dépend pas de la réponse du domaine : aucun repli possible.
        mode, base, _ = self.choisir(DOMAINE.upper(), "refs/heads/main")
        self.assertEqual((mode, base), ("domaine", ADRESSE))

    def test_autre_domaine_declare_echoue(self):
        mode, _, _ = self.choisir("autre.example.org", "refs/heads/main")
        self.assertEqual(mode, "erreur")

    def test_ligne_de_commande_du_choix(self):
        resultat = subprocess.run([sys.executable, str(SCRIPT), "--choisir-mode", "--cname", "null",
                                   "--evenement", "schedule", "--ref", "refs/heads/main", "--domaine", DOMAINE,
                                   "--adresse", ADRESSE, "--ancienne", ANCIENNE], capture_output=True, text=True)
        self.assertEqual(resultat.returncode, 1)
        self.assertIn("mode=erreur", resultat.stdout)


class SiteSurveille(unittest.TestCase):
    """Scénarios 2 à 7, contre un serveur local."""

    def test_site_sain(self):
        with Serveur() as serveur:
            code, sortie = surveiller(serveur.base)
        self.assertEqual(code, 0, sortie)
        self.assertIn("SURVEILLANCE PASS", sortie)

    def test_redirection_de_l_ancienne_adresse_correcte(self):
        with Serveur() as serveur:
            serveur.httpd.RequestHandlerClass.func.redirections = {"/ancien/": serveur.base}
            code, sortie = surveiller(serveur.base, "--ancienne", serveur.base + "ancien/")
        self.assertEqual(code, 0, sortie)

    def test_ancienne_adresse_sans_redirection_echoue(self):
        with Serveur() as serveur:
            code, sortie = surveiller(serveur.base, "--ancienne", serveur.base + "ancien/")
        self.assertEqual(code, 1)
        self.assertIn("REDIRECTION_ANCIENNE", sortie)

    def test_ancienne_adresse_redirigee_ailleurs_echoue(self):
        with Serveur() as serveur:
            serveur.httpd.RequestHandlerClass.func.redirections = {"/ancien/": "https://autre.example.org/"}
            code, sortie = surveiller(serveur.base, "--ancienne", serveur.base + "ancien/")
        self.assertEqual(code, 1)
        self.assertIn("REDIRECTION_ANCIENNE", sortie)

    def test_domaine_nu_redirige_vers_www(self):
        with Serveur() as serveur:
            serveur.httpd.RequestHandlerClass.func.redirections = {"/apex/": serveur.base}
            code, sortie = surveiller(serveur.base, "--apex", serveur.base + "apex/")
        self.assertEqual(code, 0, sortie)
        self.assertNotIn("REDIRECTION_APEX", sortie)

    def test_domaine_nu_muet_n_est_qu_un_avertissement(self):
        with Serveur() as serveur:
            code, sortie = surveiller(serveur.base, "--apex", "http://127.0.0.1:9/")
        self.assertEqual(code, 0, sortie)
        self.assertIn("WARN  REDIRECTION_APEX", sortie)

    def test_domaine_nu_redirige_ailleurs_echoue(self):
        with Serveur() as serveur:
            serveur.httpd.RequestHandlerClass.func.redirections = {"/apex/": "https://parking.example.net/"}
            code, sortie = surveiller(serveur.base, "--apex", serveur.base + "apex/")
        self.assertEqual(code, 1)
        self.assertIn("ERROR REDIRECTION_APEX", sortie)

    def test_domaine_qui_repond_sans_servir_le_site_echoue(self):
        vide = RACINE / "tests" / "surveillance"  # dossier sans les pages du site
        with Serveur(racine_servie=vide) as serveur:
            code, sortie = surveiller(serveur.base)
        self.assertEqual(code, 1)
        self.assertIn("PAGE_INDISPONIBLE", sortie)

    def test_https_defaillant_echoue(self):
        with Serveur() as serveur:
            code, sortie = surveiller(f"https://127.0.0.1:{serveur.port}/")
        self.assertEqual(code, 1)
        self.assertIn("PAGE_INDISPONIBLE", sortie)

    def test_page_redirigee_echoue(self):
        with Serveur() as serveur:
            serveur.httpd.RequestHandlerClass.func.pages_redirigees = {"/profil.html": serveur.base + "contact.html"}
            code, sortie = surveiller(serveur.base)
        self.assertEqual(code, 1)
        self.assertIn("PAGE_REDIRIGEE profil.html", sortie)

    def test_image_de_galerie_absente_echoue(self):
        image = "/assets/img/media/events/aem-cote-ivoire-2020/oby_aem_cote_ivoire_2020_06.webp"
        with Serveur() as serveur:
            serveur.httpd.RequestHandlerClass.func.absents = {image}
            code, sortie = surveiller(serveur.base)
        self.assertEqual(code, 1)
        self.assertIn(f"RESSOURCE_ABSENTE {image}", sortie)

    def test_erreur_transitoire_du_serveur_est_retentee(self):
        image = "/assets/img/media/events/convention-abidjan-cop12-2017/oby_convention_abidjan_cop12_2017_05.webp"
        with Serveur() as serveur:
            serveur.httpd.RequestHandlerClass.func.transitoires = {image: 1, "/profil.html": 2}
            code, sortie = surveiller(serveur.base)
        self.assertEqual(code, 0, sortie)
        self.assertIn("SURVEILLANCE PASS", sortie)

    def test_image_en_panne_persistante_echoue(self):
        image = "/assets/img/media/events/convention-abidjan-cop12-2017/oby_convention_abidjan_cop12_2017_05.webp"
        with Serveur() as serveur:
            serveur.httpd.RequestHandlerClass.func.en_panne = {image}
            code, sortie = surveiller(serveur.base)
        self.assertEqual(code, 1)
        self.assertIn(f"RESSOURCE_ABSENTE {image} : 503", sortie)

    def test_perte_du_noindex_echoue(self):
        with Serveur() as serveur:
            serveur.httpd.RequestHandlerClass.func.sans_noindex = {"profil.html"}
            code, sortie = surveiller(serveur.base)
        self.assertEqual(code, 1)
        self.assertIn("NOINDEX_ABSENT profil.html", sortie)


if __name__ == "__main__":
    unittest.main()
