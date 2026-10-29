<script lang="ts">
  /* **L'accueil tient deux régimes, et ils doivent se voir.** Au-dessus, ce
     qu'on vous apporte : la chronique du moment, et ce qui a bougé depuis la
     dernière visite — **une feuille posée**, un ton plus claire que le
     bureau, fermée par un filet d'encre. En dessous, le papier nu :
     l'instrument, qu'on vient consulter.

     On sépare comme le ferait du papier, pas comme le ferait un écran.

     **Et il a deux faces** (29 octobre, à la demande de Nathan) : à droite
     du Registre, le Tableau — qui en est où, œuvre par œuvre. On passe de
     l'une à l'autre par le bord de la page, et **ça glisse** : même
     profondeur, donc ni flou ni zoom. Le bord est discret, mais il est là,
     écrit et visible : rien ne se découvre au survol (invariant 19). */
  import { registre } from "#core/model/store.svelte.ts";
  import { Face, gestes } from "#core/ui/index.ts";
  import { KIND, STATUS, VERB, ago, roman } from "#core/model/lexicon.ts";
  import { chronicles, covetedDoneByOthers, myUnderway, progressOf, register, titleOf, watchItems } from "#core/selectors/index.ts";
  import { UNIT } from "#core/model/lexicon.ts";
  import Lot from "./Lot.svelte";
  import { skyline } from "#core/ui/skyline.ts";
  import Table from "./Table.svelte";
  import { vue } from "./side.svelte.ts";

  const w = $derived(registre.world);
  const pref = $derived(registre.titlePref);
  const seen = $derived(registre.seen);

  const acts = $derived(register(w));
  const chron = $derived(chronicles(w));
  const lead = $derived(chron[0] ?? null);
  const fresh = $derived(seen ? acts.filter(r => r.at > seen) : []);
  const freshChron = $derived(seen ? chron.filter(r => r.at > seen) : []);
  const days = $derived(seen
    ? Math.max(1, Math.round((Date.now() - new Date(seen).getTime()) / 86400000))
    : 0);

  let shown = $state(14);

  const me = $derived(registre.me ?? "");
  const moi = $derived(registre.moi);
  const knocksSince = $derived(registre.steward && seen ? registre.knocks.filter(k => k.at > seen).length : 0);
  const watch = $derived(watchItems(w, me, seen, knocksSince));
  const under = $derived(myUnderway(w, me));
  const coveted = $derived(covetedDoneByOthers(w, me));
</script>

<div class="home" class:far={vue.side === 1}>
<div class="track">
<div class="face one" inert={vue.side === 1}>
<div class="wrap">
  <!-- La feuille. Elle respire : trois halos très larges dérivent dessous et
       la font onduler entre son blanc et un blanc à peine plus clair. Ce n'est
       pas une trame — rien n'y a de forme, rien ne la traverse ; c'est le
       papier qui prend la lumière, et c'est ce qui l'autorise ici. -->
  <section class="plate">
    <!-- La cité, de profil, en tête du Registre. **Elle habille, elle ne
         remplace rien** : un décor qui existe pour lui-même, pas une
         allégorie de l'application. -->
    <canvas class="sky" use:skyline aria-hidden="true"></canvas>
    <div class="eyebrow">Le Registre</div>

    {#if lead && lead.review}
      {@const p = w.people[lead.personId]}
      <article class="une">
        <a class="lead" href="#/fiche/{lead.mediaId}">
          <span class="eyebrow">Chronique du moment · {titleOf(w, lead.mediaId, pref)}</span>
          <span class="ti">{lead.review.title}</span>
          <span class="ex">{lead.review.body.split("\n\n")[0]}</span>
          <span class="sig">
            {#if p}<Face who={p} size="s" />{p.firstName}, {p.circleRef.one} · {ago(lead.at)}{/if}
          </span>
        </a>

        {#if days}
          <div class="aside">
            <span class="k">Depuis {roman(days)} jours</span>
            <span class="v">{roman(fresh.length)}</span>
            <span class="kk">inscription{fresh.length > 1 ? "s" : ""}</span>
            <span class="v">{roman(freshChron.length)}</span>
            <span class="kk">chronique{freshChron.length > 1 ? "s" : ""}</span>
          </div>
        {/if}
      </article>
    {/if}

    <Lot />

    <!-- **Une seule chose sur l'accueil porte une couleur : l'encart du
         guetteur**, et c'est celle de ton Ordre. Entre Le Sort et Les
         inscriptions — pas en tête de page, parce qu'on n'ouvre pas
         l'application pour des annonces, mais là où le regard descend déjà. -->
    {#if watch.length && moi}
      <div class="watch" style="--c:{moi.circleRef.color}">
        <span class="wk">Depuis ta dernière visite</span>
        <div class="wl">
          {#each watch as it (it.text)}
            <a href={it.href}>
              <!-- Un fanion en guise de tiret : une annonce par ligne. -->
              <svg class="wf" viewBox="0 0 14 14" aria-hidden="true">
                <path d="M3 1.4 V12.6" /><path d="M3.9 2.1 L11.4 4.6 L3.9 7.1 Z" class="fl" />
              </svg>
              <span>{it.text}</span>
            </a>
          {/each}
        </div>
      </div>
    {/if}
  </section>

  <section class="sect">
    <h2>Les inscriptions</h2>
    <div class="reg">
      {#each acts.slice(0, shown) as r (r.personId + r.mediaId)}
        {@const p = w.people[r.personId]}
        {@const m = w.catalog[r.mediaId]}
        <a class="r" class:neuf={!!seen && r.at > seen} href="#/fiche/{r.mediaId}">
          <span class="who">{#if p}<Face who={p} size="s" />{/if}</span>
          <span class="line">
            <span class="t">{titleOf(w, r.mediaId, pref)}</span>
            <span class="kind">{KIND[m.mediaType]} · {m.year}</span>
          </span>
          <span class="did">{p?.firstName} {VERB[m.mediaType][r.status]}</span>
          <span class="st">{STATUS[m.mediaType][r.status]}</span>
          <span class="when">{ago(r.at)}</span>
        </a>
      {/each}
    </div>
    {#if !acts.length}
      <!-- Le tout premier arrivant : il n'arrive pas au milieu d'une
           conversation, il l'ouvre. On le lui dit, et on lui tend le geste. -->
      <p class="none">Personne n'a encore rien inscrit. La première œuvre portée ici sera la tienne.</p>
      {#if gestes.inscrire}<button class="add" onclick={() => gestes.inscrire?.()}>＋ Inscrire une œuvre</button>{/if}
    {/if}
    {#if acts.length > shown}
      <button class="more" onclick={() => (shown += 20)}>
        Dérouler les {acts.length - shown} inscriptions antérieures
      </button>
    {/if}
  </section>

  <section class="sect">
    <h2>Tes affaires</h2>
    {#if under.length}
      <div class="reg">
        {#each under as r (r.mediaId)}
          {@const m = w.catalog[r.mediaId]}
          <a class="r r-mine" href="#/fiche/{r.mediaId}">
            <span class="line"><span class="t">{titleOf(w, r.mediaId, pref)}</span><span class="kind">{KIND[m.mediaType]}</span></span>
            <span class="did">{progressOf(r, UNIT) ?? "—"}</span>
            <span class="when">{ago(r.at)}</span>
          </a>
        {/each}
      </div>
    {:else}
      <p class="none">Tu n'as rien en cours.</p>
    {/if}

    {#if coveted.length}
      <!-- La convoitise d'hier est devenue une conversation possible. -->
      <p class="note">Convoitées, et achevées depuis par d'autres :</p>
      <div class="reg">
        {#each coveted as c (c.r.mediaId)}
          {@const m = w.catalog[c.r.mediaId]}
          <a class="r r-mine" href="#/fiche/{c.r.mediaId}">
            <span class="line"><span class="t">{titleOf(w, c.r.mediaId, pref)}</span><span class="kind">{KIND[m.mediaType]}</span></span>
            <span class="stack">{#each c.by.slice(0, 4) as x (x.personId)}{@const p = w.people[x.personId]}{#if p}<Face who={p} size="s" />{/if}{/each}</span>
            <span class="when">{roman(c.by.length)} témoin{c.by.length > 1 ? "s" : ""}</span>
          </a>
        {/each}
      </div>
    {/if}
  </section>
</div>
</div>

<div class="face two" inert={vue.side === 0}><Table /></div>
</div>

<!-- Le bord : une bande étroite, un chevron et un nom couché. La face qu'on
     quitte reste à sa place, à côté — on y revient par l'autre bord. -->
{#if vue.side === 0}
  <button class="edge r" onclick={() => (vue.side = 1)} aria-label="Glisser vers le Tableau">
    <span class="ev">Le Tableau</span><span class="ch" aria-hidden="true">›</span>
  </button>
{:else}
  <button class="edge l" onclick={() => (vue.side = 0)} aria-label="Revenir au Registre">
    <span class="ch" aria-hidden="true">‹</span><span class="ev">Le Registre</span>
  </button>
{/if}
</div>

<style>
  /* Les deux faces côte à côte, et la page n'en montre qu'une. **Chaque face
     défile pour son compte** : revenir au Registre le retrouve où on
     l'avait laissé. */
  .home { position: relative; height: 100%; overflow: hidden; }
  .track { display: flex; width: 200%; height: 100%; transition: transform 560ms var(--e); }
  .far .track { transform: translateX(-50%); }
  @media (prefers-reduced-motion: reduce) { .track { transition: none; } }
  .face { width: 50%; height: 100%; overflow: auto; }
  /* La bande ne recouvre rien : chaque face lui laisse sa place. */
  .one { padding-right: var(--edge); }
  .two { padding-left: var(--edge); overflow: hidden; }
  .home { --edge: 44px; }

  .edge {
    position: absolute; top: 0; bottom: 0; z-index: 5; width: var(--edge);
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px;
    background: var(--paper); color: var(--faint);
  }
  .edge.r { right: 0; border-left: 1px solid var(--rule); }
  .edge.l { left: 0; border-right: 1px solid var(--rule); }
  .edge:hover { color: var(--ink); background: var(--raise); }
  .ev { writing-mode: vertical-rl; font-size: 9px; font-weight: 700; letter-spacing: .22em; text-transform: uppercase; }
  .edge.l .ev { transform: rotate(180deg); }
  /* Un glyphe seul dans un carré ne se centre pas tout seul (invariant 30). */
  .ch { display: grid; place-items: center; width: 22px; height: 22px; font-size: 18px; letter-spacing: 0; line-height: 1; }

  .wrap { max-width: 980px; margin: 0 auto; padding: 30px 34px 60px; }

  /* La feuille posée : un seul ton d'écart et un seul filet. Assez pour qu'on
     voie la différence au passage, trop peu pour qu'on la remarque en lisant. */
  .plate {
    position: relative; overflow: hidden; background: var(--une);
    margin: -30px -34px 26px; padding: 30px 34px 22px;
    border-bottom: 1.5px solid var(--ink);
  }
  .plate::before {
    content: ""; position: absolute; inset: -45%; z-index: 0; pointer-events: none;
    background:
      radial-gradient(44% 40% at 28% 26%, var(--une-hi) 0%, transparent 64%),
      radial-gradient(38% 34% at 72% 58%, var(--une-hi) 0%, transparent 62%),
      radial-gradient(50% 44% at 46% 88%, var(--une-hi) 0%, transparent 66%);
    animation: souffle 26s ease-in-out infinite;
  }
  .plate > * { position: relative; z-index: 1; }
  /* Jamais de blanc pur, même au sommet du souffle : le monde reste cassé. */
  @keyframes souffle {
    0%, 100% { transform: translate3d(0,0,0) scale(1);      opacity: .40; }
    34%      { transform: translate3d(2%,-3%,0) scale(1.06); opacity: 1;   }
    68%      { transform: translate3d(-3%,2%,0) scale(1.03); opacity: .66; }
  }

  .sky { display: block; width: 100%; height: 188px; margin: -12px 0 24px; image-rendering: pixelated; }
  @media (max-width: 860px) { .sky { height: 132px; margin-bottom: 16px; } }

  .eyebrow {
    font-size: 9px; font-weight: 700; letter-spacing: .2em;
    text-transform: uppercase; color: var(--faint);
  }

  .une { display: grid; grid-template-columns: 1fr 200px; gap: 30px; margin-top: 12px; }
  .lead { display: grid; gap: 5px; }
  .ti { font-family: var(--fs); font-weight: 400; font-size: 31px; line-height: 1.1; }
  .ex { font-family: var(--fr); font-size: 15px; line-height: 1.6; color: var(--ink2); max-width: 58ch; }
  .sig { display: flex; align-items: center; gap: 8px; margin-top: 6px; font-size: 11.5px; color: var(--dim); }

  .aside { display: grid; grid-template-columns: auto 1fr; gap: 2px 9px; align-content: start;
           border-left: 1px solid var(--rule); padding-left: 16px; }
  .aside .k { grid-column: 1 / -1; font-size: 9px; font-weight: 700; letter-spacing: .16em;
              text-transform: uppercase; color: var(--faint); margin-bottom: 4px; }
  .aside .v { font-family: var(--fs); font-size: 22px; line-height: 1; }
  .aside .kk { font-size: 11px; color: var(--dim); align-self: end; }

  .sect { margin-top: 30px; }
  h2 { font-family: var(--fs); font-weight: 400; font-size: 21px; margin-bottom: 10px; }

  /* Instrument : dense, filets d'un pixel, chiffres tabulaires. Pas de cartes
     arrondies, pas de gélules. */
  .reg { border-top: 1px solid var(--rule); }
  .r {
    display: grid; grid-template-columns: 22px minmax(0,1fr) auto auto 74px;
    gap: 14px; align-items: center; padding: 9px 0;
    border-bottom: 1px solid var(--rule); min-height: 44px;
  }
  .r:hover { background: var(--raise); }
  .neuf { box-shadow: inset 2px 0 0 var(--ink); padding-left: 10px; }
  .line { display: grid; min-width: 0; }
  .t { font-family: var(--fs); font-size: 17px; line-height: 1.15;
       white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .kind, .did, .st, .when { font-size: 11px; color: var(--dim); }
  .st { font-weight: 600; color: var(--ink2); }
  .when { text-align: right; color: var(--faint); }
  .r-mine { grid-template-columns: minmax(0,1fr) auto 90px; }
  .stack { display: flex; gap: 2px; }
  .note { font-size: 11.5px; color: var(--dim); margin: 18px 0 8px; font-style: italic; }
  .none { font-size: 12.5px; color: var(--dim); font-style: italic; }
  /* « Inscrire » hors de la barre : un mot d'instrument, pas un bouton plein. */
  .add { display: inline-flex; align-items: center; min-height: 44px; font-size: 10.5px; font-weight: 700;
         letter-spacing: .14em; text-transform: uppercase; color: var(--ink); border-bottom: 1.5px solid var(--ink); }
  .add:hover { color: var(--ink2); }


  /* L'encart du guetteur : un filet de couleur, un fond à peine teinté. Ce
     n'est pas une notification — il ne se ferme pas, ne se compte pas, et
     disparaît de lui-même à la visite suivante. */
  .watch { margin: 22px 0 4px; padding: 6px 13px 6px;
           background: color-mix(in srgb, var(--c) 12%, var(--paper));
           border: 1px solid color-mix(in srgb, var(--c) 40%, transparent);
           box-shadow: inset 3px 0 0 var(--c); }
  .wk { display: block; font-size: 8.5px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase;
        color: color-mix(in srgb, var(--c) 70%, var(--ink)); margin: 4px 0 2px; }
  .wl { display: flex; flex-direction: column; }
  .wl a { display: grid; grid-template-columns: 16px 1fr; gap: 7px; align-items: center; min-height: 44px;
          font-family: var(--fr); font-weight: 300; font-size: 13.5px; line-height: 1.45; color: var(--ink); }
  .wl a + a { border-top: 1px solid color-mix(in srgb, var(--c) 22%, transparent); }
  .wl a:hover span { text-decoration: underline; text-underline-offset: 3px; }
  .wf { width: 11px; height: 11px; overflow: visible; }
  .wf path { stroke: var(--c); stroke-width: 1.3; fill: none; stroke-linecap: round; }
  .wf .fl { fill: var(--c); stroke-width: 1; stroke-linejoin: round; }

  .more {
    width: 100%; margin-top: 12px; padding: 11px 0; min-height: 44px;
    text-align: center; font-size: 10px; font-weight: 700; letter-spacing: .18em;
    text-transform: uppercase; color: var(--dim); border-bottom: 1px solid var(--rule);
  }
  .more:hover { color: var(--ink); }

  /* En étroit : une colonne, et rien ne disparaît — on replie, on n'ampute pas. */
  @media (max-width: 860px) {
    .wrap { padding: 22px 18px 80px; }
    .plate { margin: -22px -18px 22px; padding: 22px 18px 18px; }
    /* La bande tient lieu de marge de droite : elle ne la double pas. Elle
       garde ses 44 px — c'est une cible, en étroit plus qu'ailleurs. */
    .one .wrap { padding-right: 8px; }
    .one .plate { margin-right: -8px; padding-right: 8px; }
    .une { grid-template-columns: 1fr; gap: 18px; }
    .aside { border-left: none; border-top: 1px solid var(--rule); padding: 12px 0 0; }
    .r { grid-template-columns: 22px 1fr auto; row-gap: 2px; }
    .did { grid-column: 2 / -1; }
    .st, .when { grid-column: 3; text-align: right; }
  }
</style>
