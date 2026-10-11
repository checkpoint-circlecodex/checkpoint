/* La Grande Loge : un message board par Ordre, et surtout pas un salon.

   Chacun n'écrit que dans son propre fragment, donc l'invariant premier tient
   sans un mot de code en plus — et il en découle que **personne n'efface le
   message d'un autre**. On lit tous les Ordres ; on ne prend la parole que
   dans le sien.

   ⚠️ **Règle d'usage, pas clôture** : tout le monde lit le même dépôt.
   L'application fait respecter la convention, elle ne garantit pas le secret,
   et il ne faut jamais laisser croire le contraire (invariant 25). */

import type { CircleId } from "../model/schema.ts";
import type { Mention, World } from "../model/world.ts";

/** Un fil se lit dans le sens du temps, du plus ancien au plus récent : c'est
    ce qui le distingue d'un registre, qui se lit à l'envers. */
export const logeOf = (w: World, cid: CircleId): Mention[] =>
  w.posts.filter(m => m.order === cid).sort((a, b) => a.at.localeCompare(b.at));

export const postById = (w: World, id: string) => w.posts.find(m => m.id === id) ?? null;

export const speaksIn = (w: World, me: string, cid: CircleId) => w.people[me]?.circle === cid;

/** Surligner : une marque personnelle, rangée chez celui qui la pose
    (invariant 26). Un message est surligné dès qu'une personne l'a marqué ;
    on ne retire que la sienne. */
export const marksOf = (w: World, pid: string) => w.people[pid]?.marks ?? [];
export const markers = (w: World, postId: string) =>
  Object.values(w.people).filter(p => marksOf(w, p.id).includes(postId));

/** Replié, le fil ne garde que ce que quelqu'un a voulu pouvoir retrouver.
    **Le surlignage n'est pas une décoration : c'est un index construit à la
    main par ceux qui lisent.** */
export const litIn = (w: World, cid: CircleId) =>
  logeOf(w, cid).filter(m => markers(w, m.id).length > 0);

/** Les messages consécutifs d'une même personne à moins d'un quart d'heure se
    groupent sous un seul nom : **c'est ce groupement qui fait la différence
    entre un fil et un forum.** */
export const GROUP_MS = 15 * 60 * 1000;
export const groupsWith = (prev: Mention | undefined, m: Mention) =>
  !!prev && prev.personId === m.personId &&
  new Date(m.at).getTime() - new Date(prev.at).getTime() < GROUP_MS;
