// Accessibilité. axe-core contrôle chaque page selon les critères WCAG 2.2
// niveaux A et AA qu'il sait évaluer automatiquement ; les contrôles du
// clavier et du focus complètent ce qu'un moteur automatique ne voit pas.
const fs = require("fs");
const { test, expect } = require("playwright/test");
const { PAGES, parcourir } = require("./outils");

let SOURCE_AXE = null;
try {
  SOURCE_AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
} catch {
  SOURCE_AXE = null;
}

const CRITERES = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

test.describe("axe-core, WCAG 2.2 AA", () => {
  test.skip(!SOURCE_AXE, "axe-core n'est pas installé dans cet environnement (npm install)");
  test.use({ bypassCSP: true });

  for (const fichier of PAGES) {
    test(`${fichier} — aucune violation`, async ({ page }) => {
      const projet = test.info().project.name;
      test.skip(!["chromium-ordinateur", "chromium-mobile"].includes(projet), "axe : ordinateur et mobile Chromium");
      await page.goto(`/${fichier}`, { waitUntil: "networkidle" });
      await parcourir(page);
      // Les sections apparaissent en fondu au défilement : on attend leur état
      // final pour que les contrastes soient mesurés sur l'affichage réel.
      await page.evaluate(() => document.querySelectorAll(".reveal").forEach((element) => element.classList.add("is-visible")));
      await page.waitForTimeout(900);
      await page.evaluate(SOURCE_AXE);
      const resultats = await page.evaluate(
        (criteres) => window.axe.run(document, { runOnly: { type: "tag", values: criteres }, resultTypes: ["violations"] }),
        CRITERES
      );
      const violations = resultats.violations.map((violation) => ({
        regle: violation.id,
        impact: violation.impact,
        aide: violation.help,
        cibles: violation.nodes.slice(0, 5).map((noeud) => noeud.target.join(" ")),
        occurrences: violation.nodes.length,
      }));
      await test.info().attach("axe.json", { body: JSON.stringify(violations, null, 2), contentType: "application/json" });
      expect(violations).toEqual([]);
    });
  }
});

test.describe("clavier et focus", () => {
  test("chaque élément atteint au clavier porte un focus visible", async ({ page, browserName }) => {
    test.skip(browserName === "webkit", "Safari ne tabule pas vers les liens sans réglage du système");
    const fautes = [];
    for (const fichier of ["index.html", "profil.html", "contact.html", "mediatheque.html", "parcours-recits.html"]) {
      await page.goto(`/${fichier}`, { waitUntil: "networkidle" });
      for (let i = 0; i < 25; i += 1) {
        await page.keyboard.press("Tab");
        const etat = await page.evaluate(() => {
          const element = document.activeElement;
          if (!element || element === document.body) return null;
          const style = getComputedStyle(element);
          const boite = element.getBoundingClientRect();
          const visible = boite.width > 0 && boite.height > 0;
          const anneau = (style.outlineStyle !== "none" && parseFloat(style.outlineWidth) > 0) || style.boxShadow !== "none";
          return { nom: (element.textContent || element.getAttribute("aria-label") || element.tagName).trim().slice(0, 40), visible, anneau };
        });
        if (etat && (!etat.visible || !etat.anneau)) fautes.push(`${fichier} : ${etat.nom}`);
      }
    }
    expect(fautes).toEqual([]);
  });

  test("les mouvements sont réduits quand le visiteur le demande", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/index.html", { waitUntil: "networkidle" });
    const duree = await page.evaluate(() => {
      const element = document.querySelector(".reveal") || document.querySelector("a");
      const style = getComputedStyle(element);
      return parseFloat(style.transitionDuration) + parseFloat(style.animationDuration || "0");
    });
    expect(duree).toBeLessThanOrEqual(0.01);
  });

  test("le zoom à 200 % garde le menu utilisable, sans débordement horizontal", async ({ browser }) => {
    const contexte = await browser.newContext({ viewport: { width: 640, height: 400 }, deviceScaleFactor: 2 });
    const page = await contexte.newPage();
    await page.goto("/profil.html", { waitUntil: "networkidle" });
    await page.locator("[data-nav-toggle]").click();
    await expect(page.locator("#navigation")).toHaveClass(/is-open/);
    const debord = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    expect(debord).toBe(false);
    await contexte.close();
  });
});
