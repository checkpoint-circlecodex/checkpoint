/* Les actes : ce qu'on peut inscrire, écrit une fois et nommé en français.

   Chacun est une **intention** — une fonction qui modifie le fragment — et
   non un instantané : c'est ce qui permet au scribe de la rejouer sur une
   version plus fraîche en cas de conflit.

   Et chacun ne touche **que le fragment de celui qui agit**. Il n'y a pas
   d'acte qui écrive ailleurs, et il ne peut pas y en avoir. */

import { FAV_MAX, type Act, type Entry, type Shard, type Status, type User, type Work } from "./schema.ts";
import type { Mutation } from "./write.ts";

const now = () => new Date().toISOString();

/** La part d'une description qu'on recopie chez soi quand on ne la porte pas
    encore : **l'identité seule, champ par champ** (invariant 34). Jamais la
    fiche telle que le catalogue la montre — elle somme les catégories et les
    jaquettes des autres, ce serait faire retomber un dérivé dans son fichier. */
export const identity = (w: Work): Work => ({
  mediaType: w.mediaType, title: w.title, year: w.year,
  ...(w.titleFr ? { titleFr: w.titleFr } : {}), ...(w.manual ? { manual: true } : {}),
});
const carry = (s: Shard, id: string, base?: Work) => {
  if (!s.works[id] && base) s.works[id] = identity(base);
  return s.works[id] ?? null;
};

/** Poser ou changer sa position sur une œuvre. */
export const inscrire = (mediaId: string, patch: Partial<Entry>, work?: Work): Mutation => ({
  label: "inscrit une œuvre",
  apply: s => {
    /* Une copie, jamais une référence : un objet partagé entre deux
       fragments — ou entre un fragment et le catalogue — se modifierait des
       deux côtés à la fois. **Les appelants passent l'identité seule**
       quand l'œuvre vient du catalogue (`identity`), la description entière
       seulement quand ils la créent. */
    if (work && !s.works[mediaId]) s.works[mediaId] = { ...work, ...(work.genres ? { genres: [...work.genres] } : {}) };
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

/** **Retirer son message.** Nul n'efface celui d'un autre (invariant 25) —
    on n'a pas accès à son fichier — mais chacun peut retirer le sien. Les
    réponses qui le citaient disent qu'il a été retiré. */
export const retirerMessage = (postId: string): Mutation => ({
  label: "retire un message",
  apply: s => { s.loge = (s.loge ?? []).filter(m => m.id !== postId); },
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

/** **Modifier une planche** — la sienne seulement : elle vit dans son
    fragment. Même identifiant, même date de plantation ; son
    accomplissement se recalcule de lui-même (invariant 28). */
export const modifierQuete = (q: NonNullable<Shard["quests"]>[number]): Mutation => ({
  label: "retouche une planche",
  apply: s => { s.quests = (s.quests ?? []).map(x => (x.id === q.id ? { ...q, at: x.at } : x)); },
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
/** **Entrer.** Le premier acte d'une personne, et le seul qui pose son
    identité : on ne pouvait pas l'écrire avant l'admission, faute de droits
    sur le dépôt. `user` arrive **champ par champ** depuis l'écran d'entrée —
    jamais un objet de vue répandu, qui ferait tomber un dérivé dans le
    fichier (invariant 34). La visite est datée du même geste : une personne
    qui arrive n'a rien manqué, l'encart du guetteur n'a rien à lui dire. */
export const fonder = (user: User): Mutation => ({
  label: "entre dans le registre",
  apply: s => { s.user = { ...user }; s.seenAt = now(); },
});

/** **Avancer** : heures, épisodes ou pages. `null` efface la progression. */
export const avancer = (mediaId: string, unit: "hours" | "episodes" | "pages", value: number | null): Mutation => ({
  label: "avance dans une œuvre",
  apply: s => {
    const e = s.entries[mediaId];
    if (!e) return;
    if (value === null || !Number.isFinite(value) || value < 0) delete e.progress;
    else e.progress = { unit, value };
    e.at = now();
  },
});

/** **Avec** : une œuvre faite à plusieurs. Les chroniques restent
    individuelles ; c'est la fréquentation qui se partage. */
export const accompagner = (mediaId: string, ids: string[]): Mutation => ({
  label: "dit avec qui",
  apply: s => {
    const e = s.entries[mediaId];
    if (!e) return;
    if (ids.length) e.with = [...new Set(ids)]; else delete e.with;
  },
});

/** **Refait** : un passage de plus — rejoué, revu, relu. */
export const refaire = (mediaId: string): Mutation => ({
  label: "refait une œuvre",
  apply: s => {
    const e = s.entries[mediaId];
    if (!e) return;
    e.plays = (e.plays ?? 1) + 1;
    e.at = now();
  },
});

/** **Ses catégories** : elles partent dans sa copie de l'œuvre, et s'ajoutent
    à celles des autres à la lecture — on ne retire pas la catégorie d'un
    autre. */
export const categoriser = (mediaId: string, genres: string[], base?: Work): Mutation => ({
  label: "range une œuvre",
  apply: s => { const w = carry(s, mediaId, base); if (w) w.genres = [...new Set(genres)]; },
});

/** **Poser une jaquette** — son adresse, jamais ses octets. Datée : la plus
    récente l'emporte pour tout le monde. Une adresse vide la retire. */
export const poserJaquette = (mediaId: string, url: string, base?: Work): Mutation => ({
  label: url ? "pose une jaquette" : "retire une jaquette",
  apply: s => { const w = carry(s, mediaId, base); if (w) { w.cover = url.trim(); w.coverAt = now(); } },
});

/** **Retirer de son registre.** Sa ligne, sa copie de l'œuvre, sa
    distinction. L'œuvre reste au corpus tant que quelqu'un d'autre la suit :
    on ne retire que ce qui est à soi. */
export const retirerInscription = (mediaId: string): Mutation => ({
  label: "retire une œuvre de son registre",
  apply: s => {
    delete s.entries[mediaId];
    delete s.works[mediaId];
    if (s.favorites) s.favorites = s.favorites.filter(x => x !== mediaId);
  },
});

export const marquerVisite = (): Mutation => ({
  label: "referme le registre",
  apply: s => { s.seenAt = now(); },
});

export const preferTitres = (v: "vo" | "fr"): Mutation => ({
  label: "change sa préférence de titres",
  apply: s => { s.user.prefs = { ...(s.user.prefs ?? {}), titles: v }; },
});
