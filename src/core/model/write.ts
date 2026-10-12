/* **Le seul chemin d'écriture de l'application.**

   Tout ce qu'on inscrit — un statut, un jugement, un checkpoint, un favori,
   une parole, un surlignage, une quête, une parenté — passe par ici, et par
   ici seulement. Il n'y a qu'un fichier qu'on ait le droit de toucher : le
   sien (invariant 1). C'est une fonction, pas une convention : on ne lui
   donne pas de chemin, elle ne connaît que le nôtre.

   Trois choses que ce module tient :

   · **Le regroupement.** Écrire dans la Loge se groupe, ça ne se commite pas
     message par message (invariant 27) : l'historique est ce qui rend les
     données réparables, c'est lui qu'on protège. Toute mutation attend donc
     un court silence avant de partir, et une rafale fait un seul commit.

   · **Le conflit.** Un `409` ne devrait jamais arriver — un seul écrivain par
     fichier. S'il arrive, c'est qu'un autre appareil de la même personne a
     écrit entre-temps. On **relit, on rejoue les mutations en attente sur la
     version fraîche, et on réessaie** : rejouer les intentions est juste,
     renvoyer un instantané périmé ne l'est pas.

   · **L'honnêteté.** Tant que ce n'est pas parti, l'interface doit pouvoir le
     dire. `state` passe par « en attente » puis « écrit », et par « conflit »
     si la bagarre dure. */

import { SCHEMA_VERSION, shardPath, type Shard } from "./schema.ts";
import { migrate } from "./migrate.ts";
import { ConflictError, type Storage } from "#platform/index.ts";

export type WriteState = "repos" | "attente" | "envoi" | "écrit" | "erreur";

/** Une mutation est une **intention**, pas un instantané : c'est ce qui
    permet de la rejouer sur une version plus fraîche du fragment. */
export type Mutation = { label: string; apply: (s: Shard) => void };

export type Scribe = {
  readonly state: WriteState;
  readonly pending: number;
  readonly lastError: string | null;
  /** Range une intention et arme le départ. */
  push(m: Mutation): void;
  /** Force le départ sans attendre le silence — pour quitter proprement. */
  flush(): Promise<void>;
};

export const QUIET_MS = 2500;

export function makeScribe(opts: {
  storage: Storage;
  me: string;
  /** Rend le fragment courant et son SHA, relus si besoin. */
  load: () => Promise<{ shard: Shard; sha: string | null }>;
  /** Appelé après chaque écriture réussie, pour que les vues se remettent à jour. */
  onWritten: (shard: Shard, sha: string) => void;
  onState?: (s: WriteState, pending: number, err: string | null) => void;
  quiet?: number;
}): Scribe {
  const quiet = opts.quiet ?? QUIET_MS;
  let queue: Mutation[] = [];
  let timer: ReturnType<typeof setTimeout> | null = null;
  let inflight: Promise<void> | null = null;
  let state: WriteState = "repos";
  let lastError: string | null = null;

  const say = (s: WriteState) => { state = s; opts.onState?.(s, queue.length, lastError); };

  async function commit(): Promise<void> {
    if (!queue.length) return;
    say("envoi");

    /* On vide la file **avant** d'écrire : ce qui arrive pendant l'envoi
       appartient au tour suivant, et ne doit pas être perdu ni envoyé deux
       fois. */
    const batch = queue;
    queue = [];

    const run = async (tries: number): Promise<void> => {
      const { shard, sha } = await opts.load();
      /* Les intentions se rejouent sur la version fraîche. C'est tout
         l'intérêt de garder des fonctions plutôt qu'un état figé. */
      for (const m of batch) m.apply(shard);
      shard.schemaVersion = SCHEMA_VERSION;
      shard.updatedAt = new Date().toISOString();

      const text = JSON.stringify(shard, null, 1) + "\n";
      const message = batch.length === 1
        ? batch[0].label
        : `${batch.length} inscriptions — ${[...new Set(batch.map(m => m.label))].slice(0, 3).join(", ")}`;

      try {
        const out = await opts.storage.write(shardPath(opts.me), text, sha, message);
        opts.onWritten(shard, out.sha);
        lastError = null;
      } catch (e) {
        if (e instanceof ConflictError && tries > 0) return run(tries - 1);
        throw e;
      }
    };

    try {
      await run(2);
      say(queue.length ? "attente" : "écrit");
    } catch (e) {
      /* Ce qui n'est pas parti retourne dans la file, en tête : on ne perd
         pas une intention parce que le réseau a toussé. */
      queue = [...batch, ...queue];
      lastError = (e as Error).message;
      say("erreur");
    }
  }

  function arm() {
    if (timer) clearTimeout(timer);
    say("attente");
    timer = setTimeout(() => { timer = null; inflight = commit(); }, quiet);
  }

  return {
    get state() { return state; },
    get pending() { return queue.length; },
    get lastError() { return lastError; },
    push(m) { queue.push(m); arm(); },
    async flush() {
      if (timer) { clearTimeout(timer); timer = null; }
      await inflight;
      inflight = commit();
      await inflight;
    },
  };
}

/** Le fragment d'une personne qui n'en a pas encore. Il naît **à l'entrée**,
    avec l'identité qu'elle s'est composée (`fonder`) — jamais à
    l'admission : un fichier vide qui attend n'apprend rien à personne. */
export function blankShard(me: string, user: Shard["user"]): Shard {
  return {
    schemaVersion: SCHEMA_VERSION,
    user,
    updatedAt: new Date().toISOString(),
    works: {},
    entries: {},
  };
}

export const parseShard = (text: string): Shard => migrate(JSON.parse(text));
