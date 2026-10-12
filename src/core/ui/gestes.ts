/* **Les gestes que plusieurs blocs offrent et qu'un seul sait faire.**
   Inscrire une œuvre se propose dans la barre, sur la page des Œuvres et sur
   un accueil vide — mais c'est le bloc d'inscription qui sait le faire, et
   deux blocs ne se connaissent jamais (invariant 11).

   D'où ce registre : **la coque y inscrit ce que fait chaque geste**, au
   démarrage, et les blocs l'appellent sans savoir qui répond. Un geste que
   personne n'a inscrit vaut `null` — et le bouton qui l'offrirait ne
   s'affiche pas, plutôt que de ne rien faire. */

type Geste = () => void;

export const gestes: { inscrire: Geste | null; signaler: Geste | null } = { inscrire: null, signaler: null };
