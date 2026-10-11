#!/usr/bin/env node
/* Invariant 11 — les dépendances vont dans un seul sens, et JAMAIS entre deux
   fonctions. Vérifié ici, pas par la discipline : `npm run build` passe par ce
   script, donc une violation fait échouer la construction.

   Pourquoi un script maison plutôt qu'une règle ESLint : la règle tient en
   trente lignes, le message d'erreur peut dire *pourquoi* c'est interdit, et
   le projet n'embarque pas une chaîne de lint entière pour ça. */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src");

/* Qui a le droit d'importer quoi. Le shell est à part : il construit la
   navigation depuis le registre, donc il touche les fonctions — mais par
   leur seul point de contact, `index.ts`. */
const ALLOWED = {
  platform: ["platform"],
  core:     ["core", "platform"],
  features: ["features", "core", "platform"],   // features : soi-même seulement, voir plus bas
  shell:    ["shell", "features", "core", "platform"],
};
const WHY = {
  "platform→core":      "la plateforme ne connaît rien au-dessus d'elle : elle est remplaçable",
  "platform→features":  "la plateforme ne connaît rien au-dessus d'elle : elle est remplaçable",
  "platform→shell":     "la plateforme ne connaît rien au-dessus d'elle : elle est remplaçable",
  "core→features":      "le noyau est partagé : s'il connaissait une fonction, retirer cette fonction le casserait",
  "core→shell":         "le noyau ne sait pas dans quelle coque il tourne",
  "features→shell":     "une fonction demande une surface au noyau, elle ne parle jamais à la coque",
  "feature↔feature":    "deux fonctions ne se connaissent jamais — ce qu'elles partagent monte dans le noyau (invariant 13)",
};

const files = [];
(function walk(dir){
  for (const name of readdirSync(dir)){
    const p = join(dir, name);
    if (statSync(p).isDirectory()){ walk(p); continue; }
    if (/\.(ts|svelte|js)$/.test(name)) files.push(p);
  }
})(SRC);

/* `import x from "…"`, `export … from "…"`, `import("…")` — et rien d'autre :
   une chaîne qui ressemble à un chemin dans un commentaire n'est pas un import. */
const IMPORTS = /(?:^|[\s;}])(?:import|export)\s[^;]*?from\s*["']([^"']+)["']|import\s*\(\s*["']([^"']+)["']\s*\)/gm;

const layerOf = abs => {
  const r = relative(SRC, abs);
  if (r.startsWith("..")) return null;
  return r.split("/")[0];
};
const featureOf = abs => {
  const r = relative(SRC, abs);
  return r.startsWith("features/") ? r.split("/")[1] : null;
};

const ALIAS = { "#core": "core", "#platform": "platform", "#features": "features", "#shell": "shell" };

let bad = 0;
for (const file of files){
  const from = layerOf(file);
  if (!from) continue;
  const text = readFileSync(file, "utf8");
  for (const m of text.matchAll(IMPORTS)){
    const spec = m[1] || m[2];
    if (!spec) continue;

    let target = null;
    const alias = Object.keys(ALIAS).find(a => spec === a || spec.startsWith(a + "/"));
    if (alias) target = join(SRC, ALIAS[alias], spec.slice(alias.length + 1));
    else if (spec.startsWith(".")) target = resolve(dirname(file), spec);
    else continue;                                   // paquet npm : hors sujet

    const to = layerOf(target);
    if (!to) continue;

    let fault = null;
    if (!ALLOWED[from] || !ALLOWED[from].includes(to)) fault = `${from}→${to}`;
    else if (from === "features" && to === "features" && featureOf(file) !== featureOf(target))
      fault = "feature↔feature";

    if (fault){
      bad++;
      console.error(`  ✗ ${relative(ROOT, file)}`);
      console.error(`    importe « ${spec} »  (${fault})`);
      console.error(`    ${WHY[fault] || "dépendance interdite"}\n`);
    }
  }
}

if (bad){
  console.error(`${bad} dépendance(s) interdite(s). Fonctions → Noyau → Plateforme, jamais l'inverse.`);
  process.exit(1);
}
console.log(`✓ ${files.length} fichiers, aucune dépendance à contresens`);
