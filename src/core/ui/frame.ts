/* **Montrer une jaquette selon son cadrage**, partout pareil : la grille des
   Œuvres, la recherche, la fiche, la planche. Du CSS seul, exact, sans
   connaître la taille de l'image :

   l'image est posée en absolu dans un cadre qui coupe ce qui dépasse ; sa
   largeur est celle du cadre divisée par `w` (la part d'image visible) ; et
   elle recule de `x` et `y` **en pourcentage d'elle-même** — c'est ce que
   fait `translate`, dont les pourcentages se rapportent à l'élément et non
   à son conteneur. Le coin haut-gauche de la fenêtre tombe ainsi exactement
   sur le coin du cadre. Sans cadrage : la jaquette remplit le cadre,
   centrée (`object-fit: cover`). */

import type { Frame } from "../model/schema.ts";

export const frameStyle = (f?: Frame | null): string =>
  f ? `position:absolute;left:0;top:0;max-width:none;height:auto;object-fit:fill;` +
      `width:${(100 / f.w).toFixed(4)}%;transform:translate(${(-f.x * 100).toFixed(4)}%,${(-f.y * 100).toFixed(4)}%)`
    : "";
