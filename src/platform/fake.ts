/* Le faux, en mémoire. Il existe pour que le noyau et les vues s'écrivent et
   se vérifient sans réseau ni jeton — et pour que le serveur de
   développement, ouvert dans un navigateur, montre quelque chose.

   Règle : **un faux ment sur la source, jamais sur la forme.** Le conflit se
   déclenche ici par comparaison de SHA, exactement comme GitHub le rend ; un
   faux qui accepterait toujours l'écriture ne vaudrait rien. */

import { ConflictError, type Cache, type Platform, type Session, type Storage, type TreeEntry } from "./types.ts";

export function fakePlatform(seed: Record<string, string> = {}, who = "ncarmichael"): Platform {
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

  const storage: Storage = {
    async me() { return who; },
    async list(): Promise<TreeEntry[]> {
      return [...files].map(([path, f]) => ({ path, sha: f.sha }));
    },
    async readBlob(sha) {
      const t = blobs.get(sha);
      if (t === undefined) throw new Error(`blob inconnu : ${sha}`);
      return t;
    },
    async write(path, text, sha, _message) {
      const cur = files.get(path) ?? null;
      if ((cur?.sha ?? null) !== sha) throw new ConflictError(path);
      return { path, sha: put(path, text) };
    },
    async openIssue(title) {
      return { number: 1, url: `fake://issue/1#${encodeURIComponent(title)}` };
    },
    async roleOf(login) { return login === "ncarmichael" ? "admin" : "member"; },
  };

  const mem = new Map<string, string>();
  const cache: Cache = {
    async get(k) { return mem.get(k) ?? null; },
    async set(k, v) { mem.set(k, v); },
    async clear() { const n = mem.size; mem.clear(); return n; },
  };

  const session: Session = {
    async has() { return true; },
    async start() {
      return { deviceCode: "fake", userCode: "FAKE-0000", uri: "https://github.com/login/device", expiresIn: 900, interval: 5 };
    },
    async poll() { return { state: "ok", login: who }; },
    async forget() {},
  };

  return { storage, cache, session };
}
