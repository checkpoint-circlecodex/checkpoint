/* La couche du bas, derrière une interface. Deux de ces adaptateurs changent
   entre le bureau et Android ; aucun bloc au-dessus ne doit le savoir. */

/** Une entrée de l'arbre Git : un chemin, et le SHA de son contenu. */
export type TreeEntry = { path: string; sha: string };

export interface Storage {
  /** Qui est connecté — c'est l'identifiant GitHub, et il nomme le fragment. */
  me(): Promise<string | null>;

  /** Tous les chemins et leurs SHA **en un seul appel**. C'est ce qui rend
      l'ouverture rapide : mesuré à 319 entrées en 195 ms. */
  list(): Promise<TreeEntry[]>;

  /** Un blob est adressé par son contenu : ce SHA ne désignera jamais autre
      chose. C'est ce qui autorise un cache sans invalidation. */
  readBlob(sha: string): Promise<string>;

  /** `sha` est celui qu'on croit remplacer, `null` pour une création.
      S'il a bougé : ConflictError — mesuré, GitHub rend 409. */
  write(path: string, text: string, sha: string | null, message: string): Promise<TreeEntry>;

  /** Le seul geste qu'un compte hors de l'organisation puisse faire. */
  openIssue(title: string, body: string): Promise<{ number: number; url: string }>;

  /** Le rôle, lu dans l'organisation — jamais une liste maison (invariant 10). */
  roleOf(login: string): Promise<"admin" | "member" | null>;
}

export class ConflictError extends Error {
  path: string;
  constructor(path: string) {
    super(`Le fichier ${path} a changé depuis la dernière lecture.`);
    this.name = "ConflictError";
    this.path = path;
  }
}

export class AuthError extends Error {
  constructor(message = "Il faut se connecter.") {
    super(message);
    this.name = "AuthError";
  }
}

/** Le cache de blobs. Clé = SHA, donc aucune politique d'invalidation. */
export interface Cache {
  get(sha: string): Promise<string | null>;
  set(sha: string, value: string): Promise<void>;
  clear(): Promise<number>;
}

/** La connexion.
    ⚠️ **Aucune méthode ne rend le jeton**, et c'est le point entier : il est
    écrit par le device flow côté natif, lu par le client GitHub côté natif, et
    ne traverse jamais le pont. Un `get()` aurait suffi à le mettre dans le DOM
    un jour de fatigue (invariant 15). */
export interface Session {
  has(): Promise<boolean>;
  /** Rend le code à saisir et l'adresse où le saisir. */
  start(): Promise<{ deviceCode: string; userCode: string; uri: string; expiresIn: number; interval: number }>;
  poll(deviceCode: string): Promise<
    | { state: "pending"; interval: number }
    | { state: "ok"; login: string }
    | { state: "error"; message: string }
  >;
  forget(): Promise<void>;
}

export type Platform = { storage: Storage; cache: Cache; session: Session };
