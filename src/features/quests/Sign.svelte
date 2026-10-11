<script lang="ts">
  /* **Une quête est une pancarte, pas une jaquette.** Une œuvre a une image ;
     une quête n'a qu'un nom et une promesse. D'où la planche : un panneau
     cloué sur un piquet, légèrement de travers, **qui se redresse quand on
     s'en approche**.

     Accomplie, la planche **s'inverse** — encre pleine, texte en papier : le
     plus fort contraste disponible sans couleur, et il ne sert qu'à ça. */
  import { roman } from "#core/model/lexicon.ts";
  import type { OpenQuest } from "#core/model/world.ts";

  let { q, i = 0, done = false, holders = 0 }:
    { q: OpenQuest; i?: number; done?: boolean; holders?: number } = $props();

  /* L'inclinaison est tirée du nom, pas au hasard : une planche doit pencher
     de la même façon à chaque ouverture, sinon elle n'est plus la même. */
  const tilt = $derived(((q.id.charCodeAt(0) + q.id.length * 7) % 5) - 2);
</script>

<a class="sign" class:done href="#/quete/{q.id}" style="--tilt:{tilt * 0.5}deg; --d:{Math.min(i, 14) * 24}ms">
  <span class="plank">
    <span class="t">{q.title}</span>
    <span class="l">{q.line}</span>
    <span class="f">
      {roman(q.trials.reduce((n, t) => n + t.media.length, 0))} œuvres
      {#if holders}· accomplie par {roman(holders)}{/if}
    </span>
  </span>
  <span class="post" aria-hidden="true"></span>
</a>

<style>
  .sign { display: grid; justify-items: center; width: 100%; animation: pousse 420ms var(--e) var(--d) backwards; }
  @keyframes pousse { from { opacity: 0; transform: translateY(8px); } }

  .plank {
    display: grid; gap: 4px; width: 100%; padding: 15px 18px 16px;
    border: 1.5px solid var(--ink); background: var(--paper);
    transform: rotate(var(--tilt)); transform-origin: 50% 100%;
    transition: transform var(--t2) var(--e);
  }
  /* On la lit de loin ; on ne voit ses conditions qu'en entrant. */
  .sign:hover .plank, .sign:focus-visible .plank { transform: rotate(0deg); }

  .t { font-family: var(--fs); font-size: 21px; line-height: 1.1; }
  .l { font-family: var(--fr); font-style: italic; font-size: 13px; color: var(--ink2); }
  .f { font-size: 10px; letter-spacing: .12em; text-transform: uppercase; color: var(--faint); margin-top: 3px; }

  .post { width: 3px; height: 16px; background: var(--ink); }

  .done .plank { background: var(--ink); border-color: var(--ink); }
  .done .t, .done .l { color: var(--paper); }
  .done .f { color: color-mix(in srgb, var(--paper) 65%, transparent); }

  @media (prefers-reduced-motion: reduce) {
    .sign { animation: none; }
    .plank { transform: none; }
  }
</style>
