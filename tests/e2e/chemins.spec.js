// Indépendance vis-à-vis de l'emplacement : le site doit fonctionner à
// l'identique à la racine d'un domaine (www.ouagabokouayao.com) et sous un
// chemin (ouagabokouayao.github.io/oby-site-academique/). Chaque page est
// chargée dans les deux configurations : aucune requête ne doit sortir de
// l'emplacement du site, aucune ressource ne doit manquer, et chaque lien
// interne rendu doit rester dans l'emplacement.
const { test, expect } = require("playwright/test");
const { PAGES, parcourir, imagesCassees } = require("./outils");

const PORT_RACINE = Number(process.env.OBY_PORT || 4173);
const PORT_CHEMIN = PORT_RACINE + 1;

const EMPLACEMENTS = [
  { nom: "racine du domaine", base: `http://127.0.0.1:${PORT_RACINE}/` },
  { nom: "sous /oby-site-academique/", base: `http://127.0.0.1:${PORT_CHEMIN}/oby-site-academique/` },
];

for (const emplacement of EMPLACEMENTS) {
  test.describe(`emplacement — ${emplacement.nom}`, () => {
    test.beforeEach(() => {
      test.skip(test.info().project.name !== "chromium-ordinateur", "contrôle d'emplacement : un seul parcours suffit");
    });

    for (const fichier of PAGES) {
      test(`${fichier}`, async ({ page }) => {
        const sorties = [];
        const echecs = [];
        page.on("request", (requete) => {
          const url = requete.url();
          if (!url.startsWith(emplacement.base) && !url.startsWith("data:")) sorties.push(url);
        });
        page.on("response", (reponse) => {
          if (reponse.status() >= 400) echecs.push(`${reponse.status()} ${reponse.url()}`);
        });
        page.on("pageerror", (erreur) => echecs.push(`JS : ${erreur.message}`));

        await page.goto(emplacement.base + fichier, { waitUntil: "networkidle" });
        await parcourir(page);

        expect(sorties, "requêtes hors de l'emplacement du site").toEqual([]);
        expect(echecs, "ressources absentes ou erreurs").toEqual([]);
        expect(await imagesCassees(page), "images non affichées").toEqual([]);

        const origine = new URL(emplacement.base).origin;
        const horsEmplacement = await page.$$eval(
          "a[href]",
          (liens, [origine, base]) =>
            liens.map((a) => a.href).filter((href) => href.startsWith(origine) && !href.startsWith(base)),
          [origine, emplacement.base]
        );
        expect(horsEmplacement, "liens internes sortant de l'emplacement").toEqual([]);
      });
    }
  });
}
