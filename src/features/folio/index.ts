import Folio from "./Folio.svelte";
import type { ViewEntry } from "$core/ui/registry.ts";

/** La fiche n'a pas de porte dans la barre : on y entre par une œuvre, jamais
    par un menu. Elle est au registre pour sa profondeur et sa dégradation. */
export const folio: ViewEntry = {
  id: "folio",
  label: "Fiche",
  href: "#/fiche/",
  gl: "❧",
  narrow: "stack",
  depth: 2,
  view: Folio,
};
