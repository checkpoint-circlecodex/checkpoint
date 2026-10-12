/* Le point de contact unique de la couche du bas. Rien au-dessus n'importe
   `tauri.ts` ni `fake.ts` : le choix de l'adaptateur se fait ici, une fois. */

export * from "./types.ts";
export * from "./knock.ts";
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
  /* Les quatre demandes du prototype, choisies pour leurs trois cas : un
     parrain qui se résout, un parrain qui ne désigne personne, aucun parrain. */
  const knock = (issue: number, login: string, at: string, firstName: string, vouchedName: string, vouchedAs: string, discord: string) =>
    ({ issue, login, at, firstName, vouchedName, vouchedAs, discord, url: `https://github.com/checkpoint-circlecodex/checkpoint/issues/${issue}` });
  /* `?dehors` : jouer quelqu'un qui arrive — pas de jeton, pas d'adhésion,
     et un greffier imaginaire qui admet la demande douze secondes après.
     **C'est une adresse de développement, pas une porte** : elle n'existe
     que hors de la coque, sur le faux. Le banc d'essai du prototype, lui,
     était un onglet de la barre — c'est ce qui ne devait pas survivre. */
  if (new URLSearchParams(location.search).has("dehors"))
    return (current = fakePlatform(files, "nouveau-venu", [], { outside: true, admitAfterMs: 12_000 }));
  return (current = fakePlatform(files, "ncarmichael", [
    knock(31, "sachab",       "2026-10-09T16:42:00Z", "Sacha",   "Marion", "ami", "sacha.b"),
    knock(28, "yann-delorme", "2026-10-07T07:05:00Z", "Yann",    "Alice",  "ami", ""),
    knock(22, "gaspard-h",    "2026-10-03T21:17:00Z", "Gaspard", "Hugo",   "ami", "gasp"),
    knock(17, "un-passant",   "2026-09-30T12:33:00Z", "",        "",       "",    ""),
  ]));
}

export const platform = (): Platform => {
  if (!current) throw new Error("bootPlatform() n'a pas encore été appelé");
  return current;
};

/** Permet à un essai de poser son propre monde. */
export function usePlatform(p: Platform) { current = p; }
