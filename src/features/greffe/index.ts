import Greffe from "./Greffe.svelte";
import type { ViewEntry } from "#core/ui/registry.ts";
import { registre } from "#core/model/store.svelte.ts";

/** Troisième zone de la barre : ni agir, ni parcourir — **tenir**. Et `only`
    ne grise pas la porte, il la retire : pour qui n'a pas la charge, elle
    n'existe pas (invariant 32). */
export const greffe: ViewEntry = {
  id: "greffe",
  label: "Le Greffe",
  href: "#/greffe",
  gl: "✇",
  narrow: "stack",
  depth: 1,
  view: Greffe,
  hold: true,
  only: () => registre.steward,
};
