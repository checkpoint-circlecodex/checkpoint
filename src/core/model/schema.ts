/* Le fragment d'une personne — le seul fichier qu'elle écrit (invariant 1).
   Règles qui gouvernent ce fichier et qu'on ne contourne pas :
   · `schemaVersion` partout, migrations côté client (invariant 3) ;
   · on n'enlève jamais un champ, on en ajoute (invariant 4) ;
   · `mediaType` est présent partout (invariant 5) ;
   · la section d'œuvres s'appelle `works`, jamais `games` (invariant 6) ;
   · aucun agrégat n'est stocké (invariant 2) — rien ici n'est un total. */

export const SCHEMA_VERSION = 1;

export type MediaType = "game" | "film" | "series" | "book";

/** Les six états. `paused` n'est pas un palier de quête : on en sort. */
export type Status = "wishlist" | "playing" | "paused" | "completed" | "mastered" | "dropped";

export type Progress = { unit: "hours" | "episodes" | "pages" | "chapters"; value: number };

/** Une pensée prise en chemin. Ce n'est pas une chronique en plus court. */
export type Checkpoint = { at: string; text: string };

/** Un jugement rédigé. Une œuvre n'en porte qu'un par personne. */
export type Review = { title: string; body: string };

export type Entry = {
  status: Status;
  rating: number | null;
  at: string;
  progress?: Progress;
  plays?: number;
  with?: string[];
  reflections?: Checkpoint[];
  review?: Review;
};

/** Ce qu'une personne apporte au catalogue commun. L'identité d'une œuvre est
    son identifiant de source, jamais son titre (invariant 9). */
export type Work = {
  mediaType: MediaType;
  title: string;
  titleFr?: string;
  year: number;
  cover?: string;
  genres?: string[];
  platforms?: string[];
  /** Inscrite à la main faute d'avoir été trouvée — candidate à un doublon. */
  manual?: boolean;
};

export type CircleId = "mage" | "guerrier" | "ranger" | "soigneur" | "barde";

export type User = {
  id: string;              // compte GitHub — immuable, il nomme le fichier
  firstName: string;
  handle: string;
  circle: CircleId;
  tone?: string;           // le fond du portrait
  sign?: string;           // l'emblème
  discord?: string;
  prefs?: { titles?: "vo" | "fr" };
  links?: Record<string, string>;
};

/** Un message de la Loge vit chez son auteur et porte son Ordre (invariant 25). */
export type Post = { id: string; order: CircleId; at: string; body: string; ref?: string; replyTo?: string };

/** Une épreuve : un palier atteint sur un groupe d'œuvres. Monotone. */
export type Trial = { rung: 1 | 2 | 3; media: string[] };
export type Quest = { id: string; at: string; title: string; line: string; trials: Trial[] };

/** Une parenté n'existe que déclarée des deux côtés (invariant 29). */
export type Kin = { id: string; rel: string };

/** Un doublon fondu : déclaré chez le greffier, appliqué à la lecture (invariant 31). */
export type Alias = { from: string; to: string; at: string };

/** Une ligne du journal du Greffe, **rangée chez le greffier qui a agi** et
    sommée à la lecture. Rien ne s'y efface : un acte défait est un acte de
    plus, pas une ligne retirée. */
export type Act = {
  at: string;
  kind: "admission" | "ecart" | "alias" | "defait" | "greffe";
  what: string;
  note?: string;
};

export type Shard = {
  schemaVersion: number;
  user: User;
  updatedAt: string;
  works: Record<string, Work>;
  entries: Record<string, Entry>;
  favorites?: string[];    // déclarées, plafonnées à douze (invariant 24)
  marks?: string[];        // surlignages, personnels (invariant 26)
  loge?: Post[];
  quests?: Quest[];
  kin?: Kin[];
  aliases?: Alias[];       // seulement chez qui tient le greffe
  journal?: Act[];         // les actes de greffier, chez qui les a faits
  seenAt?: string;         // dernière visite, pour l'encart du guetteur
};

export const FAV_MAX = 12;

/** Le chemin du fragment d'une personne. Le compte GitHub nomme le fichier
    (invariant 8) : un pseudo se change, un identifiant non. */
export const shardPath = (id: string) => `data/${id}.json`;
