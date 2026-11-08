// Résumé lisible du rapport JSON de Playwright, pour le journal et pour la
// page de synthèse de GitHub Actions (GITHUB_STEP_SUMMARY).
//
//   node tests/resume-resultats.js [test-results/resultats.json]
const fs = require("fs");

const chemin = process.argv[2] || "test-results/resultats.json";
if (!fs.existsSync(chemin)) {
  console.log(`Rapport absent : ${chemin}`);
  process.exit(0);
}
const rapport = JSON.parse(fs.readFileSync(chemin, "utf8"));

const parProjet = {};
const echecs = [];
const parcourir = (suite, titres = []) => {
  const chemins = suite.title ? [...titres, suite.title] : titres;
  for (const spec of suite.specs || []) {
    for (const t of spec.tests || []) {
      const projet = t.projectName;
      const etat = t.status === "skipped" ? "ignorés" : t.status === "expected" ? "réussis" : t.status === "flaky" ? "instables" : "échoués";
      parProjet[projet] ||= { réussis: 0, échoués: 0, ignorés: 0, instables: 0 };
      parProjet[projet][etat] += 1;
      if (etat === "échoués" || etat === "instables") {
        const erreur = (t.results || []).flatMap((r) => r.errors || []).map((e) => (e.message || "").split("\n")[0])[0] || "";
        echecs.push(`| ${projet} | ${[...chemins, spec.title].slice(1).join(" › ")} | ${erreur.replace(/\|/g, "/").slice(0, 160)} |`);
      }
    }
  }
  for (const enfant of suite.suites || []) parcourir(enfant, chemins);
};
for (const suite of rapport.suites || []) parcourir(suite);

const totaux = Object.values(parProjet).reduce(
  (acc, v) => ({ réussis: acc.réussis + v.réussis, échoués: acc.échoués + v.échoués, ignorés: acc.ignorés + v.ignorés, instables: acc.instables + v.instables }),
  { réussis: 0, échoués: 0, ignorés: 0, instables: 0 }
);

const lignes = [
  "## Tests navigateur",
  "",
  `**${totaux.réussis + totaux.échoués + totaux.instables} tests exécutés** — ${totaux.réussis} réussis, ${totaux.échoués} échoués, ${totaux.instables} instables, ${totaux.ignorés} ignorés (hors périmètre du projet).`,
  "",
  "| Projet | Réussis | Échoués | Instables | Ignorés |",
  "|---|---|---|---|---|",
  ...Object.entries(parProjet).map(([p, v]) => `| ${p} | ${v.réussis} | ${v.échoués} | ${v.instables} | ${v.ignorés} |`),
];
if (echecs.length) {
  lignes.push("", "### Échecs", "", "| Projet | Test | Première erreur |", "|---|---|---|", ...echecs);
}
const texte = lignes.join("\n") + "\n";
console.log(texte);
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, texte);
