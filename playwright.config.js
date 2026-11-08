// Configuration des tests navigateur du site OBY.
//
// Le site est statique : un serveur HTTP local le sert tel qu'il sera publié.
// Les moteurs se choisissent par OBY_MOTEURS (« chromium », ou
// « chromium,firefox,webkit » en intégration continue). Le projet « captures »
// produit des captures pleine page à cinq largeurs ; il ne vérifie rien.
const { defineConfig, devices } = require("playwright/test");

const PORT = Number(process.env.OBY_PORT || 4173);
const MOTEURS = (process.env.OBY_MOTEURS || "chromium").split(",").map((m) => m.trim());
const HORS_CAPTURES = /captures\.spec\.js/;

const projets = [
  {
    name: "chromium-ordinateur",
    testIgnore: HORS_CAPTURES,
    use: { browserName: "chromium", viewport: { width: 1440, height: 900 } },
  },
  {
    name: "chromium-tablette",
    testIgnore: HORS_CAPTURES,
    use: { browserName: "chromium", viewport: { width: 768, height: 1024 }, hasTouch: true, isMobile: true },
  },
  {
    name: "chromium-mobile",
    testIgnore: HORS_CAPTURES,
    use: { browserName: "chromium", viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 },
  },
];

if (MOTEURS.includes("firefox")) {
  projets.push({
    name: "firefox-ordinateur",
    testIgnore: HORS_CAPTURES,
    use: { browserName: "firefox", viewport: { width: 1366, height: 800 } },
  });
}

if (MOTEURS.includes("webkit")) {
  projets.push({
    name: "webkit-mobile",
    testIgnore: HORS_CAPTURES,
    use: { ...devices["iPhone 13"] },
  });
}

projets.push({
  name: "captures",
  testMatch: HORS_CAPTURES,
  use: { browserName: "chromium" },
});

module.exports = defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: process.env.CI ? 2 : 4,
  timeout: 60_000,
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "playwright-report" }],
    ["json", { outputFile: "test-results/resultats.json" }],
  ],
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  // Deux serveurs : le site à la racine, comme sur www.ouagabokouayao.com,
  // et sous /oby-site-academique/, comme sur l'adresse GitHub Pages d'origine.
  webServer: [
    {
      command: `python3 -m http.server ${PORT} --bind 127.0.0.1`,
      url: `http://127.0.0.1:${PORT}/index.html`,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
      stdout: "ignore",
      stderr: "ignore",
    },
    {
      command: `python3 tests/serveur_sous_chemin.py ${PORT + 1} /oby-site-academique/`,
      url: `http://127.0.0.1:${PORT + 1}/oby-site-academique/index.html`,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
      stdout: "ignore",
      stderr: "ignore",
    },
  ],
  projects: projets,
});
