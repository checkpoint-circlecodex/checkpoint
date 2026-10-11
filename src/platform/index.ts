/* Le point de contact unique de la couche du bas. Rien au-dessus n'importe
   `tauri.ts` ni `fake.ts` directement : le choix de l'adaptateur se fait ici,
   et il se fait une fois. */

export * from "./types.ts";
import { fakePlatform } from "./fake.ts";
import { inShell, tauriPlatform } from "./tauri.ts";
import type { Platform } from "./types.ts";

export { fakePlatform, inShell };

let current: Platform | null = null;

/** Dans la coque, le vrai. Hors coque — un navigateur sur le serveur de
    développement — le faux, sinon rien ne répond et on perd une heure à
    chercher pourquoi la page est vide. */
export function platform(): Platform {
  return (current ??= inShell() ? tauriPlatform() : fakePlatform(devSeed()));
}

/** Permet à un essai de poser son propre monde. */
export function usePlatform(p: Platform) { current = p; }

function devSeed(): Record<string, string> {
  return {
    "data/ncarmichael.json": JSON.stringify({
      schemaVersion: 1,
      user: { id: "ncarmichael", firstName: "Nathan", handle: "Nath", circle: "mage" },
      updatedAt: new Date().toISOString(),
      works: {}, entries: {},
    }),
  };
}
