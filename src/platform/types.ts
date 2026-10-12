import type { KnockFields } from "./knock.ts";
import type { ReportFields } from "./report.ts";

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

  /** Le rôle, lu dans l'organisation — jamais une liste maison (invariant 10). */
  roleOf(login: string): Promise<"admin" | "member" | null>;

  /** Ce que GitHub a dit du quota à la dernière réponse. Pour l'établi
      seulement — et jamais présenté comme une gratuité. */
  remaining(): number | null;
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

/** Une demande d'adhésion : une issue du dépôt public. **Son auteur est celui
    que GitHub atteste** (`login`) — jamais ce que le corps prétend. Le reste
    est ce que la personne a écrit au vasistas, et rien ne le garantit. */
export type Knock = {
  issue: number;
  login: string;
  at: string;
  firstName: string;
  vouchedName: string;
  vouchedAs: string;
  discord: string;
  url: string;
};

/** **Sa propre** demande, telle que GitHub la rend. Refermée, elle dit une
    issue : `completed` pour une admission, `not_planned` pour un écart. */
export type MyKnock = Knock & { state: "open" | "closed"; reason: string | null };

/** Ce que l'organisation sait faire pour qui tient le greffe. Chaque geste
    est un appel GitHub : l'application n'a pas d'autorité à elle, elle
    demande (invariant 10). */
export interface Org {
  knocks(): Promise<Knock[]>;
  /** **Une invitation, pas une entrée forcée** : GitHub ne fait entrer
      personne dans une organisation sans son accord. */
  admit(k: Knock, note: string): Promise<void>;
  /** Ferme l'issue avec un mot. Aucune liste noire ne s'ouvre. */
  shun(k: Knock, note: string): Promise<void>;
  setRole(login: string, role: "admin" | "member"): Promise<void>;
  /** Qui tient la charge — lu dans l'organisation, jamais dans un fichier. */
  admins(): Promise<string[]>;

  /* --- Ce que fait celui qui attend à la porte. --- */

  /** **Le seul geste qu'un compte hors de l'organisation puisse faire** :
      ouvrir une issue sur le dépôt public. Le format est celui de `knock.ts`. */
  knock(login: string, f: KnockFields): Promise<MyKnock>;
  /** Sa dernière demande, ouverte ou refermée — `null` s'il n'y en a pas. */
  myKnock(login: string): Promise<MyKnock | null>;
  /** **Sa propre** adhésion : `pending` tant qu'une invitation attend,
      `active` une fois entré, `null` sinon. */
  membership(): Promise<"active" | "pending" | null>;
  /** Accepter l'invitation **à la place de la personne**. Sans ça, le critère
      de la V1 tombe sur un courriel de GitHub qu'il faudrait savoir lire. */
  accept(): Promise<void>;
  /** Où GitHub montre l'invitation, pour le cas où on n'a pas pu l'accepter d'ici. */
  invitationUrl(): Promise<string>;

  /** **Signaler un défaut** : une issue du dépôt public, au format de
      `report.ts`. Publique — l'écran le dit avant l'envoi. */
  report(f: ReportFields): Promise<{ issue: number; url: string }>;
}

/** Ce qui est publié, et de quoi s'y mettre. Deux chemins, et c'est voulu :
    la mise à jour de Tauri ne couvre pas Android, **le bandeau marche
    partout** — il lit les versions publiées sur le dépôt public. */
export interface Updates {
  /** La dernière version publiée — `null` s'il n'y en a aucune. */
  latest(): Promise<{ version: string; url: string } | null>;
  /** Télécharger, vérifier la signature du projet, installer, relancer.
      `false` si cette plateforme ne sait pas le faire : on renvoie alors
      vers la page de la version. */
  install(): Promise<boolean>;
}

export type Platform = {
  storage: Storage; cache: Cache; session: Session; org: Org; updates: Updates;
  /** Ouvrir une page **de GitHub** dans le navigateur de la personne. Le natif
      refuse tout autre hôte : la page ne peut envoyer personne ailleurs. */
  open(url: string): Promise<void>;
};
