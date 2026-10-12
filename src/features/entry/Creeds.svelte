<script lang="ts">
  /* **Le défilé des cinq principes.** Il remplit le temps mort de l'attente
     au lieu d'être un péage avant l'entrée — et il sort de la tuile, plus
     large qu'elle : c'est à la largeur qu'on voit que c'est un moment. */
  import { CREEDS, CREED_ART } from "./creeds.ts";
  import { porte } from "./gate.svelte.ts";
  import { draft } from "./draft.svelte.ts";

  let { next }: { next: () => void } = $props();

  let strip = $state<HTMLElement | null>(null);
  let pos = $state(0);
  const track = () => {
    if (!strip) return;
    const m = strip.scrollWidth - strip.clientWidth;
    pos = m ? strip.scrollLeft / m : 0;
  };
  const by = (d: number) => {
    const card = strip?.querySelector<HTMLElement>(".creed");
    if (strip && card) strip.scrollBy({ left: (card.offsetWidth + 16) * d, behavior: "smooth" });
  };

  const admitted = $derived(porte.door === "admis");
  const ready = $derived(admitted && !!draft.firstName.trim());
</script>

<section class="creeds">
  <header class="creeds-h">
    <span class="onb-k">Cinq choses à savoir</span>
    <span class="creeds-nav">
      <button onclick={() => by(-1)} aria-label="Principe précédent">&lsaquo;</button>
      <button onclick={() => by(1)} aria-label="Principe suivant">&rsaquo;</button>
    </span>
  </header>
  <div class="strip" bind:this={strip} onscroll={track}>
    {#each CREEDS as c (c.n)}
      <article class="creed">
        <!-- Du SVG écrit à la main dans le code, aucune donnée n'y entre. -->
        <div class="creed-art">{@html CREED_ART[c.n]}</div>
        <span class="creed-n">{c.n}</span>
        <b>{c.t}</b><span class="creed-d">{c.d}</span>
      </article>
    {/each}
  </div>
  <!-- La règle de progression va d'un bord à l'autre : son curseur occupe
       un tiers, il parcourt donc les deux autres. -->
  <div class="rail"><i style="transform:translateX({pos * (100 / .34 - 100)}%)"></i></div>
  <div class="onb-act foot">
    <span class="legend">
      {#if admitted && !ready}Il vous manque un prénom, plus haut.
      {:else if admitted}Rien de tout cela n'est à retenir. On le retrouve en marchant.
      {:else}Rien de tout cela n'est à retenir. Le bouton s'allumera quand on vous aura accepté.{/if}
    </span>
    <button class="btn-main" disabled={!ready} onclick={next}>On vous a accepté — entrer</button>
  </div>
</section>

<style>
  .creeds { margin-top: 18px; }
  .creeds-h { display: flex; align-items: center; justify-content: space-between; padding: 0 2px 10px; border-bottom: 1px solid var(--rule); }
  .creeds-nav { display: flex; gap: 4px; }
  /* 44 px de cible pour un cadre de 34 (invariant 20). */
  .creeds-nav button { position: relative; width: 44px; height: 44px; display: grid; place-items: center;
                       font-size: 19px; line-height: 1; letter-spacing: 0; color: var(--dim); margin: -5px 0; }
  .creeds-nav button::before { content: ""; position: absolute; inset: 5px; border: 1px solid var(--rule2); transition: border-color var(--t1) var(--e); }
  .creeds-nav button:hover { color: var(--ink); }
  .creeds-nav button:hover::before { border-color: var(--ink); }

  .strip { display: flex; gap: 16px; overflow-x: auto; scroll-snap-type: x mandatory; padding: 16px 2px 18px; scrollbar-width: none; }
  .strip::-webkit-scrollbar { display: none; }
  .rail { height: 2px; background: var(--rule); overflow: hidden; margin: 0 2px; }
  .rail i { display: block; width: 34%; height: 100%; background: var(--ink); transition: transform 120ms linear; }

  .creed {
    flex: none; width: min(252px, 72vw); scroll-snap-align: start; background: var(--paper);
    border: 1px solid var(--rule); padding: 0 0 16px;
    /* Le prototype nommait une animation `rise` qu'il ne définissait nulle
       part : les cartes y paraissent sans entrée. C'est ce qu'on a vu et
       validé, c'est donc ce qu'on garde. */
    transition: border-color var(--t1) var(--e), transform var(--t2) var(--e);
  }
  .creed:hover { border-color: var(--rule2); transform: translateY(-3px); }
  .creed-art { display: block; padding: 14px 16px 6px; border-bottom: 1px solid var(--rule); background: var(--raise); }
  .creed-art :global(svg) { display: block; width: 100%; height: auto; }
  .creed-art :global(.rule) { stroke: var(--rule2); fill: none; stroke-width: 1; }
  .creed-art :global(.ink) { stroke: var(--ink); fill: none; stroke-width: 1.4; }
  .creed-art :global(.fill) { fill: var(--ink); stroke: none; }
  .creed-art :global(.paper) { stroke: var(--paper); fill: none; stroke-width: 1; opacity: .65; }
  .creed-art :global(rect.fill) { fill: var(--ink); }
  .creed-n { font-family: var(--fs); font-size: 21px; color: var(--faint); display: block; padding: 13px 16px 0; }
  .creed b { display: block; font-family: var(--fs); font-size: 20px; font-weight: 400; line-height: 1.15; margin: 2px 0 8px; padding: 0 16px; }
  .creed-d { display: block; font-family: var(--fr); font-weight: 300; font-size: 13px; line-height: 1.62; color: var(--dim); padding: 0 16px; }

  .foot { justify-content: space-between; align-items: center; }
  .foot .legend { margin: 0; flex: 1; min-width: 200px; }
</style>
