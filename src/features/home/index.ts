/* Le point de contact d'un bloc avec le reste : **une ligne au registre**, et
   rien d'autre. La coque construit sa navigation à partir de là ; ajouter une
   vue, c'est un dossier et une ligne, la retirer, c'est effacer le dossier. */

import Home from "./Home.svelte";
import type { ViewEntry } from "$core/ui/registry.ts";

export const home: ViewEntry = {
  id: "home",
  label: "Registre",
  href: "#/",
  gl: "☰",
  /* Chaque vue déclare comment elle dégrade en étroit (invariant 23), au même
     endroit que son nom. Une vue qui ne sait pas répondre n'est pas finie. */
  narrow: "adapt",
  depth: 0,
  view: Home,
};
