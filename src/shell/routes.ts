/* La coque rassemble les blocs. **C'est le seul endroit qui les connaît
   tous** — et elle ne connaît de chacun que sa ligne de registre. */

import type { ViewEntry } from "#core/ui/registry.ts";
import type { CircleId, MediaType } from "#core/model/schema.ts";
import { registre } from "#core/model/store.svelte.ts";
import { home } from "#features/home/index.ts";
import { works } from "#features/works/index.ts";
import { folio } from "#features/folio/index.ts";
import { orders } from "#features/orders/index.ts";
import { soul } from "#features/soul/index.ts";
import { quest, quests } from "#features/quests/index.ts";

export const REGISTRY: ViewEntry[] = [orders, works, quests];
export const HOME = home;

export type Route = { entry: ViewEntry; props: Record<string, unknown>; key: string; depth: number };

/** **La profondeur décide du geste**, et elle se déclare route par route :
    zoom si elle change, glissement latéral sinon. Le type l'exige, et c'est
    volontaire — une route qui ne sait pas à quelle profondeur elle est
    produirait un geste au hasard, donc un geste qui ne veut plus rien dire. */
export function route(hash: string): Route {
  const h = hash || "#/";
  if (h.startsWith("#/quete/"))
    return { entry: quest, props: { id: h.slice(8) }, key: h, depth: 2 };
  if (h.startsWith("#/quetes"))
    return { entry: quests, props: {}, key: "#/quetes", depth: 1 };
  if (h.startsWith("#/personne/"))
    return { entry: soul, props: { id: h.slice(11) }, key: h, depth: 3 };
  if (h.startsWith("#/profil"))
    return { entry: soul, props: { id: registre.me ?? "" }, key: "#/profil", depth: 3 };
  if (h.startsWith("#/fiche/"))
    return { entry: folio, props: { id: h.slice(8) }, key: h, depth: 2 };
  if (h.startsWith("#/cercles/"))
    return { entry: orders, props: { cid: h.slice(10) as CircleId }, key: h, depth: 2 };
  if (h.startsWith("#/cercles"))
    return { entry: orders, props: { cid: null }, key: "#/cercles", depth: 1 };
  if (h.startsWith("#/media/t/"))
    return { entry: works, props: { kind: h.slice(10) as MediaType }, key: h, depth: 1 };
  if (h.startsWith("#/media"))
    return { entry: works, props: { kind: null }, key: "#/media", depth: 1 };
  return { entry: home, props: {}, key: "#/", depth: 0 };
}
