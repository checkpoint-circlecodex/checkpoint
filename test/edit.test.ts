/* Modifier son inscription. Chacun écrit dans son fragment ; ces essais
   tiennent ce qui se passe quand plusieurs en ont dit quelque chose. */

import { strict as assert } from "node:assert";
import { test } from "node:test";

import { merge } from "../src/core/model/world.ts";
import { accompagner, avancer, categoriser, identity, inscrire, poserJaquette, refaire, retirerInscription } from "../src/core/model/acts.ts";
import { tracked } from "../src/core/selectors/works.ts";
import { SCHEMA_VERSION, type Shard, type Work } from "../src/core/model/schema.ts";

const THING: Work = { mediaType: "film", title: "The Thing", year: 1982 };
const sh = (id: string): Shard => ({ schemaVersion: SCHEMA_VERSION, user: { id, firstName: id, handle: "", circle: "mage" },
  updatedAt: "", works: {}, entries: {} });
const run = (s: Shard, ...ms: { apply: (s: Shard) => void }[]) => { for (const m of ms) m.apply(s); return s; };
const wait = () => new Promise(r => setTimeout(r, 3));

test("la jaquette la plus récente l'emporte, pour tout le monde, et une vide la retire", async () => {
  const a = run(sh("a"), inscrire("t", { status: "completed" }, THING), poserJaquette("t", "https://img/a.jpg"));
  await wait();
  const b = run(sh("b"), inscrire("t", { status: "completed" }, THING), poserJaquette("t", "https://img/b.jpg"));
  assert.equal(merge([a, b]).catalog.t.cover, "https://img/b.jpg");
  assert.equal(merge([b, a]).catalog.t.cover, "https://img/b.jpg", "l'ordre des fichiers n'y change rien");
  await wait();
  run(a, poserJaquette("t", ""));
  assert.equal(merge([a, b]).catalog.t.cover, undefined);
});

test("les catégories s'additionnent ; on ne retire pas celle d'un autre", () => {
  const a = run(sh("a"), inscrire("t", { status: "completed" }, THING), categoriser("t", ["Horreur"]));
  const b = run(sh("b"), inscrire("t", { status: "completed" }, THING), categoriser("t", ["Science-fiction"]));
  assert.deepEqual(merge([a, b]).catalog.t.genres?.sort(), ["Horreur", "Science-fiction"]);
  run(a, categoriser("t", []));
  assert.deepEqual(merge([a, b]).catalog.t.genres, ["Science-fiction"]);
});

test("on recopie l'identité seule, jamais la fiche sommée", () => {
  const other = run(sh("o"), inscrire("t", { status: "completed" }, { ...THING, genres: ["Horreur"] }));
  /* Et inscrire une œuvre du catalogue n'en recopie que l'identité. */
  const late = run(sh("l"), inscrire("t", { status: "wishlist" }, identity(merge([other]).catalog.t)));
  assert.deepEqual(late.works.t, THING);
  const w = merge([other]);
  const me = run(sh("me"), categoriser("t", ["Thriller"], w.catalog.t));
  const { genresAt, ...rest } = me.works.t;
  assert.ok(genresAt, "les catégories sont datées : une correction de greffier les remettra à zéro");
  assert.deepEqual(rest, { mediaType: "film", title: "The Thing", year: 1982, genres: ["Thriller"] },
    "« Horreur » est à l'autre : elle ne retombe pas dans mon fichier");
});

test("avancer, être à plusieurs, refaire", () => {
  const s = run(sh("a"), inscrire("g", { status: "playing" }, { mediaType: "game", title: "Elden Ring", year: 2022 }));
  run(s, avancer("g", "hours", 42), accompagner("g", ["b", "c", "b"]), refaire("g"), refaire("g"));
  assert.deepEqual(s.entries.g.progress, { unit: "hours", value: 42 });
  assert.deepEqual(s.entries.g.with, ["b", "c"]);
  assert.equal(s.entries.g.plays, 3);
  run(s, avancer("g", "hours", null), accompagner("g", []));
  assert.equal(s.entries.g.progress, undefined);
  assert.equal(s.entries.g.with, undefined);
});

test("retirer de son registre n'enlève l'œuvre du corpus que si personne d'autre ne la suit", () => {
  const a = run(sh("a"), inscrire("t", { status: "completed" }, THING));
  a.favorites = ["t"];
  const b = run(sh("b"), inscrire("t", { status: "wishlist" }, THING));
  run(a, retirerInscription("t"));
  assert.equal(a.entries.t, undefined);
  assert.equal(a.works.t, undefined);
  assert.deepEqual(a.favorites, []);
  assert.deepEqual(tracked(merge([a, b])), ["t"], "b la suit encore");
  run(b, retirerInscription("t"));
  assert.deepEqual(tracked(merge([a, b])), []);
});

test("on retire son propre message ; une réponse qui le citait le dit", async () => {
  const { parler, retirerMessage } = await import("../src/core/model/acts.ts");
  const a = run(sh("a"), parler("mage", "Premier"));
  const id = a.loge![0].id;
  const b = run(sh("b"), parler("mage", "Je réponds", undefined, id));
  run(a, retirerMessage(id));
  const w = merge([a, b]);
  assert.deepEqual(w.posts.map(p => p.body), ["Je réponds"]);
  assert.equal(w.posts[0].replyTo, id, "la réponse garde sa trace : l'écran dira « message retiré »");
});

test("retoucher une planche garde son identifiant et sa date de plantation", async () => {
  const { modifierQuete, ouvrirQuete } = await import("../src/core/model/acts.ts");
  const s = run(sh("a"), ouvrirQuete({ id: "q1", at: "2026-01-01T00:00:00.000Z", title: "Istari", line: "", trials: [{ rung: 3, media: ["t"] }] }));
  run(s, modifierQuete({ id: "q1", at: "2099-01-01T00:00:00.000Z", title: "Les Istari", line: "Cinq mages", trials: [{ rung: 2, media: ["t", "u"] }] }));
  assert.deepEqual(s.quests, [{ id: "q1", at: "2026-01-01T00:00:00.000Z", title: "Les Istari", line: "Cinq mages", trials: [{ rung: 2, media: ["t", "u"] }] }]);
});

test("un greffier réassigne les catégories : tout ce qui précède s'efface, ce qui suit s'ajoute", async () => {
  const { corriger } = await import("../src/core/model/acts.ts");
  const a = run(sh("a"), inscrire("t", { status: "completed" }, THING), categoriser("t", ["Romance"]));
  await wait();
  const g = run(sh("g"), corriger("t", { genres: ["Horreur", "Science-fiction"] }, ""));
  assert.deepEqual(merge([a, g]).catalog.t.genres?.sort(), ["Horreur", "Science-fiction"], "« Romance » était fausse : elle s'en va");
  await wait();
  const b = run(sh("b"), inscrire("t", { status: "completed" }, THING), categoriser("t", ["Thriller"]));
  assert.deepEqual(merge([a, g, b]).catalog.t.genres?.sort(), ["Horreur", "Science-fiction", "Thriller"], "posée après : elle s'ajoute");
  await wait();
  run(g, corriger("t", { cover: "https://img/g.jpg" }, ""));
  assert.equal(merge([a, g, b]).catalog.t.cover, "https://img/g.jpg", "la jaquette du greffier concourt, la plus récente l'emporte");
});

test("le cadrage voyage avec sa jaquette, et un cadrage absurde est ignoré", async () => {
  const { frameOf } = await import("../src/core/model/world.ts");
  const { frameStyle } = await import("../src/core/ui/frame.ts");
  const a = run(sh("a"), inscrire("t", { status: "completed" }, THING), poserJaquette("t", "https://img/a.jpg", undefined, { x: .1, y: .2, w: .5 }));
  assert.deepEqual(merge([a]).catalog.t.coverFrame, { x: .1, y: .2, w: .5 });
  await wait();
  const b = run(sh("b"), inscrire("t", { status: "completed" }, THING), poserJaquette("t", "https://img/b.jpg"));
  assert.equal(merge([a, b]).catalog.t.cover, "https://img/b.jpg");
  assert.equal(merge([a, b]).catalog.t.coverFrame, undefined, "la jaquette de b n'a pas de cadrage : celui de a ne la suit pas");
  for (const bad of [{ x: .8, y: 0, w: .5 }, { x: 0, y: 0, w: 0 }, { x: -1, y: 0, w: .5 }, { x: 0, y: 0, w: 2 }, { x: "1", y: 0, w: 1 }, null])
    assert.equal(frameOf(bad), undefined, JSON.stringify(bad));
  /* Le style exact : la fenêtre de 50 % commence à 10 % et 20 % de l'image. */
  assert.match(frameStyle({ x: .1, y: .2, w: .5 }), /width:200\.0000%;transform:translate\(-10\.0000%,-20\.0000%\)/);
  assert.equal(frameStyle(null), "");
});
