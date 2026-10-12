<script lang="ts">
  /* **Planter une quête : un vœu, et ses conditions.** Un nom, une ligne, et
     des épreuves — un palier à atteindre sur un groupe d'œuvres.

     Les paliers sont monotones (invariant 28) : convoiter, entreprendre,
     achever. On ne propose pas « suspendu », et pas par oubli : une quête qui
     se désaccomplirait parce qu'on a changé un statut serait cruelle.

     Désigner une œuvre se fait en cherchant et en voyant ce qu'on choisit ;
     on la retire d'un geste. Et le choix met à jour **ses seuls résultats** —
     on ne redessine jamais sous les doigts de quelqu'un qui écrit. */
  import { registre } from "#core/model/store.svelte.ts";
  import { KIND, roman } from "#core/model/lexicon.ts";
  import { RUNGS, matchTitle, rung, titleOf } from "#core/selectors/index.ts";
  import { ouvrirQuete } from "#core/model/acts.ts";

  let { close }: { close: () => void } = $props();

  const w = $derived(registre.world);
  const pref = $derived(registre.titlePref);

  let title = $state("");
  let line = $state("");
  let trials = $state<{ rung: 1 | 2 | 3; media: string[]; q: string }[]>([{ rung: 3, media: [], q: "" }]);

  const hits = (i: number) => {
    const t = trials[i];
    const term = t.q.toLowerCase().trim();
    if (term.length < 2) return [];
    return Object.keys(w.catalog)
      .filter(id => !w.alias[id] && !t.media.includes(id) && matchTitle(w, id, term))
      .sort((a, b) => titleOf(w, a, pref).localeCompare(titleOf(w, b, pref), "fr"))
      .slice(0, 6);
  };

  const add = (i: number, id: string) => { trials[i].media = [...trials[i].media, id]; trials[i].q = ""; };
  const drop = (i: number, id: string) => { trials[i].media = trials[i].media.filter(x => x !== id); };
  const more = () => { trials = [...trials, { rung: 3, media: [], q: "" }]; };
  const less = (i: number) => { trials = trials.filter((_, k) => k !== i); };

  /* Une quête sans œuvre ne s'accomplirait jamais — ou toujours, selon la
     façon de compter. On ne la laisse pas planter. */
  const ready = $derived(title.trim().length > 1 && trials.length > 0 && trials.every(t => t.media.length > 0));

  function plant() {
    if (!ready) return;
    const id = `q-${(registre.me ?? "x")}-${Date.now().toString(36)}`;
    registre.act(ouvrirQuete({
      id, at: new Date().toISOString(), title: title.trim(), line: line.trim(),
      trials: trials.map(t => ({ rung: t.rung, media: t.media })),
    }));
    close();
    location.hash = `#/quete/${id}`;
  }
</script>

<div class="b">
  <label class="f">
    <span class="k">Son nom</span>
    <input class="nm" bind:value={title} placeholder="Istari, Le Tribunal, Les Cendres…" autocomplete="off" />
  </label>
  <label class="f">
    <span class="k">Sa promesse</span>
    <input bind:value={line} placeholder="Ce qu'elle demande, en une phrase." autocomplete="off" />
  </label>

  {#each trials as t, i (i)}
    <section class="trial">
      <div class="th">
        <span class="tn">Épreuve {roman(i + 1)}</span>
        {#if trials.length > 1}
          <button class="lien" onclick={() => less(i)}>Retirer l'épreuve</button>
        {/if}
      </div>

      <div class="picks">
        {#each RUNGS as r (r.k)}
          <button class="pick" class:on={t.rung === r.k} onclick={() => (t.rung = r.k)}>{r.v}</button>
        {/each}
      </div>
      <p class="legend">{rung(t.rung).d}</p>

      {#if t.media.length}
        <div class="chosen">
          {#each t.media as id (id)}
            <button class="pick on" onclick={() => drop(i, id)} aria-label="Retirer {titleOf(w, id, pref)}">
              {titleOf(w, id, pref)} <span aria-hidden="true">×</span>
            </button>
          {/each}
        </div>
      {/if}

      <input class="q" bind:value={t.q} placeholder="Ajouter une œuvre…" autocomplete="off" />
      {#if hits(i).length}
        <div class="res">
          {#each hits(i) as id (id)}
            {@const m = w.catalog[id]}
            <button class="hit" onclick={() => add(i, id)}>
              <span class="ht">{titleOf(w, id, pref)}</span>
              <span class="hk">{KIND[m.mediaType]} · {m.year}</span>
              <span class="plus" aria-hidden="true">+</span>
            </button>
          {/each}
        </div>
      {/if}
    </section>
  {/each}

  <button class="lien more" onclick={more}>+ Une autre épreuve</button>

  <div class="go">
    <button class="btn-main" onclick={plant} disabled={!ready}>Planter la quête</button>
    {#if !ready}
      <span class="why">
        {!title.trim() ? "Il lui faut un nom." : "Chaque épreuve demande au moins une œuvre."}
      </span>
    {/if}
  </div>
  <p class="rule"><strong>Nul ne la validera.</strong> Elle s'accomplira d'elle-même, pour chacun, à mesure que les registres avancent.</p>
</div>

<style>
  .b { display: grid; gap: 14px; }
  .f { display: grid; gap: 6px; }
  .k, .tn { font-size: 9px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: var(--faint); }
  input { width: 100%; min-height: 44px; padding: 10px 12px; border: 1px solid var(--rule2);
          background: var(--paper); font-size: 13.5px; }
  .nm { font-family: var(--fs); font-size: 19px; }

  .trial { display: grid; gap: 8px; padding: 12px 14px; border: 1px solid var(--rule); }
  .th { display: flex; align-items: center; justify-content: space-between; }
  .legend { font-size: 11.5px; color: var(--dim); font-style: italic; }

  .picks, .chosen { display: flex; gap: 4px; flex-wrap: wrap; }
  .pick, .btn-main {
    min-height: 44px; padding: 8px 12px; border: 1px solid var(--rule2);
    font-size: 11px; font-weight: 600; color: var(--dim);
  }
  .pick:hover { color: var(--ink); border-color: var(--ink); }
  .pick.on { color: var(--paper); background: var(--ink); border-color: var(--ink); }

  .res { display: flex; flex-direction: column; border-top: 1px solid var(--rule); }
  .hit { display: grid; grid-template-columns: minmax(0,1fr) auto 24px; gap: 10px; align-items: center;
         min-height: 44px; padding: 6px 0; border-bottom: 1px solid var(--rule); text-align: left; }
  .hit:hover { background: var(--raise); }
  .ht { font-family: var(--fs); font-size: 16px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .hk { font-size: 10.5px; color: var(--dim); }
  .plus { display: grid; place-items: center; letter-spacing: 0; line-height: 1; }

  .lien { min-height: 44px; font-size: 11px; color: var(--dim); text-decoration: underline; text-underline-offset: 3px; }
  .lien:hover { color: var(--ink); }
  .more { justify-self: start; }

  .go { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
  .btn-main { border-color: var(--ink); color: var(--ink); font-weight: 700; letter-spacing: .1em; text-transform: uppercase; font-size: 10px; }
  .btn-main:disabled { opacity: .4; cursor: default; }
  .why { font-size: 11px; color: var(--dim); font-style: italic; }
  .rule { font-size: 11.5px; color: var(--dim); line-height: 1.55; }
</style>
