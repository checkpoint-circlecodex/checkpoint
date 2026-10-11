<script lang="ts">
  /* **Deux gestes, et ils ne se confondent jamais.** Le zoom — deux couches
     se croisent, celle qu'on quitte se défocalise et recule — dit un
     *changement de profondeur*. Le glissement latéral, sans aucun flou, dit
     un *déplacement à profondeur égale*.

     ⚠️ **Le retrait de la couche qui part ne dépend pas de l'animation.**
     C'est une leçon déjà payée trois fois dans le prototype : dans un onglet
     qui ne rend pas, aucune image n'est calculée, donc `onfinish` n'arrive
     jamais — et les couches quittées s'empilent en silence. *Un rappel
     d'animation anime, il ne met jamais en place.* D'où le fantôme : on
     clone la couche sortante, on l'anime, et **un minuteur la retire quoi
     qu'il arrive**.

     C'est aussi pour ça qu'on ne se repose pas sur les transitions de
     Svelte ici : elles sont pilotées par l'horloge d'animation, et l'horloge
     s'arrête. */
  import type { Snippet } from "svelte";

  let { routeKey, forward = true, children }:
    { routeKey: string; forward?: boolean; children: Snippet } = $props();

  let host = $state<HTMLElement | null>(null);
  let live = $state<HTMLElement | null>(null);
  let ghost: HTMLElement | null = null;
  let seen: string | null = null;

  const REDUCE = () => typeof matchMedia !== "undefined"
    && matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Avant que le DOM ne change, on prend l'empreinte de ce qui va partir. */
  $effect.pre(() => {
    routeKey;
    if (!live || seen === null) return;
    const g = live.cloneNode(true) as HTMLElement;
    g.scrollTop = live.scrollTop;         // un clone ne copie pas le défilement
    ghost = g;
  });

  $effect(() => {
    const key = routeKey;
    const first = seen === null;
    seen = key;
    if (!live) return;
    live.scrollTop = 0;                   // on arrive en haut de ce qu'on ouvre

    const g = ghost; ghost = null;
    if (first || !host) return;

    if (REDUCE()) { g?.remove(); return; }

    if (g) {
      g.classList.add("ghost");
      host.appendChild(g);
      const out = g.animate(
        [{ opacity: 1, transform: "scale(1)", filter: "blur(0px)" },
         { opacity: 0, transform: `scale(${forward ? 1.06 : 0.94})`, filter: "blur(12px)" }],
        { duration: 300, easing: "cubic-bezier(.6,0,.25,1)", fill: "forwards" });
      const kill = () => g.remove();
      out.onfinish = out.oncancel = kill;
      setTimeout(kill, 360);              // le filet, et c'est lui qui compte
    }

    live.animate(
      [{ opacity: 0, transform: `scale(${forward ? 0.965 : 1.05})`, filter: "blur(10px)" },
       { opacity: 1, transform: "scale(1)", filter: "blur(0px)" }],
      { duration: 420, easing: "cubic-bezier(.2,.75,.25,1)" });
  });
</script>

<div class="stage" bind:this={host}>
  {#key routeKey}
    <div class="layer" bind:this={live}>{@render children()}</div>
  {/key}
</div>

<style>
  .stage { position: relative; height: 100%; overflow: hidden; }
  .layer { position: absolute; inset: 0; overflow: auto; }
  /* Le fantôme ne reçoit plus rien : il est en train de disparaître. */
  :global(.stage .ghost) { pointer-events: none; }
</style>
