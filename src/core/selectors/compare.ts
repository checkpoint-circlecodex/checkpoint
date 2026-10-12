/* **La comparaison — la valeur ajoutée entière de l'application.** Le
   tracker solo existe déjà ; ce que Checkpoint apporte, c'est qui a fini
   quoi, sur quoi on n'est pas d'accord, ce qu'un ami a adoré et qui traîne
   dans sa liste. Porté tel quel du prototype (`kinship`, `peaks`,
   `singularity`, `partisan`), qui fait foi. */

import type { CircleId } from "../model/schema.ts";
import type { Row, World } from "../model/world.ts";
import { avgOf, rowsBy, rowsFor, tracked } from "./works.ts";

const rated = (r: Row): r is Row & { rating: number } => typeof r.rating === "number";
const done = (r: Row) => r.status === "completed" || r.status === "mastered";

export type Pair = { id: string; me: number; them: number; d: number };

/** **Toi et X.** Ce que deux personnes ont fréquenté toutes les deux (une
    convoitise ne compte pas : on ne compare pas ce qu'on n'a pas touché),
    leur écart moyen, leur plus grand désaccord — et ce que l'autre a adoré
    sans que tu en aies rien fait. */
export function affinity(w: World, me: string, other: string) {
  const mine = new Map(rowsBy(w, me).map(r => [r.mediaId, r]));
  const theirs = rowsBy(w, other);
  const common = theirs.filter(r => {
    const m = mine.get(r.mediaId);
    return m && r.status !== "wishlist" && m.status !== "wishlist";
  });
  const pairs: Pair[] = common
    .filter(r => rated(r) && rated(mine.get(r.mediaId)!))
    .map(r => {
      const m = mine.get(r.mediaId)!.rating as number;
      return { id: r.mediaId, them: r.rating as number, me: m, d: Math.abs((r.rating as number) - m) };
    });
  const accord = pairs.length ? pairs.reduce((s, p) => s + p.d, 0) / pairs.length : null;
  const clash = pairs.length ? pairs.reduce((a, p) => (p.d > a.d ? p : a)) : null;
  const urge = theirs
    .filter(r => done(r) && rated(r) && (r.rating as number) >= 9)
    .filter(r => { const m = mine.get(r.mediaId); return !m || m.status === "wishlist"; })
    .sort((a, b) => (b.rating as number) - (a.rating as number));
  return { common, pairs, accord, clash, urge };
}

/** **Les sommets** : ce que quelqu'un tient pour parfait. Calculés — à ne
    pas confondre avec les favoris, qui se déclarent (invariant 24). */
export const peaks = (w: World, pid: string) =>
  rowsBy(w, pid).filter(r => rated(r) && (r.rating as number) >= 9)
    .sort((a, b) => (b.rating as number) - (a.rating as number) || b.at.localeCompare(a.at));

/** **Seul contre le reste** : l'œuvre où quelqu'un s'écarte le plus des
    autres — au moins deux autres jugements, et un écart d'un point et demi. */
export function singularity(w: World, pid: string) {
  let best: { id: string; mine: number; theirs: number; d: number } | null = null;
  for (const r of rowsBy(w, pid)) {
    if (!rated(r)) continue;
    const others = rowsFor(w, r.mediaId).filter(x => x.personId !== pid && rated(x));
    if (others.length < 2) continue;
    const theirs = avgOf(others) as number;
    const d = (r.rating as number) - theirs;
    if (!best || Math.abs(d) > Math.abs(best.d)) best = { id: r.mediaId, mine: r.rating as number, theirs, d };
  }
  return best && Math.abs(best.d) >= 1.5 ? best : null;
}

/** **Ce qu'un Ordre défend** : l'œuvre qu'il juge le plus au-dessus des
    autres Ordres — d'un point au moins. */
export function partisan(w: World, cid: CircleId) {
  let best: { id: string; mine: number; theirs: number; d: number } | null = null;
  for (const id of tracked(w)) {
    const rs = rowsFor(w, id).filter(rated);
    const ins = rs.filter(r => w.people[r.personId]?.circle === cid);
    const out = rs.filter(r => w.people[r.personId]?.circle !== cid);
    if (!ins.length || !out.length) continue;
    const mine = avgOf(ins) as number, theirs = avgOf(out) as number;
    const d = mine - theirs;
    if (!best || d > best.d) best = { id, d, mine, theirs };
  }
  return best && best.d >= 1 ? best : null;
}

/* Les tournures du prototype, pour des traits qui parlent. */
export const signed = (n: number) => (n > 0 ? "+" : "−") + Math.abs(n).toFixed(1).replace(".", ",");
export const pct = (n: number) => `${Math.round(n * 100)} %`;
