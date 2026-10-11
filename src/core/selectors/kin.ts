/* La lignée. **Une parenté se déclare des deux côtés** : chacun n'écrit que
   dans son fragment, donc un lien n'existe que si les deux l'ont posé — ce qui
   interdit de s'inventer une famille. Encore la même forme que les favoris,
   les surlignages et les quêtes : déclaré chez soi, sommé à la lecture.

   Le mot est au choix de celui qui le pose ; seul son **sens** doit s'accorder
   (invariant 29). */

import type { World } from "../model/world.ts";

export const KIN: Record<string, { l: string; d: number }> = {
  pere:  { l: "père",  d:  1 }, mere:  { l: "mère",  d:  1 }, parent:  { l: "parent",  d:  1 },
  fils:  { l: "fils",  d: -1 }, fille: { l: "fille", d: -1 }, enfant:  { l: "enfant",  d: -1 },
  frere: { l: "frère", d:  0 }, soeur: { l: "sœur",  d:  0 }, fratrie: { l: "fratrie", d:  0 },
};

export const kinOf = (w: World, pid: string) =>
  (w.people[pid]?.kin ?? []).filter(k => w.people[k.id] && KIN[k.rel]);

/** Confirmé seulement si les deux déclarations se répondent : « mon fils »
    appelle « mon père », « ma sœur » appelle « mon frère ». Sinon, rien. */
export function kinLink(w: World, a: string, b: string): string | null {
  const ra = kinOf(w, a).find(k => k.id === b);
  const rb = kinOf(w, b).find(k => k.id === a);
  if (!ra || !rb) return null;
  return KIN[ra.rel].d + KIN[rb.rel].d === 0 ? ra.rel : null;
}

export type Household = { ids: string[]; gen: Record<string, number>; size: number };

/** La maisonnée n'est pas un objet qu'on possède : c'est **la composante
    connexe des liens confirmés**. Personne ne la crée, personne ne la détient,
    et elle se recalcule comme tout le reste. */
export function household(w: World, pid: string): Household {
  const seen = new Set([pid]);
  const queue = [pid];
  const gen: Record<string, number> = { [pid]: 0 };
  while (queue.length) {
    const x = queue.shift() as string;
    for (const k of kinOf(w, x)) {
      const rel = kinLink(w, x, k.id);
      if (!rel || seen.has(k.id)) continue;
      gen[k.id] = gen[x] - KIN[rel].d;      // « mon père » est un cran au-dessus
      seen.add(k.id);
      queue.push(k.id);
    }
  }
  const ids = [...seen];
  const lo = Math.min(...ids.map(i => gen[i]));
  for (const i of ids) gen[i] -= lo;

  /* **Une maisonnée se lit toujours pareil, quel que soit celui par qui on y
     entre** : l'aîné d'abord, puis l'ordre des noms. Sinon le même foyer
     s'appellerait « Nina, Jules et Éliot » ici et « Jules, Éliot et Nina » là,
     et ce ne serait plus un foyer. */
  ids.sort((a, b) =>
    gen[a] - gen[b] ||
    (w.people[a]?.firstName ?? "").localeCompare(w.people[b]?.firstName ?? "", "fr"));
  return { ids, gen, size: ids.length };
}

export const hasKin = (w: World, pid: string) => household(w, pid).size > 1;
