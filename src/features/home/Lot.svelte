<script lang="ts">
  /* **Le Sort — une œuvre au hasard**, tirée de préférence parmi celles dont
     tu n'as encore rien dit. La roulette ralentit, puis s'arrête sur l'œuvre
     où l'on part.

     Elle tourne **par minuterie et jamais par image d'animation** : une
     fenêtre masquée n'en produit aucune, et le tirage resterait suspendu au
     milieu sans rien dire. */
  import { registre } from "#core/model/store.svelte.ts";
  import { KIND, dec, roman } from "#core/model/lexicon.ts";
  import { avgOf, drawLot, rowsFor, titleOf, tracked } from "#core/selectors/index.ts";
  import { DIE_FACES, drawDie } from "#core/ui/die.ts";

  const w = $derived(registre.world);
  const pref = $derived(registre.titlePref);
  const me = $derived(registre.me ?? "");

  let type = $state("");
  let lot = $state<string | null>(null);
  let shown = $state("");
  let spinning = $state(false);
  let fade = $state(1);
  let die = $state<HTMLCanvasElement | null>(null);

  /* Le premier tirage se fait à l'arrivée sur la page, et seulement lui :
     re-tirer à chaque remise à jour du monde ferait changer l'œuvre sous les
     yeux de qui la lit. */
  $effect(() => { if (lot === null && w.rows.length) { lot = drawLot(w, me, type); shown = lot ? titleOf(w, lot, pref) : ""; } });
  $effect(() => { if (die) drawDie(die, "XII"); });

  const m = $derived(lot ? w.catalog[lot] : null);
  const rs = $derived(lot ? rowsFor(w, lot).filter(r => r.status !== "wishlist") : []);
  const avg = $derived(avgOf(rs));
  const mine = $derived(lot ? w.rows.some(r => r.personId === me && r.mediaId === lot) : false);

  function retype(t: string) {
    type = t;
    lot = drawLot(w, me, type);
    shown = lot ? titleOf(w, lot, pref) : "";
  }

  function spin() {
    const land = drawLot(w, me, type);
    if (!land) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { location.hash = `#/fiche/${land}`; return; }
    const pool = tracked(w, (type || undefined) as never);
    spinning = true;
    let i = 0;
    const n = 16;
    const step = () => {
      shown = titleOf(w, pool[Math.floor(Math.random() * pool.length)], pref);
      fade = 0.5 + 0.5 * (i / n);
      /* On anime le contenu, jamais la géométrie : le dé change de face. */
      if (die) drawDie(die, DIE_FACES[Math.floor(Math.random() * 10)]);
      if (++i < n) { setTimeout(step, 36 + i * i * 2.6); return; }
      lot = land; shown = titleOf(w, land, pref); fade = 1;
      if (die) drawDie(die, "XII");
      setTimeout(() => { spinning = false; location.hash = `#/fiche/${land}`; }, 260);
    };
    step();
  }
</script>

{#if lot && m}
  <section class="lot">
    <canvas class="d10" bind:this={die} aria-hidden="true"></canvas>
    <a class="l" href="#/fiche/{lot}">
      <span class="eyebrow">Le Sort — une œuvre au hasard</span>
      <span class="t" style="opacity:{fade}">{shown}</span>
      <span class="m">
        {KIND[m.mediaType]} · {m.year}{rs.length ? ` · ${roman(rs.length)} témoin${rs.length > 1 ? "s" : ""}` : " · nul témoin"}{avg !== null ? ` · jugement ${dec(avg)}` : ""}{mine ? "" : " · tu n'en as rien dit"}
      </span>
    </a>
    <div class="r">
      <select bind:value={type} onchange={() => retype(type)} aria-label="Nature de l'œuvre tirée" disabled={spinning}>
        <option value="">Toute nature</option>
        <option value="game">Jeux</option>
        <option value="film">Films</option>
        <option value="series">Séries</option>
        <option value="book">Livres</option>
      </select>
      <button class="go" onclick={spin} disabled={spinning}>{spinning ? "Le sort tourne…" : "Tenter le sort"}</button>
    </div>
  </section>
{/if}

<style>
  .lot { display: grid; grid-template-columns: auto 1fr auto; gap: 22px; align-items: center;
         border: 1px solid var(--rule); border-left: 2px solid var(--ink); padding: 14px 20px; margin-top: 26px; }
  .d10 { width: 80px; height: 84px; display: block; image-rendering: pixelated; }
  .l { display: block; min-width: 0; min-height: 44px; }
  .eyebrow { display: block; font-size: 9px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; color: var(--faint); }
  .t { display: block; font-family: var(--fs); font-size: 27px; line-height: 1.08; margin: 5px 0;
       white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: opacity 90ms linear; }
  .m { display: block; font-size: 11.5px; color: var(--dim); }
  .r { display: flex; align-items: center; gap: 12px; }
  select { appearance: none; -webkit-appearance: none; min-height: 44px; border: none; border-bottom: 1px solid var(--rule2);
           background: none; font-size: 11px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase;
           color: var(--dim); padding: 5px 4px; cursor: pointer; }
  select:hover { color: var(--ink); border-bottom-color: var(--ink); }
  .go { min-height: 44px; padding: 0 17px; border: 1px solid var(--ink); white-space: nowrap;
        font-size: 10.5px; font-weight: 700; letter-spacing: .17em; text-transform: uppercase;
        transition: background var(--t1) var(--e), color var(--t1) var(--e); }
  .go:hover:not(:disabled) { background: var(--ink); color: var(--paper); }
  .go:disabled { opacity: .45; cursor: default; }

  @media (max-width: 860px) {
    .lot { grid-template-columns: auto 1fr; gap: 14px; padding: 12px 14px; }
    .d10 { width: 60px; height: 63px; }
    .r { grid-column: 1 / -1; }
    .r .go { flex: 1; }
    .t { font-size: 22px; }
  }
</style>
