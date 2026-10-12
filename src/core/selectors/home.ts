/* Ce que l'accueil tire du monde : le Sort, tes affaires, et l'encart du
   guetteur. Des fonctions pures, comme le reste — le hasard du Sort est
   injecté, pour qu'un essai puisse le fixer. */

import { roman } from "../model/lexicon.ts";
import type { CircleId } from "../model/schema.ts";
import type { Row, World } from "../model/world.ts";
import { nameList } from "./kin.ts";
import { logeOf } from "./loge.ts";
import { questHolders, questMedia, questScore, sealedAt } from "./quests.ts";
import { tracked } from "./works.ts";

/** **Le Sort tire de préférence une œuvre dont tu n'as encore rien dit.**
    Un hasard qui te ressert ce que tu connais n'apprend rien. */
export function drawLot(w: World, me: string, type: string | null, rnd: () => number = Math.random): string | null {
  const all = tracked(w, (type || undefined) as never);
  if (!all.length) return null;
  const fresh = all.filter(id => !w.rows.some(r => r.personId === me && r.mediaId === id));
  const src = fresh.length ? fresh : all;
  return src[Math.floor(rnd() * src.length)];
}

/** Ce que tu as convoité et que d'autres ont **achevé depuis** : la
    convoitise d'hier est devenue une conversation possible. */
export function covetedDoneByOthers(w: World, me: string) {
  return w.rows
    .filter(r => r.personId === me && r.status === "wishlist")
    .map(r => ({
      r,
      by: w.rows.filter(x => x.mediaId === r.mediaId && x.personId !== me
        && (x.status === "completed" || x.status === "mastered") && x.at > r.at),
    }))
    .filter(x => x.by.length);
}

export type Watch = { text: string; href: string };

/** **L'encart du guetteur** : ce que la synchronisation vient de révéler, et
    rien d'autre. Ce n'est pas une notification — il n'y en a pas, et il n'y
    en aura pas. Il ne se ferme pas, ne se compte pas, et disparaît de
    lui-même à la visite suivante : **il ne décrit que l'écart avec la
    précédente.** Une annonce par ligne, quatre au plus. */
export function watchItems(w: World, me: string, since: string, knocksSince = 0): Watch[] {
  const p = w.people[me];
  if (!p || !since) return [];
  const out: Watch[] = [];

  const msgs = logeOf(w, p.circle as CircleId).filter(m => m.at > since && m.personId !== me);
  if (msgs.length) {
    const who = [...new Set(msgs.map(m => m.personId))];
    out.push({
      text: msgs.length === 1
        ? `${w.people[who[0]]?.firstName ?? "Quelqu'un"} a pris la parole dans ta Loge`
        : `${roman(msgs.length)} paroles nouvelles dans ta Loge, de ${nameList(w, who)}`,
      href: `#/cercles/${p.circle}`,
    });
  }

  /* Une quête n'a pas de date d'accomplissement — elle n'est jamais
     stockée. On la date par la dernière inscription qui l'a scellée. */
  for (const q of w.quests)
    if (questScore(w, q, me).ok && sealedAt(w, q, me) > since)
      out.push({ text: `Tu as accompli « ${q.title} »`, href: `#/quete/${q.id}` });

  for (const q of w.quests.filter(q => q.personId === me)) {
    const late = questHolders(w, q).filter(h => h.id !== me && questMedia(w, q).some(id => {
      const r = w.rows.find(x => x.personId === h.id && x.mediaId === id);
      return !!r && r.at > since;
    }));
    if (late.length)
      out.push({
        text: `${nameList(w, late.map(h => h.id))} ${late.length > 1 ? "ont" : "a"} accompli ta quête « ${q.title} »`,
        href: `#/quete/${q.id}`,
      });
  }

  /* Pour qui tient la charge seulement : personne n'est averti d'une
     demande, donc elle doit se voir au seul moment où l'on regarde. */
  if (knocksSince)
    out.push({
      text: knocksSince === 1 ? "Quelqu'un frappe à la porte" : `${roman(knocksSince)} demandes d'entrée attendent au greffe`,
      href: "#/greffe",
    });

  return out.slice(0, 4);
}

export const myUnderway = (w: World, me: string): Row[] =>
  w.rows.filter(r => r.personId === me && r.status === "playing").sort((a, b) => b.at.localeCompare(a.at));
