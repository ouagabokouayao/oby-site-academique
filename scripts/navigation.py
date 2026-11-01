#!/usr/bin/env python3
"""Source unique de la navigation OBY : menu d'en-tête et pied de page.

Le site est statique et n'a pas de gabarit commun : chaque page porte sa propre
copie du menu. Ce script en est la seule source. Il réécrit le <nav> et le
<footer> des pages à partir de RUBRIQUES, et inscrit l'état actif directement
dans le HTML (aria-current, classe is-current) : l'accès aux pages ne dépend
pas du JavaScript.

    python3 scripts/navigation.py              réécrit les pages
    python3 scripts/navigation.py --verifier   signale les pages qui divergent

scripts/qa_site.py appelle la vérification : une copie modifiée à la main
fait échouer la QA.
"""

import html
import pathlib
import re
import sys

RACINE = pathlib.Path(__file__).resolve().parent.parent

EMAIL_PUBLIC = "bokouaromeo225@gmail.com"

# (libellé court du menu, titre complet de la rubrique, page principale, sous-pages)
# Le libellé court tient dans l'en-tête dès 1061 px ; le titre complet nomme la
# rubrique dans le pied de page et dans le bouton du sous-menu.
RUBRIQUES = [
    ("Accueil", "Accueil", "index.html", []),
    ("Profil", "Profil", "profil.html", [
        ("Mon profil", "profil.html"),
        ("Participations & événements", "interventions.html"),
        ("Bourses, distinctions & accompagnements", "distinctions-bourses.html"),
        ("Réseaux, engagements & initiatives", "ecosysteme.html"),
    ]),
    ("Expertise", "Expertise", "axes-recherche.html", [
        ("Domaines d’expertise", "axes-recherche.html"),
        ("Missions & contributions", "expertise-missions-contributions.html"),
        ("Enseignement, transmission & accompagnement", "enseignement-transmission-accompagnement.html"),
    ]),
    ("Travaux", "Travaux & recherche", "travaux-publications.html", [
        ("Travaux & publications", "travaux-publications.html"),
        ("Recherche : le droit de la mer dans le golfe de Guinée", "recherche-droit-mer-golfe-guinee.html"),
        ("Littoral, Méditerranée & environnement marin", "travaux-publications.html#travaux-selectionnes"),
        ("Médiation & règlement des différends", "travaux-publications.html#mediation-ohada"),
        ("Innovation & droit des affaires", "travaux-publications.html#innovation-droit-affaires"),
        ("Terrains", "travaux-publications.html#terrains"),
    ]),
    ("Ressources", "Ressources & exploration", "bibliotheque-ressources.html", [
        ("Bibliothèque & ressources", "bibliotheque-ressources.html"),
        ("Cartographie intellectuelle", "cartographie.html"),
        ("Idées & analyses", "idees-analyses.html"),
        ("Carnet d’idées", "carnet-idees.html"),
        ("Médiathèque", "mediatheque.html"),
        ("Veille & agenda", "veille-agenda.html"),
        ("Recherche dans le site", "recherche.html"),
    ]),
    ("Contact", "Contact", "contact.html", []),
]

# Modèles de détail : ils ne figurent pas dans le menu, mais héritent de
# l'état actif de la page qui les liste.
RATTACHEMENTS = {
    "participation.html": "interventions.html",
    "analyse.html": "idees-analyses.html",
}

# Pages hors navigation : leur menu n'indique aucune rubrique active.
HORS_MENU = {"404.html", "mentions-legales.html"}

# 404.html n'a pas de h2 : ses colonnes de pied de page restent des h2 pour ne
# pas sauter un niveau de titre.
NIVEAU_TITRE_PIED = {"404.html": "h2"}


def _e(texte):
    return html.escape(texte, quote=False)


def page_de_reference(page):
    return RATTACHEMENTS.get(page, page)


def rubrique_active(page):
    cible = page_de_reference(page)
    if page in HORS_MENU:
        return None
    for court, _complet, principale, sous_pages in RUBRIQUES:
        if cible == principale or any(cible == lien.split("#")[0] for _, lien in sous_pages):
            return court
    return None


def _courant(lien, page):
    """aria-current="page" sur le lien qui mène exactement à la page affichée."""
    return ' aria-current="page"' if lien == page else ""


def rendre_menu(page):
    active = rubrique_active(page)
    lignes = ['      <nav class="nav-menu" id="navigation" data-nav-menu aria-label="Navigation principale">',
              '        <ul class="nav-list">']
    for court, complet, principale, sous_pages in RUBRIQUES:
        classe_cta = " nav-cta" if principale == "contact.html" else ""
        lien = f'<a class="nav-link{classe_cta}" href="{principale}"{_courant(principale, page)}>{_e(court)}</a>'
        if not sous_pages:
            courant = " is-current" if court == active else ""
            lignes.append(f'          <li class="nav-item{courant}">{lien}</li>')
            continue
        ident = "sous-menu-" + re.sub(r"[^a-z]", "", court.lower().replace("é", "e"))
        courant = " is-current" if court == active else ""
        lignes.append(f'          <li class="nav-item nav-group{courant}">')
        lignes.append(f"            {lien}")
        lignes.append(f'            <button class="nav-sub-toggle" type="button" aria-expanded="false" '
                      f'aria-controls="{ident}" data-nav-sub-toggle>'
                      f'<span class="visually-hidden">Afficher les pages : {_e(complet)}</span></button>')
        lignes.append(f'            <ul class="nav-submenu" id="{ident}">')
        for libelle, cible in sous_pages:
            lignes.append(f'              <li><a href="{cible}"{_courant(cible, page)}>{_e(libelle)}</a></li>')
        lignes.append("            </ul>")
        lignes.append("          </li>")
    lignes += ["        </ul>", "      </nav>"]
    return "\n".join(lignes)


def rendre_pied(page):
    niveau = NIVEAU_TITRE_PIED.get(page, "h3")
    colonnes = []
    for _court, complet, _principale, sous_pages in RUBRIQUES:
        if not sous_pages:
            continue
        liens = "".join(f'<a href="{cible}">{_e(libelle)}</a>'
                        for libelle, cible in sous_pages if "#" not in cible)
        colonnes.append(f"        <div><{niveau}>{_e(complet)}</{niveau}>{liens}</div>")
    return "\n".join([
        '  <footer class="site-footer">',
        '    <div class="footer-inner">',
        '      <div class="footer-brand">',
        '        <img src="assets/img/identity/oby-logo-officiel-footer-sombre.webp" alt="OBY — OUAGA Bokoua Yao" width="257" height="135" loading="lazy">',
        "        <p>Site personnel professionnel, académique et intellectuel.</p>",
        "      </div>",
        '      <div class="footer-links">',
        *colonnes,
        "      </div>",
        "    </div>",
        '    <div class="footer-bottom"><div class="section-inner footer-bottom-inner">'
        "<span>© 2026 OUAGA Bokoua Yao — Site personnel professionnel, académique et intellectuel.</span>"
        '<span class="footer-legal"><a href="contact.html">Contact</a>'
        '<a href="mentions-legales.html">Mentions légales</a>'
        f'<a href="mailto:{EMAIL_PUBLIC}">Email public</a></span></div></div>',
        "  </footer>",
    ])


# Le retrait qui précède le bloc est conservé tel quel : certaines pages
# enchaînent </main><footer> sur une même ligne.
MOTIF_MENU = re.compile(r'(?P<retrait>[ \t]*)<nav class="nav-menu" id="navigation".*?</nav>', re.S)
MOTIF_PIED = re.compile(r'(?P<retrait>[ \t]*)<footer class="site-footer">.*?</footer>', re.S)


def appliquer(page, source):
    for motif, rendu in ((MOTIF_MENU, rendre_menu(page)), (MOTIF_PIED, rendre_pied(page))):
        if len(motif.findall(source)) != 1:
            raise ValueError(f"{page} : bloc de navigation introuvable ou multiple")
        source = motif.sub(lambda m: m.group("retrait") + rendu.lstrip(), source)
    return source


def divergences(racine=RACINE):
    """Pages dont le menu ou le pied de page ne correspond pas à la source."""
    ecarts = []
    for fichier in sorted(racine.glob("*.html")):
        texte = fichier.read_text(encoding="utf-8")
        try:
            attendu = appliquer(fichier.name, texte)
        except ValueError as erreur:
            ecarts.append(str(erreur))
            continue
        if attendu != texte:
            ecarts.append(fichier.name)
    return ecarts


def main():
    if "--verifier" in sys.argv:
        ecarts = divergences()
        for ecart in ecarts:
            print(f"DIVERGENCE {ecart}")
        print(f"navigation : {len(ecarts)} page(s) divergente(s)")
        return 1 if ecarts else 0
    for fichier in sorted(RACINE.glob("*.html")):
        texte = fichier.read_text(encoding="utf-8")
        neuf = appliquer(fichier.name, texte)
        if neuf != texte:
            fichier.write_text(neuf, encoding="utf-8")
            print(f"mis à jour  {fichier.name}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
