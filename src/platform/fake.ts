/* Le faux, en mémoire. Il existe pour que le noyau et les vues s'écrivent et
   se vérifient sans réseau ni jeton — et pour que le serveur de
   développement, ouvert dans un navigateur, montre quelque chose.

   Règle : **un faux ment sur la source, jamais sur la forme.** Le conflit se
   déclenche ici par comparaison de SHA, exactement comme GitHub le rend ; un
   faux qui accepterait toujours l'écriture ne vaudrait rien. De même, un
   compte qui n'est pas membre **ne lit pas le dépôt** : GitHub lui rendrait
   un 404, le faux lui rend une erreur. */

import { ConflictError, type Cache, type Knock, type MyKnock, type Org, type Platform, type Session, type Storage, type TreeEntry } from "./types.ts";

export type FakeOptions = {
  /** Jouer quelqu'un du dehors : pas de jeton, pas d'adhésion. */
  outside?: boolean;
  /** Si posé, un greffier imaginaire admet la demande après ce délai. */
  admitAfterMs?: number;
  /** Une version « publiée », pour voir le bandeau en développement. */
  release?: string;
};

export function fakePlatform(
  seed: Record<string, string> = {}, who = "ncarmichael", knocks: Knock[] = [], opts: FakeOptions = {},
): Platform {
  const files = new Map<string, { sha: string; text: string }>();
  const blobs = new Map<string, string>();
  let n = 0;
  const put = (path: string, text: string) => {
    const sha = `fake${(++n).toString(16).padStart(36, "0")}`;
    files.set(path, { sha, text });
    blobs.set(sha, text);
    return sha;
  };
  for (const [path, text] of Object.entries(seed)) put(path, text);

  /* Les rôles et les adhésions vivent ici comme ils vivraient dans
     l'organisation : à part des fragments, et modifiables seulement par elle. */
  const roles: Record<string, "admin" | "member"> = { ncarmichael: "admin", mrossi: "admin" };
  const members: Record<string, "active" | "pending"> = {};
  if (!opts.outside) members[who] = "active";
  const memberOf = (login: string) =>
    members[login] ?? (roles[login] || files.has(`data/${login}.json`) ? "active" : null);

  let signedIn = !opts.outside;
  const inside = () => {
    if (memberOf(who) !== "active") throw new Error("dépôt introuvable — GitHub rend 404 à qui n'est pas membre");
  };

  const storage: Storage = {
    async me() { return signedIn ? who : null; },
    async list(): Promise<TreeEntry[]> {
      inside();
      return [...files].map(([path, f]) => ({ path, sha: f.sha }));
    },
    async readBlob(sha) {
      inside();
      const t = blobs.get(sha);
      if (t === undefined) throw new Error(`blob inconnu : ${sha}`);
      return t;
    },
    async write(path, text, sha, _message) {
      inside();
      const cur = files.get(path) ?? null;
      if ((cur?.sha ?? null) !== sha) throw new ConflictError(path);
      return { path, sha: put(path, text) };
    },
    remaining: () => null,
    async roleOf(login) { return roles[login] ?? (memberOf(login) === "active" ? "member" : null); },
  };

  const issues: MyKnock[] = knocks.map(k => ({ ...k, state: "open", reason: null }));
  const close = (issue: number, reason: string) => {
    const i = issues.find(x => x.issue === issue);
    if (i) { i.state = "closed"; i.reason = reason; }
  };
  /* Admettre, c'est **inviter** : l'adhésion reste en attente tant que la
     personne n'a pas accepté — exactement comme dans l'organisation. */
  const admit = (k: { issue: number; login: string }) => {
    close(k.issue, "completed");
    if (memberOf(k.login) !== "active") members[k.login] = "pending";
  };

  const org: Org = {
    async knocks() { return issues.filter(i => i.state === "open"); },
    async admit(k) { admit(k); },
    async shun(k) { close(k.issue, "not_planned"); },
    async setRole(login, role) { roles[login] = role; },
    async admins() { return Object.keys(roles).filter(k => roles[k] === "admin"); },

    async knock(login, f) {
      const k: MyKnock = {
        issue: 100 + issues.length, login, at: new Date().toISOString(),
        url: `https://github.com/checkpoint-circlecodex/checkpoint/issues/${100 + issues.length}`,
        state: "open", reason: null, ...f,
      };
      issues.push(k);
      if (opts.admitAfterMs !== undefined) setTimeout(() => admit(k), opts.admitAfterMs);
      return { ...k };
    },
    async myKnock(login) {
      const mine = issues.filter(i => i.login === login);
      return mine.length ? { ...mine[mine.length - 1] } : null;
    },
    async membership() { return signedIn ? memberOf(who) : null; },
    async accept() {
      if (members[who] !== "pending") throw new Error("aucune invitation en attente");
      members[who] = "active";
    },
    async invitationUrl() { return "https://github.com/orgs/checkpoint-circlecodex/invitation"; },
  };

  const mem = new Map<string, string>();
  const cache: Cache = {
    async get(k) { return mem.get(k) ?? null; },
    async set(k, v) { mem.set(k, v); },
    async clear() { const n = mem.size; mem.clear(); return n; },
  };

  /* Le device flow joué en deux temps : une attente, puis l'accord — pour
     que l'écran qui attend soit vu au moins une fois. */
  let polls = 0;
  const session: Session = {
    async has() { return signedIn; },
    async start() {
      polls = 0;
      return { deviceCode: "fake", userCode: "FAKE-0000", uri: "https://github.com/login/device", expiresIn: 900, interval: 1 };
    },
    async poll() {
      if (++polls < 3) return { state: "pending", interval: 1 };
      signedIn = true;
      return { state: "ok", login: who };
    },
    async forget() { signedIn = false; },
  };

  /* Le faux n'ouvre rien : il dit ce qu'il aurait ouvert. Un serveur de
     développement qui lancerait des onglets vers GitHub à chaque essai
     serait un faux qui agit sur le vrai. */
  const open = async (url: string) => { console.info("[faux] ouvrirait", url); };

  const updates = {
    async latest() {
      return opts.release
        ? { version: opts.release, url: `https://github.com/checkpoint-circlecodex/checkpoint/releases/tag/v${opts.release}` }
        : null;
    },
    /* Le faux n'installe rien : il dit qu'il ne sait pas, comme Android. */
    async install() { return false; },
  };

  return { storage, cache, session, org, open, updates };
}
