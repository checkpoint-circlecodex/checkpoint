<script lang="ts">
  /* Le lanceur, posé au-dessus du flou. Il ne vit qu'en large : en étroit, la
     barre n'existe pas, et la recherche devient une feuille qui monte du bas
     (invariant 22). */
  import { lanceur } from "./launcher.svelte.ts";
  import Seek from "./Seek.svelte";
</script>

<div class="deck" role="search">
  <div class="in"><Seek query={lanceur.query} onpick={() => lanceur.chose()} /></div>
</div>

<style>
  .deck { position: absolute; inset: 0; z-index: 6; overflow-y: auto; }
  .in { max-width: 980px; margin: 0 auto; padding: 34px 36px 64px; animation: lift 280ms var(--e) both; }
  /* Le départ de l'animation n'est jamais invisible : une animation figée
     garde sa première image, et un lanceur à opacité nulle serait une page
     blanche. Un décalage de 6 px, lui, se lit même s'il ne bouge pas. */
  @keyframes lift { from { transform: translateY(6px); } }
  @media (prefers-reduced-motion: reduce) { .in { animation: none; } }
</style>
