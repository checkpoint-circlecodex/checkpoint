<script lang="ts">
  /* La forme large et la forme étroite d'une surface sont décidées **ici**,
     une fois : un panneau latéral devient une feuille du bas. Les blocs n'ont
     rien à en savoir. */
  import { pile, type Surface } from "./surfaces.svelte.ts";

  let { surface, index, children }:
    { surface: Surface; index: number; children: import("svelte").Snippet } = $props();

  /* Défocalisé si quelque chose s'est ouvert par-dessus. On ne floute jamais
     ce qui a la main — le flou est un événement, jamais un état. */
  const under = $derived(index < pile.depth - 1);
</script>

<div class="surf {surface.kind}" class:under role="dialog" aria-modal={!under} aria-label={surface.title}>
  <header>
    <h2>{surface.title}</h2>
    <button class="x" onclick={() => pile.close(surface.id)} aria-label="Fermer">×</button>
  </header>
  <div class="body">{@render children()}</div>
</div>

<style>
  .surf {
    position: fixed; z-index: 60; background: var(--paper);
    border: 1px solid var(--ink); display: flex; flex-direction: column;
    transition: filter var(--t2) var(--e), opacity var(--t2) var(--e);
  }
  .surf.under { filter: blur(6px); opacity: .5; pointer-events: none; }

  /* Forme large : un panneau posé au milieu, un volet collé à droite. */
  .panneau { top: 8vh; left: 50%; transform: translateX(-50%); width: min(720px, 92vw); max-height: 80vh; }
  .volet   { top: 0; right: 0; bottom: 0; width: min(420px, 92vw); border-right: none; }

  header {
    display: flex; align-items: center; gap: 14px;
    padding: 13px 16px; border-bottom: 1px solid var(--rule);
  }
  h2 { font-family: var(--fs); font-weight: 400; font-size: 19px; flex: 1; }
  .x {
    display: grid; place-items: center; width: 44px; height: 44px; margin: -7px -8px -7px 0;
    font-size: 19px; letter-spacing: 0; line-height: 1; color: var(--dim);
  }
  .x:hover { color: var(--ink); }
  .body { overflow: auto; padding: 18px 16px 22px; }

  /* Forme étroite : tout devient une feuille qui monte du bas. */
  @media (max-width: 860px) {
    .surf {
      top: auto; left: 0; right: 0; bottom: 0; width: auto; transform: none;
      max-height: 88vh; border-left: none; border-right: none; border-bottom: none;
    }
  }
</style>
