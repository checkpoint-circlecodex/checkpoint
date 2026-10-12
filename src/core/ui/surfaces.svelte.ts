import type { Component } from "svelte";

/* Les surfaces sont **dans le noyau** (invariant 14) : panneaux,
   superpositions, tiroirs forment un vocabulaire partagé. Un bloc demande une
   surface, jamais une disposition (invariant 22).

   **Depuis une surface, elles s'empilent** (invariant 17) : une surface
   ouverte depuis une autre doit retrouver la première intacte en se
   fermant — sinon on détruit une saisie en cours. Celle du dessous se
   défocalise.

   **Depuis la barre, elles se remplacent** (`swap`). Un geste de la barre
   n'est pas ouvert depuis un panneau : c'est une nouvelle destination, et
   choisir une destination referme ce qui était ouvert, comme une
   navigation. Décidé par Nathan le 12 octobre — et une saisie en cours
   dans le panneau remplacé est perdue, c'est assumé. */

export type SurfaceKind = "panneau" | "volet";

export type Surface = {
  id: number;
  kind: SurfaceKind;
  title: string;
  /** Ce qui s'affiche dedans : **le bloc fournit son composant**, le noyau ne
      devine rien. C'est la règle « un bloc demande une surface, jamais une
      disposition » (invariant 22) prise au mot. */
  comp: Component<any>;
  props?: Record<string, unknown>;
  onClose?: () => void;
};

let seq = 0;

class Pile {
  stack = $state<Surface[]>([]);

  /** Le dessus de la pile a la main ; tout ce qui est dessous se défocalise. */
  get top() { return this.stack.at(-1) ?? null; }
  get depth() { return this.stack.length; }

  open(kind: SurfaceKind, title: string, comp: Component<any>,
       props?: Record<string, unknown>, onClose?: () => void): number {
    const id = ++seq;
    this.stack = [...this.stack, { id, kind, title, comp, props, onClose }];
    return id;
  }

  /** **Remplacer** : tout ce qui est ouvert se ferme, puis la nouvelle
      surface s'ouvre. Pour les gestes de la barre et de l'en-tête —
      jamais pour une surface ouverte depuis une autre. */
  swap(kind: SurfaceKind, title: string, comp: Component<any>,
       props?: Record<string, unknown>, onClose?: () => void): number {
    this.closeAll();
    return this.open(kind, title, comp, props, onClose);
  }

  /** Ferme **la surface nommée**, pas « la dernière » : une fermeture
      différée (une animation, une réponse tardive) sinon emporterait celle
      que quelqu'un vient d'ouvrir par-dessus. */
  close(id?: number) {
    const target = id ?? this.top?.id;
    if (target === undefined) return;
    const s = this.stack.find(x => x.id === target);
    this.stack = this.stack.filter(x => x.id !== target);
    s?.onClose?.();
  }

  closeAll() {
    const all = this.stack;
    this.stack = [];
    for (const s of all.reverse()) s.onClose?.();
  }
}

export const pile = new Pile();
