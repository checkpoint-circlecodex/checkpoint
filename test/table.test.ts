/* Le Tableau : qui vient en tête, comment les colonnes se groupent, et ce
   que la recherche trouve. */

import { strict as assert } from "node:assert";
import { test } from "node:test";

import { merge } from "../src/core/model/world.ts";
import { SCHEMA_VERSION, type CircleId, type Shard } from "../src/core/model/schema.ts";
import { ledger } from "../src/core/selectors/table.ts";

const D = "2026-10-01T20:00:00.000Z";
const war = { mediaType: "book" as const, title: "The Three-Body Problem", titleFr: "Le Problème à trois corps", year: 2008 };
const re = { mediaType: "game" as const, title: "Resident Evil 4", year: 2005 };

const sh = (id: string, circle: CircleId, works: Record<string, typeof war | typeof re>): Shard => ({
  schemaVersion: SCHEMA_VERSION,
  user: { id, firstName: id[0].toUpperCase() + id.slice(1), handle: id, circle },
  updatedAt: D, works,
  entries: Object.fromEntries(Object.keys(works).map(k => [k, { status: "completed" as const, rating: 8, at: D }])),
});

const w = merge([
  sh("zoe", "mage", { "b-3": war }),
  sh("anna", "mage", { "g-re": re }),
  sh("nathan", "mage", { "g-re": re }),
  sh("bob", "guerrier", { "g-re": re }),
]);

test("sa propre colonne vient en tête, puis les Ordres et les noms", () => {
  const L = ledger(w, { me: "nathan" });
  assert.deepEqual(L.people.map(p => p.id), ["nathan", "anna", "zoe", "bob"]);
});

test("sa colonne fait groupe à elle seule, même devant son propre Ordre", () => {
  const L = ledger(w, { me: "nathan" });
  assert.deepEqual(L.bands.map(b => [b.c.id, b.n, b.me]), [["mage", 1, true], ["mage", 2, false], ["guerrier", 1, false]]);
});

test("la recherche lit les deux titres, sans casse ni accents", () => {
  assert.deepEqual(ledger(w, { q: "resident" }).works, ["g-re"]);
  assert.deepEqual(ledger(w, { q: "probleme" }).works, ["b-3"], "le titre français, sans son accent");
  assert.deepEqual(ledger(w, { q: "three-body", pref: "fr" }).works, ["b-3"], "le titre original, même si l'on affiche le français");
  assert.deepEqual(ledger(w, { q: "zzz" }).works, []);
});

test("le fonds vient à part, et la recherche le filtre aussi", () => {
  const ws = merge([sh("nathan", "mage", { "g-re": re })], [{ schemaVersion: SCHEMA_VERSION, by: "nathan", updatedAt: D, works: { "b-3": war, "g-re": re } }]);
  const L = ledger(ws, { me: "nathan" });
  assert.deepEqual(L.works, ["g-re"], "suivie : au corpus");
  assert.deepEqual(L.fonds, ["b-3"], "personne ne la suit : au fonds, et une seule fois");
  assert.deepEqual(ledger(ws, { q: "resident" }).fonds, []);
});

test("les quêtes disent qui les a accomplies, et s'effacent quand on filtre par nature", () => {
  const base = sh("nathan", "mage", { "g-re": re });
  const wq = merge([
    { ...base, quests: [{ id: "q", at: D, title: "Survivre", line: "", trials: [{ rung: 3, media: ["g-re"] }] }] },
    sh("bob", "guerrier", { "b-3": war }),
  ]);
  const L = ledger(wq, { me: "nathan" });
  assert.equal(L.quests.length, 1);
  assert.deepEqual([...L.quests[0].done], ["nathan"], "Bob n'a pas achevé Resident Evil");
  assert.deepEqual(ledger(wq, { kind: "game" }).quests, [], "une quête traverse les natures");
  assert.deepEqual(ledger(wq, { q: "surv" }).quests.length, 1, "la recherche lit aussi les quêtes");
});
