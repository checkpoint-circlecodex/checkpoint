<script lang="ts">
  /* **Accès rapide — ce que tu mènes.**

     « En cours » est un tableau de bord, pas une lecture : deux lignes par
     œuvre et pas cinq — le titre et ses commandes sur la même, le dernier
     checkpoint sur l'autre, tronqué. On vient y agir, pas s'y attarder.

     Et **le panneau montre aussi ce qu'on a mis de côté**, avec de quoi le
     reprendre : suspendre était facile, reprendre ne l'était pas — l'œuvre
     tombait dans le registre général et il fallait l'y retrouver. */
  import { registre } from "#core/model/store.svelte.ts";
  import { KIND, STATUS, UNIT, ago } from "#core/model/lexicon.ts";
  import { progressOf, rowsBy, titleOf } from "#core/selectors/index.ts";
  import { changerStatut, poserCheckpoint } from "#core/model/acts.ts";
  import type { Status } from "#core/model/schema.ts";

  let { close }: { close: () => void } = $props();

  const w = $derived(registre.world);
  const pref = $derived(registre.titlePref);
  const me = $derived(registre.moi);
  const mine = $derived(me ? rowsBy(w, me.id) : []);
  const live = $derived(mine.filter(r => r.status === "playing"));
  const aside = $derived(mine.filter(r => r.status === "paused"));

  const N = ["Aucune", "Une", "Deux", "Trois", "Quatre", "Cinq", "Six", "Sept", "Huit", "Neuf", "Dix"];

  let writing = $state<string | null>(null);
  let thought = $state("");

  const set = (id: string, st: Status) => registre.act(changerStatut(id, st));
  function consign(id: string) {
    if (!thought.trim()) return;
    registre.act(poserCheckpoint(id, thought));
    thought = ""; writing = null;
  }
</script>

<div class="live" style="--c:{me?.circleRef.color ?? 'var(--ink)'}">
  <p class="alt">
    {live.length ? `${N[live.length] ?? live.length} œuvre${live.length > 1 ? "s" : ""} en chemin.` : "Rien en chemin pour l'instant."}
    Suspendre n'est pas renoncer : ce qui part d'ici se retrouve juste dessous.
  </p>

  {#if live.length}
    <div class="box">
      {#each live as r (r.mediaId)}
        {@const m = w.catalog[r.mediaId]}
        {@const last = r.reflections?.at(-1)}
        <div class="lv">
          <div class="top">
            <a class="t" href="#/fiche/{r.mediaId}" onclick={close}>{titleOf(w, r.mediaId, pref)}</a>
            <span class="k">{KIND[m.mediaType]}{r.progress ? ` · ${progressOf(r, UNIT)}` : ""}</span>
            <!-- Les commandes sont là, visibles, sur la ligne du titre : le
                 survol peut confirmer, jamais découvrir. -->
            <span class="act">
              <button onclick={() => set(r.mediaId, "paused")}>De côté</button>
              <button onclick={() => set(r.mediaId, "completed")}>{STATUS[m.mediaType].completed}</button>
              <button onclick={() => set(r.mediaId, "dropped")}>{STATUS[m.mediaType].dropped}</button>
              <button class="sq" aria-label="Consigner une pensée"
                      aria-expanded={writing === r.mediaId}
                      onclick={() => { writing = writing === r.mediaId ? null : r.mediaId; thought = ""; }}>+</button>
            </span>
          </div>
          {#if last}
            <p class="st">« {last.text} » <em>{ago(last.at)}</em></p>
          {/if}
          {#if writing === r.mediaId}
            <form class="f" onsubmit={e => { e.preventDefault(); consign(r.mediaId); }}>
              <input bind:value={thought} placeholder="Une pensée, en chemin." autocomplete="off" />
              <button disabled={!thought.trim()}>Consigner</button>
            </form>
          {/if}
        </div>
      {/each}
    </div>
  {/if}

  {#if aside.length}
    <h3>Mis de côté</h3>
    <div class="box side">
      {#each aside as r (r.mediaId)}
        {@const m = w.catalog[r.mediaId]}
        <div class="lv">
          <div class="top">
            <a class="t" href="#/fiche/{r.mediaId}" onclick={close}>{titleOf(w, r.mediaId, pref)}</a>
            <span class="k">{KIND[m.mediaType]}{r.progress ? ` · ${progressOf(r, UNIT)}` : ""} · {ago(r.at)}</span>
            <span class="act">
              <button class="go" onclick={() => set(r.mediaId, "playing")}>Reprendre</button>
              <button onclick={() => set(r.mediaId, "dropped")}>{STATUS[m.mediaType].dropped}</button>
            </span>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .live { display: grid; gap: 12px; }
  .alt { font-family: var(--fr); font-size: 13.5px; line-height: 1.55; color: var(--ink2); max-width: 56ch; }
  h3 { font-family: var(--fs); font-weight: 400; font-size: 18px; margin-top: 10px; }

  /* Le panneau porte la couleur de son Ordre, comme le bloc de la feuille :
     c'est la même chose, vue d'ailleurs — et c'est un filet, pas un aplat. */
  .box { display: flex; flex-direction: column; border: 1px solid var(--rule);
         border-left: 2px solid color-mix(in srgb, var(--c) 70%, transparent); }
  .side { border-left-color: color-mix(in srgb, var(--c) 35%, transparent); }
  .lv { padding: 8px 12px; }
  .lv + .lv { border-top: 1px solid var(--rule); }

  .top { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; min-height: 44px; }
  /* Le titre est un lien, donc une cible : il occupe toute la hauteur de sa
     ligne plutôt que la hauteur de son texte (invariant 20). */
  .t { align-self: stretch; display: flex; align-items: center; min-height: 44px;
       font-family: var(--fs); font-size: 17px; line-height: 1.15; }
  .t:hover { text-decoration: underline; text-underline-offset: 3px; }
  .k { font-size: 11px; color: var(--dim); }
  .act { display: flex; gap: 4px; margin-left: auto; }
  .act button {
    min-height: 44px; padding: 0 10px; border: 1px solid var(--rule2);
    font-size: 10px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--dim);
  }
  .act button:hover { color: var(--ink); border-color: var(--ink); }
  .act .go { color: var(--ink); border-color: var(--ink); }
  /* Un bouton carré ne centre pas son glyphe tout seul (invariant 30). */
  .act .sq { display: grid; place-items: center; width: 44px; padding: 0;
             font-size: 16px; letter-spacing: 0; line-height: 1; }

  .st { font-family: var(--fr); font-style: italic; font-size: 12.5px; color: var(--ink2);
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px; }
  .st em { font-family: var(--fu); font-style: normal; font-size: 10px; color: var(--faint); margin-left: 6px; }

  .f { display: flex; gap: 6px; margin-top: 8px; }
  .f input { flex: 1; min-width: 0; min-height: 44px; padding: 8px 11px; border: 1px solid var(--rule2);
             background: var(--paper); font-family: var(--fr); font-size: 13.5px; }
  .f button { min-height: 44px; padding: 0 12px; border: 1px solid var(--ink);
              font-size: 10px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; }
  .f button:disabled { opacity: .35; cursor: default; }

  @media (max-width: 860px) { .act { margin-left: 0; width: 100%; } .act button { flex: 1; } .act .sq { flex: none; } }
</style>
