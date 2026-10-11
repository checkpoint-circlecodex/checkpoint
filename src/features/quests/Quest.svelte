<script lang="ts">
  import { registre } from "#core/model/store.svelte.ts";
  import { Face } from "#core/ui/index.ts";
  import { KIND, STATUS, dateShort, roman } from "#core/model/lexicon.ts";
  import { questById, questHolders, questScore, reached, rung, titleOf } from "#core/selectors/index.ts";

  let { id }: { id: string } = $props();

  const w = $derived(registre.world);
  const pref = $derived(registre.titlePref);
  const me = $derived(registre.me ?? "");
  const q = $derived(questById(w, id));
  const by = $derived(q ? w.people[q.personId] : null);
  const score = $derived(q ? questScore(w, q, me) : null);
  const holders = $derived(q ? questHolders(w, q) : []);
</script>

{#if !q}
  <div class="wrap"><p class="none">Cette planche a été arrachée.</p></div>
{:else}
  <div class="wrap">
    <a class="back" href="#/quetes">← Les Quêtes</a>
    <header>
      <span class="eyebrow">Quête · ouverte par {by?.firstName ?? "—"} · {dateShort(q.at)}</span>
      <h1>{q.title}</h1>
      {#if q.line}<p class="lede">{q.line}</p>{/if}
      {#if score}
        <div class="meas">
          <div><span class="k">Ta progression</span><span class="v">{roman(score.done)} / {roman(score.all)}</span></div>
          <div><span class="k">Accomplie par</span><span class="v">{holders.length ? roman(holders.length) : "—"}</span></div>
          <div><span class="k">Épreuves</span><span class="v">{roman(q.trials.length)}</span></div>
        </div>
        {#if score.ok}<p class="disc">Tu l'as accomplie.</p>{/if}
      {/if}
    </header>

    {#each q.trials as t, ti (ti)}
      {@const r = rung(t.rung)}
      {@const known = t.media.filter(m => w.catalog[m])}
      {@const got = known.filter(m => reached(w, me, m) >= t.rung).length}
      <section class="sect">
        <h2>Avoir {r.pp} — {roman(got)} sur {roman(known.length)}</h2>
        <p class="legend">{r.d}</p>
        <div class="reg">
          {#each known as mid (mid)}
            {@const hit = reached(w, me, mid) >= t.rung}
            {@const m = w.catalog[mid]}
            {@const own = w.rows.find(x => x.personId === me && x.mediaId === mid)}
            <a class="r" class:hit href="#/fiche/{mid}">
              <span class="mk">{hit ? "✓" : "·"}</span>
              <span class="line">
                <span class="t">{titleOf(w, mid, pref)}</span>
                <span class="kind">{KIND[m.mediaType]} · {m.year}</span>
              </span>
              <span class="st">{own ? STATUS[m.mediaType][own.status] : "rien d'inscrit"}</span>
            </a>
          {/each}
        </div>
      </section>
    {/each}

    <section class="sect">
      <h2>Qui l'a accomplie</h2>
      {#if holders.length}
        <div class="troop">
          {#each holders as p (p.id)}
            <a class="sold" href="#/personne/{p.id}"><Face who={p} size="m" /><b>{p.firstName}</b><i>{p.circleRef.one}</i></a>
          {/each}
        </div>
      {:else}
        <p class="none">Personne, pour l'instant. La planche attend.</p>
      {/if}
    </section>

    <p class="rule">
      <strong>Nul ne valide une quête.</strong> Elle s'accomplit d'elle-même, à mesure que les
      registres avancent — il n'y a personne à convaincre, donc rien à administrer.
    </p>
  </div>
{/if}

<style>
  .wrap { max-width: 820px; margin: 0 auto; padding: 30px 34px 60px; }
  .back { display: inline-flex; align-items: center; min-height: 44px; font-size: 10px;
          font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: var(--faint); }
  .back:hover { color: var(--ink); }
  .eyebrow { display: block; font-size: 9px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; color: var(--faint); }
  h1 { font-family: var(--fs); font-weight: 400; font-size: 36px; line-height: 1.05; margin-top: 4px; }
  .lede { font-family: var(--fr); font-style: italic; font-size: 15px; color: var(--ink2); margin-top: 8px; max-width: 58ch; }
  .meas { display: flex; gap: 34px; margin-top: 20px; }
  .meas .k { display: block; font-size: 9px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: var(--faint); }
  .meas .v { display: block; font-family: var(--fs); font-size: 26px; line-height: 1.1; }
  .disc { margin-top: 12px; font-family: var(--fr); font-style: italic; font-size: 14px; }

  .sect { margin-top: 30px; }
  h2 { font-family: var(--fs); font-weight: 400; font-size: 20px; }
  .legend { font-size: 11.5px; color: var(--dim); margin: 2px 0 12px; }
  .none { font-size: 12.5px; color: var(--dim); font-style: italic; }

  .reg { border-top: 1px solid var(--rule); }
  .r { display: grid; grid-template-columns: 18px minmax(0,1fr) auto; gap: 12px; align-items: center;
       padding: 9px 0; min-height: 44px; border-bottom: 1px solid var(--rule); }
  .r:hover { background: var(--raise); }
  .mk { color: var(--faint); text-align: center; }
  .hit .mk { color: var(--ink); font-weight: 700; }
  .line { display: grid; min-width: 0; }
  .t { font-family: var(--fs); font-size: 17px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .kind, .st { font-size: 11px; color: var(--dim); }

  .troop { display: flex; flex-wrap: wrap; gap: 4px; }
  .sold { display: flex; flex-direction: column; align-items: center; gap: 7px; width: 82px; padding: 10px 0; min-height: 44px; }
  .sold:hover { background: var(--raise); }
  .sold b { font-size: 11.5px; font-weight: 600; }
  .sold i { font-style: normal; font-size: 10px; color: var(--faint); }

  .rule { margin-top: 30px; padding-top: 12px; border-top: 1px solid var(--rule);
          font-size: 12px; color: var(--dim); max-width: 62ch; line-height: 1.6; }

  @media (max-width: 860px) { .wrap { padding: 22px 18px 80px; } .meas { gap: 20px; flex-wrap: wrap; } }
</style>
