/* La comparaison est la valeur ajoutée entière de l'application. Ces
   essais tiennent ce qu'elle affirme : un désaccord est vraiment le plus
   grand, une convoitise ne compte pas comme fréquentation, et « seul contre
   le reste » demande un vrai reste. */

import { strict as assert } from "node:assert";
import { test } from "node:test";

import { merge } from "../src/core/model/world.ts";
import { affinity, partisan, peaks, singularity } from "../src/core/selectors/compare.ts";
import { SCHEMA_VERSION, type CircleId, type Entry, type Shard, type Status } from "../src/core/model/schema.ts";

const at = "2026-10-01T00:00:00.000Z";
const e = (status: Status, rating: number | null): Entry => ({ status, rating, at });
const sh = (id: string, circle: CircleId, entries: Record<string, Entry>): Shard => ({
  schemaVersion: SCHEMA_VERSION, user: { id, firstName: id, handle: "", circle }, updatedAt: at,
  works: Object.fromEntries(Object.keys(entries).map(k => [k, { mediaType: "film" as const, title: k, year: 2000 }])),
  entries,
});

const w = merge([
  sh("moi", "mage", { a: e("completed", 9), b: e("completed", 4), c: e("wishlist", null), d: e("completed", 7) }),
  sh("ami", "guerrier", { a: e("completed", 8), b: e("completed", 10), c: e("completed", 10), e: e("completed", 9) }),
  sh("tiers", "guerrier", { b: e("completed", 9), d: e("completed", 8), e: e("dropped", 3) }),
]);

test("toi et X : le commun ignore les convoitises, le désaccord est le plus grand", () => {
  const a = affinity(w, "moi", "ami");
  assert.deepEqual(a.common.map(r => r.mediaId).sort(), ["a", "b"], "c est convoité de mon côté : pas fréquenté en commun");
  assert.equal(a.accord, (1 + 6) / 2);
  assert.deepEqual(a.clash, { id: "b", me: 4, them: 10, d: 6 });
  /* c : adoré par l'ami, seulement convoité par moi → à me proposer ;
     e : adoré, jamais touché par moi → aussi. */
  assert.deepEqual(a.urge.map(r => r.mediaId), ["c", "e"]);
});

test("les sommets sont calculés, du plus haut au plus bas, à partir de neuf", () => {
  assert.deepEqual(peaks(w, "ami").map(r => r.mediaId), ["b", "c", "e"]);
  assert.deepEqual(peaks(w, "moi").map(r => r.mediaId), ["a"]);
});

test("seul contre le reste : il faut deux autres jugements et un écart d'un point et demi", () => {
  /* b : moi 4, les autres 10 et 9 → écart −5,5 ; a n'a qu'un autre jugement. */
  assert.deepEqual(singularity(w, "moi"), { id: "b", mine: 4, theirs: 9.5, d: -5.5 });
  /* tiers : b à 9, les autres 4 et 10 → 7 de moyenne, écart de 2 ; d et e
     n'ont qu'un autre jugement chacun. */
  assert.deepEqual(singularity(w, "tiers"), { id: "b", mine: 9, theirs: 7, d: 2 });
  assert.deepEqual(singularity(w, "ami"), { id: "b", mine: 10, theirs: 6.5, d: 3.5 });
  const calm = merge([sh("x", "mage", { a: e("completed", 8) }), sh("y", "mage", { a: e("completed", 8) }),
                      sh("z", "mage", { a: e("completed", 9) })]);
  assert.equal(singularity(calm, "z"), null, "un point d'écart n'est pas une singularité");
});

test("ce qu'un Ordre défend : l'écart au-dessus des autres Ordres, d'un point au moins", () => {
  const p = partisan(w, "guerrier");
  assert.equal(p?.id, "b");
  assert.equal(p?.d, 9.5 - 4);
  assert.equal(partisan(w, "barde"), null);
});
