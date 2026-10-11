/* Le registre des vues. Il vit dans le noyau parce que la coque **et** les
   blocs en parlent — mais il ne connaît aucun bloc : ce sont eux qui s'y
   déclarent, et la coque qui les rassemble. */

import type { Component } from "svelte";

/** Comment une vue se comporte quand la place manque. Une vue qui ne sait pas
    répondre n'est pas finie (invariant 23). */
export type Narrow =
  | "adapt"     // une colonne, rien ne disparaît
  | "tabs"      // ses volets deviennent des onglets pleine largeur
  | "stack";    // ses colonnes s'empilent dans l'ordre de lecture

export type ViewEntry = {
  id: string;
  label: string;
  href: string;
  gl: string;
  narrow: Narrow;
  /** La profondeur décide du geste : zoom si elle change, glissement sinon. */
  depth: number;
  view: Component<any>;
  /** Les sous-entrées dépliables de la barre, calculées à l'affichage. */
  subs?: () => { href: string; label: string; dot?: string; n?: string }[];
  /** Une porte qui n'existe que pour certains. **Absente, jamais grisée**
      (invariant 32). */
  only?: () => boolean;
  /** Ce qu'on *tient* plutôt que ce qu'on parcourt : le Greffe. */
  hold?: boolean;
  /** ⚠️ Banc d'essai, à retirer au portage. */
  bench?: boolean;
};
