/* L'adaptateur réel. Tout ce qui sort d'ici passe par une commande native :
   l'interface web n'émet aucune requête, ne voit aucun jeton, et ne peut
   désigner aucun hôte. */

import { invoke } from "@tauri-apps/api/core";
import { fromB64, toB64 } from "./b64.ts";
import {
  AuthError, ConflictError,
  type Cache, type Knock, type MyKnock, type Org, type Platform, type Session, type Storage, type TreeEntry,
} from "./types.ts";
import { knockBody, knockTitle, parseKnock } from "./knock.ts";

type Reply = { status: number; body: string; etag: string | null; remaining: number | null };

/** Ce que GitHub vient de répondre sur le quota. Lu par l'établi — et jamais
    présenté comme une gratuité : un 304 décompte, c'est mesuré. */
export let lastRemaining: number | null = null;

async function gh(method: string, path: string, body?: unknown): Promise<Reply> {
  const r = await invoke<Reply>("gh", { method, path, body: body ?? null, etag: null });
  lastRemaining = r.remaining;
  if (r.status === 401) throw new AuthError();
  return r;
}

type Issue = {
  number: number; user: { login: string }; created_at: string; body: string; html_url: string;
  state: "open" | "closed"; state_reason: string | null; pull_request?: unknown;
};
/** Une issue de GitHub devenue demande — ou `null` si ce n'en est pas une. */
const toKnock = (i: Issue): MyKnock | null => {
  const f = i.pull_request ? null : parseKnock(i.body);
  return f ? { issue: i.number, login: i.user.login, at: i.created_at, url: i.html_url,
               state: i.state, reason: i.state_reason ?? null, ...f } : null;
};

const json = (r: Reply) => { try { return JSON.parse(r.body); } catch { return null; } };
const fail = (what: string, r: Reply) => {
  const m = json(r)?.message;
  return new Error(`${what} — GitHub rend ${r.status}${m ? ` : ${m}` : ""}`);
};

export function tauriPlatform(): Platform {
  /* Les coordonnées viennent du natif plutôt que d'être recopiées ici : une
     seule source, et un essai se règle par une variable d'environnement. */
  let site: Promise<{ org: string; repo: string; public_repo: string }> | null = null;
  const where = () => (site ??= invoke("whereabouts"));

  const storage: Storage = {
    async me() {
      if (!(await invoke<boolean>("gh_has_token"))) return null;
      /* Un 401 lève `AuthError` — le jeton a été révoqué, on l'oubliera. Tout
         autre échec **lève aussi** : rendre `null` sur une panne de GitHub
         ferait oublier le jeton de tout le monde un soir d'incident. */
      const r = await gh("GET", "/user");
      if (r.status !== 200) throw fail("lecture du compte", r);
      return json(r)?.login ?? null;
    },

    async list() {
      const { org, repo } = await where();
      /* `HEAD` plutôt qu'un nom de branche : on ne suppose pas « main », et
         ça survit à une branche par défaut renommée. */
      const r = await gh("GET", `/repos/${org}/${repo}/git/trees/HEAD?recursive=1`);
      if (r.status !== 200) throw fail("lecture de l'arbre", r);
      const t = json(r);
      /* GitHub tronque au-delà de 100 000 entrées et le dit. À vingt
         fichiers ça n'arrivera pas — mais un jour où ça arriverait, mieux
         vaut une erreur franche qu'une bibliothèque silencieusement amputée. */
      if (t?.truncated) throw new Error("L'arbre du dépôt est tronqué : il faudrait paginer.");
      return (t?.tree ?? [])
        .filter((e: { type: string }) => e.type === "blob")
        .map((e: { path: string; sha: string }): TreeEntry => ({ path: e.path, sha: e.sha }));
    },

    async readBlob(sha) {
      const { org, repo } = await where();
      const r = await gh("GET", `/repos/${org}/${repo}/git/blobs/${sha}`);
      if (r.status !== 200) throw fail(`lecture du blob ${sha.slice(0, 7)}`, r);
      return fromB64(json(r)?.content ?? "");
    },

    async write(path, text, sha, message) {
      const { org, repo } = await where();
      const r = await gh("PUT", `/repos/${org}/${repo}/contents/${path}`, {
        message, content: toB64(text), ...(sha ? { sha } : {}),
      });
      /* 409 : le SHA fourni n'est plus celui du dépôt. 422 : GitHub le dit
         parfois autrement quand on crée un fichier qui existe déjà — c'est
         le même accident, il mérite la même erreur. */
      if (r.status === 409 || (r.status === 422 && /sha/i.test(r.body))) throw new ConflictError(path);
      if (r.status !== 200 && r.status !== 201) throw fail(`écriture de ${path}`, r);
      return { path, sha: json(r)?.content?.sha ?? "" };
    },

    remaining: () => lastRemaining,

    async roleOf(login) {
      const { org } = await where();
      const r = await gh("GET", `/orgs/${org}/memberships/${login}`);
      if (r.status === 404) return null;           // pas membre : ce n'est pas une erreur
      if (r.status !== 200) throw fail("lecture du rôle", r);
      const m = json(r);
      return m?.state === "active" && m?.role === "admin" ? "admin" : "member";
    },
  };

  const cache: Cache = {
    get: sha => invoke<string | null>("cache_get", { key: sha }),
    set: (sha, value) => invoke("cache_set", { key: sha, value }),
    clear: () => invoke<number>("cache_clear"),
  };

  const session: Session = {
    has: () => invoke<boolean>("gh_has_token"),
    async start() {
      const k = await invoke<{
        device_code: string; user_code: string; verification_uri: string;
        expires_in: number; interval: number;
      }>("auth_start");
      return {
        deviceCode: k.device_code, userCode: k.user_code, uri: k.verification_uri,
        expiresIn: k.expires_in, interval: k.interval,
      };
    },
    poll: deviceCode => invoke("auth_poll", { deviceCode }),
    forget: () => invoke("gh_forget"),
  };

  const org: Org = {
    async knocks() {
      const { public_repo } = await where();
      /* Les issues ouvertes, toutes : on ne peut pas filtrer par étiquette,
         un inconnu n'a pas le droit d'en poser. C'est le marqueur dans le
         corps qui dit « ceci est une demande ». Les demandes de tirage sont
         aussi des issues pour l'API : on les écarte. */
      const r = await gh("GET", `/repos/${public_repo}/issues?state=open&per_page=100`);
      if (r.status !== 200) throw fail("lecture des demandes", r);
      return ((json(r) ?? []) as Issue[]).map(toKnock).filter(Boolean) as Knock[];
    },

    async admit(k, note) {
      const { org: o, public_repo } = await where();
      const r = await gh("PUT", `/orgs/${o}/memberships/${k.login}`, { role: "member" });
      if (r.status !== 200) throw fail("invitation dans l'organisation", r);
      await gh("POST", `/repos/${public_repo}/issues/${k.issue}/comments`, { body: note });
      await gh("PATCH", `/repos/${public_repo}/issues/${k.issue}`, { state: "closed", state_reason: "completed" });
    },

    async shun(k, note) {
      const { public_repo } = await where();
      await gh("POST", `/repos/${public_repo}/issues/${k.issue}/comments`, { body: note });
      const r = await gh("PATCH", `/repos/${public_repo}/issues/${k.issue}`, { state: "closed", state_reason: "not_planned" });
      if (r.status !== 200) throw fail("fermeture de la demande", r);
    },

    async admins() {
      const { org: o } = await where();
      const r = await gh("GET", `/orgs/${o}/members?role=admin&per_page=100`);
      if (r.status !== 200) throw fail("lecture des greffiers", r);
      return (json(r) ?? []).map((m: { login: string }) => m.login);
    },

    async setRole(login, role) {
      const { org: o } = await where();
      const r = await gh("PUT", `/orgs/${o}/memberships/${login}`, { role });
      if (r.status !== 200) throw fail("changement de rôle", r);
    },

    async knock(login, f) {
      const { public_repo } = await where();
      const r = await gh("POST", `/repos/${public_repo}/issues`, { title: knockTitle(login), body: knockBody(f) });
      if (r.status !== 201) throw fail("ouverture de la demande", r);
      const k = toKnock(json(r));
      if (!k) throw new Error("La demande est partie, mais GitHub la rend sans son marqueur.");
      return k;
    },

    async myKnock(login) {
      const { public_repo } = await where();
      /* Toutes, ouvertes ou refermées, les plus récentes d'abord : une
         demande refermée dit justement ce qu'on veut savoir. */
      const r = await gh("GET", `/repos/${public_repo}/issues?creator=${encodeURIComponent(login)}&state=all&per_page=30`);
      if (r.status !== 200) throw fail("lecture de sa demande", r);
      for (const i of (json(r) ?? []) as Issue[]) { const k = toKnock(i); if (k) return k; }
      return null;
    },

    async membership() {
      const { org: o } = await where();
      const r = await gh("GET", `/user/memberships/orgs/${o}`);
      /* 404 : ni membre ni invité. 403 : le jeton n'a pas le droit de
         regarder — on ne sait pas, et ici ça revient au même : on attend. */
      if (r.status === 404 || r.status === 403) return null;
      if (r.status !== 200) throw fail("lecture de l'adhésion", r);
      const s = json(r)?.state;
      return s === "active" || s === "pending" ? s : null;
    },

    async accept() {
      const { org: o } = await where();
      const r = await gh("PATCH", `/user/memberships/orgs/${o}`, { state: "active" });
      if (r.status !== 200) throw fail("acceptation de l'invitation", r);
    },

    async invitationUrl() {
      const { org: o } = await where();
      return `https://github.com/orgs/${o}/invitation`;
    },
  };

  /* Le natif vérifie l'hôte : c'est lui qui refuse, pas cette ligne. */
  const open = (url: string) => invoke<void>("open_github", { url });

  return { storage, cache, session, org, open };
}

/** Vrai quand on tourne dans la coque. Hors coque — un navigateur ouvert sur
    le serveur de développement — il faut le faux, sinon rien ne répond. */
export const inShell = () => typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
