/* **Le Tableau** — la seconde face de l'accueil : les œuvres en lignes, les
   membres en colonnes, et dans chaque case où en est chacun. C'est la
   comparaison entre amis dans sa forme la plus brute, et c'est pour ça
   qu'elle vit à côté du Registre (demandé par Nathan le 29 octobre).

   Rien n'y est stocké : la grille se recalcule du monde comme le reste
   (invariant 2). Le fonds n'y entre pas — une œuvre que personne ne suit
   n'aurait qu'une ligne vide (invariant 36). */

import { CIRCLES, type Circle } from "../model/lexicon.ts";
import type { MediaType } from "../model/schema.ts";
import type { Person, Row, World } from "../model/world.ts";
import { tracked } from "./works.ts";

export type Ledger = {
  /** Les membres, **rangés par Ordre** — dans l'ordre des cinq, puis des noms. */
  people: Person[];
  /** Les Ordres représentés, et combien de colonnes chacun couvre. */
  bands: { c: Circle; n: number }[];
  works: string[];
  /** La case d'une personne sur une œuvre : `cell[personId][mediaId]`. */
  cell: Record<string, Record<string, Row>>;
};

export function ledger(w: World, kind?: MediaType, pref: "vo" | "fr" = "fr"): Ledger {
  const rank = (p: Person) => CIRCLES.findIndex(c => c.id === p.circleRef.id);
  const people = Object.values(w.people)
    .sort((a, b) => rank(a) - rank(b) || a.firstName.localeCompare(b.firstName, "fr"));

  const bands: Ledger["bands"] = [];
  for (const p of people) {
    const last = bands.at(-1);
    if (last && last.c.id === p.circleRef.id) last.n++;
    else bands.push({ c: p.circleRef, n: 1 });
  }

  const cell: Ledger["cell"] = {};
  for (const r of w.rows) (cell[r.personId] ??= {})[r.mediaId] = r;

  return { people, bands, works: tracked(w, kind, pref), cell };
}
