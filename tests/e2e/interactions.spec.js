// Fonctions interactives : filtres de recherche, visionneuse de la
// médiathèque, fiches de participation et sommaire des récits.
const { test, expect } = require("playwright/test");
const { lireJson, surveillerErreurs } = require("./outils");

const FILTRES = [
  { page: "mediatheque.html", formulaire: "[data-public-media-controls]", resultats: "[data-public-media-results]", vide: "[data-public-media-empty]", requete: "Monaco" },
  { page: "bibliotheque-ressources.html", formulaire: "[data-library-controls]", resultats: "[data-library-results]", vide: "[data-library-empty]", requete: "mer" },
  { page: "cartographie.html", formulaire: "[data-map-controls]", resultats: "[data-map-results]", vide: "[data-map-empty]", requete: "médiation" },
  { page: "recherche.html", formulaire: "[data-search-controls]", resultats: "[data-search-results]", vide: "[data-search-empty]", requete: "littoral" },
];

const compter = (page, selecteur) => page.locator(`${selecteur} > *`).count();

for (const filtre of FILTRES) {
  test.describe(`filtre — ${filtre.page}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/${filtre.page}`, { waitUntil: "networkidle" });
    });

    test("la saisie filtre, une recherche sans réponse l'annonce, la réinitialisation rétablit", async ({ page }) => {
      const erreurs = surveillerErreurs(page);
      const champ = page.locator(`${filtre.formulaire} input[name="q"]`);
      const initial = await compter(page, filtre.resultats);

      await champ.fill(filtre.requete);
      await expect.poll(() => compter(page, filtre.resultats)).toBeGreaterThan(0);
      const filtres = await compter(page, filtre.resultats);
      if (initial > 0) expect(filtres).toBeLessThanOrEqual(initial);

      await champ.fill("zzqxwv-aucune-reponse");
      await expect.poll(() => compter(page, filtre.resultats)).toBe(0);
      await expect(page.locator(filtre.vide)).toBeVisible();

      const reinitialiser = page.locator(`${filtre.formulaire} [type="reset"], [data-map-reset]`).first();
      if (await reinitialiser.count()) {
        await reinitialiser.click();
        await expect.poll(() => compter(page, filtre.resultats)).toBe(initial);
      }
      expect(erreurs).toEqual([]);
    });

    test("la touche Entrée ne recharge pas la page et conserve les résultats", async ({ page }) => {
      const champ = page.locator(`${filtre.formulaire} input[name="q"]`);
      await champ.fill(filtre.requete);
      await expect.poll(() => compter(page, filtre.resultats)).toBeGreaterThan(0);
      const avant = await compter(page, filtre.resultats);
      const adresse = page.url();
      await champ.press("Enter");
      await page.waitForLoadState("networkidle");
      expect(page.url(), "aucune navigation").toBe(adresse);
      await expect(champ).toHaveValue(filtre.requete);
      expect(await compter(page, filtre.resultats)).toBe(avant);
    });
  });
}

test.describe("Veille & agenda", () => {
  test("le choix d'un type filtre l'agenda, puis la réinitialisation rétablit", async ({ page }) => {
    await page.goto("/veille-agenda.html", { waitUntil: "networkidle" });
    const resultats = "[data-watch-results]";
    const initial = await compter(page, resultats);
    expect(initial).toBeGreaterThan(0);
    const choix = page.locator('[data-watch-controls] select[name="type"]');
    const valeurs = await choix.locator("option").evaluateAll((options) => options.map((o) => o.value).filter(Boolean));
    expect(valeurs.length).toBeGreaterThan(0);
    await choix.selectOption(valeurs[0]);
    await expect.poll(() => compter(page, resultats)).toBeGreaterThan(0);
    expect(await compter(page, resultats)).toBeLessThanOrEqual(initial);
  });
});

test.describe("Idées & analyses", () => {
  test("les cinq collections s'affichent et le catalogue vide est annoncé", async ({ page }) => {
    await page.goto("/idees-analyses.html", { waitUntil: "networkidle" });
    await expect(page.locator("[data-analyses-collections] > *")).toHaveCount(5);
    await expect(page.locator("[data-analyses-empty]")).toBeVisible();
    const champ = page.locator('[data-analyses-controls] input[name="q"]');
    const adresse = page.url();
    await champ.fill("mer");
    await champ.press("Enter");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toBe(adresse);
  });
});

test.describe("médiathèque — visionneuse", () => {
  test("s'ouvre en fenêtre modale, fait défiler les photos, Échap la ferme et rend le focus", async ({ page }) => {
    await page.goto("/mediatheque.html", { waitUntil: "networkidle" });
    // Le premier album qui compte plusieurs photographies.
    const visionneuse = page.locator("[data-media-lightbox]");
    const suivante = page.locator("[data-media-lightbox-next]");
    const declencheurs = page.locator(".media-lightbox-trigger");
    let declencheur = declencheurs.first();
    for (let i = 0; i < Math.min(await declencheurs.count(), 12); i += 1) {
      declencheur = declencheurs.nth(i);
      await declencheur.click();
      await expect(visionneuse).toHaveJSProperty("open", true);
      if (await suivante.isEnabled()) break;
      await page.keyboard.press("Escape");
    }
    await expect(visionneuse).toHaveJSProperty("open", true);
    expect(await visionneuse.evaluate((d) => d.matches(":modal"))).toBe(true);

    const image = page.locator("[data-media-lightbox-image]");
    await expect(image).toHaveJSProperty("complete", true);
    const premiere = await image.getAttribute("src");
    await expect(suivante).toBeEnabled();
    await suivante.click();
    await expect(image).not.toHaveAttribute("src", premiere);

    await page.keyboard.press("Escape");
    await expect(visionneuse).toHaveJSProperty("open", false);
    await expect(declencheur).toBeFocused();
  });
});

test.describe("fiches de participation", () => {
  const fiches = lireJson("assets/data/participations-oby.json");
  const publique = fiches.find((fiche) => fiche.affichage_participations !== false && (fiche.galerie || []).length > 1);
  const masquee = fiches.find((fiche) => fiche.affichage_participations === false);

  test("une fiche publique s'affiche avec sa galerie", async ({ page }) => {
    const erreurs = surveillerErreurs(page);
    await page.goto(`/participation.html?id=${publique.id}`, { waitUntil: "networkidle" });
    await expect(page.locator("[data-participation-titre]")).toHaveText(publique.titre.trim());
    await expect(page.locator("[data-participation-galerie] img")).toHaveCount(publique.galerie.length);
    expect(erreurs).toEqual([]);
  });

  test("une fiche masquée ou inconnue n'est pas lisible par son adresse", async ({ page }) => {
    for (const identifiant of [masquee.id, "fiche-inexistante"]) {
      await page.goto(`/participation.html?id=${identifiant}`, { waitUntil: "networkidle" });
      await expect(page.locator("[data-participation-titre]")).toHaveText("Participation introuvable");
      await expect(page.locator("[data-participation-contexte]")).toBeEmpty();
    }
  });
});

test.describe("parcours en récits", () => {
  test("le sommaire mène à chacun des trois récits", async ({ page }) => {
    await page.goto("/parcours-recits.html", { waitUntil: "networkidle" });
    for (const ancre of ["trajectoire", "du-droit-a-l-action", "portrait"]) {
      await page.locator(`.analysis-toc a[href="#${ancre}"]`).click();
      await expect(page).toHaveURL(new RegExp(`#${ancre}$`));
      await expect
        .poll(() => page.locator(`#${ancre}`).evaluate((element) => Math.round(element.getBoundingClientRect().top)))
        .toBeLessThan(160);
    }
    await expect(page.locator(".recit-figure img")).toHaveCount(2);
  });
});
