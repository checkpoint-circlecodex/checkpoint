<script lang="ts">
  /* **La bulle — une petite surface accrochée à ce qu'on vient de toucher.**
     Dans le noyau dès sa première utilisation : les surfaces y sont toutes
     (invariant 14), et un bloc ne réinvente pas les siennes.

     Elle se pose **au-dessus** de son ancre, ou dessous s'il n'y a pas la
     place, et reste dans l'écran. Elle se ferme sur Échap, sur un clic
     ailleurs, et dès que ce qu'il y a dessous défile — une bulle qui
     resterait en l'air pendant que sa case s'en va désignerait autre
     chose. Sa forme étroite est la même, bornée à l'écran (invariant 22).

     ⚠️ **Elle se rend dans `body`, pas sur place.** Un ancêtre transformé
     (le glissement de l'accueil l'est) devient le repère de tout ce qui
     est `fixed` dessous : posée sur place, la bulle tomberait à côté. Et
     on mesure l'ancre une fois, au repos — jamais pendant une animation
     (invariant 18). */
  import { onMount, type Snippet } from "svelte";

  let { anchor, label, close, children }:
    { anchor: HTMLElement; label: string; close: () => void; children: Snippet } = $props();

  let el = $state<HTMLElement | null>(null);
  let pos = $state({ top: -9999, left: -9999, below: false, tip: 0 });

  const portal = (node: HTMLElement) => {
    document.body.appendChild(node);
    return { destroy: () => node.remove() };
  };

  onMount(() => {
    const b = el!;
    const place = () => {
      const a = anchor.getBoundingClientRect();
      const W = innerWidth, M = 8, GAP = 7;
      const w = b.offsetWidth, h = b.offsetHeight;
      const below = a.top - h - GAP < M;
      const left = Math.min(W - w - M, Math.max(M, a.left + a.width / 2 - w / 2));
      pos = { top: below ? a.bottom + GAP : a.top - h - GAP, left, below, tip: a.left + a.width / 2 - left };
    };
    place();
    /* Le focus va au choix en cours s'il y en a un, sinon au premier. */
    (b.querySelector('[aria-pressed="true"]') as HTMLElement | null ?? b.querySelector("button, a") as HTMLElement | null)?.focus();
    /* Ouverte pendant un glissement, elle a mesuré une ancre en mouvement :
       elle se repose quand la transition finit — on mesure au repos
       (invariant 18), pas pendant. Vu le 29 octobre, case touchée trop tôt
       après être arrivé sur le Tableau. */
    document.addEventListener("transitionend", place, true);

    const away = (e: PointerEvent) => {
      if (!b.contains(e.target as Node) && !anchor.contains(e.target as Node)) close();
    };
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") { e.stopPropagation(); close(); anchor.focus(); } };
    const moved = (e: Event) => { if (!b.contains(e.target as Node)) close(); };
    document.addEventListener("pointerdown", away, true);
    document.addEventListener("keydown", key, true);
    addEventListener("scroll", moved, true);
    addEventListener("resize", close);
    return () => {
      document.removeEventListener("transitionend", place, true);
      document.removeEventListener("pointerdown", away, true);
      document.removeEventListener("keydown", key, true);
      removeEventListener("scroll", moved, true);
      removeEventListener("resize", close);
    };
  });
</script>

<div class="bubble" class:below={pos.below} bind:this={el} use:portal role="dialog" aria-label={label}
     style="top:{pos.top}px; left:{pos.left}px; --tip:{pos.tip}px">
  {@render children()}
</div>

<style>
  /* Plate, comme tout : un filet d'encre, le papier relevé, aucune ombre. */
  .bubble {
    position: fixed; z-index: 600; max-width: calc(100vw - 16px);
    background: var(--raise); border: 1px solid var(--ink); padding: 8px;
    animation: pop 140ms var(--e);
  }
  /* La pointe désigne la case : on sait de quoi parle la bulle. */
  .bubble::after {
    content: ""; position: absolute; left: calc(var(--tip) - 5px); bottom: -6px;
    width: 9px; height: 9px; background: var(--raise);
    border-right: 1px solid var(--ink); border-bottom: 1px solid var(--ink); transform: rotate(45deg);
  }
  .bubble.below::after { bottom: auto; top: -6px; transform: rotate(225deg); }
  @keyframes pop { from { opacity: 0; transform: translateY(3px); } to { opacity: 1; transform: none; } }
  @media (prefers-reduced-motion: reduce) { .bubble { animation: none; } }
</style>
