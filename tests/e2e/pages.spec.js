// Chaque page publiée : chargement, contenu essentiel, non-indexation,
// absence d'erreur, images affichées et absence de débordement horizontal.
const { test, expect } = require("playwright/test");
const {
  PAGES,
  DIRECTIVES_ROBOTS,
  surveillerErreurs,
  parcourir,
  imagesCassees,
  debordementHorizontal,
} = require("./outils");

for (const fichier of PAGES) {
  test(`${fichier} — chargement, contenu essentiel et affichage`, async ({ page }) => {
    const erreurs = surveillerErreurs(page);
    const reponse = await page.goto(`/${fichier}`, { waitUntil: "networkidle" });
    expect(reponse?.status(), "statut HTTP").toBe(200);

    const robots = await page.locator('meta[name="robots"]').getAttribute("content");
    for (const directive of DIRECTIVES_ROBOTS) {
      expect(robots, `directive ${directive}`).toContain(directive);
    }

    await expect(page.locator("html")).toHaveAttribute("lang", "fr");
    expect((await page.title()).trim().length, "titre de page").toBeGreaterThan(10);
    await expect(page.locator("h1"), "un seul titre principal").toHaveCount(1);
    expect((await page.locator("h1").innerText()).trim().length).toBeGreaterThan(3);
    await expect(page.locator("main#contenu")).toHaveCount(1);
    await expect(page.locator("header.site-header")).toBeVisible();
    await expect(page.locator("footer.site-footer")).toHaveCount(1);

    await parcourir(page);
    expect(await imagesCassees(page), "images non affichées").toEqual([]);

    const debord = await debordementHorizontal(page);
    expect(debord.defile, `débordement horizontal (${debord.fautifs.join(", ")})`).toBe(false);

    expect(erreurs, "erreurs JavaScript, console ou réseau").toEqual([]);
  });
}
