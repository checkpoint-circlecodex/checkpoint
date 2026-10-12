/* L'état de la porte, pour les écrans. La logique vit dans `door.ts`, pure ;
   ici on la tient en runes, on attend, et on ouvre le registre quand c'est
   le moment.

   **Personne n'est averti de rien** — il n'y a pas de serveur pour ça. Une
   demande se voit quand un greffier ouvre l'application, et l'admission se
   voit quand celui qui attend regarde de nouveau. D'où une relecture toutes
   les trente secondes, et une à chaque retour dans la fenêtre : c'est là
   qu'on revient de GitHub. */

import { registre } from "#core/model/store.svelte.ts";
import type { User } from "#core/model/schema.ts";
import type { KnockFields, MyKnock, Platform } from "#platform/index.ts";
import { examine, standing, type Verdict } from "./door.ts";

/** `examen` : on ne sait pas encore. `dedans` : la coque prend le relais. */
export type Door = "examen" | "dehors" | "attente" | "admis" | "dedans";

const WATCH_MS = 30_000;
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const say = (e: unknown) => (e as Error)?.message ?? String(e);

class Porte {
  door = $state<Door>("examen");
  login = $state<string | null>(null);
  /** Sa demande, telle que GitHub la rend. */
  knock = $state<MyKnock | null>(null);
  /** Admis, mais l'invitation se règle sur GitHub — voir `door.ts`. */
  invited = $state(false);
  error = $state<string | null>(null);
  /** Le code du device flow, tant qu'on attend que la personne le saisisse. */
  code = $state<{ user: string; uri: string } | null>(null);
  busy = $state(false);

  #p: Platform | null = null;
  #timer: ReturnType<typeof setInterval> | null = null;
  #checking: Promise<void> | null = null;
  #flow = 0;

  async start(p: Platform) {
    this.#p = p;
    this.error = null;
    try { await this.#apply(await examine(p)); }
    catch (e) { this.error = say(e); }
  }

  async #apply(v: Verdict) {
    const p = this.#p!;
    if (v.door === "dehors") { this.#stop(); this.door = "dehors"; return; }
    this.login = v.login;
    if (v.door === "membre") {
      this.#stop();
      /* Admis : le dépôt s'ouvre. On le lit **avant** d'avoir un fragment —
         c'est ce qui permet au dernier écran de dire que le corpus est déjà
         plein. */
      await registre.open(p.storage, p.cache, p.org);
      this.door = registre.moi ? "dedans" : "admis";
      return;
    }
    this.knock = v.knock;
    this.invited = v.invited;
    this.door = "attente";
    this.#watch();
  }

  /** Regarder de nouveau. **Non réentrant** : la minuterie et le retour
      dans la fenêtre peuvent tomber ensemble (invariant 35). */
  check(): Promise<void> {
    return (this.#checking ??= (async () => {
      const p = this.#p;
      if (!p || !this.login) return;
      try { await this.#apply(await standing(p, this.login)); this.error = null; }
      catch (e) { this.error = say(e); }
    })().finally(() => { this.#checking = null; }));
  }

  #onFocus = () => { void this.check(); };
  #watch() {
    if (this.#timer) return;
    this.#timer = setInterval(() => void this.check(), WATCH_MS);
    addEventListener("focus", this.#onFocus);
  }
  #stop() {
    if (this.#timer) clearInterval(this.#timer);
    this.#timer = null;
    removeEventListener("focus", this.#onFocus);
  }

  /** **Le device flow.** On ouvre la page de GitHub, on montre le code, et
      on attend que la personne l'ait saisi — au rythme que GitHub demande. */
  async connect() {
    const p = this.#p;
    if (!p) return;
    const flow = ++this.#flow;
    this.error = null;
    this.busy = true;
    try {
      const k = await p.session.start();
      if (flow !== this.#flow) return;
      this.code = { user: k.userCode, uri: k.uri };
      void p.open(k.uri).catch(() => { /* le bouton « Rouvrir » reste là */ });
      let wait = k.interval;
      const until = Date.now() + k.expiresIn * 1000;
      while (Date.now() < until) {
        await sleep(wait * 1000);
        if (flow !== this.#flow) return;
        const r = await p.session.poll(k.deviceCode);
        if (flow !== this.#flow) return;
        if (r.state === "pending") { wait = r.interval; continue; }
        this.code = null;
        if (r.state === "error") { this.error = r.message; return; }
        this.login = r.login;
        await this.#apply(await standing(p, r.login));
        return;
      }
      this.code = null;
      this.error = "Le code a expiré. Recommencez.";
    } catch (e) {
      if (flow === this.#flow) { this.code = null; this.error = say(e); }
    } finally {
      if (flow === this.#flow) this.busy = false;
    }
  }

  cancel() { this.#flow++; this.code = null; this.busy = false; }

  async reopen() { if (this.code && this.#p) await this.#p.open(this.code.uri).catch(() => {}); }
  async visit(url: string) { await this.#p?.open(url).catch(() => {}); }
  async invitation() { if (this.#p) await this.visit(await this.#p.org.invitationUrl()); }

  /** Frapper. **Le seul geste qu'un compte hors de l'organisation puisse
      faire** — et il est public : l'écran le dit avant le clic. */
  async sendKnock(f: KnockFields) {
    const p = this.#p;
    if (!p || !this.login) return;
    this.busy = true;
    this.error = null;
    try {
      this.knock = await p.org.knock(this.login, f);
      this.invited = false;
      this.#watch();
    } catch (e) { this.error = say(e); }
    finally { this.busy = false; }
  }

  /** Changer de compte : le jeton est oublié sur cette machine. */
  async leave() {
    this.#stop();
    this.cancel();
    await this.#p?.session.forget();
    this.login = null; this.knock = null; this.invited = false; this.error = null;
    this.door = "dehors";
  }

  /** **Entrer** : écrire son premier fragment, et attendre qu'il soit
      parti. Rend vrai si c'est fait ; la coque passe « dedans » après
      l'onde, pas avant. */
  async enter(user: User): Promise<boolean> {
    this.busy = true;
    this.error = null;
    const err = await registre.found(user);
    this.busy = false;
    if (err) { this.error = err; return false; }
    return true;
  }

  arrive() { this.door = "dedans"; }
}

export const porte = new Porte();
