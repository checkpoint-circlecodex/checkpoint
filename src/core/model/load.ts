/* L'ouverture : lire l'arbre, prendre ce qui a bougé, fusionner.

   **Un fragment cassé n'emporte pas les autres.** C'est la propriété que le
   choix « un fichier par personne » achète, et il faut la dépenser : un JSON
   illisible, un schéma trop récent, et la personne manque — le reste du
   cercle s'affiche. Les ennuis sont rendus à l'appelant, qui les montrera à
   l'établi au lieu de les taire. */

import type { Cache, Storage } from "$platform/index.ts";
import { migrate } from "./migrate.ts";
import { merge, type World } from "./world.ts";
import type { Shard } from "./schema.ts";

export type Problem = { path: string; message: string };
export type Opening = { world: World; problems: Problem[]; fromCache: number; fetched: number };

const isFragment = (path: string) => /^data\/[^/]+\.json$/.test(path);

export async function openWorld(storage: Storage, cache: Cache): Promise<Opening> {
  /* Un seul appel donne tous les chemins et tous les SHA : c'est lui qui rend
     l'ouverture rapide, et c'est le seul appel d'une ouverture sans changement. */
  const tree = (await storage.list()).filter(e => isFragment(e.path));

  const problems: Problem[] = [];
  let fromCache = 0, fetched = 0;

  /* En parallèle : vingt fichiers séquentiels paieraient vingt allers-retours.
     Mesuré à 258 ms pour vingt en parallèle, contre une seconde et demie sinon. */
  const texts = await Promise.all(tree.map(async e => {
    try {
      const hit = await cache.get(e.sha);
      if (hit !== null) { fromCache++; return { path: e.path, text: hit }; }
      const text = await storage.readBlob(e.sha);
      fetched++;
      /* Un blob est adressé par son contenu : ce SHA ne désignera jamais autre
         chose, donc le cache n'a aucune invalidation à tenir. */
      await cache.set(e.sha, text);
      return { path: e.path, text };
    } catch (err) {
      problems.push({ path: e.path, message: (err as Error).message });
      return null;
    }
  }));

  const shards: Shard[] = [];
  for (const t of texts) {
    if (!t) continue;
    try {
      shards.push(migrate(JSON.parse(t.text)));
    } catch (err) {
      problems.push({ path: t.path, message: (err as Error).message });
    }
  }

  return { world: merge(shards), problems, fromCache, fetched };
}
