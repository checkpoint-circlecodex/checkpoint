/* **Le glissement latéral, écrit une fois.** Les volets d'une feuille et les
   tuiles de l'entrée le partagent — deux usagers, donc le noyau
   (invariant 13). Même profondeur : aucun flou, aucun zoom, et le sens du
   glissement dit seulement de quel côté on va.

   Le volet sortant est un **clone** posé par-dessus, à l'endroit exact où
   était l'ancien — mesuré par `offset*`, qui ignore les transformations
   (invariant 18). Et **son retrait ne dépend pas de l'animation** : un
   minuteur l'emporte quoi qu'il arrive, sinon un onglet qui ne rend pas
   accumulerait les fantômes. */

const REDUCE = () => typeof matchMedia !== "undefined"
  && matchMedia("(prefers-reduced-motion: reduce)").matches;

/** `host` doit être positionné ; `ghost` est le clone de l'ancien volet,
    pris **avant** la mise à jour, et `live` le nouveau. */
export function slide(host: HTMLElement, live: HTMLElement, ghost: HTMLElement | null, dir: number) {
  if (REDUCE()) { ghost?.remove(); return; }

  if (ghost) {
    ghost.style.cssText += `;position:absolute;pointer-events:none;margin:0;` +
      `left:${live.offsetLeft}px;top:${live.offsetTop}px;width:${live.offsetWidth}px`;
    ghost.setAttribute("aria-hidden", "true");
    ghost.setAttribute("inert", "");
    host.appendChild(ghost);
    const out = ghost.animate(
      [{ opacity: 1, transform: "translateX(0)" },
       { opacity: 0, transform: `translateX(${dir * -18}px)` }],
      { duration: 180, easing: "cubic-bezier(.6,0,.25,1)", fill: "forwards" });
    const kill = () => ghost.remove();
    out.onfinish = out.oncancel = kill;
    setTimeout(kill, 230);
  }
  const enter = live.animate(
    [{ opacity: 0, transform: `translateX(${dir * 20}px)` },
     { opacity: 1, transform: "translateX(0)" }],
    { duration: 260, easing: "cubic-bezier(.2,.75,.25,1)" });
  /* Une animation figée garde sa première image : opacité zéro, décalée de
     20 px. L'annuler après sa durée rend le volet à son état de repos. */
  setTimeout(() => enter.cancel(), 320);
}
