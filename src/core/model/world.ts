/* Le monde : ce que l'application connaît après avoir lu tous les fragments.
   **Rien ici n'est stocké** (invariant 2) — catalogue, lignes, quêtes, tout
   est recalculé à chaque lecture, et c'est ce qui empêche un agrégat de
   devenir faux puis irrécupérable. */

import type { Act, CircleId, Correction, Entry, Fonds, Frame, Kin, Post, Quest, Shard, User, Work } from "./schema.ts";

/** Un cadrage lu dans un fichier ne se croit pas sur parole : des nombres,
    dans l'image, une fenêtre non vide. Sinon, pas de cadrage — la jaquette
    s'affiche centrée, ce qui vaut mieux qu'une image hors du cadre. */
export function frameOf(f: unknown): Frame | undefined {
  const o = f as Frame | undefined;
  if (!o || ![o.x, o.y, o.w].every(n => typeof n === "number" && Number.isFinite(n))) return undefined;
  if (o.w <= 0 || o.w > 1 || o.x < 0 || o.y < 0 || o.x + o.w > 1.0001 || o.y >= 1) return undefined;
  return { x: o.x, y: o.y, w: o.w };
}
import { type Circle, circle } from "./lexicon.ts";

/** Une personne, telle que les vues la lisent. */
export type Person = User & {
  circleRef: Circle;
  favorites: string[];
  marks: string[];
  kin: Kin[];
  seenAt?: string;
};

/** Une inscription, à plat : l'entrée plus qui l'a posée et sur quoi. */
export type Row = Entry & { mediaId: string; personId: string };

export type Mention = Post & { personId: string };
export type OpenQuest = Quest & { personId: string };
/** Un acte de greffier, avec qui l'a fait. */
export type SignedAct = Act & { by: string };

export type World = {
  people: Record<string, Person>;
  catalog: Record<string, Work>;
  rows: Row[];
  posts: Mention[];
  quests: OpenQuest[];
  /** Les doublons fondus, déclarés par les greffiers (invariant 31). */
  alias: Record<string, string>;
  /** Le journal du Greffe, sommé depuis le fragment de chaque greffier. */
  journal: SignedAct[];
  /** Les œuvres **versées au fonds** — choisissables, suivies ou non. Elles
      sont au catalogue pour qu'on puisse les ouvrir et les inscrire ; elles
      ne sont **au corpus** que si quelqu'un les suit (`tracked`). */
  fonds: string[];
};

/** Descend la chaîne d'alias jusqu'au bout.
    Le compteur n'est pas de la paranoïa : deux greffiers peuvent déclarer
    `a→b` et `b→a` sans se concerter, et une boucle pendrait la page. */
export function canon(alias: Record<string, string>, id: string): string {
  let n = 0;
  while (alias[id] && n++ < 8) id = alias[id];
  return id;
}

export function merge(shards: Shard[], fondsFiles: Fonds[] = []): World {
  /* Les alias se collectent **avant** tout le reste : ils changent la lecture
     de tous les fragments, y compris de ceux lus avant eux. */
  const alias: Record<string, string> = {};
  for (const sh of shards) for (const a of sh.aliases ?? []) alias[a.from] = a.to;

  /* La description d'une œuvre est la **première contribution** — mais deux
     choses s'y somment au lieu de s'y écraser, parce que chacun peut les
     poser depuis son propre fragment : **les catégories s'additionnent**, et
     **la jaquette la plus récente l'emporte** (`coverAt`). C'est encore la
     même grammaire : déclaré chez soi, sommé à la lecture. */
  const catalog: Record<string, Work> = {};
  const genres: Record<string, { g: string[]; at: string }[]> = {};
  const covers: Record<string, { url: string; at: string; frame?: Frame }> = {};
  const offerCover = (id: string, url: string, at: string, frame?: unknown) => {
    if (!covers[id] || at > covers[id].at) covers[id] = { url, at, frame: frameOf(frame) };
  };
  const take = (id: string, w: Work) => {
    catalog[id] ??= { ...w };
    if (w.genres?.length) (genres[id] ??= []).push({ g: w.genres, at: w.genresAt ?? "" });
    if (w.cover !== undefined && w.coverAt) offerCover(id, w.cover, w.coverAt, w.coverFrame);
  };
  for (const sh of shards) for (const [id, w] of Object.entries(sh.works)) take(id, w);
  /* Le fonds vient **après** les fragments : quand quelqu'un suit déjà une
     œuvre, c'est sa description qui fait foi, pas celle du fonds. */
  const fondsIds = new Set<string>();
  for (const f of fondsFiles)
    for (const [id, w] of Object.entries(f.works ?? {})) { take(id, w); fondsIds.add(id); }
  /* **Les corrections de greffier**, de la plus ancienne à la plus récente :
     la dernière l'emporte, champ par champ. Appliquées à la lecture — le
     fichier de qui a mal saisi un titre n'est jamais touché. Un titre
     français vide efface le titre français. Des catégories réassignées
     **remettent à zéro** : seules s'y ajoutent celles posées après. */
  const corrections: Correction[] = [];
  for (const sh of shards) corrections.push(...(sh.corrections ?? []));
  corrections.sort((a, b) => a.at.localeCompare(b.at));
  const reset: Record<string, { g: string[]; at: string }> = {};
  for (const c of corrections) {
    const w = catalog[c.id];
    if (!w) continue;
    if (c.title?.trim()) w.title = c.title.trim();
    if (c.titleFr !== undefined) { if (c.titleFr.trim()) w.titleFr = c.titleFr.trim(); else delete w.titleFr; }
    if (typeof c.year === "number" && Number.isFinite(c.year)) w.year = c.year;
    if (c.genres) reset[c.id] = { g: c.genres, at: c.at };
    if (c.cover !== undefined) offerCover(c.id, c.cover, c.at);
  }
  for (const id of Object.keys(catalog)) {
    const r = reset[id];
    const all = new Set<string>(r?.g ?? []);
    for (const k of genres[id] ?? []) if (!r || k.at > r.at) for (const g of k.g) all.add(g);
    if (all.size || r) catalog[id].genres = [...all];
    if (covers[id]) {
      const c = covers[id];
      if (c.url) catalog[id].cover = c.url; else delete catalog[id].cover;
      if (c.url && c.frame) catalog[id].coverFrame = c.frame; else delete catalog[id].coverFrame;
    } else if (catalog[id].coverFrame) {
      const f = frameOf(catalog[id].coverFrame);
      if (f) catalog[id].coverFrame = f; else delete catalog[id].coverFrame;
    }
  }

  const people: Record<string, Person> = {};
  const rows: Row[] = [];
  const posts: Mention[] = [];
  const quests: OpenQuest[] = [];
  const journal: SignedAct[] = [];

  for (const sh of shards) {
    people[sh.user.id] = {
      ...sh.user,
      circleRef: circle(sh.user.circle),
      favorites: [...new Set((sh.favorites ?? []).map(id => canon(alias, id)))].filter(id => catalog[id]),
      marks: sh.marks ?? [],
      kin: sh.kin ?? [],
      seenAt: sh.seenAt,
    };

    /* Le repli des alias se fait **ici**, à la lecture, jamais dans le fichier
       de quelqu'un. Et si une même personne tenait les deux entrées d'un
       doublon, elle n'en garde qu'une : la plus récente. */
    const held: Record<string, Row> = {};
    for (const [rawId, e] of Object.entries(sh.entries)) {
      const mediaId = canon(alias, rawId);
      if (!catalog[mediaId]) continue;
      const prev = held[mediaId];
      if (prev) { if (e.at > prev.at) Object.assign(prev, e, { mediaId }); continue; }
      const row: Row = { ...e, mediaId, personId: sh.user.id };
      held[mediaId] = row;
      rows.push(row);
    }

    for (const m of sh.loge ?? []) posts.push({ ...m, personId: sh.user.id });
    for (const q of sh.quests ?? []) quests.push({ ...q, personId: sh.user.id });
    for (const a of sh.journal ?? []) journal.push({ ...a, by: sh.user.id });
  }

  journal.sort((a, b) => b.at.localeCompare(a.at));
  return { people, catalog, rows, posts, quests, alias, journal, fonds: [...fondsIds] };
}

export const emptyWorld = (): World =>
  ({ people: {}, catalog: {}, rows: [], posts: [], quests: [], alias: {}, journal: [], fonds: [] });

/** Une œuvre fondue garde son titre dans le catalogue — on ne supprime rien —
    mais elle ne se montre plus nulle part. */
export const alive = (w: World, id: string) => !w.alias[id];

export const inCircle = (w: World, cid: CircleId) => (r: Row) => w.people[r.personId]?.circle === cid;
