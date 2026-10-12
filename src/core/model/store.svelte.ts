/* L'état du monde, et lui seul. Tout le reste se recalcule à partir d'ici
   (invariant 2) : aucune vue ne garde sa petite copie d'un total.

   Le fichier porte `.svelte.ts` parce qu'il emploie les runes. C'est le seul
   endroit du noyau qui en a besoin — un sélecteur reste une fonction pure. */

import { emptyWorld, merge, type World } from "./world.ts";
import { openWorld, type Problem } from "./load.ts";
import { makeScribe, parseShard, type Mutation, type Scribe, type WriteState } from "./write.ts";
import { blankShard } from "./write.ts";
import { shardPath, type Shard } from "./schema.ts";
import type { Cache, Knock, Org, Storage } from "#platform/index.ts";
import { consigner, marquerVisite } from "./acts.ts";

type Phase = "vide" | "ouverture" | "prêt" | "fermé";

class Registre {
  world = $state<World>(emptyWorld());
  phase = $state<Phase>("vide");
  problems = $state<Problem[]>([]);
  me = $state<string | null>(null);
  /** Ce que la dernière ouverture a coûté. Montré à l'établi, pas ailleurs. */
  last = $state<{ fetched: number; fromCache: number; ms: number } | null>(null);

  /** L'état de l'écriture, pour que l'interface puisse le dire au lieu de
      laisser croire que c'est parti. */
  writing = $state<WriteState>("repos");
  pending = $state(0);
  writeError = $state<string | null>(null);

  #scribe: Scribe | null = null;
  #storage: Storage | null = null;
  #org: Org | null = null;

  /* --- Le Greffe. Le rôle se lit dans l'organisation (invariant 10) ; tant
     qu'on ne l'a pas lu, on n'a pas la charge — une porte qui apparaît puis
     disparaît serait pire qu'une porte qui tarde. --- */
  role = $state<"admin" | "member" | null>(null);
  stewards = $state<string[]>([]);
  knocks = $state<Knock[]>([]);
  orgError = $state<string | null>(null);

  get steward() { return this.role === "admin"; }

  async refreshGreffe() {
    if (!this.#org || !this.steward) return;
    try {
      const [k, a] = await Promise.all([this.#org.knocks(), this.#org.admins()]);
      this.knocks = k; this.stewards = a; this.orgError = null;
    } catch (e) { this.orgError = (e as Error).message; }
  }

  /** Admettre : une invitation dans l'organisation, l'issue refermée avec un
      mot, et une ligne au journal. **Les trois, ou aucun** — si l'invitation
      échoue, on n'inscrit rien et on le dit. */
  async admit(k: Knock) {
    if (!this.#org) return;
    try {
      await this.#org.admit(k, `Admis au registre par @${this.me}. Une invitation est partie dans l'organisation : il suffit de l'accepter.`);
      this.act(consigner("admission", k.login, k.firstName ? `${k.firstName}` : undefined));
      this.knocks = this.knocks.filter(x => x.issue !== k.issue);
      this.orgError = null;
    } catch (e) { this.orgError = (e as Error).message; }
  }

  async shun(k: Knock) {
    if (!this.#org) return;
    try {
      await this.#org.shun(k, `Demande refermée par @${this.me}. Rien n'empêche de frapper de nouveau.`);
      this.act(consigner("ecart", k.login, k.vouchedName ? `se réclamait de « ${k.vouchedName} »` : "ne se réclamait de personne"));
      this.knocks = this.knocks.filter(x => x.issue !== k.issue);
      this.orgError = null;
    } catch (e) { this.orgError = (e as Error).message; }
  }

  /** Confier la charge : **un rôle qui change dans l'organisation**. Il n'y a
      pas d'administrateur du côté de l'application. */
  async entrust(login: string) {
    if (!this.#org) return;
    try {
      await this.#org.setRole(login, "admin");
      this.act(consigner("greffe", login, "charge confiée"));
      this.stewards = [...new Set([...this.stewards, login])];
      this.orgError = null;
    } catch (e) { this.orgError = (e as Error).message; }
  }

  /** **Inscrire.** Le seul geste d'écriture offert aux vues : elles décrivent
      une intention, elles ne touchent jamais au stockage. */
  act(...ms: Mutation[]) {
    if (!this.#scribe) return;
    for (const m of ms) {
      /* La vue doit répondre tout de suite : on applique l'intention sur le
         monde en mémoire, et le scribe s'occupe du dépôt à son rythme.
         **Si l'écriture échoue, `writeError` le dira** — on ne défait pas
         ce que la personne vient de faire sous ses yeux. */
      const mine = this.#mine();
      m.apply(mine);
      this.#remerge(mine);
      this.#scribe.push(m);
    }
  }

  async flush() { await this.#scribe?.flush(); }

  #shards: Shard[] = [];

  #mine(): Shard {
    const i = this.#shards.findIndex(s => s.user.id === this.me);
    if (i >= 0) return this.#shards[i];
    /* On ne passe pas `moi` tel quel : il porte `circleRef`, qui est dérivé.
       **Un dérivé qui retombe dans le fichier devient un agrégat stocké**, et
       il deviendra faux le jour où l'Ordre change. */
    const p = this.moi;
    const fresh = blankShard(this.me ?? "", p
      ? { id: p.id, firstName: p.firstName, handle: p.handle, circle: p.circle,
          ...(p.tone ? { tone: p.tone } : {}), ...(p.sign ? { sign: p.sign } : {}),
          ...(p.discord ? { discord: p.discord } : {}), ...(p.prefs ? { prefs: p.prefs } : {}) }
      : { id: this.me ?? "", firstName: "", handle: "", circle: "mage" });
    this.#shards.push(fresh);
    return fresh;
  }

  #remerge(_touched?: Shard) { this.world = merge(this.#shards); }

  async open(storage: Storage, cache: Cache, org?: Org) {
    this.phase = "ouverture";
    const t0 = performance.now();
    this.me = await storage.me();
    const { world, problems, fetched, fromCache, shards } = await openWorld(storage, cache);
    this.world = world;
    this.#shards = shards;
    this.problems = problems;
    this.last = { fetched, fromCache, ms: Math.round(performance.now() - t0) };
    this.#storage = storage;
    this.#org = org ?? null;
    this.role = this.me ? await storage.roleOf(this.me).catch(() => null) : null;

    if (this.me) {
      const me = this.me;
      this.#scribe = makeScribe({
        storage, me,
        /* On relit **le dépôt**, pas notre copie : si un autre appareil a
           écrit, c'est sa version qu'il faut compléter. */
        load: async () => {
          const e = (await storage.list()).find(x => x.path === shardPath(me));
          if (!e) return { shard: this.#mine(), sha: null };
          return { shard: parseShard(await storage.readBlob(e.sha)), sha: e.sha };
        },
        onWritten: shard => {
          const i = this.#shards.findIndex(s => s.user.id === me);
          if (i >= 0) this.#shards[i] = shard; else this.#shards.push(shard);
          this.#remerge();
        },
        onState: (s, n, err) => { this.writing = s; this.pending = n; this.writeError = err; },
      });
    }
    this.lastVisit = this.moi?.seenAt ?? "";
    this.phase = "prêt";
    /* Inscrire cette visite seulement si on a déjà un fragment : un compte
       qui n'est pas encore admis n'a pas de quoi écrire, et on ne crée pas un
       fichier pour y ranger une date. */
    if (this.moi) this.act(marquerVisite());
    void this.refreshGreffe();
  }

  /** Celui qu'on est, tel que le monde le connaît. `null` tant qu'on n'est pas
      admis : le compte existe, le fragment pas encore. */
  get moi() { return this.me ? this.world.people[this.me] ?? null : null; }

  /** La préférence de titres est rangée dans le fragment de la personne
      (invariant 9). Avant l'admission, le français par défaut. */
  get titlePref(): "vo" | "fr" { return this.moi?.prefs?.titles ?? "fr"; }

  /** **La visite précédente**, retenue à l'ouverture avant d'inscrire
      celle-ci. C'est elle qui donne son sens à l'encart du guetteur, qui ne
      décrit que l'écart entre les deux.

      ⚠️ Le prototype disait « écrite à la fermeture ». Mais une application
      qu'on ferme peut mourir avant que l'écriture parte, et l'encart
      raconterait alors deux fois la même chose. On date donc la visite à
      l'**ouverture** : rien ne dépend d'une fermeture propre. */
  lastVisit = $state("");
  get seen(): string { return this.lastVisit; }
}

export const registre = new Registre();
