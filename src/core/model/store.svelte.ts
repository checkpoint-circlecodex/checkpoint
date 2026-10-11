/* L'état du monde, et lui seul. Tout le reste se recalcule à partir d'ici
   (invariant 2) : aucune vue ne garde sa petite copie d'un total.

   Le fichier porte `.svelte.ts` parce qu'il emploie les runes. C'est le seul
   endroit du noyau qui en a besoin — un sélecteur reste une fonction pure. */

import { emptyWorld, merge, type World } from "./world.ts";
import { openWorld, type Problem } from "./load.ts";
import { makeScribe, parseShard, type Mutation, type Scribe, type WriteState } from "./write.ts";
import { blankShard } from "./write.ts";
import { shardPath, type Shard } from "./schema.ts";
import type { Cache, Storage } from "#platform/index.ts";

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

  async open(storage: Storage, cache: Cache) {
    this.phase = "ouverture";
    const t0 = performance.now();
    this.me = await storage.me();
    const { world, problems, fetched, fromCache, shards } = await openWorld(storage, cache);
    this.world = world;
    this.#shards = shards;
    this.problems = problems;
    this.last = { fetched, fromCache, ms: Math.round(performance.now() - t0) };
    this.#storage = storage;

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
    this.phase = "prêt";
  }

  /** Celui qu'on est, tel que le monde le connaît. `null` tant qu'on n'est pas
      admis : le compte existe, le fragment pas encore. */
  get moi() { return this.me ? this.world.people[this.me] ?? null : null; }

  /** La préférence de titres est rangée dans le fragment de la personne
      (invariant 9). Avant l'admission, le français par défaut. */
  get titlePref(): "vo" | "fr" { return this.moi?.prefs?.titles ?? "fr"; }

  /** Dernière visite : ce qui donne son sens à l'encart du guetteur. Elle ne
      décrit que **l'écart** avec la précédente, et rien d'autre. */
  get seen(): string { return this.moi?.seenAt ?? ""; }
}

export const registre = new Registre();
