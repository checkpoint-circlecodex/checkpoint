<script lang="ts">
  import { registre } from "#core/model/store.svelte.ts";
  import { roman } from "#core/model/lexicon.ts";
  import { questHolders, questScore, questsDoneBy, questsOpenFor } from "#core/selectors/index.ts";
  import Sign from "./Sign.svelte";

  const w = $derived(registre.world);
  const me = $derived(registre.me ?? "");
  const mine = $derived(questsDoneBy(w, me).map(q => q.id));
  let filter = $state<"all" | "done" | "way">("all");

  const list = $derived(
    filter === "done" ? w.quests.filter(q => mine.includes(q.id))
    : filter === "way" ? questsOpenFor(w, me)
    : [...w.quests].sort((a, b) => b.at.localeCompare(a.at)));
</script>

<div class="wrap">
  <div class="eyebrow">Les Quêtes</div>
  <h1>{roman(w.quests.length)} planches au carrefour</h1>
  <p class="lede">
    Une quête est un vœu que quelqu'un a planté là : des œuvres, et un palier à
    atteindre sur chacune. <strong>Nul ne la valide</strong> — elle s'accomplit
    toute seule, à mesure que ton registre avance.
  </p>

  <div class="filt">
    <button class:on={filter === "all"} onclick={() => (filter = "all")}>Toutes<span class="n">{roman(w.quests.length)}</span></button>
    <button class:on={filter === "done"} onclick={() => (filter = "done")}>Accomplies<span class="n">{roman(mine.length)}</span></button>
    <button class:on={filter === "way"} onclick={() => (filter = "way")}>En chemin<span class="n">{roman(questsOpenFor(w, me).length)}</span></button>
  </div>

  {#if list.length}
    <div class="signs">
      {#each list as q, i (q.id)}
        <Sign {q} {i} done={questScore(w, q, me).ok} holders={questHolders(w, q).length} />
      {/each}
    </div>
  {:else}
    <p class="none">{filter === "done" ? "Tu n'as encore accompli aucune quête." : "Rien par ici."}</p>
  {/if}
</div>

<style>
  .wrap { max-width: 980px; margin: 0 auto; padding: 30px 34px 60px; }
  .eyebrow { display: block; font-size: 9px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; color: var(--faint); }
  h1 { font-family: var(--fs); font-weight: 400; font-size: 34px; line-height: 1.05; margin-top: 8px; }
  .lede { font-family: var(--fr); font-size: 14.5px; line-height: 1.6; color: var(--ink2); max-width: 62ch; margin: 8px 0 20px; }
  .none { font-size: 12.5px; color: var(--dim); font-style: italic; }

  .filt { display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 26px; }
  .filt button {
    display: inline-flex; align-items: center; gap: 7px; padding: 9px 13px; min-height: 44px;
    font-size: 11px; font-weight: 600; color: var(--dim); border: 1px solid var(--rule);
  }
  .filt button:hover { color: var(--ink); }
  .filt button.on { color: var(--ink); border-color: var(--ink); background: var(--raise); }
  .n { font-size: 9.5px; color: var(--faint); }

  .signs { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 26px 20px; }
  @media (max-width: 860px) { .wrap { padding: 22px 18px 80px; } .signs { grid-template-columns: 1fr; } }
</style>
