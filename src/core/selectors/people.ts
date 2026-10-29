import type { CircleId } from "../model/schema.ts";
import { FAV_MAX } from "../model/schema.ts";
import { inCircle, type Person, type World } from "../model/world.ts";
import { avgOf, titleOf } from "./works.ts";

export const person = (w: World, id: string): Person | undefined => w.people[id];
export const everyone = (w: World) => Object.values(w.people);
export const membersOf = (w: World, cid: CircleId) => everyone(w).filter(p => p.circle === cid);

/** Un favori est **déclaré**, jamais dérivé d'un classement de notes
    (invariant 24). On peut distinguer une œuvre qu'on a jugée moyenne ; on ne
    distingue pas ce qu'on convoite sans l'avoir fréquenté. */
export const favsOf = (w: World, pid: string) =>
  (w.people[pid]?.favorites ?? []).filter(id => w.catalog[id]);

export const canFavor = (w: World, pid: string, mediaId: string) => {
  const r = w.rows.find(x => x.personId === pid && x.mediaId === mediaId);
  return !!r && r.status !== "wishlist";
};

export const favFull = (w: World, pid: string) => favsOf(w, pid).length >= FAV_MAX;

export type MagnumRow = { id: string; holders: Person[]; rank: number; avg: number | null };

/** Le Magnum opus d'un Ordre somme les distinctions de ses membres — ce qu'ils
    ont **déclaré**, jamais ce qu'ils ont le mieux noté. Ce qui réunit le plus
    de voix passe devant ; à égalité, le rang que ses tenants lui donnent
    tranche, puis le jugement de l'Ordre.
    **C'est le seul accord de l'application qui se déclare au lieu d'être
    calculé** — et quand rien ne réunit deux voix, on le dit. */
export function magnum(w: World, cid: CircleId, pref: "vo" | "fr" = "fr"): MagnumRow[] {
  const by: Record<string, { id: string; holders: Person[]; rank: number }> = {};
  for (const p of membersOf(w, cid))
    favsOf(w, p.id).forEach((id, rank) => {
      (by[id] ??= { id, holders: [], rank: 0 });
      by[id].holders.push(p);
      by[id].rank += rank;
    });
  return Object.values(by)
    .map(x => ({ ...x, avg: avgOf(w.rows.filter(r => r.mediaId === x.id && inCircle(w, cid)(r))) }))
    .sort((a, b) =>
      b.holders.length - a.holders.length ||
      a.rank / a.holders.length - b.rank / b.holders.length ||
      (b.avg ?? 0) - (a.avg ?? 0) ||
      titleOf(w, a.id, pref).localeCompare(titleOf(w, b.id, pref), "fr"));
}

/* --- Le tempérament, et la ligne de caractère ---------------------------- */

export type Temper = {
  avg: number | null; gavg: number | null;
  /** L'écart au jugement du groupe. Négatif : juge plus durement. */
  sev: number | null;
  rate: number; grate: number;
  pref: string | null; prefShare: number;
};

export function temper(w: World, rows: typeof w.rows): Temper {
  const all = w.rows;
  const a = avgOf(rows), ga = avgOf(all);
  const done = (r: { status: string }) => r.status === "completed";
  const fin = rows.filter(done).length, eng = rows.filter(r => r.status !== "wishlist").length;
  const gfin = all.filter(done).length, geng = all.filter(r => r.status !== "wishlist").length;
  const k: Record<string, number> = {};
  for (const r of rows) { const t = w.catalog[r.mediaId]?.mediaType; if (t) k[t] = (k[t] ?? 0) + 1; }
  const top = Object.entries(k).sort((x, y) => y[1] - x[1])[0];
  return {
    avg: a, gavg: ga,
    sev: a !== null && ga !== null ? a - ga : null,
    rate: eng ? fin / eng : 0, grate: geng ? gfin / geng : 0,
    pref: top ? top[0] : null, prefShare: top && rows.length ? top[1] / rows.length : 0,
  };
}
