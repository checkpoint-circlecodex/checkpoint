/* Le visage qu'on se compose. **Le portrait ne vient plus de GitHub** : un
   fond pris dans une palette fermée, un emblème, un prénom. GitHub
   n'identifie plus que le compte. */

/** Seize fonds, et aucun qui frôle les cinq teintes d'Ordre : un visage est
    personnel, une couleur d'Ordre est collective, et les confondre ferait un
    faux signal dans toutes les listes. */
export const TONES = [
  "#C9D4E8","#A8C0DE","#8FA8C8","#BFD6C9","#9DC3AE","#7FA894",
  "#E4D6B8","#D9BE8C","#C2A878","#E6C9C4","#D9A9A2","#C08E88",
  "#D6CBE4","#B9A8D1","#D8D5CE","#AFACA4",
];

/** L'emblème est le seul trait de caractère qu'on se donne : il en faut assez
    pour que personne ne tombe sur celui du voisin. */
export const SIGNS: { g: string; l: string[] }[] = [
  { g:"Bêtes", l:["🦊","🦉","🐺","🐙","🦝","🐉","🕊️","🦌","🦜","🐈","🦔","🦢",
                  "🐝","🦋","🦇","🐋","🦈","🐿️","🦦","🐢","🦅","🦚","🐍","🦂",
                  "🐌","🦭","🐏","🦬"] },
  { g:"Ciel et terre", l:["🌙","⭐","☄️","🔥","🌊","🍃","🌲","🏔️","🌵","🪨","❄️","🌸",
                          "🍄","🌿","🌾","🐚","⛰️","🌋"] },
  { g:"Objets", l:["⚓","🗝️","🕯️","🪶","⚔️","🛡️","🏹","📕","🔮","⚗️","🎻","🧭",
                   "⏳","🪞","🍷","🧵","🔔","🪓","📯","🗡️"] },
  { g:"Signes", l:["✦","✧","✶","❖","◆","◇","▲","△","⬟","⬢","☽","✠","⚜","⚑","☗","✺"] },
];

export const SIGN_COUNT = SIGNS.reduce((n, f) => n + f.l.length, 0);

/** À quel titre on vous connaît. */
export const VOUCHED_AS = ["Ami", "Père", "Enfant"];
