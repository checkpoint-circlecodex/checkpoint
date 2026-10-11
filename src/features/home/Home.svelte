<script lang="ts">
  /* **L'accueil tient deux régimes, et ils doivent se voir.** Au-dessus, ce
     qu'on vous apporte : la chronique du moment, et ce qui a bougé depuis la
     dernière visite — **une feuille posée**, un ton plus claire que le
     bureau, fermée par un filet d'encre. En dessous, le papier nu :
     l'instrument, qu'on vient consulter.

     On sépare comme le ferait du papier, pas comme le ferait un écran. */
  import { registre } from "#core/model/store.svelte.ts";
  import { Face } from "#core/ui/index.ts";
  import { KIND, STATUS, VERB, ago, roman } from "#core/model/lexicon.ts";
  import { chronicles, register, titleOf } from "#core/selectors/index.ts";

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
</script>

<div class="wrap">
  <!-- La feuille. Elle respire : trois halos très larges dérivent dessous et
       la font onduler entre son blanc et un blanc à peine plus clair. Ce n'est
       pas une trame — rien n'y a de forme, rien ne la traverse ; c'est le
       papier qui prend la lumière, et c'est ce qui l'autorise ici. -->
  <section class="plate">
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
    {#if acts.length > shown}
      <button class="more" onclick={() => (shown += 20)}>
        Dérouler les {acts.length - shown} inscriptions antérieures
      </button>
    {/if}
  </section>
</div>

<style>
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
    .une { grid-template-columns: 1fr; gap: 18px; }
    .aside { border-left: none; border-top: 1px solid var(--rule); padding: 12px 0 0; }
    .r { grid-template-columns: 22px 1fr auto; row-gap: 2px; }
    .did { grid-column: 2 / -1; }
    .st, .when { grid-column: 3; text-align: right; }
  }
</style>
