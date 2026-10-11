/* Le Greffe. Ce qui demande une **autorité** — et rien d'autre : ce qui ne
   demande que de la discrétion vit au pied de sa propre feuille.

   Le rôle ne se lit pas ici : il se lit dans l'organisation GitHub, par la
   couche plateforme (invariant 10). Une liste maison divergerait des droits
   réels et créerait une autorité fictive. */

import type { World } from "../model/world.ts";
import { alive } from "../model/world.ts";

/** Les doublons **se suggèrent, ils ne se déclarent pas.** L'application
    rapproche les titres ; le greffier tranche — un livre et son film portent
    le même nom, et seule une personne le sait. */
const flat = (t: string) =>
  t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "");

export type Suspicion = { keep: string; drop: string[] };

export function suspected(w: World): Suspicion[] {
  const by: Record<string, Set<string>> = {};
  for (const [id, m] of Object.entries(w.catalog)) {
    if (!alive(w, id)) continue;
    for (const t of [m.title, m.titleFr]) {
      if (!t) continue;
      const k = `${m.mediaType}:${flat(t)}`;
      (by[k] ??= new Set()).add(id);
    }
  }
  const out: Suspicion[] = [];
  const done = new Set<string>();
  for (const ids of Object.values(by)) {
    if (ids.size < 2) continue;
    const key = [...ids].sort().join("|");
    if (done.has(key)) continue;
    done.add(key);
    /* Le survivant est l'entrée qui n'a pas été inscrite à la main : elle
       porte un identifiant de source, et **l'identité d'une œuvre est son
       identifiant** (invariant 9). */
    const sorted = [...ids].sort((a, b) => (w.catalog[a].manual ? 1 : 0) - (w.catalog[b].manual ? 1 : 0));
    out.push({ keep: sorted[0], drop: sorted.slice(1) });
  }
  return out;
}

export const aliasList = (w: World) =>
  Object.entries(w.alias).map(([from, to]) => ({ from, to }));
