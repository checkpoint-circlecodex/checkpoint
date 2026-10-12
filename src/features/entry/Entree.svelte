<script lang="ts">
  /* **L'entrée.** Le seul écran de la séquence qui porte une couleur : celle
     qu'on vient de choisir. C'est ce qui en fait un aboutissement.

     Il dit que **le corpus est déjà plein** : on n'arrive pas devant une
     bibliothèque vide, on arrive au milieu d'une conversation. Puis l'onde
     porte « BIENVENUE DANS LE CODEX », et elle **ne nomme personne** — le
     seuil salue l'arrivée, il ne salue pas quelqu'un. */
  import { circle, roman } from "#core/model/lexicon.ts";
  import { registre } from "#core/model/store.svelte.ts";
  import { alive } from "#core/model/world.ts";
  import { burst } from "#core/ui/burst.ts";
  import { porte } from "./gate.svelte.ts";
  import { draft, drop } from "./draft.svelte.ts";
  import { founding } from "./door.ts";

  const c = $derived(draft.circle ? circle(draft.circle) : null);
  const corpus = $derived(Object.keys(registre.world.catalog).filter(id => alive(registre.world, id)).length);
  const me = $derived(draft.firstName.trim() || "vous");

  async function enter(e: MouseEvent) {
    const btn = e.currentTarget as HTMLElement;
    const user = porte.login ? founding(porte.login, draft) : null;
    if (!user || !c) return;
    /* On n'accueille pas quelqu'un dont le fichier n'existe pas : l'onde
       part **après** l'écriture, jamais avant. */
    if (!(await porte.enter(user))) return;
    drop();
    /* Un mot porté par l'onde, et par elle seule : il naît avec, il meurt
       avec. Hors de la tuile, puisque la tuile disparaît avant lui. */
    const hail = document.createElement("div");
    hail.className = "cp-hail";
    const b = document.createElement("b");
    b.textContent = "Bienvenue dans le codex";
    hail.appendChild(b);
    document.body.appendChild(hail);
    setTimeout(() => hail.remove(), 2000);
    burst(btn, c.color, () => porte.arrive(), true);
  }
</script>

<h2 class="onb-t">Le serment est prêté</h2>
<div class="done" style="--c:{c ? c.color : 'var(--ink)'}">
  <span class="halo"><span class="face" style="--g:{draft.tone}"><span>{draft.sign}</span></span></span>
  <!-- `{" "}` et non une espace nue : en tête d'un bloc, Svelte la retire,
       et on lisait « Sachade la Forge ». -->
  <b>{me}{#if draft.handle.trim()}{" "}<em>{draft.handle.trim()}</em>{/if}</b>
  <span class="oath">{c ? c.order : "Sans Ordre"}</span>
  {#if draft.discord.trim()}<span class="dsc">{draft.discord.trim()} sur Discord</span>{/if}
</div>
{#if corpus > 1}
  <p class="onb-p">Le corpus est déjà plein : <b>{roman(corpus)} œuvres</b> y ont été portées avant vous. Vous n'arrivez pas devant une bibliothèque vide — <b>vous arrivez au milieu d'une conversation.</b></p>
{:else}
  <!-- Le premier arrivant ne peut pas arriver au milieu d'une conversation :
       il la commence. Lui dire que le corpus est plein serait mentir. -->
  <p class="onb-p">Le corpus est encore vide : <b>vous êtes parmi les premiers.</b> Ce que vous y porterez, les suivants le trouveront en arrivant — <b>c'est vous qui ouvrez la conversation.</b></p>
{/if}
<div class="onb-act center">
  <button class="btn-main enter" onclick={enter} disabled={porte.busy || !c}>
    {porte.busy ? "On vous inscrit…" : "Entrer dans le Registre"}</button>
</div>
{#if porte.error}<p class="err" role="alert">{porte.error}</p>{/if}

<style>
  .done {
    display: flex; flex-direction: column; align-items: center; text-align: center;
    gap: 3px; padding: 30px 20px 26px; margin: 4px 0 18px;
    background: color-mix(in srgb, var(--c) 11%, var(--paper));
    border: 1px solid color-mix(in srgb, var(--c) 38%, transparent);
  }
  .halo { position: relative; display: block; margin-bottom: 14px; animation: drift 7.5s ease-in-out infinite; }
  .halo::before {
    content: ""; position: absolute; inset: -42%; border-radius: 50%; z-index: 0;
    background: radial-gradient(circle, var(--c) 0%, transparent 62%);
    filter: blur(17px); animation: halo 7.5s ease-in-out infinite;
  }
  .face {
    position: relative; z-index: 1; display: grid; place-items: center; border-radius: 50%;
    width: 104px; height: 104px; font-size: 50px; background: var(--g); overflow: hidden;
    box-shadow: 0 0 0 1px rgba(20,20,18,.12) inset; letter-spacing: 0;
  }
  .face span { line-height: 1; }
  .done > b { display: block; font-family: var(--fs); font-size: 31px; font-weight: 400; line-height: 1.1; overflow-wrap: anywhere; }
  .done > b em { font-style: italic; color: var(--dim); }
  .oath { font-family: var(--fs); font-size: 17px; color: color-mix(in srgb, var(--c) 76%, var(--ink)); }
  .dsc { font-size: 10px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--faint); margin-top: 6px; }
  .center { justify-content: center; }
  .enter { padding: 14px 30px; font-size: 11px; letter-spacing: .2em; }
  @keyframes drift { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-11px); } }
  @keyframes halo { 0%,100% { opacity: .26; transform: scale(1); } 50% { opacity: .46; transform: scale(1.1); } }
  @media (prefers-reduced-motion: reduce) { .halo, .halo::before { animation: none; } }
</style>
