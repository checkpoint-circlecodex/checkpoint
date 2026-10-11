/* **Les catégories reprennent le vocabulaire des sources.** IGDB pour les
   jeux, TMDb pour les films et les séries — puisque c'est de là que viendra
   l'identité des œuvres, les genres arriveront **déjà mappés**, sans table de
   correspondance à maintenir.

   IGDB distingue deux axes et la distinction est juste : « tir » ou
   « simulation » dit **la forme**, « horreur » ou « romance » dit **le
   sujet**. Les livres n'ont aucune autorité unique : leur liste est la nôtre,
   et c'est assumé.

   ⚠️ La liste des thèmes IGDB a été écrite de mémoire et reste à confirmer —
   signalé dans `docs/ETAT.md`. */

import type { MediaType } from "./schema.ts";

export type GenreGroup = { g: string; l: string[] };

export const GENRES: Record<MediaType, GenreGroup[]> = {
  game: [
    { g:"Forme", l:["Aventure","Tir","Plateforme","Jeu de rôle","Stratégie",
      "Stratégie temps réel","Stratégie au tour par tour","Tactique","Simulation",
      "Réflexion","Course","Sport","Combat","Hack'n'slash","Point-and-click",
      "Visual novel","Cartes et plateau","MOBA","Arcade","Musique","Quiz",
      "Flipper","Indépendant"] },
    { g:"Thème", l:["Action","Monde ouvert","Survie","Horreur","Infiltration",
      "Science-fiction","Fantasy","Historique","Guerre","Mystère","Thriller",
      "Drame","Comédie","Romance","Gestion","Bac à sable","Entre amis","4X",
      "Éducatif","Enfants","Documentaire"] },
  ],
  film: [
    { g:"Genre", l:["Action","Aventure","Animation","Comédie","Crime","Documentaire",
      "Drame","Familial","Fantastique","Histoire","Horreur","Musique","Mystère",
      "Romance","Science-fiction","Thriller","Guerre","Western","Téléfilm"] },
  ],
  series: [
    { g:"Genre", l:["Action & aventure","Animation","Comédie","Crime","Documentaire",
      "Drame","Familial","Enfants","Mystère","Science-fiction & fantastique",
      "Guerre & politique","Western","Téléréalité","Feuilleton","Talk-show","Actualités"] },
    { g:"Forme", l:["Mini-série","Anthologie"] },
  ],
  book: [
    { g:"Genre", l:["Roman","Littérature générale","Science-fiction","Fantasy","Horreur",
      "Policier","Thriller","Romance","Historique","Aventure","Satire","Conte","Jeunesse"] },
    { g:"Forme", l:["Essai","Récit","Biographie","Autobiographie","Poésie","Nouvelles",
      "Théâtre","Roman graphique","Bande dessinée","Manga","Correspondance"] },
  ],
};

export const genreGroups = (t: MediaType): GenreGroup[] => GENRES[t] ?? GENRES.film;
export const genresFor = (t: MediaType): string[] => genreGroups(t).flatMap(x => x.l);

/** **Toute valeur déjà consignée hors liste reste choisissable**, sinon une
    simple édition l'efface. On la range sous « Déjà consigné » plutôt que de
    la faire disparaître. */
export function groupsWithLegacy(t: MediaType, chosen: Iterable<string>): GenreGroup[] {
  const known = new Set(genresFor(t));
  const extra = [...chosen].filter(g => !known.has(g));
  return extra.length ? [...genreGroups(t), { g: "Déjà consigné", l: extra }] : genreGroups(t);
}
