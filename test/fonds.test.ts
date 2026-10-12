/* Le fonds propose, il ne compte pas. Ces essais tiennent la frontière
   entre ce qu'on peut choisir et ce que les gens suivent. */

import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { parseFonds } from "../src/core/model/load.ts";
import { merge } from "../src/core/model/world.ts";
import { inscrire } from "../src/core/model/acts.ts";
import { tracked, unfollowed } from "../src/core/selectors/works.ts";
import { SCHEMA_VERSION, type Fonds, type Shard } from "../src/core/model/schema.ts";

const shard = (id: string, over: Partial<Shard> = {}): Shard => ({
  schemaVersion: SCHEMA_VERSION, user: { id, firstName: id, handle: "", circle: "mage" },
  updatedAt: "2026-10-12T10:00:00.000Z", works: {}, entries: {}, ...over,
});
const fonds = (works: Fonds["works"]): Fonds => ({ schemaVersion: 1, by: "nathan", updatedAt: "", works });
const THING = { mediaType: "film" as const, title: "The Thing", year: 1982 };

test("une œuvre du fonds s'ouvre et se choisit, mais n'est pas au corpus", () => {
  const w = merge([shard("alice")], [fonds({ "tmdb:movie:1091": THING })]);
  assert.equal(w.catalog["tmdb:movie:1091"].title, "The Thing");
  assert.deepEqual(w.fonds, ["tmdb:movie:1091"]);
  assert.deepEqual(tracked(w), []);
  assert.deepEqual(unfollowed(w), ["tmdb:movie:1091"]);
});

test("dès qu'on la suit, elle passe au corpus et quitte « personne ne les suit »", () => {
  const sh = shard("alice");
  inscrire("tmdb:movie:1091", { status: "wishlist" }, THING).apply(sh);
  const w = merge([sh], [fonds({ "tmdb:movie:1091": THING })]);
  assert.deepEqual(tracked(w), ["tmdb:movie:1091"]);
  assert.deepEqual(unfollowed(w), []);
  /* La description est partie dans le fragment : si le fonds la retire
     demain, l'inscription ne devient pas orpheline. */
  assert.deepEqual(sh.works["tmdb:movie:1091"], THING);
  assert.deepEqual(tracked(merge([sh])), ["tmdb:movie:1091"]);
});

test("quand quelqu'un porte déjà l'œuvre, sa description fait foi, pas celle du fonds", () => {
  const sh = shard("alice", { works: { "tmdb:movie:1091": { ...THING, titleFr: "The Thing (1982)" } },
    entries: { "tmdb:movie:1091": { status: "completed", rating: 9, at: "2026-10-01T00:00:00.000Z" } } });
  const w = merge([sh], [fonds({ "tmdb:movie:1091": THING })]);
  assert.equal(w.catalog["tmdb:movie:1091"].titleFr, "The Thing (1982)");
});

test("une œuvre fondue par un greffier disparaît aussi du fonds", () => {
  const g = shard("greffier", { aliases: [{ from: "tmdb:movie:1091", to: "local:film-the-thing", at: "" }] });
  const w = merge([g], [fonds({ "tmdb:movie:1091": THING })]);
  assert.deepEqual(unfollowed(w), []);
});

test("une œuvre mal décrite est écartée sans emporter les autres", () => {
  const { fonds: f, skipped } = parseFonds(JSON.stringify({ schemaVersion: 1, by: "n", works: {
    "tmdb:movie:1091": THING, "x": { mediaType: "podcast", title: "?", year: 2020 }, "y": { mediaType: "film", year: 2020 } } }));
  assert.deepEqual(Object.keys(f.works), ["tmdb:movie:1091"]);
  assert.deepEqual(skipped, ["x", "y"]);
  assert.throws(() => parseFonds(JSON.stringify({ schemaVersion: 99, works: {} })), /version 99/);
});

test("le fonds versé le 12 octobre se lit en entier, avec des identifiants de source", () => {
  const { fonds: f, skipped } = parseFonds(readFileSync("src/platform/dev/fonds.json", "utf8"));
  assert.deepEqual(skipped, []);
  const ids = Object.keys(f.works);
  assert.equal(ids.length, 43);
  for (const id of ids) assert.match(id, /^(tmdb:movie:\d+|igdb:[a-z0-9-]+|ol:OL\d+W)$/, id);
  const kinds = Object.values(f.works).map(w => w.mediaType);
  assert.equal(kinds.filter(k => k === "film").length, 24);
  assert.equal(kinds.filter(k => k === "book").length, 4);
  assert.equal(kinds.filter(k => k === "game").length, 15);
});
