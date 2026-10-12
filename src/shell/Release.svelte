<script lang="ts">
  /* **Le bandeau « nouvelle version disponible ».** La mise à jour de Tauri
     ne couvre pas Android ; ce bandeau, lui, marche partout : il lit les
     versions publiées sur le dépôt public, et propose d'installer là où
     on sait le faire, d'aller sur la page de la version ailleurs.

     Ce n'est pas une notification — il n'y en a pas : il se lit à
     l'ouverture, toutes les six heures, et **au retour dans la fenêtre**
     (au plus une fois toutes les dix minutes) — une application restée
     ouverte ne voyait pas une version publiée entre-temps, et « Plus tard » le range jusqu'au
     prochain lancement. Une vérification qui échoue ne dit rien : l'absence
     de nouvelle n'est pas une nouvelle. */
  import { untrack } from "svelte";
  import { platform } from "#platform/index.ts";
  import { registre } from "#core/model/store.svelte.ts";
  import { newer } from "./version.ts";

  const EVERY_MS = 6 * 3600_000;
  const FOCUS_GAP_MS = 10 * 60_000;
  let lastLook = 0;
  let found = $state<{ version: string; url: string } | null>(null);
  let later = $state(false);
  let busy = $state(false);
  let error = $state<string | null>(null);

  async function look() {
    lastLook = Date.now();
    try {
      const r = await platform().updates.latest();
      found = r && newer(r.version, __APP_VERSION__) ? r : null;
    } catch { /* hors ligne, ou pas encore connecté : on se tait */ }
  }
  $effect(() => {
    untrack(() => void look());
    const t = setInterval(look, EVERY_MS);
    const onFocus = () => { if (Date.now() - lastLook > FOCUS_GAP_MS) void look(); };
    addEventListener("focus", onFocus);
    return () => { clearInterval(t); removeEventListener("focus", onFocus); };
  });

  async function install() {
    if (!found) return;
    busy = true; error = null;
    try {
      /* Relancer tue la file d'écriture : ce qui n'est pas parti serait
         perdu. On la vide d'abord. */
      await registre.flush();
      if (!(await platform().updates.install())) await platform().open(found.url);
    } catch (e) { error = (e as Error).message; }
    finally { busy = false; }
  }
</script>

{#if found && !later}
  <div class="release" role="status">
    <span class="t">Une nouvelle version de Checkpoint est publiée — <b>{found.version}</b>.</span>
    <button class="go" onclick={install} disabled={busy}>{busy ? "Téléchargement…" : "Installer et relancer"}</button>
    <button class="lk" onclick={() => found && platform().open(found.url)}>Ce qui change</button>
    <button class="lk" onclick={() => (later = true)}>Plus tard</button>
    {#if error}<span class="err" role="alert">L'installation a échoué : {error}</span>{/if}
  </div>
{/if}

<style>
  /* Un bandeau d'instrument : une ligne, un filet, aucune couleur. */
  .release {
    position: relative; z-index: 350; flex: none;
    display: flex; align-items: center; gap: 4px 16px; flex-wrap: wrap;
    padding: 0 16px; min-height: 44px; background: var(--raise);
    border-bottom: 1px solid var(--rule); font-size: 11.5px; color: var(--ink2);
  }
  .t { flex: 1; min-width: 200px; padding: 8px 0; }
  .t b { color: var(--ink); font-weight: 600; font-variant-numeric: tabular-nums; }
  .go, .lk { min-height: 44px; display: inline-flex; align-items: center;
             font-size: 10px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; }
  .go { color: var(--ink); text-decoration: underline; text-underline-offset: 4px; }
  .go[disabled] { color: var(--dim); text-decoration: none; }
  .lk { color: var(--dim); }
  .lk:hover, .go:hover { color: var(--ink); }
  .err { flex-basis: 100%; padding-bottom: 8px; color: var(--ink); }
</style>
