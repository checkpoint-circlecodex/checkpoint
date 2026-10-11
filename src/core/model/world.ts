/* Le monde : ce que l'application connaît après avoir lu tous les fragments.
   **Rien ici n'est stocké** (invariant 2) — catalogue, lignes, quêtes, tout
   est recalculé à chaque lecture, et c'est ce qui empêche un agrégat de
   devenir faux puis irrécupérable. */

import type { Alias, CircleId, Entry, Kin, Post, Quest, Shard, User, Work } from "./schema.ts";
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

export type World = {
  people: Record<string, Person>;
  catalog: Record<string, Work>;
  rows: Row[];
  posts: Mention[];
  quests: OpenQuest[];
  /** Les doublons fondus, déclarés par les greffiers (invariant 31). */
  alias: Record<string, string>;
};

/** Descend la chaîne d'alias jusqu'au bout.
    Le compteur n'est pas de la paranoïa : deux greffiers peuvent déclarer
    `a→b` et `b→a` sans se concerter, et une boucle pendrait la page. */
export function canon(alias: Record<string, string>, id: string): string {
  let n = 0;
  while (alias[id] && n++ < 8) id = alias[id];
  return id;
}

export function merge(shards: Shard[]): World {
  /* Les alias se collectent **avant** tout le reste : ils changent la lecture
     de tous les fragments, y compris de ceux lus avant eux. */
  const alias: Record<string, string> = {};
  for (const sh of shards) for (const a of sh.aliases ?? []) alias[a.from] = a.to;

  const catalog: Record<string, Work> = {};
  for (const sh of shards) for (const [id, w] of Object.entries(sh.works)) catalog[id] ??= w;

  const people: Record<string, Person> = {};
  const rows: Row[] = [];
  const posts: Mention[] = [];
  const quests: OpenQuest[] = [];

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
  }

  return { people, catalog, rows, posts, quests, alias };
}

export const emptyWorld = (): World =>
  ({ people: {}, catalog: {}, rows: [], posts: [], quests: [], alias: {} });

/** Une œuvre fondue garde son titre dans le catalogue — on ne supprime rien —
    mais elle ne se montre plus nulle part. */
export const alive = (w: World, id: string) => !w.alias[id];

export const inCircle = (w: World, cid: CircleId) => (r: Row) => w.people[r.personId]?.circle === cid;
