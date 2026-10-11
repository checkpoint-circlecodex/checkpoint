/* Le faux stockage, en mémoire. Il existe pour que le noyau et les vues
   puissent être écrits et vérifiés avant que la vraie couche GitHub ne soit
   là — et pour que les tests n'aient jamais besoin du réseau. */

import { ConflictError, type Blob, type Cache, type Platform, type Secrets, type Storage } from "./types";

export function fakeStorage(seed: Record<string, string> = {}): Storage {
  const files = new Map<string, Blob>();
  let n = 0;
  const sha = () => `fake${(++n).toString(16).padStart(8, "0")}`;
  for (const [path, text] of Object.entries(seed)) files.set(path, { path, sha: sha(), text });

  return {
    async list() {
      return [...files.values()].map(({ path, sha }) => ({ path, sha }));
    },
    async read(path) {
      return files.get(path) ?? null;
    },
    async write(path, text, expected, _message) {
      const cur = files.get(path) ?? null;
      /* Le conflit se simule exactement comme GitHub le rend : on compare le
         SHA qu'on croyait remplacer, pas le contenu. */
      if ((cur?.sha ?? null) !== expected) throw new ConflictError(path);
      const next: Blob = { path, sha: sha(), text };
      files.set(path, next);
      return next;
    },
    async openIssue(title, _body) {
      return { number: 1, url: `fake://issue/1#${encodeURIComponent(title)}` };
    },
    async roleOf(login) {
      return login === "ncarmichael" ? "admin" : "member";
    },
  };
}

export function fakeSecrets(): Secrets {
  const m = new Map<string, string>();
  return {
    async get(k) { return m.get(k) ?? null; },
    async set(k, v) { m.set(k, v); },
    async clear(k) { m.delete(k); },
  };
}

export function fakeCache(): Cache {
  const m = new Map<string, string>();
  return {
    async get(k) { return m.get(k) ?? null; },
    async set(k, v) { m.set(k, v); },
  };
}

export const fakePlatform = (seed?: Record<string, string>): Platform => ({
  storage: fakeStorage(seed),
  secrets: fakeSecrets(),
  cache: fakeCache(),
});
