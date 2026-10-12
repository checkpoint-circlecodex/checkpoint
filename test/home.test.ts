/* L'accueil : deux règles qui pourraient mentir sans qu'on le voie. */

import { strict as assert } from "node:assert";
import { test } from "node:test";

import { merge } from "../src/core/model/world.ts";
import { covetedDoneByOthers, drawLot, watchItems } from "../src/core/selectors/home.ts";
import { SCHEMA_VERSION, type Shard } from "../src/core/model/schema.ts";

const D = (d: string) => `${d}T20:00:00.000Z`;
const shard = (id: string, circle: Shard["user"]["circle"], over: Partial<Shard> = {}): Shard => ({
  schemaVersion: SCHEMA_VERSION,
  user: { id, firstName: id[0].toUpperCase() + id.slice(1), handle: id, circle },
  updatedAt: D("2026-10-01"), works: {}, entries: {}, ...over,
});
const g = (title: string) => ({ mediaType: "game" as const, title, year: 2020 });

test("le Sort tire de préférence ce dont tu n'as rien dit", () => {
  const w = merge([
    shard("nathan", "mage", { works: { a: g("A"), b: g("B") }, entries: { a: { status: "completed", rating: 8, at: D("2026-01-01") } } }),
    shard("alice", "ranger", { entries: { a: { status: "completed", rating: 9, at: D("2026-01-01") }, b: { status: "playing", rating: null, at: D("2026-01-01") } } }),
  ]);
  for (const r of [0, 0.3, 0.6, 0.99]) assert.equal(drawLot(w, "nathan", null, () => r), "b");
});

test("quand tout est déjà connu, le Sort tire quand même", () => {
  const w = merge([shard("nathan", "mage", { works: { a: g("A") }, entries: { a: { status: "completed", rating: 8, at: D("2026-01-01") } } })]);
  assert.equal(drawLot(w, "nathan", null, () => 0.5), "a");
});

test("l'encart ne dit que ce qui a bougé depuis la visite précédente", () => {
  const w = merge([
    shard("nathan", "mage"),
    shard("marion", "mage", { loge: [
      { id: "vieux", order: "mage", at: D("2026-10-01"), body: "avant" },
      { id: "neuf",  order: "mage", at: D("2026-10-08"), body: "après" },
    ] }),
  ]);
  const items = watchItems(w, "nathan", D("2026-10-05"));
  assert.deepEqual(items.map(i => i.text), ["Marion a pris la parole dans ta Loge"]);
  assert.deepEqual(watchItems(w, "nathan", D("2026-10-09")), [], "rien de neuf : l'encart disparaît");
});

test("ses propres paroles ne s'annoncent pas", () => {
  const w = merge([shard("nathan", "mage", { loge: [{ id: "x", order: "mage", at: D("2026-10-08"), body: "moi" }] })]);
  assert.deepEqual(watchItems(w, "nathan", D("2026-10-05")), []);
});

test("la Loge d'un autre Ordre ne s'annonce pas", () => {
  const w = merge([shard("nathan", "mage"), shard("theo", "guerrier", { loge: [{ id: "x", order: "guerrier", at: D("2026-10-08"), body: "…" }] })]);
  assert.deepEqual(watchItems(w, "nathan", D("2026-10-05")), []);
});

test("une quête se date par l'inscription qui l'a scellée", () => {
  const w = merge([shard("nathan", "mage", {
    works: { a: g("A") },
    entries: { a: { status: "completed", rating: 8, at: D("2026-10-07") } },
    quests: [{ id: "q", at: D("2026-01-01"), title: "La Q", line: "", trials: [{ rung: 3, media: ["a"] }] }],
  })]);
  assert.deepEqual(watchItems(w, "nathan", D("2026-10-05")).map(i => i.text), ["Tu as accompli « La Q »"]);
  assert.deepEqual(watchItems(w, "nathan", D("2026-10-08")), [], "scellée avant la visite précédente : déjà dite");
});

test("sans visite précédente, l'encart se tait — il ne décrit qu'un écart", () => {
  const w = merge([shard("nathan", "mage"), shard("marion", "mage", { loge: [{ id: "x", order: "mage", at: D("2026-10-08"), body: "…" }] })]);
  assert.deepEqual(watchItems(w, "nathan", ""), []);
});

test("une convoitise que d'autres ont achevée depuis devient une conversation possible", () => {
  const w = merge([
    shard("nathan", "mage", { works: { a: g("A") }, entries: { a: { status: "wishlist", rating: null, at: D("2026-09-01") } } }),
    shard("alice", "ranger", { entries: { a: { status: "completed", rating: 9, at: D("2026-09-20") } } }),
    shard("theo", "guerrier", { entries: { a: { status: "completed", rating: 7, at: D("2026-08-01") } } }),
  ]);
  const c = covetedDoneByOthers(w, "nathan");
  assert.equal(c.length, 1);
  assert.deepEqual(c[0].by.map(x => x.personId), ["alice"], "Théo l'avait achevée AVANT : ce n'est pas nouveau");
});
