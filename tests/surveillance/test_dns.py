"""Contrôle de la configuration DNS cible, sur des réponses simulées.

    python3 -m unittest discover -s tests/surveillance -v
"""

import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "scripts"))
import verifier_dns as dns  # noqa: E402

DOMAINE = "ouagabokouayao.com"
CIBLE = {
    ("www.ouagabokouayao.com", "CNAME"): ["ouagabokouayao.github.io."],
    (DOMAINE, "A"): sorted(dns.IPV4_PAGES),
    (DOMAINE, "AAAA"): sorted(dns.IPV6_PAGES),
    (DOMAINE, "MX"): ["1 mx1.mail.ovh.net.", "5 mx2.mail.ovh.net."],
    (DOMAINE, "TXT"): ['"v=spf1 include:mx.ovh.com ~all"'],
    (DOMAINE, "CAA"): [],
    (f"_github-pages-challenge-ouagabokouayao.{DOMAINE}", "TXT"): ['"valeur-fournie-par-github"'],
}


def evaluer(modifications=None, exiger=True):
    reponses = {**CIBLE, **(modifications or {})}
    inv = dns.inventaire(DOMAINE, interroger=lambda nom, type_: reponses.get((nom, type_), []))
    return dns.evaluer(inv, exiger)


class ConfigurationCible(unittest.TestCase):
    def test_configuration_cible_conforme(self):
        erreurs, avertissements = evaluer()
        self.assertEqual(erreurs, [])
        self.assertEqual(avertissements, [])

    def test_www_en_a_ou_vers_un_autre_nom_echoue(self):
        for valeur in ([], ["ouagabokouayao.com."], ["redirect.ovh.net."]):
            erreurs, _ = evaluer({("www.ouagabokouayao.com", "CNAME"): valeur})
            self.assertTrue(any(e.startswith("WWW_CNAME") for e in erreurs), valeur)

    def test_domaine_nu_qui_pointe_aussi_ailleurs_echoue(self):
        erreurs, _ = evaluer({(DOMAINE, "A"): sorted(dns.IPV4_PAGES) + ["213.186.33.5"]})
        self.assertTrue(any(e.startswith("APEX_A_ETRANGER") for e in erreurs))

    def test_domaine_nu_sans_a_n_est_qu_un_avertissement(self):
        erreurs, avertissements = evaluer({(DOMAINE, "A"): []})
        self.assertEqual(erreurs, [])
        self.assertTrue(any(a.startswith("APEX_A_ABSENT") for a in avertissements))

    def test_a_incomplet_est_un_avertissement(self):
        erreurs, avertissements = evaluer({(DOMAINE, "A"): ["185.199.108.153"]})
        self.assertEqual(erreurs, [])
        self.assertTrue(any(a.startswith("APEX_A_INCOMPLET") for a in avertissements))

    def test_aaaa_etranger_echoue_et_aaaa_absent_est_accepte(self):
        erreurs, _ = evaluer({(DOMAINE, "AAAA"): ["2001:41d0:1:2::1"]})
        self.assertTrue(any(e.startswith("APEX_AAAA_ETRANGER") for e in erreurs))
        erreurs, avertissements = evaluer({(DOMAINE, "AAAA"): []})
        self.assertEqual((erreurs, avertissements), ([], []))

    def test_caa_qui_exclut_letsencrypt_echoue(self):
        erreurs, _ = evaluer({(DOMAINE, "CAA"): ['0 issue "digicert.com"']})
        self.assertTrue(any(e.startswith("CAA_BLOQUE_CERTIFICAT") for e in erreurs))
        erreurs, _ = evaluer({(DOMAINE, "CAA"): ['0 issue "digicert.com"', '0 issue "letsencrypt.org"']})
        self.assertEqual(erreurs, [])

    def test_verification_github_absente_est_un_avertissement(self):
        erreurs, avertissements = evaluer({(f"_github-pages-challenge-ouagabokouayao.{DOMAINE}", "TXT"): []})
        self.assertEqual(erreurs, [])
        self.assertTrue(any(a.startswith("VERIFICATION_GITHUB_ABSENTE") for a in avertissements))

    def test_messagerie_n_est_jamais_une_erreur(self):
        erreurs, _ = evaluer({(DOMAINE, "MX"): [], (DOMAINE, "TXT"): []})
        self.assertEqual(erreurs, [])

    def test_inventaire_seul_ne_bloque_jamais(self):
        erreurs, avertissements = evaluer({("www.ouagabokouayao.com", "CNAME"): []}, exiger=False)
        self.assertEqual((erreurs, avertissements), ([], []))


if __name__ == "__main__":
    unittest.main()
