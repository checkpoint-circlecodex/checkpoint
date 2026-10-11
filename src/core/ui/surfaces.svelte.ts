/* Les surfaces sont **dans le noyau** (invariant 14) : panneaux,
   superpositions, tiroirs forment un vocabulaire partagé. Un bloc demande une
   surface, jamais une disposition (invariant 22).

   **Elles s'empilent, elles ne se remplacent jamais** (invariant 17). Une
   surface ouverte depuis une autre doit retrouver la première intacte en se
   fermant — sinon on détruit une saisie en cours. Celle du dessous se
   défocalise. */

export type SurfaceKind = "panneau" | "volet";

export type Surface = {
  id: number;
  kind: SurfaceKind;
  title: string;
  /** Ce qui s'affiche dedans : au bloc de le dire, pas au noyau de le deviner. */
  render: unknown;
  onClose?: () => void;
};

let seq = 0;

class Pile {
  stack = $state<Surface[]>([]);

  /** Le dessus de la pile a la main ; tout ce qui est dessous se défocalise. */
  get top() { return this.stack.at(-1) ?? null; }
  get depth() { return this.stack.length; }

  open(kind: SurfaceKind, title: string, render: unknown, onClose?: () => void): number {
    const id = ++seq;
    this.stack = [...this.stack, { id, kind, title, render, onClose }];
    return id;
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
