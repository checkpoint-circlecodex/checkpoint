<script lang="ts">
  /* Son propre fragment, **tel qu'il est** — pour le lire, pas pour
     l'éditer. On n'écrit dans un fragment que par des intentions ; un
     éditeur de texte brut contournerait le scribe, ses regroupements et sa
     reprise sur conflit. */
  import { registre } from "#core/model/store.svelte.ts";

  let { close: _close }: { close: () => void } = $props();
  const text = $derived(registre.myShardText());
  const bytes = $derived(new TextEncoder().encode(text).length);
</script>

<p class="legend">
  C'est le seul fichier que tu écris — <code>data/{registre.me}.json</code>, {(bytes / 1024).toFixed(1).replace(".", ",")} Ko.
  Tout le monde le lit, personne d'autre ne l'écrit.
</p>
<pre>{text}</pre>

<style>
  .legend { font-size: 11.5px; color: var(--dim); margin-bottom: 10px; line-height: 1.55; }
  code { font-size: 11px; }
  pre { max-height: 60vh; overflow: auto; padding: 12px 14px; border: 1px solid var(--rule);
        background: var(--raise); font-size: 11px; line-height: 1.5; white-space: pre; }
</style>
