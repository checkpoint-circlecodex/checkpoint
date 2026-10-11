import Soul from "./Soul.svelte";
import type { ViewEntry } from "#core/ui/registry.ts";

/** « Ma Feuille » ne figure pas dans la barre : le visage en bas y mène déjà,
    et deux portes pour la même pièce, c'est une porte de trop. */
export const soul: ViewEntry = {
  id: "soul",
  label: "Feuille",
  href: "#/personne/",
  gl: "◉",
  narrow: "tabs",
  depth: 3,
  view: Soul,
};
