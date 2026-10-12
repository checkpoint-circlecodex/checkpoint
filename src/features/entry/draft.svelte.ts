/* Le brouillon de l'atelier. **Il vit sur cette machine jusqu'à
   l'admission** : on ne peut l'écrire nulle part ailleurs, puisque le
   fragment n'existe pas encore et qu'on n'a pas les droits pour le créer.

   Le stockage du navigateur est une commodité, pas une garantie : s'il est
   vide, illisible ou refusé, on repart d'un brouillon neuf — et rien de ce
   qui compte n'est perdu, puisque la demande, elle, est sur GitHub. */

import { TONES } from "./emblems.ts";
import type { Draft } from "./door.ts";

const KEY = "checkpoint.atelier";

const blank = (): Draft => ({
  tone: TONES[1], sign: "🦊", firstName: "", handle: "",
  discord: "", vouched: "", vouchedAs: "Ami", circle: null,
});

function load(): Draft {
  try {
    const t = localStorage.getItem(KEY);
    if (t) return { ...blank(), ...JSON.parse(t) };
  } catch { /* stockage refusé ou illisible : on repart de zéro */ }
  return blank();
}

export const draft = $state<Draft>(load());

export function keep() {
  try { localStorage.setItem(KEY, JSON.stringify(draft)); } catch { /* commodité seulement */ }
}

/** Une fois entré, le brouillon n'a plus de raison d'être : le fragment
    porte désormais ce qu'il contenait. */
export function drop() {
  try { localStorage.removeItem(KEY); } catch { /* idem */ }
}
