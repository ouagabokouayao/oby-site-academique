// Navigation commune : état actif, sous-menus à la souris, au clavier et au
// toucher, lien d'évitement et pied de page.
const { test, expect } = require("playwright/test");
const { PAGES, HORS_MENU, RATTACHEMENTS, estPetitEcran } = require("./outils");

test.describe("état actif et pied de page", () => {
  for (const fichier of PAGES) {
    test(`${fichier} — rubrique active et pied de page`, async ({ page }) => {
      await page.goto(`/${fichier}`);
      const etat = await page.evaluate(() => ({
        groupes: [...document.querySelectorAll(".nav-list > .is-current > .nav-link")].map((a) => a.textContent.trim()),
        courants: [...document.querySelectorAll('#navigation a[aria-current="page"]')].map((a) => a.getAttribute("href")),
        pied: [...document.querySelectorAll(".site-footer a")].map((a) => a.getAttribute("href")),
      }));

      if (HORS_MENU.has(fichier)) {
        expect(etat.groupes).toEqual([]);
        expect(etat.courants).toEqual([]);
      } else if (RATTACHEMENTS[fichier]) {
        expect(etat.groupes).toEqual([RATTACHEMENTS[fichier]]);
        expect(etat.courants).toEqual([]);
      } else {
        expect(etat.groupes).toHaveLength(1);
        expect(etat.courants).toContain(fichier);
      }

      for (const lien of ["contact.html", "mentions-legales.html"]) {
        expect(etat.pied, `pied de page : ${lien}`).toContain(lien);
      }
      expect(etat.pied.some((href) => href.startsWith("mailto:"))).toBe(true);
    });
  }
});

test.describe("lien d'évitement", () => {
  test("la première tabulation atteint « Aller au contenu », qui mène au contenu", async ({ page, browserName }) => {
    test.skip(browserName === "webkit", "Safari ne tabule pas vers les liens sans réglage du système");
    await page.goto("/profil.html");
    await page.keyboard.press("Tab");
    const lien = page.locator(".skip-link");
    await expect(lien).toBeFocused();
    await expect(lien).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page.locator("main#contenu")).toBeFocused();
  });
});

test.describe("menu sur ordinateur", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(estPetitEcran(page), "menu horizontal : grands écrans uniquement");
    await page.goto("/index.html");
  });

  test("en-tête sur une ligne, sans recouvrement du logo", async ({ page }) => {
    const entete = await page.evaluate(() => ({
      hauteur: document.querySelector(".nav-list").getBoundingClientRect().height,
      chevauchement:
        document.querySelector(".brand").getBoundingClientRect().right >
        document.querySelector(".nav-list").getBoundingClientRect().left,
    }));
    expect(entete.hauteur).toBeLessThanOrEqual(48);
    expect(entete.chevauchement).toBe(false);
  });

  test("chaque sous-menu s'ouvre au survol, au premier plan et dans l'écran", async ({ page }) => {
    const largeur = page.viewportSize().width;
    const groupes = page.locator(".nav-group");
    const nombre = await groupes.count();
    expect(nombre).toBe(4);
    for (let i = 0; i < nombre; i += 1) {
      const groupe = groupes.nth(i);
      await groupe.locator(".nav-link").hover();
      const sousMenu = groupe.locator(".nav-submenu");
      await expect(sousMenu).toBeVisible();
      const etat = await sousMenu.evaluate((element) => {
        const boite = element.getBoundingClientRect();
        const dessus = document.elementFromPoint(boite.left + boite.width / 2, boite.top + Math.min(boite.height - 4, 30));
        return { gauche: boite.left, droite: boite.right, devant: Boolean(dessus) && element.contains(dessus) };
      });
      expect(etat.gauche).toBeGreaterThanOrEqual(0);
      expect(etat.droite).toBeLessThanOrEqual(largeur);
      expect(etat.devant).toBe(true);
      await page.mouse.move(5, page.viewportSize().height - 5);
      await expect(sousMenu).toBeHidden();
    }
  });

  test("le bouton ouvre le sous-menu ; un clic à l'extérieur le referme", async ({ page }) => {
    const bouton = page.locator('[aria-controls="sous-menu-profil"]');
    await bouton.click();
    await expect(bouton).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator("#sous-menu-profil")).toBeVisible();
    await page.locator("main h1").click();
    await expect(bouton).toHaveAttribute("aria-expanded", "false");
  });

  test("clavier : Entrée ouvre, Tab entre, Échap referme et rend le focus", async ({ page, browserName }) => {
    test.skip(browserName === "webkit", "Safari ne tabule pas vers les liens sans réglage du système");
    const bouton = page.locator('[aria-controls="sous-menu-profil"]');
    await bouton.focus();
    await page.keyboard.press("Enter");
    await expect(bouton).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Tab");
    await expect(page.locator("#sous-menu-profil a").first()).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(bouton).toHaveAttribute("aria-expanded", "false");
    await expect(bouton).toBeFocused();
  });

  test("clavier : quitter la rubrique par Tab referme le sous-menu", async ({ page, browserName }) => {
    test.skip(browserName === "webkit", "Safari ne tabule pas vers les liens sans réglage du système");
    const bouton = page.locator('[aria-controls="sous-menu-profil"]');
    await bouton.focus();
    await page.keyboard.press("Enter");
    const liens = await page.locator("#sous-menu-profil a").count();
    for (let i = 0; i <= liens; i += 1) await page.keyboard.press("Tab");
    await expect(bouton).toHaveAttribute("aria-expanded", "false");
  });
});

test.describe("menu sur mobile et tablette", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!estPetitEcran(page), "panneau de menu : petits écrans uniquement");
    await page.goto("/interventions.html");
    await page.locator("[data-nav-toggle]").click();
  });

  test("le panneau s'ouvre sous l'en-tête, rubrique active dépliée", async ({ page }) => {
    const menu = page.locator("#navigation");
    await expect(menu).toHaveClass(/is-open/);
    await expect(page.locator(".nav-group.is-current")).toHaveClass(/is-open/);
    await expect(page.locator(".nav-group.is-current .nav-submenu")).toBeVisible();
    const boites = await page.evaluate(() => ({
      menu: document.getElementById("navigation").getBoundingClientRect().toJSON(),
      entete: document.querySelector(".site-header").getBoundingClientRect().toJSON(),
    }));
    expect(boites.menu.top).toBeGreaterThanOrEqual(boites.entete.bottom - 1);
    expect(boites.menu.left).toBeGreaterThanOrEqual(0);
    expect(boites.menu.right).toBeLessThanOrEqual(page.viewportSize().width + 1);
  });

  test("cibles tactiles d'au moins 44 px", async ({ page }) => {
    const petites = await page.evaluate(() =>
      [...document.querySelectorAll("#navigation a, #navigation button")]
        .filter((element) => element.offsetParent && element.getBoundingClientRect().height < 44)
        .map((element) => element.textContent.trim() || element.getAttribute("aria-controls"))
    );
    expect(petites).toEqual([]);
  });

  test("toucher un bouton déplie une rubrique sans naviguer ; un lien ouvre la page", async ({ page }) => {
    const adresse = page.url();
    const bouton = page.locator('[aria-controls="sous-menu-ressources"]');
    await bouton.click();
    await expect(bouton).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator('[aria-controls="sous-menu-profil"]')).toHaveAttribute("aria-expanded", "false");
    expect(page.url()).toBe(adresse);
    await page.locator('#sous-menu-ressources a[href="mediatheque.html"]').click();
    await expect(page).toHaveURL(/mediatheque\.html$/);
  });
});
