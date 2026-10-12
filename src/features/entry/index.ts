/* L'entrée dans le groupe. **Ce n'est pas une vue du registre** : elle se
   joue avant que l'application ait la moindre donnée, donc elle ne se
   déclare nulle part dans la barre. La coque la montre tant que la porte
   n'est pas franchie, et rien d'autre ne mène à elle.

   ⚠️ Le prototype avait un banc d'essai — un onglet « Onboarding » dans la
   barre. **Il n'a pas été porté**, et c'est délibéré : pour voir la
   séquence en développement, l'adresse `?dehors` joue quelqu'un du dehors
   sur le faux, hors de la coque. */

export { default as Entry } from "./Entry.svelte";
export { porte, type Door } from "./gate.svelte.ts";
