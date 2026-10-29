<script lang="ts">
  /* Le lanceur, posé au-dessus du flou. Il ne vit qu'en large : en étroit, la
     barre n'existe pas, et la recherche devient une feuille qui monte du bas
     (invariant 22). */
  import { lanceur } from "./launcher.svelte.ts";
  import { makeSecret, type Side } from "./secret.ts";
  import { pile } from "#core/ui/index.ts";
  import Seek from "./Seek.svelte";
  import Etabli from "./Etabli.svelte";

  /* ⚠️ **Le seul geste caché de l'application, et il est voulu.** Deux
     boutons invisibles dans le coin de la zone floutée ; cinq clics dans le
     bon ordre ouvrent l'établi. Une entorse délibérée aux invariants 19 et
     32, décidée avec Nathan le 11 octobre et bornée : **elle ne mène qu'à
     l'atelier**, jamais à une autorité. Le Greffe, lui, reste une porte en
     vue pour qui tient la charge. */
  const press = makeSecret();
  function knock(side: Side) {
    if (!press(side, performance.now())) return;
    lanceur.chose();
    pile.open("panneau", "L'établi", Etabli);
  }
</script>

<div class="deck" role="search">
  <div class="in"><Seek query={lanceur.query} onpick={() => lanceur.chose()} /></div>
</div>

<!-- Hors de l'ordre de tabulation et des lecteurs d'écran : ils n'ont rien à
     annoncer à qui ne sait pas qu'ils existent. -->
<div class="knock" aria-hidden="true">
  <!-- Sans étiquette, et c'est voulu : un nom les rendrait découvrables, ce
       qu'ils ne doivent pas être. Le conteneur les retire déjà de
       l'accessibilité ; le vérificateur ne voit pas le parent. -->
  <!-- svelte-ignore a11y_consider_explicit_label -->
  <button tabindex="-1" onclick={() => knock("g")}></button>
  <!-- svelte-ignore a11y_consider_explicit_label -->
  <button tabindex="-1" onclick={() => knock("d")}></button>
</div>

<style>
  /* La barre dépliée passe par-dessus la page (voir Rail) : le lanceur
     commence là où elle finit, pas dessous. */
  .deck { position: absolute; inset: 0 0 0 calc(var(--rail) - var(--railc)); z-index: 6; overflow-y: auto; }
  @media (max-width: 860px) { .deck { left: 0; } }
  .in { max-width: 980px; margin: 0 auto; padding: 34px 36px 64px; animation: lift 280ms var(--e) both; }
  /* Le départ de l'animation n'est jamais invisible : une animation figée
     garde sa première image, et un lanceur à opacité nulle serait une page
     blanche. Un décalage de 6 px, lui, se lit même s'il ne bouge pas. */
  @keyframes lift { from { transform: translateY(6px); } }
  @media (prefers-reduced-motion: reduce) { .in { animation: none; } }

  .knock { position: fixed; right: 14px; bottom: 14px; z-index: 7; display: flex; gap: 2px; }
  /* Invisibles ; au survol, la couleur change à peine. 44 px quand même —
     un geste caché n'a pas à être, en plus, difficile à atteindre. */
  .knock button { width: 44px; height: 44px; background: transparent; cursor: default;
                  transition: background var(--t2) var(--e); }
  .knock button:hover { background: color-mix(in srgb, var(--ink) 4%, transparent); }
</style>
