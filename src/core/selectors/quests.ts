/* Les quêtes. **Un palier est monotone** : une fois atteint, il ne se reperd
   pas — c'est ce qui rend une quête honnête, on ne se réveille jamais
   désaccompli parce qu'on a changé un statut.

   D'où l'échelle, et elle seule : avoir renoncé ou accompli, c'est avoir
   entrepris ; accompli vaut achevé. **« Suspendu » n'est pas un palier**, et
   c'est précisément parce qu'on en sort. Si un palier non monotone est
   demandé un jour, c'est là qu'il faut s'arrêter et en parler (invariant 28). */

import type { CircleId, Status } from "../model/schema.ts";
import type { OpenQuest, Person, World } from "../model/world.ts";
import { membersOf } from "./people.ts";

export const RANK: Record<Status, number> =
  { wishlist: 1, playing: 2, paused: 2, dropped: 2, completed: 3, mastered: 3 };

export type Rung = { k: 1 | 2 | 3; v: string; pp: string; p: string; d: string };

export const RUNGS: Rung[] = [
  { k: 1, v: "Convoiter",    pp: "convoité",  p: "convoitée",  d: "l'avoir inscrite, au moins" },
  { k: 2, v: "Entreprendre", pp: "entrepris", p: "entreprise", d: "l'avoir commencée — renoncer ou accomplir comptent aussi" },
  { k: 3, v: "Achever",      pp: "achevé",    p: "achevée",    d: "l'avoir menée au bout — accompli vaut achevé" },
];

export const rung = (k: number): Rung => RUNGS.find(r => r.k === k) ?? RUNGS[1];

export const reached = (w: World, pid: string, mediaId: string): number => {
  const r = w.rows.find(x => x.personId === pid && x.mediaId === mediaId);
  return r ? (RANK[r.status] ?? 0) : 0;
};

export const questById = (w: World, id: string) => w.quests.find(q => q.id === id) ?? null;

/** Les œuvres d'une quête qui existent encore au catalogue. Une quête bâtie
    sur une œuvre disparue ne doit pas devenir inaccomplissable en silence. */
export const questMedia = (w: World, q: OpenQuest) =>
  q.trials.flatMap(t => t.media).filter(m => w.catalog[m]);

/** **Jamais stocké** : un accomplissement est un calcul, comme tout le reste. */
export function questScore(w: World, q: OpenQuest, pid: string) {
  let done = 0, all = 0;
  for (const t of q.trials)
    for (const m of t.media) {
      if (!w.catalog[m]) continue;
      all++;
      if (reached(w, pid, m) >= t.rung) done++;
    }
  return { done, all, ok: all > 0 && done === all };
}

/** **Nul ne valide une quête.** Elle s'accomplit d'elle-même, à mesure que les
    registres avancent — il n'y a personne à convaincre, donc rien à administrer. */
export const questHolders = (w: World, q: OpenQuest): Person[] =>
  Object.values(w.people).filter(p => questScore(w, q, p.id).ok);

export const questsDoneBy = (w: World, pid: string) =>
  w.quests.filter(q => questScore(w, q, pid).ok);

export const questsOpenFor = (w: World, pid: string) =>
  w.quests
    .filter(q => { const s = questScore(w, q, pid); return !s.ok && s.done > 0; })
    .sort((a, b) => {
      const sa = questScore(w, a, pid), sb = questScore(w, b, pid);
      return sb.done / sb.all - sa.done / sa.all;
    });

export const questsInCircle = (w: World, cid: CircleId) => {
  const ms = membersOf(w, cid).map(p => p.id);
  return w.quests
    .map(q => ({ q, holders: ms.filter(id => questScore(w, q, id).ok).map(id => w.people[id]) }))
    .filter(x => x.holders.length)
    .sort((a, b) => b.holders.length - a.holders.length || a.q.title.localeCompare(b.q.title, "fr"));
};

/** Une quête n'a pas de date d'accomplissement — et ne peut pas en avoir, vu
    qu'elle n'est jamais stockée. On la date donc par **la dernière inscription
    qui l'a scellée**. C'est ce qui permet à l'encart du guetteur d'en parler. */
export function sealedAt(w: World, q: OpenQuest, pid: string): string {
  return questMedia(w, q).reduce((mx, id) => {
    const r = w.rows.find(x => x.personId === pid && x.mediaId === id);
    return r && r.at > mx ? r.at : mx;
  }, "");
}
