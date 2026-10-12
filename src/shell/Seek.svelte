<script lang="ts">
  /* Ce que le lanceur trouve : des gens, et des œuvres **en jaquettes**. La
     recherche interroge toujours les deux titres, quelle que soit la
     préférence d'affichage (invariant 9). */
  import { registre } from "#core/model/store.svelte.ts";
  import { Cover, Face } from "#core/ui/index.ts";
  import { KIND, roman } from "#core/model/lexicon.ts";
  import { matchTitle, titleOf, tracked } from "#core/selectors/index.ts";

  let { query, onpick }: { query: string; onpick: () => void } = $props();

  const w = $derived(registre.world);
  const pref = $derived(registre.titlePref);
  const n = $derived(query.trim().toLowerCase());
  const works = $derived(n.length < 2 ? [] : tracked(w, undefined, pref).filter(id => matchTitle(w, id, n)));
  const people = $derived(n.length < 2 ? [] : Object.values(w.people)
    .filter(p => `${p.firstName} ${p.handle}`.toLowerCase().includes(n)));
</script>

{#if n.length < 2}
  <div class="empty">
    <span class="eyebrow">Volet déployé</span>
    <p class="say">Cherche une œuvre ou quelqu'un.<br />Choisis, et le volet se referme sur la page.</p>
  </div>
{:else}
  <span class="eyebrow">« {query.trim()} » · {roman(works.length + people.length)} trouvaille{works.length + people.length > 1 ? "s" : ""}</span>
  {#if people.length}
    <div class="troop">
      {#each people as p (p.id)}
        <a class="sold" href="#/personne/{p.id}" onclick={onpick}>
          <Face who={p} size="m" /><b>{p.firstName}</b><i>{p.handle}</i>
        </a>
      {/each}
    </div>
  {/if}
  {#if works.length}
    <div class="jqs">
      {#each works as id (id)}
        {@const m = w.catalog[id]}
        <Cover href="#/fiche/{id}" title={titleOf(w, id, pref)} sub="{KIND[m.mediaType]} · {m.year}" cover={m.cover ?? null} frame={m.coverFrame ?? null} {onpick} />
      {/each}
    </div>
  {:else if !people.length}
    <p class="none">Rien sous ce nom dans le registre.</p>
  {/if}
{/if}

<style>
  .eyebrow { display: block; font-size: 9px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; color: var(--faint); }
  .empty { display: flex; flex-direction: column; align-items: center; justify-content: center;
           min-height: 50vh; text-align: center; gap: 14px; }
  .say { font-family: var(--fr); font-weight: 300; font-style: italic; font-size: 17px; line-height: 1.7; color: var(--dim); }
  .troop { display: flex; flex-wrap: wrap; gap: 4px; margin: 18px 0 22px; }
  .sold { display: flex; flex-direction: column; align-items: center; gap: 7px; width: 82px; padding: 10px 0; min-height: 44px; }
  .sold:hover { background: var(--raise); }
  .sold b { font-size: 11.5px; font-weight: 600; }
  .sold i { font-style: normal; font-size: 10px; color: var(--faint); }
  .jqs { display: grid; grid-template-columns: repeat(auto-fill, minmax(118px, 1fr)); gap: 18px 14px; margin-top: 18px; }
  .none { font-size: 12.5px; color: var(--dim); font-style: italic; margin-top: 14px; }
</style>
