/* L'état du monde, et lui seul. Tout le reste se recalcule à partir d'ici
   (invariant 2) : aucune vue ne garde sa petite copie d'un total.

   Le fichier porte `.svelte.ts` parce qu'il emploie les runes. C'est le seul
   endroit du noyau qui en a besoin — un sélecteur reste une fonction pure. */

import { emptyWorld, type World } from "./world.ts";
import { openWorld, type Problem } from "./load.ts";
import type { Cache, Storage } from "$platform/index.ts";

type Phase = "vide" | "ouverture" | "prêt" | "fermé";

class Registre {
  world = $state<World>(emptyWorld());
  phase = $state<Phase>("vide");
  problems = $state<Problem[]>([]);
  me = $state<string | null>(null);
  /** Ce que la dernière ouverture a coûté. Montré à l'établi, pas ailleurs. */
  last = $state<{ fetched: number; fromCache: number; ms: number } | null>(null);

  async open(storage: Storage, cache: Cache) {
    this.phase = "ouverture";
    const t0 = performance.now();
    this.me = await storage.me();
    const { world, problems, fetched, fromCache } = await openWorld(storage, cache);
    this.world = world;
    this.problems = problems;
    this.last = { fetched, fromCache, ms: Math.round(performance.now() - t0) };
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
