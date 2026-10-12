<script lang="ts">
  /* **L'Ordre.** Les pastilles sont **exactement celles de la racine** :
     pleine couleur, halo, dérive, et la même rafale de couleur au choix. On
     les verra tous les jours — autant les reconnaître dès le premier soir. */
  import { CIRCLES } from "#core/model/lexicon.ts";
  import { burst } from "#core/ui/burst.ts";
  import type { CircleId } from "#core/model/schema.ts";
  import { draft, keep } from "./draft.svelte.ts";

  let { next }: { next: () => void } = $props();

  function pick(id: CircleId, color: string, e: MouseEvent) {
    draft.circle = id;
    keep();
    /* La couleur naît de la pastille choisie — le geste de la racine, sans
       la navigation qui va avec. */
    const disc = (e.currentTarget as HTMLElement).querySelector(".disc2");
    if (disc) burst(disc, color, () => {});
  }
</script>

<h2 class="onb-t">Mais au fond, qui êtes-vous ?</h2>
<p class="onb-p dim">Il ne limite rien. Il décide seulement avec qui vous serez comparé, et de quelle couleur sera votre chambre.</p>
<div class="orders" role="radiogroup" aria-label="Votre Ordre">
  {#each CIRCLES as c, i (c.id)}
    <button class="orb" class:on={draft.circle === c.id} style="--c:{c.color};--i:{i}"
            role="radio" aria-checked={draft.circle === c.id} onclick={e => pick(c.id, c.color, e)}>
      <span class="disc2">{c.emoji}</span>
      <b>{c.name}</b><span class="bl">{c.blurb}</span>
    </button>
  {/each}
</div>
<div class="onb-act">
  <button class="btn-main" onclick={next} disabled={!draft.circle}>Prêter serment</button>
</div>

<style>
  .orders { display: grid; grid-template-columns: repeat(auto-fit, minmax(94px, 1fr)); gap: 8px; }
  .orb { display: flex; flex-direction: column; align-items: center; gap: 7px; text-align: center;
         padding: 14px 8px 12px; border: 1px solid transparent;
         transition: border-color var(--t1) var(--e), background var(--t1) var(--e); }
  .orb:hover { border-color: var(--rule2); }
  .orb.on { border-color: var(--c); background: color-mix(in srgb, var(--c) 10%, transparent); }
  .disc2 { width: 66px; height: 66px; border-radius: 50%; background: var(--c);
           position: relative; display: grid; place-items: center; font-size: 29px; letter-spacing: 0; line-height: 1;
           animation: drift 7.5s ease-in-out infinite; animation-delay: calc(var(--i, 0) * -1.4s);
           transition: transform var(--t2) var(--e); }
  .disc2::before { content: ""; position: absolute; inset: -30%; border-radius: 50%; z-index: -1;
                   background: radial-gradient(circle, var(--c) 0%, transparent 66%);
                   filter: blur(13px); animation: halo 7.5s ease-in-out infinite;
                   animation-delay: calc(var(--i, 0) * -1.4s); }
  .orb:hover .disc2 { transform: translateY(-5px) scale(1.06); }
  .orb.on .disc2 { transform: translateY(-3px) scale(1.04); }
  .orb b { font-size: 12.5px; font-weight: 600; }
  .bl { font-family: var(--fr); font-style: italic; font-size: 10.5px; color: var(--dim); line-height: 1.4; }
  @keyframes drift { 0%,100% { translate: 0 0; } 50% { translate: 0 -11px; } }
  @keyframes halo { 0%,100% { opacity: .26; transform: scale(1); } 50% { opacity: .46; transform: scale(1.1); } }
  @media (prefers-reduced-motion: reduce) { .disc2, .disc2::before { animation: none; } }
</style>
