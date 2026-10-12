/* L'ouverture : lire l'arbre, prendre ce qui a bougé, fusionner.

   **Un fragment cassé n'emporte pas les autres.** C'est la propriété que le
   choix « un fichier par personne » achète, et il faut la dépenser : un JSON
   illisible, un schéma trop récent, et la personne manque — le reste du
   cercle s'affiche. Les ennuis sont rendus à l'appelant, qui les montrera à
   l'établi au lieu de les taire. */

import type { Cache, Storage } from "#platform/index.ts";
import { migrate } from "./migrate.ts";
import { merge, type World } from "./world.ts";
import type { Fonds, MediaType, Shard, Work } from "./schema.ts";

export type Problem = { path: string; message: string };
/** On rend aussi les fragments eux-mêmes : le scribe a besoin du sien pour
    y appliquer des intentions, et le refabriquer depuis le monde fusionné
    serait reconstruire une source depuis sa dérivée. */
export type Opening = { world: World; shards: Shard[]; fonds: Fonds[]; problems: Problem[]; fromCache: number; fetched: number };

const isFragment = (path: string) => /^data\/[^/]+\.json$/.test(path);
const isFonds = (path: string) => /^fonds\/[^/]+\.json$/.test(path);

export const FONDS_VERSION = 1;
const KINDS: MediaType[] = ["game", "film", "series", "book"];

/** Lire un fichier du fonds. **Une œuvre mal décrite n'emporte pas les
    autres** : on garde ce qui se lit, et on rend le reste comme un ennui. */
export function parseFonds(text: string): { fonds: Fonds; skipped: string[] } {
  const raw = JSON.parse(text) as Partial<Fonds>;
  const v = typeof raw.schemaVersion === "number" ? raw.schemaVersion : 1;
  if (v > FONDS_VERSION) throw new Error(`Ce fonds est en version ${v}, l'application en lit ${FONDS_VERSION}. Mets-la à jour.`);
  const works: Record<string, Work> = {};
  const skipped: string[] = [];
  for (const [id, w] of Object.entries(raw.works ?? {})) {
    const ok = w && KINDS.includes(w.mediaType) && typeof w.title === "string" && w.title && typeof w.year === "number";
    if (ok) works[id] = w; else skipped.push(id);
  }
  return { fonds: { schemaVersion: v, by: String(raw.by ?? ""), updatedAt: String(raw.updatedAt ?? ""), works }, skipped };
}

export async function openWorld(storage: Storage, cache: Cache): Promise<Opening> {
  /* Un seul appel donne tous les chemins et tous les SHA : c'est lui qui rend
     l'ouverture rapide, et c'est le seul appel d'une ouverture sans changement. */
  const all = await storage.list();
  const tree = all.filter(e => isFragment(e.path) || isFonds(e.path));

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
  const fonds: Fonds[] = [];
  for (const t of texts) {
    if (!t) continue;
    try {
      if (isFonds(t.path)) {
        const { fonds: f, skipped } = parseFonds(t.text);
        fonds.push(f);
        if (skipped.length) problems.push({ path: t.path, message: `œuvres illisibles, écartées : ${skipped.join(", ")}` });
      } else shards.push(migrate(JSON.parse(t.text)));
    } catch (err) {
      problems.push({ path: t.path, message: (err as Error).message });
    }
  }

  return { world: merge(shards, fonds), shards, fonds, problems, fromCache, fetched };
}
