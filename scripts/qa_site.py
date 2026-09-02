#!/usr/bin/env python3
"""Dependency-free QA gate for the public OBY static site."""

import argparse
import json
import re
import sys
from collections import defaultdict
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit


REQUIRED_ROBOTS = {"noindex", "nofollow", "noarchive", "nosnippet"}
# 16 pages historiques + recherche-droit-mer-golfe-guinee.html, les deux portes
# Académique / Professionnelle, et le détail d'une participation.
EXPECTED_HTML_PAGES = 20
RISK_TERMS = (
    "doctorant",
    "doctorat en cours",
    "phd",
    "these en cours",
    "thèse en cours",
)
ASSOCIATED_STRUCTURES = (
    "BlueWave Solutions", "BlueWave", "Concordia Consulting", "Concordia",
    "AquaLab", "Betsaleel Holding", "Betsaleel", "PromptMaster",
)
REMOTE_SCHEMES = {"http", "https", "mailto", "tel", "sms", "javascript", "data"}


# Termes proscrits sur la fiche du stage AEM et sur son entrée de médiathèque :
# le stage n'a jamais relevé d'un cadre doctoral et ne doit pas le laisser croire.
AEM_ID = "aem-cote-ivoire-2020"
# Motifs bornés : « thèse » sans borne se retrouve dans « synthèse », terme
# parfaitement légitime, et le contrôle échouerait alors sur un faux positif.
AEM_FORBIDDEN = (
    re.compile(r"\bdoctorat\b"),
    re.compile(r"\bdoctoral(?:e|es|aux)?\b"),
    re.compile(r"\bth[eè]ses?\b"),
)
# Le dépôt GitHub est public : ce qui figure dans un fichier servi est lisible,
# même si l'interface ne l'affiche pas. Ces champs relèvent du back-office et
# n'ont donc pas leur place dans la projection publique.
CHAMPS_INTERNES = ("date_publication_interne", "media_status")
# Règle structurelle, plus fiable qu'une liste de chaînes : la veille publique
# n'admet que ces clés. Un champ de back-office introduit plus tard est refusé
# sans qu'il ait fallu le prévoir nommément.
VEILLE_CLES_PUBLIQUES = frozenset({
    "id", "titre", "type", "date_evenement", "organisateur", "zone", "axes",
    "statut", "resume", "interet_oby", "lien_source", "affichage_accueil",
    "ordre", "image", "video",
})
# Filet secondaire : formulations qui trahissent un état de workflow ou une
# trace préparatoire, y compris à l'intérieur d'un champ par ailleurs légitime.
FORMULATIONS_INTERNES = (
    re.compile(r"Trace préparatoire"),
    re.compile(r"à ajouter plus tard"),
    re.compile(r"(?:sur|par nouvelle) photo\b"),
)
# Le capital événementiel vit dans ce JSON ; interventions.html n'en affiche que
# la liste compacte et participation.html?id=<id> le détail.
PARTICIPATIONS_DATA = "assets/data/participations-oby.json"
# Bornes de plausibilité des dimensions déclarées pour un média publié.
MEDIA_DIM_MIN = 100
MEDIA_DIM_MAX = 10000


def dimensions_webp(chemin):
    """Dimensions d'un WebP, ou None si le conteneur n'est pas lisible ici.

    Les trois formes du format sont distinguées par le quatrième chunk du RIFF,
    à un offset fixe : chercher « VP8 » n'importe où dans le fichier tomberait
    sur des octets de données compressées et donnerait des valeurs absurdes.
    """
    try:
        d = chemin.read_bytes()
    except OSError:
        return None
    if len(d) < 30 or d[:4] != b"RIFF" or d[8:12] != b"WEBP":
        return None
    forme = d[12:16]
    if forme == b"VP8X":
        return (int.from_bytes(d[24:27], "little") + 1, int.from_bytes(d[27:30], "little") + 1)
    if forme == b"VP8L" and d[20] == 0x2F:
        n = int.from_bytes(d[21:25], "little")
        return ((n & 0x3FFF) + 1, ((n >> 14) & 0x3FFF) + 1)
    if forme == b"VP8 " and d[23:26] == b"\x9d\x01\x2a":
        return (int.from_bytes(d[26:28], "little") & 0x3FFF, int.from_bytes(d[28:30], "little") & 0x3FFF)
    return None


class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.ids = set()
        self.id_list = []
        self.links = []
        self.assets = []
        self.h1_count = 0
        self.headings = []
        self.title_parts = []
        self.in_title = False
        self.metas = []
        self.canonicals = []
        self.skip_links = []
        self.ld_json_parts = []
        self._active_ld_json = None

    def handle_starttag(self, tag, attrs_list):
        attrs = {key.lower(): (value or "") for key, value in attrs_list}
        tag = tag.lower()
        if attrs.get("id"):
            self.ids.add(attrs["id"])
            self.id_list.append(attrs["id"])
        if attrs.get("name") and tag == "a":
            self.ids.add(attrs["name"])
        if tag == "title":
            self.in_title = True
        if tag in {"h1", "h2", "h3", "h4", "h5", "h6"}:
            level = int(tag[1])
            self.headings.append(level)
            if tag == "h1":
                self.h1_count += 1
        if tag == "meta":
            self.metas.append(attrs)
        if tag == "a" and "href" in attrs:
            href = attrs["href"].strip()
            self.links.append(href)
            classes = set(attrs.get("class", "").split())
            if "skip-link" in classes:
                self.skip_links.append(href)
            if "download" in attrs:
                self.assets.append(href)
        if tag == "link" and "href" in attrs:
            rels = set(attrs.get("rel", "").lower().split())
            if "canonical" in rels:
                self.canonicals.append(attrs["href"].strip())
            if rels.intersection({"stylesheet", "icon", "manifest", "preload", "apple-touch-icon"}):
                self.assets.append(attrs["href"].strip())
        for attr in ("src", "poster", "data"):
            if attr in attrs and tag in {"img", "script", "source", "video", "audio", "iframe", "object"}:
                self.assets.append(attrs[attr].strip())
        for attr in ("srcset",):
            if attr in attrs:
                for candidate in attrs[attr].split(","):
                    value = candidate.strip().split()[0] if candidate.strip() else ""
                    if value:
                        self.assets.append(value)
        if tag == "script" and attrs.get("type", "").lower() == "application/ld+json":
            self._active_ld_json = []
            self.ld_json_parts.append(self._active_ld_json)

    def handle_endtag(self, tag):
        tag = tag.lower()
        if tag == "title":
            self.in_title = False
        if tag == "script":
            self._active_ld_json = None

    def handle_data(self, data):
        if self.in_title:
            self.title_parts.append(data)
        if self._active_ld_json is not None:
            self._active_ld_json.append(data)

    @property
    def title(self):
        return "".join(self.title_parts).strip()

    def meta_values(self, key, value):
        return [meta.get("content", "").strip() for meta in self.metas if meta.get(key, "").lower() == value]


def parse_page(path):
    text = path.read_text(encoding="utf-8")
    parser = PageParser()
    parser.feed(text)
    parser.close()
    return parser, text


def local_target(root, source, raw_ref):
    ref = raw_ref.strip()
    if not ref or ref.startswith("//"):
        return None, ""
    parsed = urlsplit(ref)
    if parsed.scheme.lower() in REMOTE_SCHEMES:
        return None, ""
    rel_path = unquote(parsed.path)
    if rel_path.startswith("/oby-site-academique/"):
        target = root / rel_path[len("/oby-site-academique/"):]
    elif rel_path.startswith("/"):
        target = root / rel_path.lstrip("/")
    elif rel_path:
        target = source.parent / rel_path
    else:
        target = source
    if target.is_dir():
        target = target / "index.html"
    return target.resolve(), unquote(parsed.fragment)


def main():
    argp = argparse.ArgumentParser()
    argp.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    argp.add_argument("--json-report", type=Path)
    args = argp.parse_args()
    root = args.root.resolve()
    pages = sorted(root.glob("*.html"))
    errors = []
    warnings = []
    parsed_pages = {}
    texts = {}

    def add(target, code, page, detail):
        try:
            label = str(page.relative_to(root)) if isinstance(page, Path) else str(page)
        except ValueError:
            label = str(page)
        target.append({"code": code, "page": label, "detail": detail})

    if len(pages) != EXPECTED_HTML_PAGES:
        add(errors, "HTML_PAGE_COUNT", root, f"Expected {EXPECTED_HTML_PAGES} root HTML pages, found {len(pages)}")

    for page in pages:
        try:
            parser, text = parse_page(page)
            parsed_pages[page.resolve()] = parser
            texts[page.resolve()] = text
        except (OSError, UnicodeError) as exc:
            add(errors, "HTML_READ", page, str(exc))
            continue
        if parser.h1_count != 1:
            add(errors, "H1_COUNT", page, f"Expected 1 H1, found {parser.h1_count}")
        if not parser.title:
            add(errors, "TITLE_MISSING", page, "Missing or empty title")
        if not parser.meta_values("name", "description"):
            add(errors, "DESCRIPTION_MISSING", page, "Missing meta description")
        if page.name != "404.html" and len(parser.canonicals) != 1:
            add(errors, "CANONICAL_COUNT", page, f"Expected 1 canonical, found {len(parser.canonicals)}")
        if not any("charset" in meta and meta["charset"].lower() == "utf-8" for meta in parser.metas):
            add(errors, "CHARSET_MISSING", page, "Missing UTF-8 charset")
        if not parser.meta_values("name", "viewport"):
            add(errors, "VIEWPORT_MISSING", page, "Missing viewport meta")
        robot_values = parser.meta_values("name", "robots")
        robot_tokens = {token.strip().lower() for value in robot_values for token in value.split(",")}
        if len(robot_values) != 1 or not REQUIRED_ROBOTS.issubset(robot_tokens):
            add(errors, "NOINDEX_GUARD", page, f"Expected one robots meta with {sorted(REQUIRED_ROBOTS)}, got {robot_values}")
        if len(parser.skip_links) != 1:
            add(errors, "SKIP_LINK_COUNT", page, f"Expected 1 skip link, found {len(parser.skip_links)}")
        for before, after in zip(parser.headings, parser.headings[1:]):
            if after > before + 1:
                add(warnings, "HEADING_JUMP", page, f"Heading level jumps from H{before} to H{after}")
        for parts in parser.ld_json_parts:
            payload = "".join(parts).strip()
            try:
                json.loads(payload)
            except json.JSONDecodeError as exc:
                add(errors, "JSON_LD_INVALID", page, str(exc))

    dynamic_id_sources = {
        "mediatheque.html": root / "assets/data/mediatheque-oby.json",
        "veille-agenda.html": root / "assets/data/veille-agenda-oby.json",
    }
    for page_name, data_path in dynamic_id_sources.items():
        page_path = (root / page_name).resolve()
        parser = parsed_pages.get(page_path)
        if parser is None or not data_path.exists():
            continue
        try:
            records = json.loads(data_path.read_text(encoding="utf-8"))
            if isinstance(records, list):
                parser.ids.update(str(record["id"]) for record in records if isinstance(record, dict) and record.get("id"))
        except (OSError, UnicodeError, json.JSONDecodeError):
            pass

    for page, parser in parsed_pages.items():
        for href in parser.links:
            target, fragment = local_target(root, page, href)
            if target is None:
                continue
            if not target.exists():
                add(errors, "INTERNAL_LINK_MISSING", page, href)
                continue
            if fragment and target.suffix.lower() == ".html":
                target_parser = parsed_pages.get(target)
                if target_parser is None:
                    try:
                        target_parser, _ = parse_page(target)
                    except (OSError, UnicodeError) as exc:
                        add(errors, "ANCHOR_TARGET_READ", page, f"{href}: {exc}")
                        continue
                if fragment not in target_parser.ids:
                    add(errors, "ANCHOR_MISSING", page, href)
        for asset in parser.assets:
            target, _ = local_target(root, page, asset)
            if target is not None and not target.exists():
                add(errors, "ASSET_MISSING", page, asset)

    css_url_pattern = re.compile(r"url\(\s*(['\"]?)([^'\")]+)\1\s*\)", re.IGNORECASE)
    for css in sorted((root / "assets").rglob("*.css")):
        text = css.read_text(encoding="utf-8")
        for _, ref in css_url_pattern.findall(text):
            target, _ = local_target(root, css, ref)
            if target is not None and not target.exists():
                add(errors, "CSS_ASSET_MISSING", css, ref)

    json_files = sorted((root / "assets").rglob("*.json"))
    for path in json_files:
        try:
            json.loads(path.read_text(encoding="utf-8"))
        except (OSError, UnicodeError, json.JSONDecodeError) as exc:
            add(errors, "JSON_INVALID", path, str(exc))

    # --- unicité des id dans une page -------------------------------------
    # `parser.ids` est un ensemble : un id dupliqué y disparaît silencieusement,
    # alors qu'il casse l'ancre et le lien croisé qui la vise.
    for page, parser in parsed_pages.items():
        vus = set()
        for ident in parser.id_list:
            if ident in vus:
                add(errors, "ID_DUPLICATE", page, ident)
            vus.add(ident)

    # --- réciprocité des liens participations / médiathèque ----------------
    # Une entrée publique de la médiathèque qui renvoie vers une fiche doit être
    # atteignable depuis cette fiche : sans quoi la circulation n'existe que dans
    # un sens et la galerie reste invisible pour qui lit la fiche.
    media_data = root / "assets/data/mediatheque-oby.json"
    interventions = (root / "interventions.html").resolve()
    if media_data.exists() and interventions in texts:
        try:
            records = json.loads(media_data.read_text(encoding="utf-8"))
        except (OSError, UnicodeError, json.JSONDecodeError):
            records = []
        page_ids = parsed_pages[interventions].ids
        page_text = texts[interventions]
        for record in records:
            if not isinstance(record, dict) or record.get("statut") != "public-valide":
                continue
            ident = str(record.get("id") or "")
            lien = str(record.get("pageLiee") or "")
            if not ident or not lien.startswith("interventions.html#"):
                continue
            fragment = lien.split("#", 1)[1]
            if fragment not in page_ids:
                add(errors, "CROSS_ID_MISSING", media_data, f"{ident} -> {lien}")
            elif fragment == ident and f"mediatheque.html#{ident}" not in page_text:
                add(errors, "CROSS_LINK_ONE_WAY", interventions, f"#{ident} ne renvoie pas vers mediatheque.html#{ident}")

    # --- médias déclarés dans les JSON -------------------------------------
    # qa_site vérifie les assets référencés depuis le HTML ; ceux des galeries
    # ne vivent que dans les JSON et échapperaient sinon à tout contrôle.
    for nom in ("assets/data/participations-oby.json", "assets/data/mediatheque-oby.json"):
        source = root / nom
        if not source.exists():
            continue
        try:
            entrees = json.loads(source.read_text(encoding="utf-8"))
        except (OSError, UnicodeError, json.JSONDecodeError):
            continue
        for entree in entrees:
            if not isinstance(entree, dict):
                continue
            refs = [entree.get("fichier")] + [g.get("fichier") for g in (entree.get("galerie") or []) if isinstance(g, dict)]
            for ref in [r for r in refs if r]:
                if not (root / ref).exists():
                    add(errors, "MEDIA_FILE_MISSING", source, f"{entree.get('id', '?')} : {ref}")
            for photo in (entree.get("galerie") or []):
                if not isinstance(photo, dict):
                    continue
                if not (photo.get("alt") or "").strip():
                    add(errors, "MEDIA_ALT_MISSING", source, f"{entree.get('id', '?')} : {photo.get('fichier')}")
                # Dimensions : elles alimentent les attributs width/height, donc la
                # réservation d'espace au chargement. Une valeur absurde passe
                # inaperçue à l'œil mais fait sauter la mise en page.
                if "largeur" in photo or "hauteur" in photo:
                    w, h = photo.get("largeur"), photo.get("hauteur")
                    if not isinstance(w, int) or not isinstance(h, int) or w < MEDIA_DIM_MIN or h < MEDIA_DIM_MIN or w > MEDIA_DIM_MAX or h > MEDIA_DIM_MAX:
                        add(errors, "MEDIA_DIM_INVALID", source, f"{entree.get('id', '?')} : {photo.get('fichier')} → {w}x{h}")
                    else:
                        reelles = dimensions_webp(root / photo["fichier"])
                        if reelles and reelles != (w, h):
                            add(errors, "MEDIA_DIM_INVALID", source,
                                f"{entree.get('id', '?')} : {photo.get('fichier')} déclaré {w}x{h}, réel {reelles[0]}x{reelles[1]}")

    # --- double encodage HTML ----------------------------------------------
    # Les JSON stockent des données : un « & » y reste un « & ». S'il y est déjà
    # échappé, le générateur l'échappe une seconde fois et le visiteur lit
    # « &amp; » en clair dans la page.
    for page, text in texts.items():
        if "&amp;amp;" in text:
            add(errors, "DOUBLE_ENTITY", page, "&amp;amp; présent dans la page")
    for nom in ("assets/data/participations-oby.json", "assets/data/mediatheque-oby.json"):
        source = root / nom
        if source.exists() and "&amp;" in source.read_text(encoding="utf-8"):
            add(errors, "DOUBLE_ENTITY", source, "entité HTML stockée dans un texte éditorial")

    # --- fiche AEM : aucun terme doctoral ----------------------------------
    if interventions in texts:
        debut = texts[interventions].find(f'id="{AEM_ID}"')
        if debut >= 0:
            fin = texts[interventions].find("</article>", debut)
            bloc = texts[interventions][debut:fin].casefold()
            for motif in AEM_FORBIDDEN:
                trouve = motif.search(bloc)
                if trouve:
                    add(errors, "AEM_FORBIDDEN_TERM", interventions, trouve.group(0))
    if media_data.exists():
        entree = json.dumps(
            [r for r in json.loads(media_data.read_text(encoding="utf-8")) if isinstance(r, dict) and r.get("id") == AEM_ID],
            ensure_ascii=False,
        ).casefold()
        for motif in AEM_FORBIDDEN:
            trouve = motif.search(entree)
            if trouve:
                add(errors, "AEM_FORBIDDEN_TERM", media_data, trouve.group(0))

    # --- cohérence du busting de cache -------------------------------------
    # Un même fichier servi sous deux jetons `?v=` crée deux entrées de cache pour
    # une seule ressource : la dérive est invisible en navigation et coûteuse.
    version_pattern = re.compile(r'([\w./-]+\.(?:css|js|json))\?v=([\w.-]+)')
    versions = defaultdict(set)
    for path, text in list(texts.items()) + [(p, p.read_text(encoding="utf-8")) for p in [root / "assets/js/main.js"] if p.exists()]:
        for asset, token in version_pattern.findall(text):
            versions[asset.rsplit("/", 1)[-1]].add(token)
    for asset, tokens in sorted(versions.items()):
        if len(tokens) > 1:
            add(errors, "CACHE_VERSION_SPLIT", root, f"{asset}: {sorted(tokens)}")

    # --- concordance liste / JSON des participations -----------------------
    # La liste compacte et le JSON canonique doivent décrire exactement le même
    # ensemble : une carte sans fiche mène à un détail vide, une fiche sans carte
    # devient inatteignable.
    participations = root / PARTICIPATIONS_DATA
    if participations.exists() and interventions in texts:
        try:
            fiches = json.loads(participations.read_text(encoding="utf-8"))
        except (OSError, UnicodeError, json.JSONDecodeError):
            fiches = []
        ids_json_liste = [str(f.get("id") or "") for f in fiches if isinstance(f, dict)]
        doublons = {i for i in ids_json_liste if ids_json_liste.count(i) > 1}
        for ident in sorted(doublons):
            add(errors, "PARTICIPATION_ID_DUPLICATE", participations, ident)
        ids_json = set(ids_json_liste)
        ids_json_visibles = {
            str(f.get("id") or "")
            for f in fiches
            if isinstance(f, dict) and f.get("affichage_participations", True) is not False
        }
        ids_html = set(re.findall(r'<article class="card participation-card" id="([^"]+)"', texts[interventions]))
        for ident in sorted(ids_html - ids_json):
            add(errors, "PARTICIPATION_MISSING_IN_JSON", interventions, ident)
        for ident in sorted(ids_json_visibles - ids_html):
            add(errors, "PARTICIPATION_MISSING_IN_LIST", participations, ident)
        # Toute adresse participation.html?id=… doit désigner une fiche réelle.
        # Les commentaires sont retirés : ils contiennent le gabarit `?id=<id>`.
        for page, text in texts.items():
            for ident in re.findall(r'participation\.html\?id=([^"&#\s]+)', re.sub(r"<!--.*?-->", "", text, flags=re.S)):
                if ident not in ids_json:
                    add(errors, "PARTICIPATION_ID_UNKNOWN", page, ident)
        # Les champs obligatoires d'une fiche publiée.
        for fiche in fiches:
            if not isinstance(fiche, dict):
                continue
            for champ in ("id", "titre", "meta", "ligne"):
                if not fiche.get(champ):
                    add(errors, "PARTICIPATION_FIELD_MISSING", participations, f"{fiche.get('id', '?')} : {champ}")
        # La règle AEM vaut aussi sur le JSON, qui porte désormais le texte long.
        entree_aem = json.dumps([f for f in fiches if isinstance(f, dict) and f.get("id") == AEM_ID], ensure_ascii=False).casefold()
        for motif in AEM_FORBIDDEN:
            trouve = motif.search(entree_aem)
            if trouve:
                add(errors, "AEM_FORBIDDEN_TERM", participations, trouve.group(0))

    # --- données de back-office dans la projection publique ------------------
    # Le dépôt est public : une donnée interne masquée dans l'interface reste
    # lisible dans le fichier. Ces champs et ces formulations ne doivent donc
    # figurer ni dans les JSON servis, ni dans le JavaScript qui les double.
    portee_publique = [root / "assets/data" / nom for nom in (
        "veille-agenda-oby.json", "bibliotheque-oby.json", "sujets-recherche-oby.json",
        "mediatheque-oby.json", "participations-oby.json")]
    portee_publique.append(root / "assets/js/main.js")
    for source in portee_publique:
        if not source.exists():
            continue
        try:
            brut = source.read_text(encoding="utf-8")
        except (OSError, UnicodeError):
            continue
        for champ in CHAMPS_INTERNES:
            if re.search(rf'["\']?{re.escape(champ)}["\']?\s*:', brut):
                add(errors, "INTERNAL_FIELD_PUBLISHED", source, champ)
        # Liste blanche de clés : refuse tout champ non prévu, y compris ceux
        # qu'aucune liste noire n'aurait anticipés.
        if source.name == "veille-agenda-oby.json":
            try:
                entrees_veille = json.loads(brut)
            except json.JSONDecodeError:
                entrees_veille = []
            for entree in entrees_veille:
                if not isinstance(entree, dict):
                    continue
                for cle in sorted(set(entree) - VEILLE_CLES_PUBLIQUES):
                    add(errors, "PUBLIC_SCHEMA_VIOLATION", source, f"{entree.get('id', '?')} : {cle}")
        for motif in FORMULATIONS_INTERNES:
            trouve = motif.search(brut)
            if trouve:
                add(errors, "INTERNAL_WORDING_PUBLISHED", source, trouve.group(0))

    # Le compteur public de la médiathèque ne doit décompter que le publiable.
    principal = root / "assets/js/main.js"
    if principal.exists():
        js = principal.read_text(encoding="utf-8")
        if re.search(r"mediaCount\.textContent\s*=\s*String\(\s*media\.length\s*\)", js):
            add(errors, "PUBLIC_COUNTER_UNFILTERED", principal, "mediaCount compte les entrées non publiées")

    term_locations = defaultdict(list)
    for path, text in texts.items():
        lowered = text.casefold()
        for term in RISK_TERMS:
            if term.casefold() in lowered:
                term_locations[term].append(path.name)
    for term, locations in sorted(term_locations.items()):
        add(warnings, "RISK_TERM", ", ".join(locations), term)

    # Doctrine publique OBY : les initiatives associées sont décrites par leur
    # domaine et leur nature, sans nom de marque dans les pages, données ou
    # scripts servis. Les chemins d'assets sont contrôlés pour la même raison.
    structure_locations = defaultdict(list)
    sources_publiques = list(texts.items())
    for path in portee_publique:
        if path.exists():
            sources_publiques.append((path.resolve(), path.read_text(encoding="utf-8")))
    for path, text in sources_publiques:
        lowered = text.casefold()
        for name in ASSOCIATED_STRUCTURES:
            if name.casefold() in lowered:
                structure_locations[name].append(str(path.relative_to(root)))
    chemins_publics = list(root.glob("*.html")) + list((root / "assets").rglob("*"))
    for path in chemins_publics:
        relatif = str(path.relative_to(root))
        lowered = relatif.casefold()
        for name in ASSOCIATED_STRUCTURES:
            if name.casefold() in lowered:
                structure_locations[name].append(relatif)
    for name, locations in sorted(structure_locations.items()):
        for location in sorted(set(locations)):
            add(errors, "ASSOCIATED_STRUCTURE_PUBLISHED", location, name)

    report = {
        "status": "FAIL" if errors else "PASS",
        "root": str(root),
        "html_pages": len(pages),
        "json_files": len(json_files),
        "errors": errors,
        "warnings": warnings,
        "risk_terms": term_locations,
        "associated_structures": structure_locations,
    }
    if args.json_report:
        args.json_report.parent.mkdir(parents=True, exist_ok=True)
        args.json_report.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"QA_SITE {report['status']} | pages={len(pages)} json={len(json_files)} errors={len(errors)} warnings={len(warnings)}")
    for issue in errors:
        print(f"ERROR {issue['code']} {issue['page']}: {issue['detail']}")
    for issue in warnings:
        print(f"WARN  {issue['code']} {issue['page']}: {issue['detail']}")
    if structure_locations:
        print("ASSOCIATED_STRUCTURES " + json.dumps(structure_locations, ensure_ascii=False, sort_keys=True))
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
