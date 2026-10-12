<script lang="ts">
  /* **Choisir des catégories.** Dans le noyau parce que deux endroits s'en
     servent : décrire une œuvre hors du fonds, et ranger une œuvre déjà
     inscrite (invariant 13).

     **Un choix qu'on ne voit pas n'existe pas** : les familles s'affichent en
     entier, jamais dans une boîte à défilement interne. Et toute valeur déjà
     consignée hors liste reste choisissable — sinon une simple édition
     l'efface (`groupsWithLegacy`). */
  import { groupsWithLegacy } from "../model/genres.ts";
  import type { MediaType } from "../model/schema.ts";

  let { kind, chosen, toggle }: { kind: MediaType; chosen: Set<string>; toggle: (g: string) => void } = $props();
  const groups = $derived(groupsWithLegacy(kind, chosen));
</script>

{#each groups as grp (grp.g)}
  <div class="grp">
    <span class="gl">{grp.g}</span>
    <div class="tags">
      {#each grp.l as g (g)}
        <button type="button" class="tag" class:on={chosen.has(g)} aria-pressed={chosen.has(g)} onclick={() => toggle(g)}>{g}</button>
      {/each}
    </div>
  </div>
{/each}

<style>
  .grp { display: grid; gap: 5px; margin-top: 8px; }
  .gl { font-size: 10px; letter-spacing: .1em; text-transform: uppercase; color: var(--dim); }
  .tags { display: flex; gap: 4px; flex-wrap: wrap; }
  .tag { min-height: 44px; padding: 7px 10px; border: 1px solid var(--rule2);
         font-size: 11px; font-weight: 500; color: var(--dim); }
  .tag:hover { color: var(--ink); border-color: var(--ink); }
  .tag.on { color: var(--paper); background: var(--ink); border-color: var(--ink); }
</style>
