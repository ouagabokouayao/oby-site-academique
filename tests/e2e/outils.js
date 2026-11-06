// Outils partagés par les tests navigateur.
const fs = require("fs");
const path = require("path");

const RACINE = path.resolve(__dirname, "..", "..");

// Toutes les pages HTML publiées, à la racine du dépôt.
const PAGES = fs
  .readdirSync(RACINE)
  .filter((fichier) => fichier.endsWith(".html"))
  .sort();

// Pages hors menu et modèles de détail.
const HORS_MENU = new Set(["404.html", "mentions-legales.html"]);
const RATTACHEMENTS = { "participation.html": "Profil", "analyse.html": "Ressources" };

const DIRECTIVES_ROBOTS = ["noindex", "nofollow", "noarchive", "nosnippet"];

function lireJson(relatif) {
  return JSON.parse(fs.readFileSync(path.join(RACINE, relatif), "utf8"));
}

// Les erreurs JavaScript, les messages d'erreur de la console, les requêtes
// échouées et les réponses HTTP en erreur sont collectés pendant le test.
function surveillerErreurs(page) {
  const erreurs = [];
  page.on("pageerror", (erreur) => erreurs.push(`JS : ${erreur.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") erreurs.push(`console : ${message.text()}`);
  });
  page.on("requestfailed", (requete) => {
    const motif = requete.failure()?.errorText || "";
    // Une navigation interrompue par la suivante n'est pas une ressource absente.
    if (/ERR_ABORTED|NS_BINDING_ABORTED|cancelled/i.test(motif)) return;
    erreurs.push(`requête échouée : ${requete.url()} (${motif})`);
  });
  page.on("response", (reponse) => {
    if (reponse.status() >= 400) erreurs.push(`HTTP ${reponse.status()} : ${reponse.url()}`);
  });
  return erreurs;
}

// Fait défiler toute la page : les sections révélées au défilement et les
// images en chargement différé sont alors réellement chargées.
async function parcourir(page) {
  await page.evaluate(async () => {
    const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    for (let y = 0; y < document.documentElement.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await pause(50);
    }
    window.scrollTo(0, document.documentElement.scrollHeight);
    await pause(150);
    window.scrollTo(0, 0);
  });
  await page.waitForLoadState("networkidle");
}

// Images présentes dans le document qui ne peuvent pas être affichées. Le
// chargement différé dépend du défilement : chaque image est donc demandée
// immédiatement, puis réellement décodée. Une image absente ou corrompue
// échoue au décodage.
async function imagesCassees(page) {
  return page.evaluate(async () => {
    const images = [...document.images].filter((image) => image.getAttribute("src"));
    const echecs = await Promise.all(
      images.map(async (image) => {
        image.loading = "eager";
        try {
          await image.decode();
          return image.naturalWidth > 0 ? null : image.getAttribute("src");
        } catch {
          return image.getAttribute("src");
        }
      })
    );
    return echecs.filter(Boolean);
  });
}

async function debordementHorizontal(page) {
  return page.evaluate(() => {
    const largeur = document.documentElement.clientWidth;
    const fautifs = [...document.querySelectorAll("body *")]
      .filter((element) => {
        const boite = element.getBoundingClientRect();
        return boite.width > 0 && boite.right > largeur + 1 && getComputedStyle(element).position !== "fixed";
      })
      .filter((element) => !element.closest("[hidden], dialog:not([open])"))
      .slice(0, 5)
      .map((element) => element.tagName.toLowerCase() + (element.className ? "." + String(element.className).split(" ")[0] : ""));
    return { defile: document.documentElement.scrollWidth > largeur + 1, fautifs };
  });
}

function estPetitEcran(page) {
  return (page.viewportSize()?.width || 1440) <= 1060;
}

module.exports = {
  RACINE,
  PAGES,
  HORS_MENU,
  RATTACHEMENTS,
  DIRECTIVES_ROBOTS,
  lireJson,
  surveillerErreurs,
  parcourir,
  imagesCassees,
  debordementHorizontal,
  estPetitEcran,
};
