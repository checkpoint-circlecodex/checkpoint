<script lang="ts">
  /* **Une porte par pièce.** La barre sépare *agir* — inscrire, voir ses en
     cours, ouvrir une quête — de *parcourir*. Une règle les sépare, et elle
     subsiste quand la barre est repliée.

     « Ma Feuille » n'y figure pas : le visage en bas y mène déjà, et deux
     portes pour la même pièce, c'est une porte de trop. */
  import { registre } from "#core/model/store.svelte.ts";
  import { Face } from "#core/ui/index.ts";
  import { HOME, REGISTRY } from "./routes.ts";

  let { hash, collapsed = $bindable(false) }:
    { hash: string; collapsed?: boolean } = $props();

  const doors = $derived(REGISTRY.filter(v => !v.only || v.only()));
  const moi = $derived(registre.moi);
  let open = $state<Record<string, boolean>>({});
</script>

<aside class="rail" class:collapsed>
  <div class="top">
    <a href="#/" class="sigil" title="Le registre">C</a>
    <span class="mark"><b>Checkpoint</b></span>
    <button class="tgl" onclick={() => (collapsed = !collapsed)}
            aria-label={collapsed ? "Déplier la barre latérale" : "Replier la barre latérale"}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="1.6" stroke-linecap="round"><path d="M14.5 6L9 12l5.5 6" /></svg>
    </button>
  </div>

  <div class="lbl">Parcourir</div>
  <nav>
    <a class="row" class:on={hash === HOME.href} href={HOME.href}>
      <span class="gl">{HOME.gl}</span><span class="t">{HOME.label}</span>
    </a>
    {#each doors as v (v.id)}
      {@const subs = v.subs?.() ?? null}
      <div class="grp" class:open={open[v.id]}>
        <div class="row" class:on={hash.startsWith(v.href)}>
          <a href={v.href} title={v.label}><span class="gl">{v.gl}</span><span class="t">{v.label}</span></a>
          {#if subs}
            <!-- Déplier une section n'est pas choisir : ça ne referme rien. -->
            <button class="exp" aria-expanded={!!open[v.id]} aria-label="Déplier {v.label}"
                    onclick={() => (open = { ...open, [v.id]: !open[v.id] })}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   stroke-width="2.4" stroke-linecap="round"><path d="M9.5 6l6 6-6 6" /></svg>
            </button>
          {/if}
        </div>
        {#if subs && open[v.id]}
          <div class="sub">
            {#each subs as s (s.href)}
              <a href={s.href} class:on={hash === s.href}>{s.label}<span class="n">{s.n}</span></a>
            {/each}
          </div>
        {/if}
      </div>
    {/each}
  </nav>

  <div class="foot">
    {#if moi}
      <a href="#/profil">
        <Face who={moi} size="m" />
        <span class="who"><b>{moi.firstName}</b><i>{moi.circleRef.one}</i></span>
      </a>
    {/if}
  </div>
</aside>

<style>
  .rail {
    position: relative;
    width: var(--rail); flex: none; display: flex; flex-direction: column;
    padding: 16px 16px 12px; border-right: 1px solid var(--rule);
    transition: width var(--t2) var(--e);
  }
  /* La barre latérale est le corps de la console : elle ne se défocalise
     jamais, et elle ne porte aucune couleur. */
  .collapsed { width: var(--railc); padding-left: 10px; padding-right: 10px; }

  .top { display: flex; align-items: center; gap: 10px; min-height: 44px; }
  /* **Cibles tactiles d'au moins 44 px partout, bureau compris** (invariant
     20). Le cadre visible reste petit ; c'est la zone qu'on vise qui grandit,
     et les marges négatives empêchent la mise en page de s'écarter. */
  .sigil {
    display: grid; place-items: center; width: 44px; height: 44px; flex: none;
    margin: -9px 0 -9px -9px; font-family: var(--fs); font-size: 15px;
    letter-spacing: 0; line-height: 1;
  }
  .sigil::before {
    content: ""; position: absolute; width: 26px; height: 26px;
    border: 1.5px solid var(--ink);
  }
  .mark { flex: 1; font-size: 12.5px; letter-spacing: .02em; }
  .tgl { display: grid; place-items: center; width: 44px; height: 44px; margin: 0 -9px 0 0; color: var(--dim); }
  .tgl:hover { color: var(--ink); }
  .collapsed .mark, .collapsed .tgl { display: none; }

  .lbl {
    margin: 22px 0 6px; font-size: 9px; font-weight: 700; letter-spacing: .2em;
    text-transform: uppercase; color: var(--faint);
  }
  /* La règle qui sépare agir de parcourir subsiste quand la barre est repliée. */
  .collapsed .lbl { color: transparent; border-top: 1px solid var(--rule); margin-top: 18px; }

  nav { display: flex; flex-direction: column; }
  .row { display: flex; align-items: center; min-height: 44px; }
  .row > a, nav > .row { flex: 1; display: flex; align-items: center; gap: 11px; }
  .row .gl { width: 14px; flex: none; text-align: center; font-family: var(--fs); font-size: 15px; letter-spacing: 0; }
  .row .t { font-size: 13px; font-weight: 600; white-space: nowrap; }
  .row.on { box-shadow: inset 2px 0 0 var(--ink); }
  .row:hover .t { text-decoration: underline; text-underline-offset: 3px; }
  .collapsed .t, .collapsed .exp, .collapsed .sub, .collapsed .who { display: none; }

  .exp { display: grid; place-items: center; width: 44px; height: 44px; margin-right: -9px; color: var(--faint); }
  .exp:hover { color: var(--ink); }
  .sub { display: flex; flex-direction: column; padding: 2px 0 6px 25px; }
  .sub a { display: flex; gap: 8px; padding: 5px 0; min-height: 44px; align-items: center; font-size: 12px; color: var(--dim); }
  .sub a.on, .sub a:hover { color: var(--ink); }
  .sub .n { margin-left: auto; font-size: 10px; color: var(--faint); }

  .foot { margin-top: auto; padding-top: 12px; border-top: 1px solid var(--rule); }
  .foot a { display: flex; align-items: center; gap: 10px; min-height: 44px; }
  .who { display: grid; }
  .who b { font-size: 12px; }
  .who i { font-style: normal; font-size: 10px; color: var(--faint); }

  /* **La barre n'existe pas en étroit** : le visage passe dans l'en-tête et
     la barre basse prend le relais. La règle est posée ici, dans le composant
     qui la connaît — depuis la coque, un `:global` perdrait contre la
     spécificité du style scopé, en silence. */
  @media (max-width: 860px) { .rail { display: none; } }
</style>
