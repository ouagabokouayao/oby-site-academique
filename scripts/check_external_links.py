#!/usr/bin/env python3
"""Classify external links without turning anti-bot responses into failures."""

import argparse
import csv
import json
import socket
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from html.parser import HTMLParser
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


class ExternalLinkParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.urls = []

    def handle_starttag(self, tag, attrs_list):
        if tag.lower() != "a":
            return
        attrs = {key.lower(): (value or "") for key, value in attrs_list}
        href = attrs.get("href", "").strip()
        if href.startswith(("https://", "http://")):
            self.urls.append(href)


def probe(url, timeout):
    headers = {"User-Agent": "Mozilla/5.0 (compatible; OBY-QA/1.0; +https://github.com/ouagabokouayao/oby-site-academique)"}
    request = Request(url, headers=headers, method="HEAD")
    try:
        response = urlopen(request, timeout=timeout)
    except HTTPError as exc:
        if exc.code in {405, 501}:
            try:
                response = urlopen(Request(url, headers={**headers, "Range": "bytes=0-0"}), timeout=timeout)
            except HTTPError as get_exc:
                return classify_http(url, get_exc.code, url, str(get_exc))
            except (URLError, TimeoutError, socket.timeout) as get_exc:
                return classify_error(url, get_exc)
        else:
            return classify_http(url, exc.code, url, str(exc))
    except (URLError, TimeoutError, socket.timeout) as exc:
        return classify_error(url, exc)
    with response:
        status = response.getcode() or 0
        final_url = response.geturl()
    return classify_http(url, status, final_url, "")


def classify_http(url, status, final_url, detail):
    if status in {404, 410}:
        label = "CASSE"
    elif status in {403, 429}:
        label = "A_CONTROLER"
    elif 200 <= status < 300:
        label = "REDIRECTION" if final_url != url else "OK"
    elif 300 <= status < 400:
        label = "REDIRECTION"
    else:
        label = "A_CONTROLER"
    return {"url": url, "status": status, "classification": label, "final_url": final_url, "detail": detail}


def classify_error(url, exc):
    reason = getattr(exc, "reason", exc)
    label = "A_CONTROLER"
    return {"url": url, "status": "", "classification": label, "final_url": "", "detail": str(reason)}


def main():
    argp = argparse.ArgumentParser()
    argp.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    argp.add_argument("--json-report", type=Path)
    argp.add_argument("--csv-report", type=Path)
    argp.add_argument("--timeout", type=float, default=15.0)
    argp.add_argument("--workers", type=int, default=8)
    args = argp.parse_args()
    root = args.root.resolve()
    occurrences = {}
    for page in sorted(root.glob("*.html")):
        parser = ExternalLinkParser()
        parser.feed(page.read_text(encoding="utf-8"))
        parser.close()
        for url in parser.urls:
            occurrences.setdefault(url, set()).add(page.name)

    results = []
    with ThreadPoolExecutor(max_workers=max(1, args.workers)) as executor:
        futures = {executor.submit(probe, url, args.timeout): url for url in sorted(occurrences)}
        for future in as_completed(futures):
            result = future.result()
            result["pages"] = sorted(occurrences[str(result["url"])])
            results.append(result)
    results.sort(key=lambda row: str(row["url"]))
    summary = {}
    for row in results:
        key = str(row["classification"])
        summary[key] = summary.get(key, 0) + 1
    report = {"root": str(root), "links": len(results), "summary": summary, "results": results}
    if args.json_report:
        args.json_report.parent.mkdir(parents=True, exist_ok=True)
        args.json_report.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    if args.csv_report:
        args.csv_report.parent.mkdir(parents=True, exist_ok=True)
        with args.csv_report.open("w", encoding="utf-8", newline="") as handle:
            writer = csv.DictWriter(handle, fieldnames=("URL", "PAGES", "STATUS", "CLASSIFICATION", "FINAL_URL", "DETAIL"))
            writer.writeheader()
            for row in results:
                writer.writerow({
                    "URL": row["url"],
                    "PAGES": " | ".join(row["pages"]),
                    "STATUS": row["status"],
                    "CLASSIFICATION": row["classification"],
                    "FINAL_URL": row["final_url"],
                    "DETAIL": row["detail"],
                })
    print(f"EXTERNAL_LINKS links={len(results)} " + " ".join(f"{key}={value}" for key, value in sorted(summary.items())))
    for row in results:
        if row["classification"] != "OK":
            print(f"{row['classification']} {row['status']} {row['url']} {row['detail']}")
    return 1 if summary.get("CASSE", 0) else 0


if __name__ == "__main__":
    sys.exit(main())
