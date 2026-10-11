<script lang="ts">
  /* ⚠️ TEMPORAIRE — banc d'essai de l'étape 2. Il n'y a pas encore de vue :
     cet écran sert à vérifier la couche plateforme à la main, dans la vraie
     coque, contre le vrai dépôt. Il disparaît à l'étape 4, quand le registre
     de vues prend la place. */
  import { inShell, platform, type TreeEntry } from "$platform/index";
  import { shardPath, type Shard } from "$core/model/schema";

  const P = platform();
  let log = $state<string[]>([]);
  let knock = $state<{ userCode: string; uri: string; deviceCode: string; interval: number } | null>(null);
  let busy = $state(false);
  const say = (s: string): void => { log = [...log, s]; };

  async function guard(what: string, fn: () => Promise<void>) {
    busy = true;
    try { await fn(); } catch (e) { say(`✗ ${what} — ${(e as Error).message}`); }
    busy = false;
  }

  const connect = () => guard("connexion", async () => {
    const k = await P.session.start();
    knock = k;
    say(`Ouvre ${k.uri} et saisis ${k.userCode}`);
    /* On interroge au rythme que GitHub demande, et pas plus vite : il rend
       `slow_down` si on insiste, et c'est lui qui dit le nouvel intervalle. */
    let wait = k.interval;
    for (;;) {
      await new Promise(r => setTimeout(r, wait * 1000));
      const step = await P.session.poll(k.deviceCode);
      if (step.state === "pending") { wait = step.interval; continue; }
      knock = null;
      say(step.state === "ok" ? `✓ connecté comme ${step.login}` : `✗ ${step.message}`);
      return;
    }
  });

  const tree = () => guard("arbre", async () => {
    const t0 = performance.now();
    const t: TreeEntry[] = await P.storage.list();
    say(`✓ ${t.length} fichiers en ${Math.round(performance.now() - t0)} ms`);
    for (const e of t.slice(0, 6)) say(`   ${e.path}  ${e.sha.slice(0, 7)}`);
  });

  const mine = () => guard("mon fragment", async () => {
    const who = await P.storage.me();
    if (!who) return say("✗ pas de jeton");
    const want = shardPath(who);
    const entry = (await P.storage.list()).find(e => e.path === want);
    if (!entry) return say(`· aucun fragment à ${want} — c'est normal avant l'admission`);
    /* Le cache est adressé par le contenu : un SHA ne désignera jamais autre
       chose, donc une fois lu, c'est lu pour toujours. */
    let text = await P.cache.get(entry.sha);
    const cached = text !== null;
    if (text === null) { text = await P.storage.readBlob(entry.sha); await P.cache.set(entry.sha, text); }
    const sh: Shard = JSON.parse(text);
    say(`✓ ${want} ${cached ? "(cache)" : "(réseau)"} — ${sh.user.firstName}, schéma v${sh.schemaVersion}`);
  });

  const role = () => guard("rôle", async () => {
    const who = await P.storage.me();
    if (!who) return say("✗ pas de jeton");
    say(`✓ ${who} : ${await P.storage.roleOf(who)} dans l'organisation`);
  });

  const forget = () => guard("oubli", async () => {
    await P.session.forget();
    say(`✓ jeton effacé — ${await P.cache.clear()} blobs retirés du cache`);
  });
</script>

<main>
  <h1>Checkpoint</h1>
  <p class="sub">
    Étape 2 — la plateforme. {inShell() ? "Dans la coque, contre le vrai dépôt." : "Hors coque : le faux en mémoire répond."}
  </p>

  <div class="acts">
    <button onclick={connect} disabled={busy}>Se connecter</button>
    <button onclick={tree} disabled={busy}>Lire l'arbre</button>
    <button onclick={mine} disabled={busy}>Mon fragment</button>
    <button onclick={role} disabled={busy}>Mon rôle</button>
    <button onclick={forget} disabled={busy}>Oublier</button>
  </div>

  {#if knock}
    <p class="knock">Saisis <b>{knock.userCode}</b> sur <b>{knock.uri}</b> — j'attends.</p>
  {/if}

  <ul>{#each log as l}<li>{l}</li>{/each}</ul>
</main>

<style>
  main { max-width: 680px; margin: 0 auto; padding: 56px 34px; height: 100%; overflow: auto; }
  h1 { font-family: var(--fs); font-weight: 400; font-size: 46px; line-height: 1; }
  .sub { color: var(--dim); font-size: 13px; margin-top: 6px; }
  .acts { display: flex; gap: 8px; flex-wrap: wrap; margin: 24px 0 0; }
  button {
    font-size: 9.5px; font-weight: 700; letter-spacing: .13em; text-transform: uppercase;
    border: 1px solid var(--rule2); color: var(--dim); padding: 9px 13px; min-height: 36px;
  }
  button:hover:not(:disabled) { color: var(--ink); border-color: var(--ink); }
  button:disabled { opacity: .4; cursor: default; }
  .knock { margin-top: 18px; padding: 11px 14px; border: 1px solid var(--ink); background: var(--raise); font-size: 13px; }
  ul { list-style: none; margin-top: 22px; border-top: 1px solid var(--rule); }
  li { border-bottom: 1px solid var(--rule); padding: 7px 0; font-size: 12.5px; color: var(--ink2); white-space: pre-wrap; }
</style>
