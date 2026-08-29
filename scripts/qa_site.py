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
# 16 pages historiques + recherche-droit-mer-golfe-guinee.html
EXPECTED_HTML_PAGES = 17
RISK_TERMS = (
    "doctorant",
    "doctorat en cours",
    "phd",
    "these en cours",
    "thèse en cours",
)
ASSOCIATED_STRUCTURES = ("BlueWave", "Concordia", "AquaLab", "PromptMaster", "Betsaleel")
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
# Les fiches d'événement portent leur contexte dans un bloc dépliable normalisé.
EVENT_CONTEXT_MARKERS = ('<details class="event-context">', "event-context-body", "event-themes")


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

    # --- structure des fiches enrichies ------------------------------------
    if interventions in texts:
        for marqueur in EVENT_CONTEXT_MARKERS:
            if marqueur not in texts[interventions]:
                add(warnings, "EVENT_CONTEXT_MARKER", interventions, f"marqueur absent : {marqueur}")

    term_locations = defaultdict(list)
    structure_locations = defaultdict(list)
    for path, text in texts.items():
        lowered = text.casefold()
        for term in RISK_TERMS:
            if term.casefold() in lowered:
                term_locations[term].append(path.name)
        for name in ASSOCIATED_STRUCTURES:
            if name.casefold() in lowered:
                structure_locations[name].append(path.name)
    for term, locations in sorted(term_locations.items()):
        add(warnings, "RISK_TERM", ", ".join(locations), term)

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
