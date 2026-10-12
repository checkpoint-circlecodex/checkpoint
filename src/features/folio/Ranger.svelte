<script lang="ts">
  /* **Ranger une œuvre** : ses catégories, choisies dans le vocabulaire des
     sources. Elles partent dans sa propre copie de l'œuvre et **s'ajoutent**
     à celles des autres à la lecture — on ne retire que les siennes. */
  import { untrack } from "svelte";
  import { registre } from "#core/model/store.svelte.ts";
  import { GenrePicker } from "#core/ui/index.ts";
  import { categoriser } from "#core/model/acts.ts";
  import type { Work } from "#core/model/schema.ts";

  let { id, work, mine, close }: { id: string; work: Work; mine: string[]; close?: () => void } = $props();

  /* L'état de départ, une fois : le panneau édite une copie, il ne suit pas. */
  let chosen = $state(new Set<string>(untrack(() => mine)));
  const toggle = (g: string) => {
    const n = new Set(chosen);
    n.has(g) ? n.delete(g) : n.add(g);
    chosen = n;
  };
  const others = $derived((work.genres ?? []).filter(g => !mine.includes(g)));
  function save() {
    registre.act(categoriser(id, [...chosen], work));
    close?.();
  }
</script>

<div class="rg">
  {#if others.length}
    <p class="legend">Déjà rangée par d'autres : <b>{others.join(" · ")}</b>. Ce que tu choisis s'y ajoute.</p>
  {/if}
  <GenrePicker kind={work.mediaType} {chosen} {toggle} />
  <div class="go"><button class="btn-main" onclick={save}>Consigner</button></div>
</div>

<style>
  .rg { display: grid; gap: 6px; }
  .legend { font-size: 11.5px; color: var(--dim); line-height: 1.55; }
  .legend b { color: var(--ink2); font-weight: 600; }
  .go { padding-top: 12px; margin-top: 8px; border-top: 1px solid var(--rule); }
  .btn-main { min-height: 44px; padding: 9px 16px; border: 1px solid var(--ink); color: var(--ink);
              font-size: 10px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; }
  .btn-main:hover { background: var(--ink); color: var(--paper); }
</style>
