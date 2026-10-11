/* **L'onde de couleur.** Née de la pastille qu'on vient de toucher, elle
   traverse la page et se retire. C'est le seul geste de l'application qui
   porte une couleur hors d'une chambre, et c'est ce qui en fait une entrée.

   Elle reste **translucide d'un bout à l'autre** : on voit la page se former
   au travers. Un volet opaque avait été essayé et écarté — *couvrir, c'est
   fermer une porte ; traverser, c'est en ouvrir une.* */

const REDUCE = () =>
  typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

export function burst(from: Element, color: string, then: () => void, ample = false) {
  if (REDUCE()) return then();

  const r = from.getBoundingClientRect();
  const b = document.createElement("div");
  b.className = "cp-burst";
  const ms = ample ? 1900 : 640;
  b.style.cssText = `--c:${color};left:${r.left + r.width / 2}px;top:${r.top + r.height / 2}px;` +
    `width:${r.width}px;height:${r.height}px;--ms:${ms}ms;--to:${ample ? 25 : 13}`;
  document.body.appendChild(b);

  /* Le retrait ne dépend pas de la fin de l'animation : dans un onglet qui ne
     rend pas, elle ne finit jamais, et l'onde resterait en travers de la page. */
  setTimeout(() => b.remove(), ms + 60);
  setTimeout(then, ample ? 820 : 150);
}
