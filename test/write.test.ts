/* Les essais du chemin d'écriture. Ce sont les plus importants du projet :
   c'est ici que « un fichier par personne, un seul écrivain » cesse d'être
   une phrase et devient du code qu'on peut mettre en défaut. */

import { strict as assert } from "node:assert";
import { test } from "node:test";

import { makeScribe, parseShard } from "../src/core/model/write.ts";
import { fakePlatform } from "../src/platform/fake.ts";
import { shardPath, SCHEMA_VERSION, type Shard } from "../src/core/model/schema.ts";

const ME = "ncarmichael";
const frag = (over: Partial<Shard> = {}): Shard => ({
  schemaVersion: SCHEMA_VERSION,
  user: { id: ME, firstName: "Nathan", handle: "Nath", circle: "mage" },
  updatedAt: "2026-10-01T20:00:00.000Z",
  works: {}, entries: {},
  ...over,
});

/** Monte un scribe sur un faux dépôt, avec un silence très court. */
function bench(seed: Shard = frag()) {
  const P = fakePlatform({ [shardPath(ME)]: JSON.stringify(seed) });
  let written: Shard | null = null;
  const states: string[] = [];
  const scribe = makeScribe({
    storage: P.storage,
    me: ME,
    quiet: 20,
    load: async () => {
      const e = (await P.storage.list()).find(x => x.path === shardPath(ME));
      if (!e) return { shard: frag(), sha: null };
      return { shard: parseShard(await P.storage.readBlob(e.sha)), sha: e.sha };
    },
    onWritten: s => { written = s; },
    onState: s => { states.push(s); },
  });
  const read = async (): Promise<Shard> => {
    const e = (await P.storage.list()).find(x => x.path === shardPath(ME))!;
    return parseShard(await P.storage.readBlob(e.sha));
  };
  return { P, scribe, read, states, get written() { return written; } };
}

const favori = (id: string) => ({
  label: "distingue une œuvre",
  apply: (s: Shard) => { s.favorites = [...(s.favorites ?? []), id]; },
});

test("une rafale ne fait qu'une seule écriture", async () => {
  const b = bench();
  let commits = 0;
  const vrai = b.P.storage.write.bind(b.P.storage);
  b.P.storage.write = async (...a: Parameters<typeof vrai>) => { commits++; return vrai(...a); };

  for (const id of ["a", "b", "c", "d"]) b.scribe.push(favori(id));
  await b.scribe.flush();

  assert.equal(commits, 1, "quatre intentions, un seul commit");
  assert.deepEqual((await b.read()).favorites, ["a", "b", "c", "d"]);
});

test("le message de commit dit ce qui s'est passé, pas « mise à jour »", async () => {
  const b = bench();
  let msg = "";
  const vrai = b.P.storage.write.bind(b.P.storage);
  b.P.storage.write = async (p, t, s, m) => { msg = m; return vrai(p, t, s, m); };
  b.scribe.push(favori("a"));
  await b.scribe.flush();
  assert.equal(msg, "distingue une œuvre");
});

test("un conflit se résout en rejouant les intentions, pas en écrasant", async () => {
  const b = bench();
  let first = true;
  const vrai = b.P.storage.write.bind(b.P.storage);
  /* On simule un autre appareil : juste avant notre écriture, le fragment
     change dans notre dos. Le SHA qu'on tenait devient périmé. */
  b.P.storage.write = async (p, t, s, m) => {
    if (first) {
      first = false;
      const e = (await b.P.storage.list()).find(x => x.path === p)!;
      const ailleurs = parseShard(await b.P.storage.readBlob(e.sha));
      ailleurs.marks = ["venu-d-ailleurs"];
      await vrai(p, JSON.stringify(ailleurs), e.sha, "écriture concurrente");
    }
    return vrai(p, t, s, m);
  };

  b.scribe.push(favori("mien"));
  await b.scribe.flush();

  const out = await b.read();
  assert.deepEqual(out.favorites, ["mien"], "notre intention est passée");
  assert.deepEqual(out.marks, ["venu-d-ailleurs"], "et l'écriture concurrente n'a PAS été écrasée");
});

test("ce qui n'est pas parti n'est pas perdu", async () => {
  const b = bench();
  const vrai = b.P.storage.write.bind(b.P.storage);
  b.P.storage.write = async () => { throw new Error("réseau coupé"); };

  b.scribe.push(favori("a"));
  await b.scribe.flush();
  assert.equal(b.scribe.state, "erreur");
  assert.equal(b.scribe.pending, 1, "l'intention est retournée dans la file");

  b.P.storage.write = vrai;
  await b.scribe.flush();
  assert.deepEqual((await b.read()).favorites, ["a"], "elle part au coup suivant");
});

test("ce qui arrive pendant l'envoi appartient au tour suivant", async () => {
  const b = bench();
  const vrai = b.P.storage.write.bind(b.P.storage);
  /* Une seule fois : un leurre qui repousse à chaque écriture se repousse
     lui-même sans fin, et c'est l'essai qui boucle, pas le code. */
  let une = true;
  b.P.storage.write = async (...a: Parameters<typeof vrai>) => {
    if (une) { une = false; b.scribe.push(favori("pendant")); }
    return vrai(...a);
  };
  b.scribe.push(favori("avant"));
  await b.scribe.flush();
  assert.deepEqual((await b.read()).favorites, ["avant"], "le premier tour n'emporte que ce qu'il avait");
  await b.scribe.flush();
  assert.deepEqual((await b.read()).favorites, ["avant", "pendant"], "et rien n'est perdu");
});

test("un fragment absent se crée à la première inscription", async () => {
  const P = fakePlatform({});
  let sha0: string | null = null;
  const scribe = makeScribe({
    storage: P.storage, me: ME, quiet: 20,
    load: async () => {
      const e = (await P.storage.list()).find(x => x.path === shardPath(ME));
      if (!e) return { shard: frag(), sha: null };
      sha0 = e.sha;
      return { shard: parseShard(await P.storage.readBlob(e.sha)), sha: e.sha };
    },
    onWritten: () => {},
  });
  scribe.push(favori("première"));
  await scribe.flush();
  const e = (await P.storage.list()).find(x => x.path === shardPath(ME));
  assert.ok(e, "le fichier existe maintenant");
  assert.equal(sha0, null, "il a bien été créé, pas remplacé");
});
