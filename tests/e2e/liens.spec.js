// Liens internes après exécution du JavaScript : la QA statique lit le HTML
// source ; ce contrôle couvre aussi les cartes, fiches et galeries construites
// à partir des registres JSON. Chaque lien interne doit répondre, et chaque
// ancre doit exister une fois la page cible rendue.
const { test, expect } = require("playwright/test");
const { PAGES, lireJson, parcourir } = require("./outils");

test.describe.configure({ mode: "serial" });

test("liens internes et ancres, pages rendues comprises", async ({ page, request, baseURL }) => {
  test.skip(test.info().project.name !== "chromium-ordinateur", "un seul parcours suffit");
  test.setTimeout(300_000);

  const participations = lireJson("assets/data/participations-oby.json")
    .filter((fiche) => fiche.affichage_participations !== false)
    .map((fiche) => `participation.html?id=${fiche.id}`);
  const aVisiter = [...PAGES, ...participations];

  const liens = new Map(); // adresse cible → page d'origine
  for (const source of aVisiter) {
    await page.goto(`/${source}`, { waitUntil: "networkidle" });
    await parcourir(page);
    const hrefs = await page.$$eval("a[href]", (ancres) => ancres.map((a) => a.href));
    for (const href of hrefs) {
      const url = new URL(href);
      if (url.origin !== new URL(baseURL).origin) continue;
      if (!liens.has(url.href)) liens.set(url.href, source);
    }
  }

  const absents = [];
  const ancresManquantes = [];
  const identifiantsParPage = new Map();

  for (const [cible, source] of liens) {
    const url = new URL(cible);
    const sansAncre = `${url.origin}${url.pathname}${url.search}`;
    const reponse = await request.get(sansAncre);
    if (reponse.status() !== 200) {
      absents.push(`${source} → ${url.pathname}${url.search} (${reponse.status()})`);
      continue;
    }
    if (!url.hash || url.hash === "#") continue;
    if (!identifiantsParPage.has(sansAncre)) {
      await page.goto(sansAncre, { waitUntil: "networkidle" });
      identifiantsParPage.set(sansAncre, new Set(await page.$$eval("[id]", (elements) => elements.map((e) => e.id))));
    }
    const identifiant = decodeURIComponent(url.hash.slice(1));
    if (!identifiantsParPage.get(sansAncre).has(identifiant)) {
      ancresManquantes.push(`${source} → ${url.pathname}${url.search}${url.hash}`);
    }
  }

  test.info().annotations.push({
    type: "couverture",
    description: `${aVisiter.length} pages ou fiches visitées, ${liens.size} liens internes distincts vérifiés`,
  });
  expect(absents, "liens internes sans réponse").toEqual([]);
  expect(ancresManquantes, "ancres introuvables").toEqual([]);
  expect(liens.size).toBeGreaterThan(100);
});
