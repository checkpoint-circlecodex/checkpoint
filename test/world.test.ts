/* Les essais du noyau. Ils vivent hors de `src/` : ce ne sont ni une fonction,
   ni le noyau, ni la plateforme, et le vérificateur de couches n'aurait pas eu
   de couche où les ranger.

   Ils n'ont besoin de rien — ni réseau, ni jeton, ni navigateur. Le noyau est
   une fonction pure de ce qu'on lui donne, et c'est tout l'intérêt. */

import { strict as assert } from "node:assert";
import { test } from "node:test";

import { merge, canon } from "../src/core/model/world.ts";
import { migrate, SchemaTooNew } from "../src/core/model/migrate.ts";
import { SCHEMA_VERSION, type Shard } from "../src/core/model/schema.ts";
import { questScore, questHolders, reached } from "../src/core/selectors/quests.ts";
import { household, kinLink } from "../src/core/selectors/kin.ts";
import { suspected } from "../src/core/selectors/greffe.ts";
import { magnum, favsOf } from "../src/core/selectors/people.ts";
import { tracked } from "../src/core/selectors/works.ts";

const D = (d: string) => `${d}T20:00:00.000Z`;

const shard = (id: string, over: Partial<Shard> = {}): Shard => ({
  schemaVersion: SCHEMA_VERSION,
  user: { id, firstName: id[0].toUpperCase() + id.slice(1), handle: id, circle: "mage" },
  updatedAt: D("2026-10-01"),
  works: {}, entries: {},
  ...over,
});

const hollow = { mediaType: "game" as const, title: "Hollow Knight", year: 2017 };
const outer  = { mediaType: "game" as const, title: "Outer Wilds",   year: 2019 };

test("un alias se replie à la lecture, et ne touche aucun fichier", () => {
  const w = merge([
    shard("greffier", {
      works: { "g-outer": outer },
      entries: { "g-outer": { status: "completed", rating: 9, at: D("2026-09-01") } },
      aliases: [{ from: "g-ow", to: "g-outer", at: D("2026-09-21") }],
    }),
    shard("ines", {
      works: { "g-ow": { ...outer, manual: true } },
      entries: { "g-ow": { status: "playing", rating: null, at: D("2026-10-08") } },
    }),
  ]);

  assert.equal(w.rows.filter(r => r.mediaId === "g-ow").length, 0, "plus rien sous l'ancien identifiant");
  assert.equal(w.rows.filter(r => r.mediaId === "g-outer").length, 2, "les deux inscriptions comptent pour l'œuvre survivante");
  assert.ok(w.catalog["g-ow"], "l'œuvre fondue garde son titre : on ne supprime rien");
  assert.ok(!tracked(w).includes("g-ow"), "mais elle ne se montre plus");
});

test("une même personne qui tenait les deux entrées n'en garde que la plus récente", () => {
  const w = merge([
    shard("greffier", { aliases: [{ from: "g-ow", to: "g-outer", at: D("2026-09-21") }] }),
    shard("nour", {
      works: { "g-outer": outer, "g-ow": { ...outer, manual: true } },
      entries: {
        "g-outer": { status: "wishlist", rating: null, at: D("2026-01-01") },
        "g-ow":    { status: "completed", rating: 8, at: D("2026-10-08") },
      },
    }),
  ]);
  const mine = w.rows.filter(r => r.personId === "nour");
  assert.equal(mine.length, 1, "une seule inscription, pas deux");
  assert.equal(mine[0].status, "completed", "et c'est la plus récente qui reste");
});

test("une boucle d'alias ne pend pas la page", () => {
  const a = { "x": "y", "y": "x" };
  assert.ok(["x", "y"].includes(canon(a, "x")), "canon s'arrête au lieu de tourner");
});

test("un favori ne compte que s'il désigne une œuvre connue", () => {
  const w = merge([shard("nathan", {
    works: { "g-hollow": hollow },
    entries: { "g-hollow": { status: "mastered", rating: 10, at: D("2026-06-01") } },
    favorites: ["g-hollow", "g-fantome"],
  })]);
  assert.deepEqual(favsOf(w, "nathan"), ["g-hollow"]);
});

test("le magnum opus somme des déclarations, pas des notes", () => {
  const base = (id: string, favs: string[], rating: number): Shard => shard(id, {
    works: { "g-hollow": hollow, "g-outer": outer },
    entries: {
      "g-hollow": { status: "completed", rating, at: D("2026-06-01") },
      "g-outer":  { status: "completed", rating: 10, at: D("2026-06-01") },
    },
    favorites: favs,
  });
  /* Outer Wilds est mieux noté par tout le monde ; Hollow Knight est déclaré
     par les deux. C'est la déclaration qui gagne, et c'est le but. */
  const w = merge([base("a", ["g-hollow"], 6), base("b", ["g-hollow"], 7)]);
  assert.equal(magnum(w, "mage")[0].id, "g-hollow");
});

test("les paliers de quête sont monotones — renoncer compte comme entrepris", () => {
  const w = merge([shard("sam", {
    works: { "g-hollow": hollow },
    entries: { "g-hollow": { status: "dropped", rating: 4, at: D("2026-02-02") } },
    quests: [{ id: "q", at: D("2026-01-01"), title: "T", line: "", trials: [{ rung: 2, media: ["g-hollow"] }] }],
  })]);
  assert.equal(reached(w, "sam", "g-hollow"), 2, "renoncé vaut entrepris");
  assert.equal(questScore(w, w.quests[0], "sam").ok, true);
});

test("« suspendu » n'accomplit pas un palier d'achèvement", () => {
  const w = merge([shard("sam", {
    works: { "g-hollow": hollow },
    entries: { "g-hollow": { status: "paused", rating: null, at: D("2026-02-02") } },
    quests: [{ id: "q", at: D("2026-01-01"), title: "T", line: "", trials: [{ rung: 3, media: ["g-hollow"] }] }],
  })]);
  assert.equal(questScore(w, w.quests[0], "sam").ok, false);
});

test("une quête sans aucune œuvre connue n'est accomplie par personne", () => {
  const w = merge([shard("sam", {
    quests: [{ id: "q", at: D("2026-01-01"), title: "T", line: "", trials: [{ rung: 1, media: ["g-fantome"] }] }],
  })]);
  assert.equal(questHolders(w, w.quests[0]).length, 0, "zéro sur zéro n'est pas un accomplissement");
});

test("une parenté déclarée d'un seul côté n'existe pas", () => {
  const w = merge([
    shard("jules", { kin: [{ id: "eliot", rel: "fils" }] }),
    shard("eliot"),
  ]);
  assert.equal(kinLink(w, "jules", "eliot"), null);
  assert.equal(household(w, "jules").size, 1);
});

test("une parenté déclarée à contresens des deux côtés n'existe pas non plus", () => {
  const w = merge([
    shard("jules", { kin: [{ id: "eliot", rel: "fils" }] }),
    shard("eliot", { kin: [{ id: "jules", rel: "fils" }] }),   // les deux se disent père
  ]);
  assert.equal(kinLink(w, "jules", "eliot"), null, "« mon fils » doit appeler « mon père »");
});

test("la maisonnée se lit pareil par quelque porte qu'on entre", () => {
  const w = merge([
    shard("jules", { kin: [{ id: "eliot", rel: "fils" }, { id: "nina", rel: "fille" }] }),
    shard("eliot", { kin: [{ id: "jules", rel: "pere" }] }),
    shard("nina",  { kin: [{ id: "jules", rel: "pere" }] }),
  ]);
  const a = household(w, "jules"), b = household(w, "nina");
  assert.deepEqual(a.ids, b.ids, "le même foyer, dans le même ordre");
  assert.deepEqual(a.ids, ["Jules", "Eliot", "Nina"].map(s => s.toLowerCase()), "l'aîné d'abord, puis les prénoms");
  assert.equal(a.size, 3);
});

test("le doublon suggéré garde l'entrée qui n'a pas été saisie à la main", () => {
  const w = merge([shard("nour", {
    works: { "g-outer": outer, "g-ow": { ...outer, manual: true } },
    entries: {},
  })]);
  const s = suspected(w);
  assert.equal(s.length, 1);
  assert.equal(s[0].keep, "g-outer");
  assert.deepEqual(s[0].drop, ["g-ow"]);
});

test("un fragment plus récent que l'application se refuse au lieu de s'amputer", () => {
  assert.throws(() => migrate({ schemaVersion: SCHEMA_VERSION + 1, user: {}, works: {}, entries: {} }),
    (e: Error) => e instanceof SchemaTooNew);
});
