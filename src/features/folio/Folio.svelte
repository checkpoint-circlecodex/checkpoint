<script lang="ts">
  /* La fiche d'une œuvre. **Une jaquette donne sa couleur au haut de sa
     fiche** — floutée, étalée, très diluée — et **s'éteint avant les
     chiffres** : au-delà du titre la page est un instrument, et un instrument
     ne se colore pas. */
  import { registre } from "#core/model/store.svelte.ts";
  import { Face, pile } from "#core/ui/index.ts";
  import { KIND, STATUS, UNIT, UNIT_LBL, UNIT_OF, dec, roman, ago } from "#core/model/lexicon.ts";
  import Plate from "./Plate.svelte";
  import Ranger from "./Ranger.svelte";
  import Corriger from "./Corriger.svelte";
  import { avgOf, favsOf, otherTitle, progressOf, rowsFor, titleOf } from "#core/selectors/index.ts";
  import {
    accompagner, avancer, changerStatut, chroniquer, distinguer, identity, inscrire, juger,
    poserCheckpoint, poserJaquette, refaire, retirerInscription,
  } from "#core/model/acts.ts";
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
  /* L'identité seule part dans le fragment — la fiche du catalogue somme les
     catégories et les jaquettes des autres (invariant 34). */
  const inscribe = () => registre.act(inscrire(id, { status: "wishlist" }, identity(m)));
  const setStatus = (st: string) => registre.act(changerStatut(id, st as never));
  const rate = (n: number) => registre.act(juger(id, mine?.rating === n ? null : n));
  const checkpoint = () => { if (!thought.trim()) return; registre.act(poserCheckpoint(id, thought)); thought = ""; };

  /* --- **Modifier son inscription** : le formulaire du prototype, rendu en
     lignes de commande visibles (invariant 19). Chaque geste part tout de
     suite ; le scribe regroupe les écritures (invariant 27). --- */
  const unit = $derived(m ? UNIT_OF[m.mediaType] : null);
  let prog = $state("");
  $effect(() => { prog = mine?.progress ? String(mine.progress.value) : ""; });
  const saveProg = () => {
    if (!unit) return;
    const v = prog.trim() === "" ? null : Number(prog.replace(",", "."));
    registre.act(avancer(id, unit, v));
  };
  const done = $derived(!!mine && (mine.status === "completed" || mine.status === "mastered"));
  const others = $derived(Object.values(w.people).filter(p => p.id !== registre.me)
    .sort((a, b) => a.firstName.localeCompare(b.firstName, "fr")));
  const toggleWith = (pid: string) => {
    const cur = new Set(mine?.with ?? []);
    cur.has(pid) ? cur.delete(pid) : cur.add(pid);
    registre.act(accompagner(id, [...cur]));
  };
  const openRanger = () => pile.open("panneau", "Ranger cette œuvre", Ranger,
    { id, work: m, mine: registre.myWork(id)?.genres ?? [] });

  /* **La jaquette : son adresse, jamais ses octets.** Git n'efface jamais un
     binaire remplacé, et chacun le retéléchargerait à chaque clone. */
  let coverUrl = $state("");
  let coverBad = $state(false);
  /* Sa propre copie ne se lit pas par une rune : on dépend du monde, qui est
     refusionné à chaque geste — c'est lui qui dit quand relire. */
  const myCover = $derived.by(() => { void w; return registre.myWork(id)?.cover || ""; });
  const okUrl = (u: string) => /^https:\/\/[^\s]+$/i.test(u.trim());
  const saveCover = () => {
    if (!okUrl(coverUrl)) { coverBad = true; return; }
    registre.act(poserJaquette(id, coverUrl, m));
    coverUrl = ""; coverBad = false;
  };
  const openPlate = () => m?.cover && pile.open("panneau", titleOf(w, id, pref), Plate,
    { src: m.cover, title: titleOf(w, id, pref), sub: `${KIND[m.mediaType]} · ${m.year}` });

  /* Retirer : **un geste qui se confirme**, et qui ne retire que ce qui est
     à soi — l'œuvre reste au corpus tant qu'un autre la suit. */
  let leaving = $state(false);
  const leave = () => { registre.act(retirerInscription(id)); leaving = false; };

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
      <!-- **La planche** : en noir et blanc, elle reprend sa couleur au
           survol, et s'agrandit au clic. Sans jaquette, le cadre porte le
           titre — et rien ne s'agrandit. -->
      <button class="plate" onclick={openPlate} disabled={!m.cover} aria-label={m.cover ? "Agrandir la jaquette" : "Pas de jaquette"}>
        {#if m.cover}<img src={m.cover} alt="" />{:else}<span>{titleOf(w, id, pref)}</span>{/if}
      </button>
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
      <!-- **Une porte qu'on n'a pas la charge d'ouvrir n'existe pas** : la
           correction n'apparaît que pour qui tient le Greffe (invariant 32). -->
      {#if registre.steward}
        <button class="greffe" onclick={() => pile.open("panneau", "Corriger la fiche", Corriger, { id, work: m })}>
          ✇ Corriger la fiche
        </button>
      {/if}
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

        {#if unit}
          <div class="m-l">
            <span class="k">Progression <em>en {UNIT_LBL[unit]}</em></span>
            <form onsubmit={e => { e.preventDefault(); saveProg(); }}>
              <input class="num" bind:value={prog} inputmode="decimal" placeholder="0" aria-label="Progression en {UNIT_LBL[unit]}" />
              <button class="btn">Consigner</button>
            </form>
          </div>
        {/if}

        {#if done}
          <div class="m-l">
            <span class="k">Refait</span>
            <div class="row">
              <button class="btn" onclick={() => registre.act(refaire(id))}>＋ Refait</button>
              <span class="why inline">{(mine.plays ?? 1) > 1 ? `${roman(mine.plays as number)} fois en tout` : "Une seule fois, pour l'instant."}</span>
            </div>
          </div>
        {/if}

        {#if others.length}
          <div class="m-l">
            <span class="k">Avec <em>si l'œuvre a été faite à plusieurs — les chroniques restent à chacun</em></span>
            <div class="withs">
              {#each others as p (p.id)}
                <button class="wth" class:on={mine.with?.includes(p.id)} aria-pressed={!!mine.with?.includes(p.id)}
                        onclick={() => toggleWith(p.id)}>
                  <Face who={p} size="s" /><b>{p.firstName}</b>
                </button>
              {/each}
            </div>
          </div>
        {/if}

        <div class="m-l">
          <span class="k">Catégories</span>
          <div class="row">
            <span class="why inline">{m.genres?.length ? m.genres.join(" · ") : "Aucune encore."}</span>
            <button class="btn" onclick={openRanger}>La ranger</button>
          </div>
        </div>

        <div class="m-l">
          <span class="k">Jaquette <em>— l'adresse d'une image, jamais le fichier</em></span>
          <form onsubmit={e => { e.preventDefault(); saveCover(); }}>
            <input bind:value={coverUrl} oninput={() => (coverBad = false)} inputmode="url"
                   placeholder="https://… (clic droit sur une image › Copier l'adresse de l'image)" aria-label="Adresse de la jaquette" />
            <button class="btn" disabled={!coverUrl.trim()}>Poser</button>
          </form>
          {#if coverBad}<span class="why">Il faut une adresse qui commence par https://</span>{/if}
          {#if myCover}
            <div class="row">
              <span class="why inline">Tu en as posé une ; la plus récente l'emporte, pour tout le monde.</span>
              <button class="btn" onclick={() => registre.act(poserJaquette(id, "", m))}>Retirer la mienne</button>
            </div>
          {/if}
        </div>

        <div class="m-l leave">
          {#if !leaving}
            <button class="btn" onclick={() => (leaving = true)}>Retirer de mon registre</button>
          {:else}
            <span class="why">Ta ligne, ta chronique, tes checkpoints et ta distinction disparaissent. L'œuvre reste au corpus si quelqu'un d'autre la suit.</span>
            <div class="row">
              <button class="btn btn-ink" onclick={leave}>Oui, retirer</button>
              <button class="btn" onclick={() => (leaving = false)}>La garder</button>
            </div>
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
  .greffe { display: inline-flex; align-items: center; min-height: 44px; margin-top: 4px; font-size: 10px; font-weight: 700;
            letter-spacing: .14em; text-transform: uppercase; color: var(--faint); }
  .greffe:hover { color: var(--ink); }
  /* La planche, à droite du titre. */
  .plate { float: right; width: 132px; aspect-ratio: 2 / 3; margin: 0 0 12px 22px; display: grid; place-items: center;
           overflow: hidden; border: 1px solid var(--rule2); background: var(--raise); }
  .plate img { width: 100%; height: 100%; object-fit: cover; filter: grayscale(1) contrast(1.04);
               transition: filter 460ms var(--e); }
  .plate:hover img, .plate:focus-visible img { filter: none; }
  .plate:not(:disabled) { cursor: zoom-in; }
  .plate span { padding: 10px; text-align: center; font-family: var(--fs); font-size: 16px; line-height: 1.15; color: var(--ink2); }
  .m-l .k em { font-style: normal; text-transform: none; letter-spacing: .02em; font-weight: 400; }
  .row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .why.inline { display: inline; margin: 0; }
  .m-l input.num { flex: 0 0 120px; min-width: 0; }
  .withs { display: flex; gap: 4px; flex-wrap: wrap; }
  .wth { display: inline-flex; align-items: center; gap: 7px; min-height: 44px; padding: 6px 12px 6px 8px;
         border: 1px solid var(--rule2); font-size: 11.5px; color: var(--dim); }
  .wth b { font-weight: 600; }
  .wth:hover { color: var(--ink); border-color: var(--ink); }
  .wth.on { color: var(--ink); border-color: var(--ink); box-shadow: inset 0 0 0 1px var(--ink); }
  .leave { margin-top: 22px !important; padding-top: 14px; border-top: 1px solid var(--rule); }
  @media (max-width: 560px) { .plate { width: 96px; margin-left: 14px; } }

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
