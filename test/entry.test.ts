/* L'entrée dans le groupe, franchie comme une personne la franchirait — sur
   le faux, du seuil au premier fragment. Le critère de la V1 est qu'un
   inconnu entre sans qu'on lui explique rien : ces essais sont ce critère,
   écrit en code. */

import { strict as assert } from "node:assert";
import { test } from "node:test";

import { examine, founding, knockFields, standing, type Draft } from "../src/features/entry/door.ts";
import { SIGNS, TONES } from "../src/features/entry/emblems.ts";
import { fakePlatform } from "../src/platform/fake.ts";
import { AuthError } from "../src/platform/types.ts";
import { parseKnock } from "../src/platform/knock.ts";
import { makeScribe, parseShard, blankShard } from "../src/core/model/write.ts";
import { fonder } from "../src/core/model/acts.ts";
import { merge } from "../src/core/model/world.ts";
import { shardPath } from "../src/core/model/schema.ts";

const LOGIN = "nouveau-venu";
const draft = (over: Partial<Draft> = {}): Draft => ({
  tone: TONES[3], sign: "🦉", firstName: "Sacha", handle: "de la Forge",
  discord: "sacha.b", vouched: "Marion", vouchedAs: "Ami", circle: "ranger", ...over,
});

test("sans jeton, on est dehors — et un faux du dehors ne lit pas le dépôt", async () => {
  const P = fakePlatform({}, LOGIN, [], { outside: true });
  assert.deepEqual(await examine(P), { door: "dehors" });
  await assert.rejects(P.storage.list(), /404/);
});

test("le seuil, la demande, l'admission, l'invitation acceptée d'ici", async () => {
  const P = fakePlatform({}, LOGIN, [], { outside: true });

  // Le device flow : une attente, puis l'accord.
  const k = await P.session.start();
  let r = await P.session.poll(k.deviceCode);
  while (r.state === "pending") r = await P.session.poll(k.deviceCode);
  assert.deepEqual(r, { state: "ok", login: LOGIN });

  // Connecté, pas encore de demande : on attend, et rien n'est admis.
  let v = await examine(P);
  assert.equal(v.door, "attente");
  assert.ok(v.door === "attente" && v.knock === null && !v.invited);

  // Frapper : la demande part avec ses quatre champs, et se relit.
  const mine = await P.org.knock(LOGIN, knockFields(draft()));
  assert.equal(mine.state, "open");
  assert.equal(mine.login, LOGIN);
  v = await standing(P, LOGIN);
  assert.ok(v.door === "attente" && v.knock?.issue === mine.issue);

  // Le greffier la voit au guichet, et admet : c'est une INVITATION.
  const [seen] = await P.org.knocks();
  assert.equal(seen.firstName, "Sacha");
  await P.org.admit(seen, "");
  assert.equal(await P.org.membership(), "pending");

  // L'écran d'attente accepte pour la personne — et elle est membre.
  v = await standing(P, LOGIN);
  assert.deepEqual(v, { door: "membre", login: LOGIN });
  assert.equal(await P.org.membership(), "active");
  assert.deepEqual(await P.storage.list(), []);
  assert.equal(await P.storage.roleOf(LOGIN), "member");
});

test("une demande refermée sans admission se dit — et on peut frapper de nouveau", async () => {
  const P = fakePlatform({}, LOGIN, [], { outside: true });
  await P.session.start();
  while ((await P.session.poll("x")).state === "pending");
  const k = await P.org.knock(LOGIN, knockFields(draft()));
  await P.org.shun(k, "");
  const v = await standing(P, LOGIN);
  assert.ok(v.door === "attente" && v.knock?.reason === "not_planned" && !v.invited);
  const again = await P.org.knock(LOGIN, knockFields(draft()));
  const w = await standing(P, LOGIN);
  assert.ok(w.door === "attente" && w.knock?.issue === again.issue && w.knock.state === "open");
});

test("admis mais l'invitation n'a pas pu être acceptée d'ici : on renvoie vers GitHub", async () => {
  const P = fakePlatform({}, LOGIN, [], { outside: true });
  await P.session.start();
  while ((await P.session.poll("x")).state === "pending");
  const k = await P.org.knock(LOGIN, knockFields(draft()));
  await P.org.admit(k, "");
  /* GitHub qui refuserait à l'application d'accepter à la place de la
     personne : la porte ne doit ni boucler ni mentir. */
  P.org.accept = async () => { throw new Error("403 — Resource not accessible by integration"); };
  const v = await standing(P, LOGIN);
  assert.ok(v.door === "attente" && v.invited);
});

test("un jeton révoqué s'oublie ; une panne de GitHub ne déconnecte personne", async () => {
  const P = fakePlatform({}, LOGIN);
  let forgot = false;
  P.session.forget = async () => { forgot = true; };
  P.storage.me = async () => { throw new AuthError(); };
  assert.deepEqual(await examine(P), { door: "dehors" });
  assert.ok(forgot);

  const Q = fakePlatform({}, LOGIN);
  let forgotQ = false;
  Q.session.forget = async () => { forgotQ = true; };
  Q.storage.me = async () => { throw new Error("lecture du compte — GitHub rend 502"); };
  await assert.rejects(examine(Q), /502/);
  assert.ok(!forgotQ, "une panne ne doit pas faire oublier le jeton");
});

test("on entre : le premier fragment porte l'identité composée, et rien d'autre", async () => {
  const P = fakePlatform({ "data/alice.json": JSON.stringify(blankShard("alice", { id: "alice", firstName: "Alice", handle: "", circle: "mage" })) }, LOGIN, [], { outside: true });
  await P.session.start();
  while ((await P.session.poll("x")).state === "pending");
  const k = await P.org.knock(LOGIN, knockFields(draft()));
  await P.org.admit(k, "");
  assert.equal((await standing(P, LOGIN)).door, "membre");

  const user = founding(LOGIN, draft())!;
  const scribe = makeScribe({
    storage: P.storage, me: LOGIN, quiet: 10,
    load: async () => {
      const e = (await P.storage.list()).find(x => x.path === shardPath(LOGIN));
      return e ? { shard: parseShard(await P.storage.readBlob(e.sha)), sha: e.sha }
               : { shard: blankShard(LOGIN, { id: LOGIN, firstName: "", handle: "", circle: "mage" }), sha: null };
    },
    onWritten: () => {},
  });
  scribe.push(fonder(user));
  await scribe.flush();

  const e = (await P.storage.list()).find(x => x.path === shardPath(LOGIN))!;
  const shard = parseShard(await P.storage.readBlob(e.sha));
  assert.deepEqual(shard.user, {
    id: LOGIN, firstName: "Sacha", handle: "de la Forge", circle: "ranger",
    tone: TONES[3], sign: "🦉", discord: "sacha.b",
  });
  /* « Qui vous connaît » appartient à la demande, pas au profil ; et la
     visite est datée du même geste — un arrivant n'a rien manqué. */
  assert.ok(!JSON.stringify(shard).includes("Marion"));
  assert.ok(shard.seenAt);
  const w = merge([parseShard(await P.storage.readBlob((await P.storage.list()).find(x => x.path === "data/alice.json")!.sha)), shard]);
  assert.equal(w.people[LOGIN].firstName, "Sacha");
  assert.equal(w.people[LOGIN].circle, "ranger");
});

test("sans prénom ni Ordre, on n'écrit pas d'identité", () => {
  assert.equal(founding(LOGIN, draft({ firstName: "  " })), null);
  assert.equal(founding(LOGIN, draft({ circle: null })), null);
  assert.equal(founding(LOGIN, draft({ discord: " " }))!.discord, undefined);
});

test("la demande porte ce que l'écran dit qu'elle porte — et rien de plus", () => {
  const f = knockFields(draft());
  assert.deepEqual(f, { firstName: "Sacha", vouchedName: "Marion", vouchedAs: "Ami", discord: "sacha.b" });
  assert.ok(!("tone" in f) && !("circle" in f));
  assert.ok(parseKnock(`<!-- checkpoint:knock v1 -->\nprénom: Sacha`));
});

test("seize fonds, et pas deux signes identiques", () => {
  assert.equal(TONES.length, 16);
  const all = SIGNS.flatMap(f => f.l);
  assert.equal(new Set(all).size, all.length, "un signe en double ferait deux visages pareils");
});
