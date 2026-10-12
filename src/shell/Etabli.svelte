<script lang="ts">
  /* **L'établi** : ce qui sert à réparer, pas à vivre. Rien ici n'est
     nécessaire pour se servir de Checkpoint, et c'est pour ça qu'on y entre
     par un geste caché plutôt que par une porte — décidé avec Nathan le
     11 octobre : *un panneau d'atelier a le droit d'être introuvable ; une
     porte d'admission non.* L'autorité reste au Greffe, lue dans
     l'organisation. */
  import { registre } from "#core/model/store.svelte.ts";
  import { inShell, platform } from "#platform/index.ts";
  import { SCHEMA_VERSION } from "#core/model/schema.ts";
  import { roman } from "#core/model/lexicon.ts";

  let { close: _close }: { close: () => void } = $props();

  const w = $derived(registre.world);
  let cleared = $state<number | null>(null);
  let rereading = $state(false);

  async function clearCache() { cleared = await platform().cache.clear(); }
  async function reread() { rereading = true; await registre.resync(); rereading = false; }
</script>

<div class="et">
  <p class="lede">Ce qui sert à réparer, pas à vivre. Rien ici n'est nécessaire pour se servir de Checkpoint.</p>

  <dl>
    <dt>Où l'on tourne</dt>
    <dd>{inShell() ? "Dans la coque native" : "Dans un navigateur — le faux dépôt répond"} · application {__APP_VERSION__} · schéma v{SCHEMA_VERSION}</dd>

    <dt>Dernière ouverture</dt>
    <dd>
      {#if registre.last}
        {registre.shardCount} fragment{registre.shardCount > 1 ? "s" : ""} ·
        {registre.last.fetched} téléchargé{registre.last.fetched > 1 ? "s" : ""},
        {registre.last.fromCache} depuis le cache · {registre.last.ms} ms
      {:else}—{/if}
    </dd>

    <dt>Quota GitHub</dt>
    <!-- Ce que GitHub a dit à la dernière réponse, et rien d'autre. Une
         relecture conditionnelle ne décompte pas quand on est authentifié —
         mesuré le 11 octobre, et tenu par un essai d'intégration. -->
    <dd>{registre.storageRemaining ?? "—"} appels restants sur 5 000 cette heure</dd>

    <dt>L'écriture</dt>
    <dd>
      {registre.writing}{registre.pending ? ` · ${registre.pending} en attente` : ""}
      {#if registre.writeError}<br /><b>{registre.writeError}</b>{/if}
    </dd>

    <dt>Fragments illisibles</dt>
    <dd>
      {#if registre.problems.length}
        {#each registre.problems as pb (pb.path)}<span class="pb"><code>{pb.path}</code> — {pb.message}</span>{/each}
      {:else}aucun{/if}
    </dd>

    <dt>Le monde</dt>
    <dd>
      {roman(Object.keys(w.people).length)} personnes · {roman(Object.keys(w.catalog).length)} œuvres ·
      {roman(w.rows.length)} inscriptions · {roman(w.posts.length)} paroles · {roman(w.quests.length)} quêtes
    </dd>
  </dl>

  <div class="acts">
    <button onclick={() => registre.flush()} disabled={!registre.pending}>Écrire maintenant</button>
    <button onclick={reread} disabled={rereading}>{rereading ? "Lecture…" : "Relire le dépôt"}</button>
    <!-- Un blob est adressé par son contenu : vider le cache ne perd rien, il
         fait seulement repayer la prochaine ouverture. -->
    <button onclick={clearCache}>Vider le cache</button>
    {#if cleared !== null}<span class="done">{cleared} blobs retirés</span>{/if}
  </div>
</div>

<style>
  .et { display: grid; gap: 16px; }
  .lede { font-family: var(--fr); font-style: italic; font-size: 13.5px; color: var(--dim); }
  dl { display: grid; grid-template-columns: 150px 1fr; gap: 0; border-top: 1px solid var(--rule); }
  dt, dd { padding: 9px 0; border-bottom: 1px solid var(--rule); font-size: 12px; line-height: 1.5; }
  dt { font-size: 9.5px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--faint); padding-top: 11px; }
  dd { color: var(--ink2); font-variant-numeric: tabular-nums; }
  .pb { display: block; }
  code { font-size: 11px; }
  .acts { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }
  .acts button { min-height: 44px; padding: 0 12px; border: 1px solid var(--rule2);
                 font-size: 10px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--dim); }
  .acts button:hover:not(:disabled) { color: var(--ink); border-color: var(--ink); }
  .acts button:disabled { opacity: .4; cursor: default; }
  .done { font-size: 11px; color: var(--faint); font-style: italic; }
  @media (max-width: 720px) { dl { grid-template-columns: 1fr; } dt { border-bottom: none; padding-bottom: 0; } }
</style>
