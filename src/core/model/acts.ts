/* Les actes : ce qu'on peut inscrire, écrit une fois et nommé en français.

   Chacun est une **intention** — une fonction qui modifie le fragment — et
   non un instantané : c'est ce qui permet au scribe de la rejouer sur une
   version plus fraîche en cas de conflit.

   Et chacun ne touche **que le fragment de celui qui agit**. Il n'y a pas
   d'acte qui écrive ailleurs, et il ne peut pas y en avoir. */

import { FAV_MAX, type Act, type Entry, type Shard, type Status, type Work } from "./schema.ts";
import type { Mutation } from "./write.ts";

const now = () => new Date().toISOString();

/** Poser ou changer sa position sur une œuvre. */
export const inscrire = (mediaId: string, patch: Partial<Entry>, work?: Work): Mutation => ({
  label: "inscrit une œuvre",
  apply: s => {
    if (work && !s.works[mediaId]) s.works[mediaId] = work;
    const base: Entry = s.entries[mediaId] ?? { status: "wishlist", rating: null, at: now() };
    s.entries[mediaId] = { ...base, ...patch, at: now() };
  },
});

export const changerStatut = (mediaId: string, status: Status): Mutation => ({
  label: "change un statut",
  apply: s => {
    const e = s.entries[mediaId];
    if (!e) return;
    e.status = status;
    e.at = now();
  },
});

export const juger = (mediaId: string, rating: number | null): Mutation => ({
  label: "porte un jugement",
  apply: s => { const e = s.entries[mediaId]; if (e) { e.rating = rating; e.at = now(); } },
});

/** Un checkpoint : une pensée datée, prise en chemin. **Ce n'est pas une
    chronique en plus court** — deux champs, deux gestes, deux lectures. */
export const poserCheckpoint = (mediaId: string, text: string): Mutation => ({
  label: "pose un checkpoint",
  apply: s => {
    const e = s.entries[mediaId];
    const t = text.trim();
    if (!e || !t) return;
    e.reflections = [...(e.reflections ?? []), { at: now(), text: t }];
  },
});

export const chroniquer = (mediaId: string, title: string, body: string): Mutation => ({
  label: "écrit une chronique",
  apply: s => {
    const e = s.entries[mediaId];
    if (!e) return;
    e.review = { title: title.trim(), body: body.trim() };
    e.at = now();
  },
});

/** Distinguer. **Un favori n'est pas une note** : liste déclarée, ordonnée,
    plafonnée à douze, et jamais dérivée d'un classement. */
export const distinguer = (mediaId: string): Mutation => ({
  label: "distingue une œuvre",
  apply: s => {
    const l = s.favorites ?? [];
    if (l.includes(mediaId)) { s.favorites = l.filter(x => x !== mediaId); return; }
    if (l.length >= FAV_MAX) return;
    s.favorites = [...l, mediaId];
  },
});

export const deplacerFavori = (mediaId: string, d: -1 | 1): Mutation => ({
  label: "réordonne ses favoris",
  apply: s => {
    const l = [...(s.favorites ?? [])];
    const i = l.indexOf(mediaId), j = i + d;
    if (i < 0 || j < 0 || j >= l.length) return;
    [l[i], l[j]] = [l[j], l[i]];
    s.favorites = l;
  },
});

/** Prendre la parole. Le message vit dans le fragment de son auteur et porte
    son Ordre : il y reste même si son auteur en change (invariant 25). */
export const parler = (order: Shard["user"]["circle"], body: string, ref?: string, replyTo?: string): Mutation => ({
  label: "prend la parole",
  apply: s => {
    const t = body.trim();
    if (!t) return;
    const id = `lg-${s.user.id}-${Date.now().toString(36)}`;
    s.loge = [...(s.loge ?? []), { id, order, at: now(), body: t, ...(ref ? { ref } : {}), ...(replyTo ? { replyTo } : {}) }];
  },
});

/** Surligner : une marque personnelle. On ne retire que la sienne. */
export const surligner = (postId: string): Mutation => ({
  label: "surligne un passage",
  apply: s => {
    const l = s.marks ?? [];
    s.marks = l.includes(postId) ? l.filter(x => x !== postId) : [...l, postId];
  },
});

export const ouvrirQuete = (q: NonNullable<Shard["quests"]>[number]): Mutation => ({
  label: "ouvre une quête",
  apply: s => { s.quests = [...(s.quests ?? []), q]; },
});

export const arracherQuete = (id: string): Mutation => ({
  label: "arrache une planche",
  apply: s => { s.quests = (s.quests ?? []).filter(q => q.id !== id); },
});

/** Déclarer une parenté. **Elle n'existera que si l'autre la déclare aussi**,
    en sens inverse — l'application ne peut pas écrire chez lui. */
export const declarerParente = (id: string, rel: string): Mutation => ({
  label: "déclare une parenté",
  apply: s => {
    const l = (s.kin ?? []).filter(k => k.id !== id);
    s.kin = [...l, { id, rel }];
  },
});

/** Une déclaration se retire. Le lien disparaît pour les deux — la parenté
    n'existait que tant que les deux la tenaient. */
export const retirerParente = (id: string): Mutation => ({
  label: "retire une parenté",
  apply: s => { s.kin = (s.kin ?? []).filter(k => k.id !== id); },
});

/** Une ligne au journal du Greffe. **Elle accompagne l'acte, elle ne le
    remplace pas** : admettre se fait dans l'organisation, et le journal dit
    qu'on l'a fait. */
export const consigner = (kind: Act["kind"], what: string, note?: string): Mutation => ({
  label: "tient le journal du greffe",
  apply: s => { s.journal = [...(s.journal ?? []), { at: now(), kind, what, ...(note ? { note } : {}) }]; },
});

/** Fondre un doublon : un alias **déclaré chez soi**, appliqué à la lecture. */
export const fondre = (from: string, to: string): Mutation => ({
  label: "fond un doublon",
  apply: s => {
    s.aliases = [...(s.aliases ?? []).filter(a => a.from !== from), { from, to, at: now() }];
    s.journal = [...(s.journal ?? []), { at: now(), kind: "alias", what: to, note: `${from} → ${to}` }];
  },
});

/** Défaire un alias. **C'est un acte de plus, pas une ligne effacée** : le
    journal garde la fonte et sa défaite. */
export const defaire = (from: string): Mutation => ({
  label: "défait un alias",
  apply: s => {
    const was = (s.aliases ?? []).find(a => a.from === from);
    s.aliases = (s.aliases ?? []).filter(a => a.from !== from);
    if (was) s.journal = [...(s.journal ?? []), { at: now(), kind: "defait", what: from, note: `${from} ⇸ ${was.to}` }];
  },
});

/** La dernière visite, écrite à la fermeture : c'est elle qui donne son sens
    à l'encart du guetteur, qui ne décrit que l'écart avec la précédente. */
export const marquerVisite = (): Mutation => ({
  label: "referme le registre",
  apply: s => { s.seenAt = now(); },
});

export const preferTitres = (v: "vo" | "fr"): Mutation => ({
  label: "change sa préférence de titres",
  apply: s => { s.user.prefs = { ...(s.user.prefs ?? {}), titles: v }; },
});
