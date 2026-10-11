import Works from "./Works.svelte";
import type { ViewEntry } from "$core/ui/registry.ts";
import { KINDS } from "$core/model/lexicon.ts";
import { registre } from "$core/model/store.svelte.ts";
import { roman } from "$core/model/lexicon.ts";
import { tracked } from "$core/selectors/index.ts";

export const works: ViewEntry = {
  id: "works",
  label: "Les Œuvres",
  href: "#/media",
  gl: "❧",
  narrow: "adapt",
  depth: 1,
  view: Works,
  subs: () => (["game", "film", "series", "book"] as const).map(t => ({
    href: `#/media/t/${t}`,
    label: KINDS[t],
    n: roman(tracked(registre.world, t).length),
  })),
};
