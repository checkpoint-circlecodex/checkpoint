/* L'ouverture, et surtout sa résistance. « Un fichier par personne » achète
   une propriété — **un fragment cassé n'emporte pas les autres** — et une
   propriété qu'on n'essaie pas n'est pas achetée. */

import { strict as assert } from "node:assert";
import { test } from "node:test";

import { openWorld } from "../src/core/model/load.ts";
import { fakePlatform } from "../src/platform/fake.ts";
import { SCHEMA_VERSION } from "../src/core/model/schema.ts";

const frag = (id: string, over: object = {}) => JSON.stringify({
  schemaVersion: SCHEMA_VERSION,
  user: { id, firstName: id, handle: id, circle: "mage" },
  updatedAt: "2026-10-01T20:00:00.000Z",
  works: {}, entries: {},
  ...over,
});

test("un fragment illisible ne fait pas tomber le cercle", async () => {
  const P = fakePlatform({
    "data/alice.json": frag("alice"),
    "data/bob.json": "{ ceci n'est pas du JSON",
    "data/carl.json": frag("carl"),
  });
  const { world, problems } = await openWorld(P.storage, P.cache);

  assert.deepEqual(Object.keys(world.people).sort(), ["alice", "carl"]);
  assert.equal(problems.length, 1);
  assert.equal(problems[0].path, "data/bob.json");
});

test("seuls les fragments sont lus — le reste du dépôt est ignoré", async () => {
  const P = fakePlatform({
    "README.md": "# tracker-data",
    "meta/members.json": "[]",
    "data/alice.json": frag("alice"),
    "data/vieux/alice.json": frag("alice"),   // pas à la racine de data/
  });
  const { world, problems } = await openWorld(P.storage, P.cache);
  assert.deepEqual(Object.keys(world.people), ["alice"]);
  assert.equal(problems.length, 0, "un fichier hors périmètre n'est pas un ennui, il n'est pas lu");
});

test("la deuxième ouverture ne retélécharge rien", async () => {
  const P = fakePlatform({ "data/alice.json": frag("alice"), "data/bob.json": frag("bob") });

  const first = await openWorld(P.storage, P.cache);
  assert.equal(first.fetched, 2);
  assert.equal(first.fromCache, 0);

  const second = await openWorld(P.storage, P.cache);
  assert.equal(second.fetched, 0, "un blob est adressé par son contenu : rien à revérifier");
  assert.equal(second.fromCache, 2);
});

test("un fragment qui change est le seul à être relu", async () => {
  const P = fakePlatform({ "data/alice.json": frag("alice"), "data/bob.json": frag("bob") });
  await openWorld(P.storage, P.cache);

  const tree = await P.storage.list();
  const bob = tree.find(e => e.path === "data/bob.json")!;
  await P.storage.write("data/bob.json", frag("bob", { favorites: [] }), bob.sha, "mise à jour");

  const third = await openWorld(P.storage, P.cache);
  assert.equal(third.fetched, 1, "un seul blob téléchargé");
  assert.equal(third.fromCache, 1);
});
