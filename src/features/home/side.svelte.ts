/* **De quel côté de l'accueil on se tient.** Au niveau du module, pas du
   composant : ouvrir une œuvre depuis le Tableau puis revenir doit ramener
   au Tableau, à l'endroit où l'on en était — la page d'accueil, elle, est
   recréée à chaque retour. Le temps d'une session seulement : au lancement,
   on arrive toujours sur le Registre. */
import type { MediaType } from "#core/model/schema.ts";

export const vue = $state({
  side: 0 as 0 | 1,
  kind: null as MediaType | null,
  x: 0,
  y: 0,
});
