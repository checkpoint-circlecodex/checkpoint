/* Le point de contact unique de la couche du bas. Rien au-dessus n'importe
   `tauri.ts` ni `fake.ts` : le choix de l'adaptateur se fait ici, une fois. */

export * from "./types.ts";
import { fakePlatform } from "./fake.ts";
import { inShell, tauriPlatform } from "./tauri.ts";
import type { Platform } from "./types.ts";

export { fakePlatform, inShell };

let current: Platform | null = null;

/** Dans la coque, le vrai. Hors coque — un navigateur sur le serveur de
    développement — le faux garni du jeu d'essai, sinon la page est vide et
    on perd une heure à chercher pourquoi.

    L'amorçage est **asynchrone** pour que le jeu d'essai soit chargé à la
    demande : il pèse 43 Ko, et il n'a rien à faire dans le binaire livré. */
export async function bootPlatform(): Promise<Platform> {
  if (current) return current;
  if (inShell()) return (current = tauriPlatform());
  const { default: seed } = await import("./dev/seed.json");
  const files: Record<string, string> = {};
  for (const sh of seed as { user: { id: string } }[])
    files[`data/${sh.user.id}.json`] = JSON.stringify(sh);
  return (current = fakePlatform(files));
}

export const platform = (): Platform => {
  if (!current) throw new Error("bootPlatform() n'a pas encore été appelé");
  return current;
};

/** Permet à un essai de poser son propre monde. */
export function usePlatform(p: Platform) { current = p; }
