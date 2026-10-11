/* La couche du bas, derrière une interface. Deux de ces trois adaptateurs
   changent entre le bureau et Android ; aucun bloc au-dessus ne doit le
   savoir. Invariant 15 : aucun secret ne passe par ici en clair. */

/** Un fichier du dépôt de données, tel que le stockage le rend. */
export type Blob = { path: string; sha: string; text: string };

/** Ce que le stockage sait faire. GitHub en est une implémentation. */
export interface Storage {
  /** Tous les chemins et leurs SHA en un appel — c'est ce qui rend l'ouverture rapide. */
  list(): Promise<{ path: string; sha: string }[]>;
  read(path: string): Promise<Blob | null>;
  /** `sha` est celui qu'on croit remplacer. S'il a bougé : ConflictError. */
  write(path: string, text: string, sha: string | null, message: string): Promise<Blob>;
  /** Le seul geste qu'un compte hors de l'organisation puisse faire. */
  openIssue(title: string, body: string): Promise<{ number: number; url: string }>;
  /** Le rôle, lu dans l'organisation — jamais une liste maison (invariant 10). */
  roleOf(login: string): Promise<"admin" | "member" | null>;
}

/** Levée quand le SHA fourni n'est plus celui du dépôt. Mesuré : GitHub rend 409. */
export class ConflictError extends Error {
  constructor(public path: string) {
    super(`Le fichier ${path} a changé depuis la dernière lecture.`);
    this.name = "ConflictError";
  }
}

/** Le jeton ne traverse jamais l'interface. Implémentation portable, pas de
    bibliothèque de trousseau propre au bureau — sinon l'APK devient coûteux. */
export interface Secrets {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  clear(key: string): Promise<void>;
}

export interface Cache {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
}

export type Platform = { storage: Storage; secrets: Secrets; cache: Cache };
