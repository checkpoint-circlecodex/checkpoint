/* Le Greffe. Deux choses ne doivent jamais mentir : qui frappe à la porte,
   et ce qui a été fait. */

import { strict as assert } from "node:assert";
import { test } from "node:test";

import { knockBody, knockTitle, parseKnock, KNOCK_MARK } from "../src/platform/knock.ts";
import { fakePlatform } from "../src/platform/fake.ts";
import { merge } from "../src/core/model/world.ts";
import { defaire, fondre } from "../src/core/model/acts.ts";
import { SCHEMA_VERSION, type Shard } from "../src/core/model/schema.ts";

const shard = (id: string, over: Partial<Shard> = {}): Shard => ({
  schemaVersion: SCHEMA_VERSION,
  user: { id, firstName: id, handle: id, circle: "mage" },
  updatedAt: "2026-10-01T20:00:00.000Z", works: {}, entries: {}, ...over,
});

test("une demande se relit telle qu'elle a été écrite", () => {
  const body = knockBody({ firstName: "Sacha", vouchedName: "Marion", vouchedAs: "ami", discord: "sacha.b" });
  assert.ok(body.startsWith(KNOCK_MARK));
  assert.deepEqual(parseKnock(body), { firstName: "Sacha", vouchedName: "Marion", vouchedAs: "ami", discord: "sacha.b" });
  assert.equal(knockTitle("sachab"), "Demande d'adhésion — @sachab");
});

test("une issue ordinaire du dépôt public n'arrive pas au guichet", () => {
  assert.equal(parseKnock("Le bouton Inscrire ne marche pas sous Linux."), null);
  assert.equal(parseKnock(null), null);
});

test("les champs vides restent vides, ils ne deviennent pas « undefined »", () => {
  const f = parseKnock(knockBody({ firstName: "", vouchedName: "", vouchedAs: "", discord: "" }));
  assert.deepEqual(f, { firstName: "", vouchedName: "", vouchedAs: "", discord: "" });
});

test("le corps ne peut pas mentir sur qui frappe : l'auteur vient de GitHub", async () => {
  /* Le faux rend ce qu'on lui donne ; le vrai lit `issue.user.login`. Ce que
     l'essai fixe, c'est que le type porte un `login` séparé des champs du
     corps — aucun champ du corps ne s'appelle `login`. */
  const f = parseKnock(knockBody({ firstName: "x", vouchedName: "y", vouchedAs: "z", discord: "w" }))!;
  assert.ok(!("login" in f), "le corps ne fournit jamais l'identité de qui frappe");
});

test("le journal se somme depuis chaque greffier, et dit qui a agi", () => {
  const a = shard("nathan"), b = shard("marion");
  fondre("g-ow", "g-outer").apply(a);
  b.journal = [{ at: "2026-09-12T20:46:00.000Z", kind: "admission", what: "efaure", note: "Éliot" }];
  const w = merge([a, b]);
  assert.equal(w.journal.length, 2);
  assert.deepEqual(w.journal.map(j => j.by).sort(), ["marion", "nathan"]);
  assert.equal(w.journal[0].by, "nathan", "le plus récent d'abord");
});

test("défaire un alias ajoute une ligne, il n'en retire aucune", () => {
  const a = shard("nathan");
  fondre("g-ow", "g-outer").apply(a);
  defaire("g-ow").apply(a);
  assert.deepEqual(a.aliases, [], "l'alias n'est plus déclaré");
  assert.deepEqual(a.journal?.map(j => j.kind), ["alias", "defait"], "mais la fonte et sa défaite restent au journal");
});

test("défaire un alias qui n'existe pas n'écrit rien", () => {
  const a = shard("nathan");
  defaire("g-fantome").apply(a);
  assert.equal(a.journal, undefined, "pas de ligne pour un acte qui n'a pas eu lieu");
});

test("admettre retire la demande du guichet, écarter aussi", async () => {
  const k = (issue: number, login: string) => ({ issue, login, at: "2026-10-01T00:00:00Z", firstName: "", vouchedName: "", vouchedAs: "", discord: "", url: "" });
  const P = fakePlatform({}, "nathan", [k(1, "a"), k(2, "b"), k(3, "c")]);
  await P.org.admit((await P.org.knocks())[0], "");
  await P.org.shun((await P.org.knocks())[0], "");
  assert.deepEqual((await P.org.knocks()).map(x => x.login), ["c"]);
});

test("un signalement de défaut porte sa version et son système, et ne passe pas pour une demande", async () => {
  const { reportBody, reportTitle, parseReport, REPORT_MARK } = await import("../src/platform/report.ts");
  const body = reportBody({ what: "La barre ne se déplie pas\net c'est gênant", expected: "", where: "Accueil", version: "0.1.3", system: "macOS" });
  assert.ok(body.startsWith(REPORT_MARK));
  assert.deepEqual(parseReport(body), { version: "0.1.3", system: "macOS" });
  assert.equal(parseKnock(body), null, "le guichet des admissions ne doit pas le voir");
  assert.equal(reportTitle("La barre ne se déplie pas\net c'est gênant"), "Défaut — La barre ne se déplie pas");
  assert.ok(!body.includes("**Ce qui était attendu**"), "un champ vide ne laisse pas de titre orphelin");
  assert.ok(reportTitle("x".repeat(200)).length <= 80);
});

test("une correction de greffier vaut pour tout le monde, champ par champ, la plus récente l'emporte", async () => {
  const { corriger, inscrire } = await import("../src/core/model/acts.ts");
  const typo = shard("alice");
  inscrire("local:film-the-thig", { status: "completed" }, { mediaType: "film", title: "The Thig", year: 1928, manual: true }).apply(typo);
  const before = JSON.stringify(typo);
  const g = shard("nathan");
  corriger("local:film-the-thig", { title: "The Thing", year: 1982 }, "« The Thig » → « The Thing » · 1928 → 1982").apply(g);
  await new Promise(r => setTimeout(r, 3));
  corriger("local:film-the-thig", { titleFr: "The Thing" }, "").apply(g);
  const w = merge([typo, g]);
  assert.equal(w.catalog["local:film-the-thig"].title, "The Thing");
  assert.equal(w.catalog["local:film-the-thig"].year, 1982, "la seconde correction n'a pas défait la première");
  assert.equal(w.catalog["local:film-the-thig"].titleFr, "The Thing");
  assert.equal(JSON.stringify(typo), before, "le fichier d'Alice n'est pas touché");
  assert.equal(w.journal[0].kind, "correction");
  /* Un titre français vide l'efface. */
  await new Promise(r => setTimeout(r, 3));
  corriger("local:film-the-thig", { titleFr: "" }, "").apply(g);
  assert.equal(merge([typo, g]).catalog["local:film-the-thig"].titleFr, undefined);
});
