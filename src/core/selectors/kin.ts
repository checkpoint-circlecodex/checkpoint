/* La lignée. **Une parenté se déclare des deux côtés** : chacun n'écrit que
   dans son fragment, donc un lien n'existe que si les deux l'ont posé — ce qui
   interdit de s'inventer une famille. Encore la même forme que les favoris,
   les surlignages et les quêtes : déclaré chez soi, sommé à la lecture.

   Le mot est au choix de celui qui le pose ; seul son **sens** doit s'accorder
   (invariant 29). */

import type { World } from "../model/world.ts";
import { de } from "../model/lexicon.ts";
import { questScore } from "./quests.ts";

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

/* --- Le mot, et l'ordre des noms ---------------------------------------- */

export const nameList = (w: World, ids: string[]) => {
  const n = ids.map(i => w.people[i]?.firstName ?? i);
  return n.length < 2 ? (n[0] ?? "") : `${n.slice(0, -1).join(", ")} et ${n[n.length - 1]}`;
};

/** **Le mot est toujours celui de l'autre.** C'est l'enfant qui dit « mon
    père », donc l'écran écrit « père de » — personne ne se nomme soi-même
    dans une famille. */
export function kinTitle(w: World, h: Household, i: string): string | null {
  const rows: Record<number, string[]> = {};
  for (const x of h.ids) (rows[h.gen[x]] ??= []).push(x);
  const above = (rows[h.gen[i] - 1] ?? []).find(y => kinLink(w, y, i));
  if (above) return `${KIN[kinLink(w, above, i)!].l} ${de(w.people[above].firstName)}`;
  const below = h.ids.filter(y => h.gen[y] === h.gen[i] + 1 && kinLink(w, i, y));
  if (below.length) return `${KIN[kinLink(w, below[0], i)!].l} ${de(nameList(w, below))}`;
  const side = h.ids.filter(y => y !== i && h.gen[y] === h.gen[i] && kinLink(w, i, y));
  if (side.length) return `${KIN[kinLink(w, side[0], i)!].l} ${de(nameList(w, side))}`;
  return null;
}

/** Ce que la maisonnée a fait ensemble — **toujours calculé, jamais rangé**. */
export function kinDeeds(w: World, ids: string[]) {
  const rs = w.rows.filter(r => ids.includes(r.personId));
  const seen = [...new Set(rs.map(r => r.mediaId))];
  const allDone = (mid: string) => ids.every(p => {
    const r = rs.find(x => x.personId === p && x.mediaId === mid);
    return !!r && (r.status === "completed" || r.status === "mastered");
  });
  /* Là où la maisonnée se divise : le plus grand écart de jugement sur une
     même œuvre. C'est la seule chose qui ressemble à une statistique sur
     cette page, et elle se dit comme une anecdote. */
  const by: Record<string, typeof rs> = {};
  for (const r of rs) if (typeof r.rating === "number") (by[r.mediaId] ??= []).push(r);
  let clash: { id: string; d: number; hi: typeof rs[number]; lo: typeof rs[number] } | null = null;
  for (const [mid, l] of Object.entries(by)) {
    if (l.length < 2) continue;
    const hi = l.reduce((m, r) => (r.rating as number) > (m.rating as number) ? r : m);
    const lo = l.reduce((m, r) => (r.rating as number) < (m.rating as number) ? r : m);
    const d = (hi.rating as number) - (lo.rating as number);
    if (!clash || d > clash.d) clash = { id: mid, d, hi, lo };
  }
  return {
    common: seen.filter(allDone),
    works: seen.length,
    hours: rs.reduce((s, r) => s + (r.progress?.unit === "hours" ? r.progress.value : 0), 0),
    chronicles: rs.filter(r => r.review).length,
    quests: w.quests.filter(q => ids.every(p => questScore(w, q, p).ok)),
    clash: clash && clash.d > 0 ? clash : null,
  };
}

/* --- Les déclarations qui attendent leur réponse ------------------------- */

/** Les mots qui répondent à un mot : « fils » appelle « père », « mère » ou
    « parent » — le sens est contraint, le mot reste libre. */
export const answersTo = (rel: string) =>
  Object.keys(KIN).filter(k => KIN[k].d === -(KIN[rel]?.d ?? 99));

export type KinAsk = { from: string; rel: string };

/** **Ce que les autres ont déclaré à ton sujet et que tu n'as pas rendu.**
    Sans cette liste, une parenté déclarée d'un seul côté resterait
    invisible à celui qui doit y répondre — et n'existerait jamais. */
export const kinAsked = (w: World, me: string): KinAsk[] =>
  Object.values(w.people)
    .filter(p => p.id !== me)
    .flatMap(p => (p.kin ?? []).filter(k => k.id === me && KIN[k.rel]).map(k => ({ from: p.id, rel: k.rel })))
    .filter(a => !kinLink(w, me, a.from));

/** Ce que tu as déclaré et qui attend la déclaration de l'autre. */
export const kinWaiting = (w: World, me: string) =>
  kinOf(w, me).filter(k => !kinLink(w, me, k.id));
