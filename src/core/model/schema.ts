/* Le fragment d'une personne — le seul fichier qu'elle écrit (invariant 1).
   Règles qui gouvernent ce fichier et qu'on ne contourne pas :
   · `schemaVersion` partout, migrations côté client (invariant 3) ;
   · on n'enlève jamais un champ, on en ajoute (invariant 4) ;
   · `mediaType` est présent partout (invariant 5) ;
   · la section d'œuvres s'appelle `works`, jamais `games` (invariant 6) ;
   · aucun agrégat n'est stocké (invariant 2) — rien ici n'est un total. */

export const SCHEMA_VERSION = 1;

export type MediaType = "game" | "film" | "series" | "book";

/** **Les quatre états.** Il y en eut six : « suspendu » (`paused`) et
    « accompli » (`mastered`) ont été retirés le 29 octobre, à la demande de
    Nathan — l'un se confondait avec « entrepris », l'autre avec « achevé ».
    Des fragments les portent encore : `migrate()` les lit comme
    `playing` et `completed` (voir `LEGACY_STATUS`). */
export type Status = "wishlist" | "playing" | "completed" | "dropped";

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

/** **Le cadrage d'une jaquette** — on ne stocke jamais l'image, donc on ne
    la recadre pas : on dit **quelle part en montrer**. `x`, `y` : le coin
    haut-gauche de la fenêtre, en fraction de l'image ; `w` : sa largeur, en
    fraction de l'image (le zoom est `1 / w`). La hauteur suit, par le format
    deux sur trois du cadre. */
export type Frame = { x: number; y: number; w: number };

/** Ce qu'une personne apporte au catalogue commun. L'identité d'une œuvre est
    son identifiant de source, jamais son titre (invariant 9). */
export type Work = {
  mediaType: MediaType;
  title: string;
  titleFr?: string;
  year: number;
  /** L'adresse d'une jaquette — **jamais ses octets** : Git n'efface jamais
      un binaire remplacé. Vide : retirée. */
  cover?: string;
  /** Quand cette jaquette a été posée. Chacun porte la sienne dans son
      fragment ; **la plus récente l'emporte**, pour tout le monde. */
  coverAt?: string;
  /** Le cadrage de cette jaquette. Il voyage avec elle : poser une jaquette,
      c'est poser une image **et** sa façon d'être montrée. */
  coverFrame?: Frame;
  /** Quand ces catégories ont été posées : une correction de greffier les
      remet à zéro, et seules celles posées **après** s'y ajoutent. */
  genresAt?: string;
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

/** **Une correction de fiche** — titre, titre français, année — déclarée
    chez le greffier qui la fait, appliquée à la lecture, pour tout le monde.
    La plus récente l'emporte, champ par champ. Même grammaire que l'alias
    (invariant 31) : rien n'est réécrit dans le fichier d'un autre. */
export type Correction = {
  id: string; at: string; title?: string; titleFr?: string; year?: number;
  /** Les catégories **réassignées** : elles remplacent tout ce qui avait été
      posé avant — c'est la seule façon de retirer une catégorie fausse. */
  genres?: string[];
  /** Une jaquette posée par le greffier : elle concourt avec les autres, la
      plus récente l'emporte. */
  cover?: string;
};

/** Une ligne du journal du Greffe, **rangée chez le greffier qui a agi** et
    sommée à la lecture. Rien ne s'y efface : un acte défait est un acte de
    plus, pas une ligne retirée. */
export type Act = {
  at: string;
  kind: "admission" | "ecart" | "alias" | "defait" | "greffe" | "correction";
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
  corrections?: Correction[]; // idem : les fiches corrigées par un greffier
  journal?: Act[];         // les actes de greffier, chez qui les a faits
  seenAt?: string;         // dernière visite, pour l'encart du guetteur
};

export const FAV_MAX = 12;

/** Le chemin du fragment d'une personne. Le compte GitHub nomme le fichier
    (invariant 8) : un pseudo se change, un identifiant non. */
export const shardPath = (id: string) => `data/${id}.json`;

/** **Le fonds** : des œuvres versées pour qu'on puisse les choisir, avant
    que quiconque les suive (invariant 36). Un fichier par personne qui
    verse — un seul écrivain, comme partout — sommé à la lecture.

    Les identifiants sont ceux des sources (invariant 9) :
    `tmdb:movie:120`, `tmdb:tv:…`, `igdb:<slug>`, `ol:<œuvre Open Library>`. */
export type Fonds = {
  schemaVersion: number;
  by: string;
  updatedAt: string;
  works: Record<string, Work>;
};

export const fondsPath = (id: string) => `fonds/${id}.json`;
