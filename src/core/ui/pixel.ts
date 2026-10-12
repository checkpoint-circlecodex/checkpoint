/* Ce que partagent les dessins en pixel art — promus ici dès le deuxième
   dessin, comme le veut la règle de promotion (invariant 13).

   **La rampe entière reste claire**, du gris moyen au gris pâle. Jamais de
   noir : il tamponnerait le papier au lieu de le dessiner, et c'est le
   défaut le plus tenace des premiers jets. */
export const GREY = ["#6E6E64", "#929187", "#B2B1A7", "#D6D5CC"];

/** Un générateur à graine fixe : **une scène se compose, elle ne se tire pas
    au sort** — et elle doit être la même à chaque ouverture. */
export const rng = (seed: number) => {
  let x = (seed >>> 0) || 1;
  return () => (x = (x * 1664525 + 1013904223) >>> 0) / 4294967296;
};
