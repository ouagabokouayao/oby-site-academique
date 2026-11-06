// Captures pleine page des pages essentielles à cinq largeurs, jointes au
// rapport HTML. Elles servent à la recette visuelle et aux comparaisons
// avant/après ; elles ne vérifient rien automatiquement, les rendus de
// polices variant d'une machine à l'autre.
const { test } = require("playwright/test");
const { parcourir } = require("./outils");

const LARGEURS = [
  { nom: "mobile-petit", largeur: 360, hauteur: 740 },
  { nom: "mobile-grand", largeur: 430, hauteur: 932 },
  { nom: "tablette", largeur: 768, hauteur: 1024 },
  { nom: "portable", largeur: 1280, hauteur: 800 },
  { nom: "ecran-large", largeur: 1920, hauteur: 1080 },
];

const PAGES_ESSENTIELLES = [
  "index.html",
  "profil.html",
  "parcours-recits.html",
  "axes-recherche.html",
  "travaux-publications.html",
  "enseignement-transmission-accompagnement.html",
  "interventions.html",
  "mediatheque.html",
  "contact.html",
];

for (const ecran of LARGEURS) {
  test.describe(`@captures ${ecran.nom} (${ecran.largeur} px)`, () => {
    test.use({ viewport: { width: ecran.largeur, height: ecran.hauteur } });
    for (const fichier of PAGES_ESSENTIELLES) {
      test(`${fichier}`, async ({ page }) => {
        await page.goto(`/${fichier}`, { waitUntil: "networkidle" });
        await parcourir(page);
        await page.evaluate(() => document.querySelectorAll(".reveal").forEach((element) => element.classList.add("is-visible")));
        await page.waitForTimeout(900);
        const chemin = test.info().outputPath(`${fichier.replace(".html", "")}-${ecran.nom}.png`);
        await page.screenshot({ path: chemin, fullPage: true });
        await test.info().attach(`${fichier} ${ecran.nom}`, { path: chemin, contentType: "image/png" });
      });
    }
  });
}
