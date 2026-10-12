<script lang="ts">
  /* Des volets à **glissement latéral**. Changer d'onglet n'est pas descendre
     d'un cran : aucun flou, aucun zoom — on se déplace à profondeur égale, et
     le sens du glissement dit seulement de quel côté on va.

     Le geste lui-même vit dans `slide.ts` : l'entrée s'en sert aussi. */
  import type { Snippet } from "svelte";
  import { slide } from "./slide.ts";

  type Tab = { k: string; l: string; n?: number };
  let { tabs, active = $bindable(), children }:
    { tabs: Tab[]; active: string; children: Snippet<[string]> } = $props();

  let host = $state<HTMLElement | null>(null);
  let live = $state<HTMLElement | null>(null);
  let ghost: HTMLElement | null = null;
  let dir = 1;
  let seen: string | null = null;

  function pick(k: string) {
    if (k === active) return;
    dir = tabs.findIndex(t => t.k === k) > tabs.findIndex(t => t.k === active) ? 1 : -1;
    active = k;
  }

  $effect.pre(() => {
    active;
    if (!live || seen === null) return;
    ghost = live.cloneNode(true) as HTMLElement;
  });

  $effect(() => {
    const k = active;
    const first = seen === null;
    seen = k;
    const g = ghost; ghost = null;
    if (first || !host || !live) { g?.remove(); return; }
    slide(host, live, g, dir);
  });
</script>

<!-- Les commandes restent visibles : rien ne se découvre au survol. -->
<div class="tabs" role="tablist">
  {#each tabs as t (t.k)}
    <button role="tab" aria-selected={t.k === active} class:on={t.k === active} onclick={() => pick(t.k)}>
      {t.l}{#if t.n !== undefined}<span class="n">{t.n}</span>{/if}
    </button>
  {/each}
</div>

<div class="panes" bind:this={host}>
  {#key active}
    <div class="pane" bind:this={live}>{@render children(active)}</div>
  {/key}
</div>

<style>
  .tabs { display: flex; gap: 2px; flex-wrap: wrap; border-bottom: 1px solid var(--rule); }
  .tabs button {
    display: inline-flex; align-items: center; gap: 7px; padding: 10px 13px; min-height: 44px;
    font-size: 11px; font-weight: 600; color: var(--dim); white-space: nowrap;
  }
  .tabs button:hover { color: var(--ink); }
  .tabs button.on { color: var(--ink); box-shadow: inset 0 -1.5px 0 var(--ink); }
  .n { font-size: 9.5px; color: var(--faint); font-variant-numeric: tabular-nums; }
  /* Positionné : le volet sortant s'y pose en absolu, hors de la mise en
     page — il ne doit pas pousser la page pendant qu'il s'efface. */
  .panes { position: relative; }

  @media (max-width: 860px) {
    .tabs { overflow-x: auto; flex-wrap: nowrap; scrollbar-width: none; }
    .tabs::-webkit-scrollbar { display: none; }
  }
</style>
