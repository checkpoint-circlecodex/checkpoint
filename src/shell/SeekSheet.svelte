<script lang="ts">
  /* La forme étroite du lanceur : une feuille qui monte du bas, avec son
     propre champ. Les résultats sont les mêmes — c'est la même surface, et
     **une surface a une forme large et une forme étroite**, décidées une fois
     (invariant 22). */
  import Seek from "./Seek.svelte";

  let { close }: { close: () => void } = $props();
  let q = $state("");
  let field: HTMLInputElement | null = $state(null);
  $effect(() => { const f = field; setTimeout(() => f?.focus(), 0); });
</script>

<label class="find">
  <input bind:this={field} bind:value={q} type="search" placeholder="Œuvres, gens…" autocomplete="off" aria-label="Chercher" />
</label>
<Seek query={q} onpick={close} />

<style>
  .find { display: block; margin-bottom: 14px; }
  input { width: 100%; min-height: 44px; padding: 10px 12px; border: 1px solid var(--rule2);
          background: var(--paper); font-size: 14px; }
</style>
