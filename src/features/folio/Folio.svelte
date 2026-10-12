<script lang="ts">
  /* La fiche d'une œuvre. **Une jaquette donne sa couleur au haut de sa
     fiche** — floutée, étalée, très diluée — et **s'éteint avant les
     chiffres** : au-delà du titre la page est un instrument, et un instrument
     ne se colore pas. */
  import { registre } from "#core/model/store.svelte.ts";
  import { Face } from "#core/ui/index.ts";
  import { KIND, STATUS, UNIT, dec, roman, ago } from "#core/model/lexicon.ts";
  import { avgOf, favsOf, otherTitle, progressOf, rowsFor, titleOf } from "#core/selectors/index.ts";
  import { changerStatut, chroniquer, distinguer, inscrire, juger, poserCheckpoint } from "#core/model/acts.ts";
  import { STATE_ORDER } from "#core/model/lexicon.ts";
  import { FAV_MAX } from "#core/model/schema.ts";

  let { id }: { id: string } = $props();

  const w = $derived(registre.world);
  const pref = $derived(registre.titlePref);
  const m = $derived(w.catalog[id]);
  const rows = $derived(rowsFor(w, id));
  const rated = $derived(rows.filter(r => typeof r.rating === "number"));
  const avg = $derived(avgOf(rows));
  const mine = $derived(w.rows.find(r => r.personId === registre.me && r.mediaId === id) ?? null);
  /* La discorde est un fait, pas un jugement : l'écart entre le plus haut et
     le plus bas. Au-delà de quatre, la page le dit. */
  const spread = $derived(rated.length > 1
    ? Math.max(...rated.map(r => r.rating as number)) - Math.min(...rated.map(r => r.rating as number))
    : 0);
  const chrons = $derived(rows.filter(r => r.review));
  let open = $state<Record<string, boolean>>({});

  /* --- Ce qu'on peut inscrire ici. Les vues décrivent une intention ; elles
     ne touchent jamais au stockage. --- */
  const favs = $derived(favsOf(w, registre.me ?? ""));
  const isFav = $derived(favs.includes(id));
  /* **On ne distingue pas ce qu'on convoite sans l'avoir fréquenté.** */
  const canFav = $derived(!!mine && mine.status !== "wishlist");
  let thought = $state("");
  const inscribe = () => registre.act(inscrire(id, { status: "wishlist" }, m));
  const setStatus = (st: string) => registre.act(changerStatut(id, st as never));
  const rate = (n: number) => registre.act(juger(id, mine?.rating === n ? null : n));
  const checkpoint = () => { if (!thought.trim()) return; registre.act(poserCheckpoint(id, thought)); thought = ""; };

  /* La chronique : **un jugement rédigé**, une seule par personne et par
     œuvre. On la réécrit, on n'en empile pas. Le formulaire ne s'ouvre que si
     on le demande — une chronique ne s'écrit pas en passant. */
  let writing = $state(false);
  let chTitle = $state("");
  let chBody = $state("");
  function openChronicle() {
    chTitle = mine?.review?.title ?? "";
    chBody = mine?.review?.body ?? "";
    writing = true;
  }
  function saveChronicle() {
    if (!chTitle.trim() || !chBody.trim()) return;
    registre.act(chroniquer(id, chTitle, chBody));
    writing = false;
  }
</script>

{#if !m}
  <div class="wrap"><p class="none">Œuvre absente du corpus.</p></div>
{:else}
  <div class="wrap">
    {#if m.cover}
      <div class="wash" style="--img:url('{m.cover}')" aria-hidden="true"></div>
    {/if}

    <header>
      <button class="back" onclick={() => history.back()}>← Retour</button>
      <span class="eyebrow">{KIND[m.mediaType]} · {m.year}</span>
      <h1>{titleOf(w, id, pref)}</h1>
      {#if otherTitle(w, id, pref)}<span class="alt">{otherTitle(w, id, pref)}</span>{/if}
      <span class="gn">{m.genres?.length ? m.genres.join(" · ") : "sans genre consigné"}</span>

      <div class="meas">
        <div><span class="k">Jugement moyen</span><span class="v">{avg === null ? "—" : dec(avg)}</span></div>
        <div><span class="k">Témoins</span><span class="v">{roman(rows.length)}</span></div>
        <div><span class="k">Discorde</span><span class="v">{spread ? roman(spread) : "—"}</span></div>
      </div>
      {#if spread >= 4}<p class="disc">Les Ordres ne s'accordent pas sur cette œuvre.</p>{/if}
    </header>

    {#if rated.length > 1 && avg !== null}
      <!-- **La forme du désaccord** : un trait par jugement sur la réglette de
           I à X. Rien de plus qu'une règle graduée et des visages — aucune
           couleur, et c'est ce qui la rend lisible. -->
      <section class="sect">
        <h2>La forme du désaccord</h2>
        <div class="plot">
          {#each Array.from({ length: 10 }, (_, k) => k + 1) as n}
            {@const hits = rated.filter(r => r.rating === n)}
            <div class="pc" class:has={hits.length > 0}>
              <span class="pf">
                {#each hits as r}{@const p = w.people[r.personId]}{#if p}<Face who={p} size="s" />{/if}{/each}
              </span>
              <span class="pt"></span>
              <span class="pn">{n}</span>
            </div>
          {/each}
          <div class="pavg" style="left:{((avg - 1) / 9 * 100).toFixed(2)}%"><span>{dec(avg)}</span></div>
        </div>
      </section>
    {/if}

    <section class="sect">
      <h2>Le registre</h2>
      <div class="reg">
        {#each rows as r (r.personId)}
          {@const p = w.people[r.personId]}
          <a class="r" class:moi={r.personId === registre.me} href="#/personne/{r.personId}">
            {#if p}<Face who={p} size="s" />{/if}
            <span class="line">
              <span class="who">{p?.firstName}</span>
              <span class="vb">
                {p?.circleRef.one}{r.progress ? ` · ${progressOf(r, UNIT)}` : ""}{(r.plays ?? 1) > 1 ? ` · ${roman(r.plays as number)} fois` : ""}
              </span>
            </span>
            <span class="st">{STATUS[m.mediaType][r.status]}</span>
            <span class="sc">{typeof r.rating === "number" ? r.rating : "—"}</span>
          </a>
        {/each}
      </div>
    </section>

    <section class="sect">
      <h2>Les chroniques</h2>
      {#if chrons.length}
        {#each chrons as r (r.personId)}
          {@const p = w.people[r.personId]}
          <div class="chron">
            <!-- Les commandes restent visibles : rien ne se découvre au survol. -->
            <button class="ch-h" onclick={() => (open = { ...open, [r.personId]: !open[r.personId] })}
                    aria-expanded={!!open[r.personId]}>
              {#if p}<Face who={p} size="s" />{/if}
              <span class="ch-t">
                <span class="ti">{r.review?.title}</span>
                <span class="au">{p?.firstName} · {typeof r.rating === "number" ? `${r.rating}/10` : "sans jugement"} · {ago(r.at)}</span>
              </span>
              <span class="mk" class:up={open[r.personId]}>›</span>
            </button>
            {#if open[r.personId]}
              <div class="ch-b">
                {#each (r.review?.body ?? "").split("\n\n") as para}<p>{para}</p>{/each}
              </div>
            {/if}
          </div>
        {/each}
      {:else}
        <p class="none">Nul n'a encore écrit sur cette œuvre.</p>
      {/if}
    </section>

    <!-- Ta position sur l'œuvre. Les commandes sont **visibles**, jamais
         révélées au survol : le survol peut confirmer, jamais découvrir. -->
    <section class="mienne">
      {#if !mine}
        <div class="m-vide">
          <span>Tu ne l'as pas inscrite.</span>
          <button class="btn" onclick={inscribe}>Inscrire au registre</button>
        </div>
      {:else}
        <div class="m-l">
          <span class="k">Ta position</span>
          <div class="picks">
            {#each STATE_ORDER as st}
              <button class="pick" class:on={mine.status === st} onclick={() => setStatus(st)}>
                {STATUS[m.mediaType][st]}
              </button>
            {/each}
          </div>
        </div>

        <div class="m-l">
          <span class="k">Ton jugement</span>
          <div class="notes">
            {#each Array.from({ length: 10 }, (_, i) => i + 1) as n}
              <button class="note" class:on={mine.rating === n} onclick={() => rate(n)}>{n}</button>
            {/each}
          </div>
        </div>

        <div class="m-l">
          <span class="k">Distinction</span>
          <button class="btn" class:held={isFav} onclick={() => registre.act(distinguer(id))}
                  disabled={!canFav || (!isFav && favs.length >= FAV_MAX)}>
            {isFav ? "Retirer des favoris" : "Distinguer"}
          </button>
          {#if !canFav}
            <span class="why">On ne distingue pas ce qu'on convoite sans l'avoir fréquenté.</span>
          {:else if !isFav && favs.length >= FAV_MAX}
            <span class="why">Douze au plus. Il faut en retirer une.</span>
          {/if}
        </div>

        <div class="m-l">
          <span class="k">Un checkpoint</span>
          <!-- Une pensée datée, prise en chemin. Ce n'est pas une chronique
               en plus court. -->
          <form onsubmit={e => { e.preventDefault(); checkpoint(); }}>
            <input bind:value={thought} placeholder="Ce que tu te dis maintenant…" />
            <button class="btn" disabled={!thought.trim()}>Poser</button>
          </form>
        </div>

        <div class="m-l">
          <span class="k">Ta chronique</span>
          {#if !writing}
            <div class="ch-act">
              {#if mine.review}<span class="ch-has">« {mine.review.title} »</span>{/if}
              <button class="btn" onclick={openChronicle}>{mine.review ? "La réécrire" : "Écrire une chronique"}</button>
            </div>
          {:else}
            <form class="ch-form" onsubmit={e => { e.preventDefault(); saveChronicle(); }}>
              <input bind:value={chTitle} placeholder="Un titre — ce qu'on en retient en une ligne" />
              <textarea bind:value={chBody} rows="6" placeholder="Le jugement, rédigé. Un paragraphe vide sépare deux paragraphes."></textarea>
              <div class="ch-row">
                <button type="button" class="btn" onclick={() => (writing = false)}>Laisser</button>
                <button class="btn btn-ink" disabled={!chTitle.trim() || !chBody.trim()}>Consigner la chronique</button>
              </div>
            </form>
          {/if}
        </div>

        {#if mine.reflections?.length}
          <ol class="cps">
            {#each mine.reflections.slice().reverse() as c}
              <li><i>{ago(c.at)}</i>{c.text}</li>
            {/each}
          </ol>
        {/if}
      {/if}
    </section>
  </div>
{/if}

<style>
  .wrap { position: relative; max-width: 820px; margin: 0 auto; padding: 30px 34px 60px; }

  /* La couleur de la jaquette, en ambiance et non en image. Ce n'est pas une
     cinquième exception au noir et blanc : c'est la troisième, rendue
     autrement. Elle s'éteint avant les chiffres. */
  .wash {
    position: absolute; top: -30px; left: -34px; right: -34px; height: 250px; z-index: 0;
    background-image: var(--img); background-size: cover; background-position: center 30%;
    filter: blur(48px) saturate(1.28); opacity: .42; transform: scale(1.18);
    mask-image: linear-gradient(to bottom, #000 0, #000 30%, transparent 80%);
    pointer-events: none;
  }
  header, .sect { position: relative; z-index: 1; }

  .back { font-size: 11px; color: var(--dim); min-height: 44px; display: inline-flex; align-items: center; }
  .back:hover { color: var(--ink); }
  .eyebrow { display: block; font-size: 9px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; color: var(--faint); }
  h1 { font-family: var(--fs); font-weight: 400; font-size: 38px; line-height: 1.03; margin-top: 4px; }
  .alt { display: block; font-family: var(--fr); font-style: italic; font-size: 14px; color: var(--dim); margin-top: 2px; }
  .gn { display: block; font-size: 11px; color: var(--dim); margin-top: 8px; }

  .meas { display: flex; gap: 34px; margin-top: 20px; }
  .meas .k { display: block; font-size: 9px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: var(--faint); }
  .meas .v { display: block; font-family: var(--fs); font-size: 26px; line-height: 1.1; }
  .disc { margin-top: 12px; font-family: var(--fr); font-style: italic; font-size: 14px; color: var(--ink2); }

  .sect { margin-top: 32px; }
  h2 { font-family: var(--fs); font-weight: 400; font-size: 20px; margin-bottom: 10px; }

  .plot { position: relative; display: grid; grid-template-columns: repeat(10, 1fr); gap: 6px; padding-top: 8px; }
  .pc { display: grid; justify-items: center; gap: 4px; }
  .pf { display: flex; flex-direction: column-reverse; gap: 3px; min-height: 22px; justify-content: flex-end; }
  .pt { width: 1px; height: 26px; background: var(--rule2); }
  .pc.has .pt { background: var(--ink); width: 1.5px; }
  .pn { font-size: 10px; color: var(--faint); font-variant-numeric: tabular-nums; }
  .pavg { position: absolute; bottom: 14px; transform: translateX(-50%); }
  .pavg span { font-family: var(--fs); font-size: 13px; border-bottom: 1.5px solid var(--ink); padding: 0 3px; }

  .reg { border-top: 1px solid var(--rule); }
  .r { display: grid; grid-template-columns: 22px minmax(0,1fr) auto 32px; gap: 12px;
       align-items: center; padding: 9px 0; min-height: 44px; border-bottom: 1px solid var(--rule); }
  .r:hover { background: var(--raise); }
  .moi { box-shadow: inset 2px 0 0 var(--ink); padding-left: 10px; }
  .line { display: grid; min-width: 0; }
  .who { font-size: 13px; font-weight: 600; }
  .vb { font-size: 11px; color: var(--dim); }
  .st { font-size: 11px; font-weight: 600; color: var(--ink2); }
  .sc { font-family: var(--fs); font-size: 17px; text-align: right; font-variant-numeric: tabular-nums; }

  .chron { border-bottom: 1px solid var(--rule); }
  .ch-h { display: grid; grid-template-columns: 22px 1fr 16px; gap: 12px; align-items: center;
          width: 100%; padding: 11px 0; min-height: 44px; text-align: left; }
  .ch-t { display: grid; min-width: 0; }
  .ti { font-family: var(--fs); font-size: 17px; line-height: 1.15; }
  .au { font-size: 11px; color: var(--dim); }
  .mk { color: var(--faint); transition: transform var(--t1) var(--e); }
  .mk.up { transform: rotate(90deg); }
  .ch-b { padding: 0 0 16px 34px; }
  .ch-b p { font-family: var(--fr); font-size: 15px; line-height: 1.68; color: var(--ink2); max-width: 62ch; }
  .ch-b p + p { margin-top: 11px; }

  .none { font-size: 12.5px; color: var(--dim); font-style: italic; }
  .mienne { position: relative; z-index: 1; margin-top: 30px; padding: 16px 18px;
            border: 1px solid var(--rule2); border-left: 2px solid var(--ink); background: var(--raise); }
  .m-vide { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; font-size: 12.5px; color: var(--dim); }
  .m-l + .m-l { margin-top: 14px; }
  .m-l .k { display: block; font-size: 9px; font-weight: 700; letter-spacing: .16em;
            text-transform: uppercase; color: var(--faint); margin-bottom: 6px; }
  .picks, .notes { display: flex; gap: 4px; flex-wrap: wrap; }
  .pick, .note, .btn {
    min-height: 44px; padding: 9px 12px; border: 1px solid var(--rule2);
    font-size: 11px; font-weight: 600; color: var(--dim);
  }
  .note { min-width: 38px; display: grid; place-items: center; font-variant-numeric: tabular-nums; letter-spacing: 0; }
  .pick:hover, .note:hover, .btn:hover:not(:disabled) { color: var(--ink); border-color: var(--ink); }
  .pick.on, .note.on, .btn.held { color: var(--paper); background: var(--ink); border-color: var(--ink); }
  .btn:disabled { opacity: .4; cursor: default; }
  .why { display: block; margin-top: 6px; font-size: 11px; color: var(--dim); font-style: italic; }
  .m-l form { display: flex; gap: 8px; flex-wrap: wrap; }
  .m-l input { flex: 1; min-width: 200px; min-height: 44px; padding: 10px 12px;
               border: 1px solid var(--rule2); background: var(--paper); font-size: 13px; }
  .ch-act { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
  .ch-has { font-family: var(--fs); font-size: 16px; }
  .ch-form { display: grid; gap: 8px; }
  .ch-form input, .ch-form textarea {
    width: 100%; padding: 10px 12px; border: 1px solid var(--rule2); background: var(--paper);
  }
  .ch-form input { min-height: 44px; font-family: var(--fs); font-size: 17px; }
  .ch-form textarea { font-family: var(--fr); font-size: 14.5px; line-height: 1.65; resize: vertical; }
  .ch-row { display: flex; gap: 8px; justify-content: flex-end; }
  .btn-ink { border-color: var(--ink); color: var(--ink); }
  .cps { list-style: none; margin-top: 14px; border-top: 1px solid var(--rule); }
  .cps li { display: grid; grid-template-columns: 90px 1fr; gap: 12px; padding: 8px 0;
            border-bottom: 1px solid var(--rule); font-family: var(--fr); font-size: 13.5px; line-height: 1.5; }
  .cps i { font-style: normal; font-family: var(--fu); font-size: 10.5px; color: var(--faint); }

  @media (max-width: 860px) {
    .wrap { padding: 22px 18px 80px; }
    .wash { left: -18px; right: -18px; top: -22px; }
    .meas { gap: 22px; flex-wrap: wrap; }
    .r { grid-template-columns: 22px 1fr auto; }
    .sc { grid-column: 3; }
    .st { grid-column: 2 / 3; justify-self: end; }
  }
</style>
