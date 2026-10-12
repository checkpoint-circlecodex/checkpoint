<script lang="ts">
  /* **L'entrée dans le groupe.** Plein écran, hors de la coque : c'est ce
     qu'on voit avant que l'application ait la moindre donnée.

     **Ouverture · Le seuil · L'atelier · L'Ordre · L'entrée** — et l'ordre
     n'est pas un goût : le profil ne peut pas s'écrire avant l'admission.

     Le nom paraît seul, lettre à lettre, puis recule et la tuile arrive.
     Changer d'étape **glisse latéralement** : même profondeur, donc jamais
     de zoom — on n'entre nulle part, on avance. */
  import { untrack } from "svelte";
  import { roman } from "#core/model/lexicon.ts";
  import { skyline } from "#core/ui/skyline.ts";
  import { slide } from "#core/ui/slide.ts";
  import { porte } from "./gate.svelte.ts";
  import { falling } from "./falling.ts";
  import Seuil from "./Seuil.svelte";
  import Forge from "./Forge.svelte";
  import Ordre from "./Ordre.svelte";
  import Entree from "./Entree.svelte";
  import Creeds from "./Creeds.svelte";

  const KICKER = ["Bienvenue", "La demande", "Votre Ordre", "Entrée"];
  const NAME = [..."Checkpoint"];

  let step = $state(porte.door === "dehors" ? 0 : 1);
  let curtain = $state(true);

  /* Le rideau se lève par minuterie, jamais par la fin d'une animation : une
     fenêtre qui ne rend pas n'en finit aucune, et il ne se lèverait jamais. */
  $effect(() => {
    const t = setTimeout(() => (curtain = false), 1750);
    return () => clearTimeout(t);
  });

  let stage = $state<HTMLElement | null>(null);
  let host = $state<HTMLElement | null>(null);
  let live = $state<HTMLElement | null>(null);
  let ghost: HTMLElement | null = null;
  let dir = 1;
  let seen: number | null = null;

  function go(n: number) {
    if (n === step) return;
    dir = n > step ? 1 : -1;
    step = n;
    stage?.scrollTo({ top: 0 });
  }

  /* **La porte bouge d'elle-même** : se connecter mène à l'atelier, changer
     de compte ramène au seuil. Le reste se fait au clic. */
  $effect(() => {
    const d = porte.door;
    untrack(() => {
      if (d === "dehors" && step !== 0) go(0);
      else if ((d === "attente" || d === "admis") && step === 0) go(1);
    });
  });

  $effect.pre(() => {
    step;
    if (!live || seen === null) return;
    ghost = live.cloneNode(true) as HTMLElement;
  });
  $effect(() => {
    const k = step;
    const first = seen === null;
    seen = k;
    const g = ghost; ghost = null;
    if (first || !host || !live) { g?.remove(); return; }
    slide(host, live, g, dir);
  });
</script>

<div class="onb" class:curtain class:at-forge={step === 1}>
  <canvas class="onb-fall" use:falling aria-hidden="true"></canvas>
  <canvas class="onb-sky" use:skyline aria-hidden="true"></canvas>

  <!-- Le nom ne se fond pas : il tombe lettre à lettre, chacune un peu après
       la précédente, puis le mot recule et un trait se tire dessous. -->
  <div class="onb-name" role="heading" aria-level="1" aria-label="Checkpoint">
    {#each NAME as ch, i (i)}<i style="--k:{i}" aria-hidden="true">{ch}</i>{/each}<u></u>
  </div>

  <div class="onb-stage" bind:this={stage}>
    <div class="onb-tile" bind:this={host}>
      {#key step}
        <div class="pane" bind:this={live}>
          <header class="onb-h">
            <span class="onb-k">{KICKER[step]}</span>
            <span class="onb-step">{roman(step + 1)}<i>/</i>{roman(KICKER.length)}</span>
          </header>
          {#if step === 0}<Seuil />
          {:else if step === 1}<Forge />
          {:else if step === 2}<Ordre next={() => go(3)} />
          {:else}<Entree />{/if}
        </div>
      {/key}
    </div>

    <!-- Le défilé sort de la tuile : il est plus large qu'elle, et c'est à
         ça qu'on voit que c'est un moment à part et non un paragraphe. -->
    {#if step === 1}
      <div class="onb-wide"><Creeds next={() => go(2)} /></div>
    {/if}

    <div class="onb-dots" aria-hidden="true">
      {#each KICKER as _, i (i)}<span class:on={i === step} class:past={i < step}></span>{/each}
    </div>
  </div>
</div>

<style>
  .onb {
    position: fixed; inset: 0; z-index: 300; background: var(--paper);
    display: flex; flex-direction: column; align-items: center;
    padding: 0 20px; overflow: hidden; animation: fade 300ms var(--e) both;
  }
  @keyframes fade { from { opacity: 0; } to { opacity: 1; } }

  .onb-name {
    position: relative; z-index: 1; font-family: var(--fs); color: var(--ink); white-space: nowrap;
    font-size: 30px; letter-spacing: .04em; margin-top: 40px;
    transition: font-size 900ms var(--e), margin 900ms var(--e), letter-spacing 900ms var(--e);
  }
  .onb-name i { display: inline-block; font-style: normal; }
  .onb-name u {
    position: absolute; left: 0; bottom: -9px; height: 1px; width: 0;
    background: var(--ink); text-decoration: none; opacity: .5;
  }
  .curtain .onb-name { font-size: clamp(44px, 9vw, 88px); letter-spacing: .14em; margin-top: calc(50vh - 76px); }
  .curtain .onb-name i { animation: letterIn 760ms var(--e) both; animation-delay: calc(var(--k, 0) * 62ms); }
  .curtain .onb-name u { animation: ruleIn 620ms var(--e) both 760ms; }
  /* Une fois le rideau levé, le trait reste tiré. */
  .onb:not(.curtain) .onb-name u { width: 100%; }
  @keyframes letterIn {
    0%   { opacity: 0; transform: translateY(-26px) rotate(-7deg) scale(1.28); filter: blur(7px); }
    62%  { opacity: 1; transform: translateY(3px) rotate(.6deg) scale(.985); filter: blur(0); }
    100% { opacity: 1; transform: none; filter: blur(0); }
  }
  @keyframes ruleIn { from { width: 0; opacity: 0; } to { width: 100%; opacity: .5; } }

  /* Le contenu défile sous le nom : sans estompe, il s'y coupait en pleine
     ligne. On le fait disparaître au lieu de le trancher. */
  .onb-stage {
    position: relative; z-index: 1;
    flex: 1; width: 100%; display: flex; flex-direction: column; align-items: center;
    overflow-y: auto; padding: 26px 0 40px; scrollbar-width: none;
    -webkit-mask-image: linear-gradient(to bottom, transparent 0, #000 26px);
    mask-image: linear-gradient(to bottom, transparent 0, #000 26px);
    transition: opacity 600ms var(--e) 150ms, transform 600ms var(--e) 150ms;
  }
  .onb-stage::-webkit-scrollbar { display: none; }
  .curtain .onb-stage { opacity: 0; transform: translateY(18px); pointer-events: none; }

  .onb-tile {
    position: relative; overflow: hidden; flex: none; width: min(620px, 100%);
    background: var(--raise); border: 1px solid var(--rule); padding: 30px 34px 26px;
  }
  /* L'atelier : trois moments d'un seul geste, sur une feuille plus large. */
  .at-forge .onb-tile { width: min(900px, 100%); }

  /* La cité du Registre, en contrebas : on entre dans un endroit, pas dans
     un formulaire. */
  .onb-sky {
    position: absolute; left: 0; right: 0; bottom: 0; width: 100%; height: 170px;
    image-rendering: pixelated; opacity: .36; pointer-events: none; z-index: 0;
    -webkit-mask-image: linear-gradient(to top, #000 30%, transparent 92%);
    mask-image: linear-gradient(to top, #000 30%, transparent 92%);
  }
  /* Les étoiles filantes, derrière tout, plus denses en haut qu'en bas. */
  .onb-fall {
    position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0;
    -webkit-mask-image: linear-gradient(to bottom, #000 34%, transparent 86%);
    mask-image: linear-gradient(to bottom, #000 34%, transparent 86%);
  }

  .onb-wide { flex: none; width: min(900px, 100%); }

  .onb-dots { flex: none; display: flex; gap: 7px; margin: 20px 0 4px; }
  .onb-dots span {
    width: 5px; height: 5px; border-radius: 50%; background: var(--rule2);
    transition: background var(--t1) var(--e);
  }
  .onb-dots span.past { background: var(--dim); }
  .onb-dots span.on { background: var(--ink); transform: scale(1.4); }

  /* ---- Le vocabulaire des tuiles, partagé par les quatre écrans. Posé ici,
     sous la racine de l'entrée, pour qu'il ne fuie nulle part ailleurs. ---- */
  .onb :global(.onb-k) { font-size: 9px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; color: var(--faint); }
  .onb-h { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; }
  .onb-step { font-family: var(--fs); font-size: 14px; color: var(--rule2); white-space: nowrap; }
  .onb-step i { font-style: normal; padding: 0 3px; }
  .onb :global(.onb-t) { font-family: var(--fs); font-size: 32px; font-weight: 400; line-height: 1.1; margin: 8px 0 14px; color: var(--ink); }
  .onb :global(.onb-p) { font-family: var(--fr); font-weight: 300; font-size: 15px; line-height: 1.7; color: var(--ink2); margin: 0 0 14px; max-width: 58ch; }
  .onb :global(.onb-p b) { font-weight: 400; color: var(--ink); }
  .onb :global(.onb-p.dim) { font-size: 13.5px; color: var(--dim); font-style: italic; }
  .onb :global(.onb-act) { display: flex; gap: 11px; flex-wrap: wrap; margin-top: 22px; border-top: 1px solid var(--rule); padding-top: 18px; }
  .onb :global(.legend) { font-size: 10.5px; color: var(--faint); font-family: var(--fr); font-style: italic; line-height: 1.55; }
  .onb :global(.err) { margin-top: 12px; font-size: 12px; color: var(--ink); border-left: 2px solid var(--ink); padding-left: 10px; }

  .onb :global(.btn-main), .onb :global(.btn-ghost) {
    display: inline-flex; align-items: center; justify-content: center; min-height: 44px; padding: 11px 18px;
    font-size: 10.5px; font-weight: 700; letter-spacing: .17em; text-transform: uppercase;
    border: 1px solid var(--ink); transition: all var(--t1) var(--e); text-align: center;
  }
  .onb :global(.btn-main) { background: var(--ink); color: var(--paper); padding: 11px 20px; }
  .onb :global(.btn-main:hover) { background: var(--ink2); border-color: var(--ink2); }
  .onb :global(.btn-main[disabled]) { opacity: .35; pointer-events: none; }
  .onb :global(.btn-ghost) { color: var(--dim); border-color: var(--rule2); }
  .onb :global(.btn-ghost:hover) { color: var(--ink); border-color: var(--ink); }

  .onb :global(.fld) { margin-bottom: 16px; }
  .onb :global(.fld label), .onb :global(.fld .lbl) {
    display: block; font-size: 9px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase;
    color: var(--faint); margin-bottom: 7px;
  }
  .onb :global(.fld em) { font-style: normal; text-transform: none; letter-spacing: .04em; font-weight: 400; }
  .onb :global(.fld input), .onb :global(.fld select) {
    width: 100%; min-height: 44px; background: var(--raise); border: 1px solid var(--rule);
    padding: 9px 11px; font-size: 14px; outline: none; color: var(--ink); font-family: var(--fu);
  }
  .onb :global(.fld input:focus), .onb :global(.fld select:focus) { border-color: var(--ink); background: var(--paper); }
  .onb :global(.fld input[disabled]), .onb :global(.fld select[disabled]) { color: var(--dim); background: transparent; }
  .onb :global(.fld-2) { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

  @media (prefers-reduced-motion: reduce) {
    .onb-name, .onb-stage { transition: none; }
    .onb-name i, .onb-name u { animation: none; }
    .onb-name u { width: 100%; }
  }
  @media (max-width: 860px) {
    .onb-tile { padding: 24px 20px 20px; }
    .onb :global(.onb-t) { font-size: 26px; }
    .onb :global(.fld-2) { grid-template-columns: 1fr; }
  }
</style>
