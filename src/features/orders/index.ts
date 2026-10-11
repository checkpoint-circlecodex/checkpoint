import Orders from "./Orders.svelte";
import type { ViewEntry } from "$core/ui/registry.ts";
import { CIRCLES, roman } from "$core/model/lexicon.ts";
import { registre } from "$core/model/store.svelte.ts";
import { membersOf } from "$core/selectors/index.ts";

export const orders: ViewEntry = {
  id: "orders",
  label: "Les Ordres",
  href: "#/cercles",
  gl: "◎",
  narrow: "adapt",
  depth: 1,
  view: Orders,
  subs: () => CIRCLES.map(c => ({
    href: `#/cercles/${c.id}`,
    label: c.name,
    dot: c.color,
    n: roman(membersOf(registre.world, c.id).length),
  })),
};
