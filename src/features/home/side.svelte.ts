/* **De quel côté de l'accueil on se tient.** Au niveau du module, pas du
   composant : ouvrir une œuvre depuis le Tableau puis revenir doit ramener
   au Tableau, à l'endroit où l'on en était — la page d'accueil, elle, est
   recréée à chaque retour. Le temps d'une session seulement : au lancement,
   on arrive toujours sur le Registre. */
import type { MediaType } from "#core/model/schema.ts";
import type { LedgerSort } from "#core/selectors/table.ts";

const SORT_KEY = "checkpoint.tableau.ordre";
function readSort(): LedgerSort {
  try { return localStorage.getItem(SORT_KEY) === "state" ? "state" : "title"; } catch { return "title"; }
}
export function keepSort(s: LedgerSort) {
  vue.sort = s;
  try { localStorage.setItem(SORT_KEY, s); } catch { /* commodité seulement */ }
}

export const vue = $state({
  side: 0 as 0 | 1,
  kind: null as MediaType | null,
  q: "",
  /** Ranger par titre ou par son propre état — une commodité par appareil,
      gardée dans le navigateur, pas dans le fragment. */
  sort: readSort(),
  x: 0,
  y: 0,
});
