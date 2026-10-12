/* Ce qu'on tire du monde à propos des œuvres. Chaque sélecteur prend le monde
   en premier argument : aucune variable globale, donc chacun se vérifie seul. */

import { ORDER } from "../model/lexicon.ts";
import type { MediaType, Status, Work } from "../model/schema.ts";
import { alive, type Row, type World } from "../model/world.ts";

/** Une œuvre porte son titre d'origine et son titre français. Lequel
    s'affiche est une préférence de personne — mais **la recherche interroge
    toujours les deux**, quelle que soit la préférence (invariant 9). */
export const titlesOf = (w: World, id: string): string[] => {
  const m = w.catalog[id];
  return [m?.title, m?.titleFr].filter(Boolean) as string[];
};

export const titleOf = (w: World, id: string, pref: "vo" | "fr" = "fr"): string => {
  const m = w.catalog[id];
  if (!m) return "";
  return pref === "fr" && m.titleFr ? m.titleFr : m.title;
};

export const otherTitle = (w: World, id: string, pref: "vo" | "fr" = "fr"): string | null => {
  const m = w.catalog[id];
  if (!m?.titleFr || m.titleFr === m.title) return null;
  return pref === "fr" ? m.title : m.titleFr;
};

export const matchTitle = (w: World, id: string, q: string) =>
  titlesOf(w, id).some(t => t.toLowerCase().includes(q));

export const byDate = (a: { at: string }, b: { at: string }) => b.at.localeCompare(a.at);

export const rowsFor = (w: World, mediaId: string) =>
  w.rows.filter(r => r.mediaId === mediaId)
        .sort((a, b) => ORDER.indexOf(a.status) - ORDER.indexOf(b.status));

export const rowsBy = (w: World, personId: string) =>
  w.rows.filter(r => r.personId === personId).sort(byDate);

/** Le registre : ce qui a été fréquenté. Une convoitise n'y figure pas — on
    n'inscrit au registre que ce qu'on a touché. */
export const register = (w: World, f: (r: Row) => boolean = () => true) =>
  w.rows.filter(r => r.status !== "wishlist" && f(r)).sort(byDate);

export const chronicles = (w: World, f: (r: Row) => boolean = () => true) =>
  w.rows.filter(r => r.review && f(r)).sort(byDate);

export const underway = (w: World) => w.rows.filter(r => r.status === "playing").sort(byDate);

/** Le catalogue tel qu'on le montre : **une œuvre existe parce qu'au moins une
    personne la suit**, et les doublons fondus n'y paraissent plus. */
export const tracked = (w: World, t?: MediaType, pref: "vo" | "fr" = "fr") =>
  Object.keys(w.catalog)
    .filter(id => alive(w, id) && (!t || w.catalog[id].mediaType === t) && w.rows.some(r => r.mediaId === id))
    .sort((a, b) => titleOf(w, a, pref).localeCompare(titleOf(w, b, pref), "fr"));

/** **Au fonds, personne ne les suit encore** : versées pour qu'on puisse les
    choisir, pas encore au corpus. Elles le rejoignent à la première
    inscription — et le corpus reste ce que les gens suivent. */
export const unfollowed = (w: World, t?: MediaType, pref: "vo" | "fr" = "fr") =>
  w.fonds
    .filter(id => alive(w, id) && w.catalog[id] && (!t || w.catalog[id].mediaType === t) && !w.rows.some(r => r.mediaId === id))
    .sort((a, b) => titleOf(w, a, pref).localeCompare(titleOf(w, b, pref), "fr"));

export const avgOf = (rows: Row[]): number | null => {
  const r = rows.filter(x => typeof x.rating === "number");
  return r.length ? r.reduce((s, x) => s + (x.rating as number), 0) / r.length : null;
};

export const progressOf = (r: Row, unit: Record<string, string>) =>
  r.progress ? r.progress.value + (unit[r.progress.unit] ?? "") : null;

/** Les chiffres d'une personne. Recalculés, jamais rangés (invariant 2). */
export function figures(w: World, personId: string) {
  const rs = rowsBy(w, personId);
  const n = (...s: Status[]) => rs.filter(r => s.includes(r.status)).length;
  return {
    done: n("completed"), master: n("mastered"), under: n("playing"), gone: n("dropped"),
    avg: avgOf(rs),
    hours: rs.reduce((s, r) => s + (r.progress?.unit === "hours" ? r.progress.value : 0), 0),
  };
}

export const work = (w: World, id: string): Work | undefined => w.catalog[id];
