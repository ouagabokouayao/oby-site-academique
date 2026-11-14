// Moyens de contact. Le site n'a pas de serveur ni de formulaire d'envoi :
// le contact passe par des liens mailto, ouverts dans la messagerie du
// visiteur. Ces tests vérifient ces liens et l'absence de toute collecte ;
// ils ne prouvent pas la réception d'un message, qui dépend de la messagerie.
const { test, expect } = require("playwright/test");
const { PAGES, estPetitEcran } = require("./outils");

const EMAIL_PUBLIC = "bokouaromeo225@gmail.com";

test("tous les liens mailto visent l'adresse publique et sont bien encodés", async ({ page }) => {
  test.skip(test.info().project.name !== "chromium-ordinateur", "contrôle du HTML : un seul parcours suffit");
  const fautes = [];
  let total = 0;
  for (const fichier of PAGES) {
    await page.goto(`/${fichier}`, { waitUntil: "networkidle" });
    const liens = await page.$$eval('a[href^="mailto:"]', (ancres) => ancres.map((a) => a.getAttribute("href")));
    for (const href of liens) {
      total += 1;
      const url = new URL(href);
      if (url.pathname !== EMAIL_PUBLIC) fautes.push(`${fichier} : destinataire ${url.pathname}`);
      if (/\s/.test(href)) fautes.push(`${fichier} : espace non encodé`);
      for (const [cle, valeur] of url.searchParams) {
        if (!["subject", "body"].includes(cle)) fautes.push(`${fichier} : paramètre ${cle}`);
        if (cle === "subject" && !/OBY/.test(valeur)) fautes.push(`${fichier} : objet sans repère OBY`);
      }
    }
  }
  test.info().annotations.push({ type: "couverture", description: `${total} liens mailto contrôlés` });
  expect(fautes).toEqual([]);
  expect(total).toBeGreaterThan(20);
});

test("page Contact : appels à l'action visibles et cliquables", async ({ page }) => {
  await page.goto("/contact.html", { waitUntil: "networkidle" });
  const principal = page.locator('a.button.primary[href^="mailto:"]').first();
  await principal.scrollIntoViewIfNeeded();
  await expect(principal).toBeVisible();
  const objet = new URL(await principal.getAttribute("href")).searchParams.get("subject");
  expect(objet).toContain("OBY");

  // Cinq portes d'entrée : chacune prépare un courriel distinct, repéré OBY.
  const portes = page.locator("#sollicitations .contact-path");
  await expect(portes).toHaveCount(5);
  const boutons = portes.locator('a.button[href^="mailto:"]');
  await expect(boutons).toHaveCount(5);
  const objets = await boutons.evaluateAll((liens) => liens.map((lien) => new URL(lien.href).searchParams.get("subject")));
  expect(new Set(objets).size).toBe(5);
  for (const sujet of objets) expect(sujet).toContain("OBY");
  for (const bouton of await boutons.all()) {
    await bouton.scrollIntoViewIfNeeded();
    await expect(bouton).toBeVisible();
  }
  if (estPetitEcran(page)) {
    const petites = await boutons.evaluateAll((liens) =>
      liens.filter((lien) => lien.getBoundingClientRect().height < 24).map((lien) => lien.textContent.trim())
    );
    expect(petites, "cibles tactiles trop petites").toEqual([]);
  }

  // Les autres sollicitations (affiliation, séminaire, panel, médiation…) gardent un courriel préparé.
  const autre = page.locator('#autres-sollicitations a[href^="mailto:"]');
  await expect(autre).toHaveCount(1);
  expect(new URL(await autre.getAttribute("href")).searchParams.get("subject")).toContain("OBY");
  // La porte « Partenariat ou projet » reste dans le périmètre d'OBY, sans renvoi vers les structures autonomes.
  await expect(page.locator('#partenariat a[href="ecosysteme.html"]')).toHaveCount(0);

  // « Choisir un sujet » conduit à ces portes.
  await page.locator('a[href="#sollicitations"]').first().click();
  await expect(page).toHaveURL(/#sollicitations$/);
});

test("aucun formulaire n'envoie de données hors du site", async ({ page }) => {
  test.skip(test.info().project.name !== "chromium-ordinateur", "contrôle du HTML : un seul parcours suffit");
  const fautes = [];
  for (const fichier of PAGES) {
    await page.goto(`/${fichier}`);
    const formulaires = await page.$$eval("form", (liste) =>
      liste.map((f) => ({ methode: (f.getAttribute("method") || "get").toLowerCase(), action: f.getAttribute("action") || "" }))
    );
    for (const formulaire of formulaires) {
      if (formulaire.methode !== "get") fautes.push(`${fichier} : méthode ${formulaire.methode}`);
      if (formulaire.action && !formulaire.action.startsWith("#")) fautes.push(`${fichier} : action ${formulaire.action}`);
    }
    const champsPersonnels = await page.$$eval(
      'input[type="email"], input[type="tel"], input[type="password"], input[autocomplete~="email"], textarea',
      (champs) => champs.length
    );
    if (champsPersonnels) fautes.push(`${fichier} : ${champsPersonnels} champ(s) de données personnelles`);
  }
  expect(fautes).toEqual([]);
});

test("une recherche ne déclenche aucune requête vers un autre domaine", async ({ page, baseURL }) => {
  const externes = [];
  page.on("request", (requete) => {
    if (!requete.url().startsWith(baseURL) && !requete.url().startsWith("data:")) externes.push(requete.url());
  });
  await page.goto("/recherche.html", { waitUntil: "networkidle" });
  const champ = page.locator('[data-search-controls] input[name="q"]');
  await champ.fill("médiation");
  await champ.press("Enter");
  await page.waitForLoadState("networkidle");
  expect(externes).toEqual([]);
});
