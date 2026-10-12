<script lang="ts">
  /* **La lignée est la seule page de l'application qui parle de gens, et
     elle doit en avoir le ton.** Visages flottants et halos qui respirent ;
     les noms en Instrument Serif, les parentés en italique ; des courbes
     plutôt que l'équerre — une maisonnée n'est pas un organigramme.

     C'est une section, jamais un onglet : une parenté dépasse la personne,
     elle ne peut pas être une facette de sa feuille. On y entre par un point
     discret ; on en ressort là où l'on va. */
  import { registre } from "#core/model/store.svelte.ts";
  import { Face } from "#core/ui/index.ts";
  import { roman } from "#core/model/lexicon.ts";
  import { household, kinDeeds, kinLink, kinTitle, nameList, titleOf } from "#core/selectors/index.ts";

  let { pid, close }: { pid: string; close: () => void } = $props();

  const w = $derived(registre.world);
  const pref = $derived(registre.titlePref);
  const h = $derived(household(w, pid));
  const d = $derived(kinDeeds(w, h.ids));
  const levels = $derived([...new Set(h.ids.map(i => h.gen[i]))].sort((a, b) => a - b));
  const rowOf = (g: number) => h.ids.filter(i => h.gen[i] === g);
  const orders = $derived(new Set(h.ids.map(i => w.people[i]?.circle)));

  const N = ["zéro", "une", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix"];

  /* Les générations se relient par des courbes qui s'évasent depuis le
     milieu. Les enfants étant régulièrement espacés, leurs abscisses se
     calculent — aucune mesure du DOM, donc rien qui dépende d'une mise en
     page faite. */
  /* ⚠️ **Une courbe ne relie que ce qui est déclaré.** Le prototype tirait
     un arc vers chaque personne de la génération suivante ; dans une
     maisonnée où Marion est la sœur de Nathan et Sam le père de Nathan seul,
     le dessin faisait de Sam le père de Marion — une parenté que personne
     n'a posée. *Le dessin ne doit pas inventer ce que les données refusent.* */
  const arcs = (g: number) => {
    const row = rowOf(g), up = rowOf(g - 1);
    return row.map((i, k) => ({ x: ((k + 0.5) / row.length) * 100, tied: up.some(u => kinLink(w, u, i)) }))
              .filter(a => a.tied).map(a => a.x);
  };

  /* Une phrase plutôt qu'un tableau de bord : quatre cases de statistiques
     refroidiraient la seule page qui parle de gens. */
  const say = $derived([
    `<b>${roman(d.works)}</b> œuvres fréquentées sous ce toit`,
    d.hours ? `<b>${roman(d.hours)}</b> heures de jeu` : null,
    d.chronicles ? `<b>${roman(d.chronicles)}</b> chroniques` : null,
    d.quests.length ? `<b>${roman(d.quests.length)}</b> quête${d.quests.length > 1 ? "s" : ""} accomplie${d.quests.length > 1 ? "s" : ""} par tous` : null,
  ].filter(Boolean).join(", ") + ".");
</script>

<div class="lig">
  <header>
    <span class="eyebrow">
      Lignée · {N[h.size] ?? h.size} âmes{orders.size === h.size && h.size > 1 ? `, ${N[orders.size]} Ordres` : ""}
    </span>
    <h3 class="names">{nameList(w, h.ids)}</h3>
  </header>

  <div class="tree">
    {#each levels as g, gi (g)}
      {#if gi}
        <svg class="arc" viewBox="0 0 100 34" preserveAspectRatio="none" aria-hidden="true">
          {#each arcs(g) as x}
            <path d="M50 0 C50 17 {x.toFixed(2)} 17 {x.toFixed(2)} 34" vector-effect="non-scaling-stroke" />
          {/each}
        </svg>
      {/if}
      <div class="row">
        {#each rowOf(g) as i, k (i)}
          {@const p = w.people[i]}
          {#if p}
            <!-- Chacun porte le halo de **son** Ordre. Ce n'est pas une
                 cinquième exception : comme chacun a le sien, aucune teinte
                 n'est choisie contre une autre — c'est ce qui l'autorise ici
                 et l'interdit au point d'entrée, forcément neutre. -->
            <a class="kp" href="#/personne/{i}" onclick={close}
               style="--c:{p.circleRef.color}; --i:{gi * 2 + k}">
              <span class="f"><Face who={p} size="l" /></span>
              <b>{p.firstName}</b>
              <i>{kinTitle(w, h, i) ?? p.circleRef.one}</i>
              <span class="kind">{p.circleRef.one}</span>
            </a>
          {/if}
        {/each}
      </div>
    {/each}
  </div>

  <p class="say">{@html say}</p>

  {#if d.common.length}
    <section>
      <span class="k">Ce qu'ils ont tous mené au bout</span>
      <div class="common">
        {#each d.common as id (id)}
          <a href="#/fiche/{id}" onclick={close}>{titleOf(w, id, pref)}</a>
        {/each}
      </div>
    </section>
  {/if}

  {#if d.clash}
    <a class="clash" href="#/fiche/{d.clash.id}" onclick={close}>
      <span class="k">Là où la maisonnée se divise</span>
      <span class="t">{titleOf(w, d.clash.id, pref)}</span>
      <span class="dd">
        {w.people[d.clash.hi.personId]?.firstName} la met à {d.clash.hi.rating},
        {w.people[d.clash.lo.personId]?.firstName} à {d.clash.lo.rating}.
        {d.clash.d >= 3 ? "Il y a là une conversation de table." : "On a vu pire."}
      </span>
    </a>
  {/if}

  <p class="end">On choisit son Ordre. On ne choisit pas sa maisonnée.</p>
</div>

<style>
  .lig { max-width: 560px; margin: 0 auto; }
  header { text-align: center; }
  .eyebrow { display: block; font-size: 9px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; color: var(--faint); }
  .names { font-family: var(--fs); font-weight: 400; font-size: 31px; line-height: 1.12; margin-top: 8px; }

  .tree { display: flex; flex-direction: column; align-items: center; margin: 24px 0 4px; }
  .row { display: flex; justify-content: center; gap: clamp(14px, 5vw, 42px); flex-wrap: wrap; width: 100%; }
  .arc { display: block; width: min(74%, 290px); height: 34px; overflow: visible; }
  .arc path { fill: none; stroke: var(--rule2); stroke-width: 1; stroke-linecap: round; }

  .kp { display: flex; flex-direction: column; align-items: center; gap: 4px; width: 112px;
        text-align: center; padding: 14px 4px 10px; min-height: 44px; }
  /* Les visages flottent comme les disques des Ordres : c'est le même geste,
     parce que c'est la même nature de chose — des gens, pas des données. */
  .f { position: relative; display: block; animation: drift 7.5s ease-in-out infinite;
       animation-delay: calc(var(--i, 0) * -1.6s); transition: transform var(--t2) var(--e); }
  .f::before { content: ""; position: absolute; inset: -44%; border-radius: 50%; z-index: 0;
               background: radial-gradient(circle, var(--c) 0%, transparent 62%); filter: blur(16px);
               animation: halo 7.5s ease-in-out infinite; animation-delay: calc(var(--i, 0) * -1.6s); }
  .f :global(.face) { position: relative; z-index: 1; }
  @keyframes drift { 0%, 100% { translate: 0 0; } 50% { translate: 0 -6px; } }
  @keyframes halo { 0%, 100% { opacity: .26; transform: scale(1); } 50% { opacity: .44; transform: scale(1.08); } }
  .kp:hover .f { transform: translateY(-4px) scale(1.05); }
  .kp b { font-family: var(--fs); font-size: 19px; font-weight: 400; margin-top: 9px; }
  .kp i { font-family: var(--fr); font-style: italic; font-weight: 300; font-size: 12.5px; color: var(--dim); line-height: 1.4; }
  .kind { font-size: 10px; letter-spacing: .1em; text-transform: uppercase; color: var(--faint); margin-top: 3px; }
  @media (prefers-reduced-motion: reduce) { .f, .f::before { animation: none; } .f::before { opacity: .22; } }

  .say { font-family: var(--fr); font-weight: 300; font-size: 15px; line-height: 1.75; color: var(--ink2);
         text-align: center; max-width: 46ch; margin: 18px auto 4px; }
  .say :global(b) { font-family: var(--fs); font-weight: 400; font-size: 17px; color: var(--ink); }

  section { margin-top: 24px; }
  .k { display: block; font-size: 9px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase;
       color: var(--faint); margin-bottom: 10px; }
  .common { display: flex; flex-wrap: wrap; gap: 4px; }
  .common a { display: inline-flex; align-items: center; min-height: 44px; padding: 6px 12px;
              border: 1px solid var(--rule); font-family: var(--fs); font-size: 16px; }
  .common a:hover { border-color: var(--ink); }

  .clash { display: block; margin-top: 24px; padding: 16px 18px; border: 1px solid var(--rule);
           background: var(--paper); transition: border-color var(--t1) var(--e); }
  .clash:hover { border-color: var(--ink); }
  .clash .t { display: block; font-family: var(--fs); font-size: 21px; margin: 2px 0 5px; }
  .dd { display: block; font-family: var(--fr); font-weight: 300; font-style: italic; font-size: 13px; color: var(--dim); line-height: 1.6; }

  .end { font-family: var(--fr); font-style: italic; font-size: 12px; color: var(--faint);
         text-align: center; margin-top: 26px; padding-top: 16px; border-top: 1px solid var(--rule); }
</style>
