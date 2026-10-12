<script lang="ts">
  /* La feuille de personnage. Elle **porte la trame de son Ordre à présence
     réduite** — touchée par lui, sans être la chambre : la quatrième des
     quatre exceptions au noir et blanc. */
  import { registre } from "#core/model/store.svelte.ts";
  import { Face, Panes, pile } from "#core/ui/index.ts";
  import Lignee from "./Lignee.svelte";
  import KinDeclare from "./KinDeclare.svelte";
  import { weave } from "#core/ui/weave.ts";
  import { KIND, STATUS, UNIT, dec, roman, ago } from "#core/model/lexicon.ts";
  import {
    KIN, favsOf, figures, household, kinAsked, progressOf, questsDoneBy, rowsBy, soulLine, titleOf,
  } from "#core/selectors/index.ts";

  let { id }: { id: string } = $props();

  const w = $derived(registre.world);
  const pref = $derived(registre.titlePref);
  const p = $derived(w.people[id]);
  const self = $derived(id === registre.me);
  const f = $derived(p ? figures(w, id) : null);
  const favs = $derived(p ? favsOf(w, id) : []);
  const rows = $derived(p ? rowsBy(w, id) : []);
  const done = $derived(p ? questsDoneBy(w, id) : []);
  const house = $derived(p ? household(w, id) : null);
  /* Ce que d'autres ont déclaré à ton sujet et que tu n'as pas rendu. Ça ne
     se voit que sur ta propre feuille — c'est à toi de répondre, à personne
     d'autre de le savoir. */
  const asked = $derived(self ? kinAsked(w, id) : []);
  const openLignee = () => pile.open("panneau", "La maisonnée", Lignee, { pid: id });
  const openDeclare = () => pile.open("panneau", "Parenté", KinDeclare);

  let tab = $state("portrait");
  const tabs = $derived([
    { k: "portrait", l: "Portrait" },
    { k: "favorites", l: "Favoris", n: favs.length },
    { k: "quests", l: "Quêtes", n: done.length },
    { k: "registry", l: "Le registre", n: rows.length },
  ]);
</script>

{#if !p}
  <div class="wrap"><p class="none">Âme inconnue de l'Ordre.</p></div>
{:else}
  <div class="sheet" style="--c:{p.circleRef.color}">
    <canvas class="weave" use:weave={{ kind: p.circle, hex: p.circleRef.hex }} aria-hidden="true"></canvas>

    <div class="wrap">
      <header class="head">
        <Face who={p} size="l" />
        <div class="who">
          <span class="eyebrow">Feuille de personnage</span>
          <h1>{p.firstName}</h1>
          <div class="meta">
            {p.handle} · <a href="#/cercles/{p.circle}">{p.circleRef.one}</a>{p.discord ? ` · ${p.discord} sur Discord` : ""}
            {#if house && house.size > 1}
              <!-- **Le point de la lignée est neutre, et il doit l'être** : les
                   membres d'une maisonnée ne sont pas du même Ordre, une marque
                   colorée obligerait à en trahir un. -->
              <button class="kin" onclick={openLignee} aria-label="La maisonnée, {roman(house.size)} âmes">⁂ {roman(house.size)}</button>
            {/if}
            {#if self}
              <button class="kin" onclick={openDeclare}>Parenté</button>
            {/if}
          </div>
          <p class="line">{soulLine(w, id)}</p>
          {#each asked as a (a.from)}
            <button class="asked" onclick={openDeclare}>
              <b>{w.people[a.from]?.firstName}</b> te déclare <i>{KIN[a.rel].l}</i> — répondre
            </button>
          {/each}
        </div>
        {#if favs.length}
          <a class="opus" href="#/fiche/{favs[0]}">
            <span class="k">Magnum opus</span>
            <span class="t">{titleOf(w, favs[0], pref)}</span>
          </a>
        {/if}
      </header>

      {#if f}
        <div class="meas">
          <div><span class="k">Achevées</span><span class="v">{roman(f.done + f.master)}</span></div>
          <div><span class="k">En cours</span><span class="v">{roman(f.under)}</span></div>
          <div><span class="k">Jugement</span><span class="v">{f.avg === null ? "—" : dec(f.avg)}</span></div>
          <div><span class="k">Heures</span><span class="v">{roman(f.hours)}</span></div>
        </div>
      {/if}

      <Panes {tabs} bind:active={tab}>
        {#snippet children(k)}
          {#if k === "portrait"}
            <section class="pane-b">
              <h2>En cours</h2>
              <!-- **« En cours » est un tableau de bord, pas une lecture** :
                   titre et commandes sur la même ligne, dernier checkpoint sur
                   l'autre, tronqué. On vient y agir, pas s'y attarder. -->
              {#each rows.filter(r => r.status === "playing") as r (r.mediaId)}
                {@const m = w.catalog[r.mediaId]}
                {@const last = r.reflections?.at(-1)}
                <a class="live" href="#/fiche/{r.mediaId}">
                  <span class="lv-t">{titleOf(w, r.mediaId, pref)}</span>
                  <span class="lv-m">{KIND[m.mediaType]}{r.progress ? ` · ${progressOf(r, UNIT)}` : ""} · {ago(r.at)}</span>
                  {#if last}<span class="lv-c">« {last.text} »</span>{/if}
                </a>
              {:else}
                <p class="none">Rien en cours.</p>
              {/each}
            </section>
          {:else if k === "favorites"}
            <section class="pane-b">
              <h2>Ce qu'{p.firstName} distingue</h2>
              <p class="legend">
                <strong>Un favori n'est pas une note.</strong> C'est une liste déclarée,
                ordonnée, plafonnée à douze — le premier rang est son magnum opus.
              </p>
              {#if favs.length}
                <ol class="favs">
                  {#each favs as id2, i (id2)}
                    <li><a href="#/fiche/{id2}"><span class="rk">{roman(i + 1)}</span>{titleOf(w, id2, pref)}</a></li>
                  {/each}
                </ol>
              {:else}
                <p class="none">N'a encore rien distingué.</p>
              {/if}
            </section>
          {:else if k === "quests"}
            <section class="pane-b">
              <h2>Planches accomplies</h2>
              {#if done.length}
                <div class="reg">
                  {#each done as q (q.id)}
                    <a class="r" href="#/quete/{q.id}"><span class="t">{q.title}</span><span class="kind">{q.line}</span></a>
                  {/each}
                </div>
              {:else}
                <p class="none">Aucune, pour l'instant. Les planches attendent.</p>
              {/if}
            </section>
          {:else}
            <section class="pane-b">
              <h2>Le registre</h2>
              <div class="reg">
                {#each rows as r (r.mediaId)}
                  {@const m = w.catalog[r.mediaId]}
                  <a class="r" href="#/fiche/{r.mediaId}">
                    <span class="t">{titleOf(w, r.mediaId, pref)}</span>
                    <span class="kind">{KIND[m.mediaType]} · {STATUS[m.mediaType][r.status]}</span>
                    <span class="sc">{typeof r.rating === "number" ? r.rating : "—"}</span>
                  </a>
                {/each}
              </div>
            </section>
          {/if}
        {/snippet}
      </Panes>
    </div>
  </div>
{/if}

<style>
  .sheet { position: relative; min-height: 100%; }
  /* **Présence réduite** : touchée par sa trame, pas baignée dedans. */
  .weave { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 0;
           opacity: .45; pointer-events: none; }
  .wrap { position: relative; z-index: 1; max-width: 900px; margin: 0 auto; padding: 30px 34px 60px; }

  .head { display: flex; align-items: flex-end; gap: 22px; padding-bottom: 20px; border-bottom: 1.5px solid var(--ink); }
  .who { flex: 1; min-width: 0; }
  .eyebrow { display: block; font-size: 9px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; color: var(--faint); }
  h1 { font-family: var(--fs); font-weight: 400; font-size: 40px; line-height: 1; margin-top: 2px; }
  .meta { font-size: 11.5px; color: var(--dim); margin-top: 5px; }
  .meta a { display: inline-flex; align-items: center; min-height: 44px; margin: -14px 0;
            color: var(--ink); font-weight: 600;
            text-decoration: underline; text-decoration-color: var(--rule2); text-underline-offset: 3px; }
  .kin { display: inline-flex; align-items: center; min-height: 44px; margin: -14px 0 -14px 8px;
         padding: 0 4px; font-size: 11.5px; color: var(--dim); }
  .kin:hover { color: var(--ink); text-decoration: underline; text-underline-offset: 3px; }
  /* Neutre, comme le point : une parenté en attente n'est pas une alerte. */
  .asked { display: flex; align-items: center; gap: 5px; min-height: 44px; margin-top: 6px;
           padding: 0 12px; border: 1px solid var(--rule2); font-size: 12px; color: var(--ink2); }
  .asked b { font-family: var(--fs); font-weight: 400; font-size: 15px; }
  .asked:hover { border-color: var(--ink); }
  /* Pas de pronom : on ne connaît pas le genre, et on n'a pas à le demander. */
  .line { font-family: var(--fr); font-style: italic; font-size: 15px; line-height: 1.55;
          color: var(--ink2); margin-top: 9px; max-width: 58ch; }
  .opus { display: grid; gap: 2px; max-width: 190px; min-height: 44px; align-content: center; text-align: right; }
  .opus .k { font-size: 9px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: var(--faint); }
  .opus .t { font-family: var(--fs); font-size: 19px; line-height: 1.1; }

  .meas { display: flex; gap: 34px; margin: 20px 0 26px; }
  .meas .k { display: block; font-size: 9px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: var(--faint); }
  .meas .v { display: block; font-family: var(--fs); font-size: 26px; line-height: 1.1; }

  .pane-b { padding-top: 18px; }
  h2 { font-family: var(--fs); font-weight: 400; font-size: 20px; margin-bottom: 10px; }
  .legend { font-size: 11.5px; color: var(--dim); margin: -4px 0 14px; max-width: 60ch; }
  .none { font-size: 12.5px; color: var(--dim); font-style: italic; }

  .live { display: grid; gap: 1px; padding: 10px 0; min-height: 44px; border-bottom: 1px solid var(--rule); }
  .live:hover { background: var(--raise); }
  .lv-t { font-family: var(--fs); font-size: 18px; }
  .lv-m { font-size: 11px; color: var(--dim); }
  .lv-c { font-family: var(--fr); font-style: italic; font-size: 12.5px; color: var(--ink2);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  .favs { list-style: none; border-top: 1px solid var(--rule); }
  .favs a { display: flex; align-items: center; gap: 14px; padding: 9px 0; min-height: 44px;
            border-bottom: 1px solid var(--rule); font-family: var(--fs); font-size: 18px; }
  .favs a:hover { background: var(--raise); }
  .rk { width: 28px; font-size: 11px; color: var(--faint); font-family: var(--fu); }

  .reg { border-top: 1px solid var(--rule); }
  .r { display: grid; grid-template-columns: minmax(0,1fr) auto 32px; gap: 14px; align-items: center;
       padding: 9px 0; min-height: 44px; border-bottom: 1px solid var(--rule); }
  .r:hover { background: var(--raise); }
  .t { font-family: var(--fs); font-size: 17px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .kind { font-size: 11px; color: var(--dim); }
  .sc { font-family: var(--fs); font-size: 17px; text-align: right; font-variant-numeric: tabular-nums; }

  @media (max-width: 860px) {
    .wrap { padding: 22px 18px 80px; }
    .head { flex-wrap: wrap; gap: 14px; }
    .opus { max-width: none; text-align: left; }
    .meas { gap: 20px; flex-wrap: wrap; }
  }
</style>
