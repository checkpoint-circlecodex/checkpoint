/* La coque rassemble les blocs. **C'est le seul endroit qui les connaît
   tous** — et elle ne connaît de chacun que sa ligne de registre. */

import type { ViewEntry } from "$core/ui/registry.ts";
import type { MediaType } from "$core/model/schema.ts";
import { home } from "$features/home/index.ts";
import { works } from "$features/works/index.ts";

export const REGISTRY: ViewEntry[] = [works];
export const HOME = home;

export type Route = { entry: ViewEntry; props: Record<string, unknown>; key: string };

/** La profondeur décide du geste, pas le goût : zoom si elle change,
    glissement latéral sinon. */
export function route(hash: string): Route {
  const h = hash || "#/";
  if (h.startsWith("#/media/t/")) {
    const kind = h.slice(10) as MediaType;
    return { entry: works, props: { kind }, key: h };
  }
  if (h.startsWith("#/media")) return { entry: works, props: { kind: null }, key: "#/media" };
  return { entry: home, props: {}, key: "#/" };
}
