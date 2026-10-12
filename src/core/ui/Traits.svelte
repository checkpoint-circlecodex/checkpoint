<script lang="ts">
  /* **Une grille de traits** : un nom, une valeur, une ligne qui dit ce
     qu'elle veut dire. Dans le noyau parce que deux pages s'en servent — la
     feuille d'une personne et la chambre d'un Ordre (invariant 13). Les
     chiffres seuls feraient un tableau de bord ; c'est la ligne qui en fait
     un portrait. */
  type Trait = { k: string; v: string; d: string };
  let { traits }: { traits: (Trait | null)[] } = $props();
  const list = $derived(traits.filter(Boolean) as Trait[]);
</script>

<div class="traits">
  {#each list as t (t.k)}
    <div class="tr"><span class="k">{t.k}</span><span class="v">{t.v}</span><span class="d">{t.d}</span></div>
  {/each}
</div>

<style>
  .traits { display: grid; grid-template-columns: repeat(auto-fit, minmax(174px, 1fr)); gap: 1px; margin: 4px 0 6px; }
  .tr { background: var(--paper); padding: 14px 15px; box-shadow: 0 0 0 1px var(--rule); }
  .k { display: block; font-size: 9px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: var(--faint); }
  .v { display: block; font-family: var(--fs); font-size: 25px; line-height: 1.1; margin: 2px 0 4px; }
  .d { display: block; font-size: 11px; color: var(--dim); line-height: 1.4; }
</style>
