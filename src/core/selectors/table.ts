/* **Le Tableau** — la seconde face de l'accueil : les œuvres en lignes, les
   membres en colonnes, et dans chaque case où en est chacun. C'est la
   comparaison entre amis dans sa forme la plus brute, et c'est pour ça
   qu'elle vit à côté du Registre (demandé par Nathan le 29 octobre).

   Rien n'y est stocké : la grille se recalcule du monde comme le reste
   (invariant 2). **Le fonds vient après, à part** — ce que personne ne suit
   encore, sous un blanc (Nathan, 29 octobre) : il est au catalogue, pas au
   corpus (invariant 36), et le Tableau le dit par la place qu'il lui donne. */

import { CIRCLES, type Circle } from "../model/lexicon.ts";
import type { MediaType } from "../model/schema.ts";
import type { OpenQuest, Person, Row, World } from "../model/world.ts";
import { questScore } from "./quests.ts";
import { titlesOf, tracked, unfollowed } from "./works.ts";

export type Ledger = {
  /** Les membres : **soi d'abord** — on lit toujours le Tableau depuis sa
      propre colonne —, puis par Ordre, dans l'ordre des cinq, puis des noms. */
  people: Person[];
  /** Les groupes de colonnes, et combien chacun en couvre. Sa propre colonne
      fait groupe à elle seule, même si l'Ordre qui suit est le sien. */
  bands: { c: Circle; n: number; me: boolean }[];
  works: string[];
  /** **Les quêtes, entre les deux** : qui les a accomplies. L'accomplissement
      se recalcule, il ne se stocke jamais (invariant 28). Elles traversent les
      natures, donc elles ne paraissent pas quand on filtre par nature. */
  quests: { q: OpenQuest; done: Set<string> }[];
  /** Les œuvres du fonds que personne ne suit encore — des lignes vides,
      qu'on peut remplir depuis sa propre colonne. */
  fonds: string[];
  /** La case d'une personne sur une œuvre : `cell[personId][mediaId]`. */
  cell: Record<string, Record<string, Row>>;
};

/** Sans casse ni accents : « eveil » trouve « Les Trois Éveils ». */
const fold = (t: string) => t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export function ledger(w: World, opts: { kind?: MediaType; pref?: "vo" | "fr"; me?: string; q?: string } = {}): Ledger {
  const { kind, pref = "fr", me = "", q = "" } = opts;
  const rank = (p: Person) => (p.id === me ? -1 : CIRCLES.findIndex(c => c.id === p.circleRef.id));
  const people = Object.values(w.people)
    .sort((a, b) => rank(a) - rank(b) || a.firstName.localeCompare(b.firstName, "fr"));

  const bands: Ledger["bands"] = [];
  for (const p of people) {
    const last = bands.at(-1), mine = p.id === me;
    if (last && !mine && !last.me && last.c.id === p.circleRef.id) last.n++;
    else bands.push({ c: p.circleRef, n: 1, me: mine });
  }

  const cell: Ledger["cell"] = {};
  for (const r of w.rows) (cell[r.personId] ??= {})[r.mediaId] = r;

  /* **La recherche interroge toujours les deux titres**, quelle que soit la
     préférence d'affichage (invariant 9). */
  const needle = fold(q.trim());
  const hit = (id: string) => !needle || titlesOf(w, id).some(t => fold(t).includes(needle));

  const quests = kind ? [] : w.quests
    .filter(q => !needle || fold(q.title).includes(needle))
    .sort((a, b) => a.title.localeCompare(b.title, "fr"))
    .map(q => ({ q, done: new Set(people.filter(p => questScore(w, q, p.id).ok).map(p => p.id)) }));

  return { people, bands, works: tracked(w, kind, pref).filter(hit), quests, fonds: unfollowed(w, kind, pref).filter(hit), cell };
}
