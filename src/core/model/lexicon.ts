/* Le lexique, accordé par nature d'œuvre : une série est achevée, un film
   contemplé. **Une seule formulation neutre au milieu et tout sonne faux** —
   c'est pour ça que ce n'est pas une table de verbes génériques. */

import type { CircleId, MediaType, Status } from "./schema.ts";

export const STATUS: Record<MediaType, Record<Status, string>> = {
  game:   { wishlist:"Convoité",  playing:"Entrepris",  paused:"Suspendu",  completed:"Achevé",    mastered:"Accompli",  dropped:"Renoncé" },
  film:   { wishlist:"Convoité",  playing:"Entamé",     paused:"Suspendu",  completed:"Contemplé", mastered:"Consacré",  dropped:"Renoncé" },
  series: { wishlist:"Convoitée", playing:"Entreprise", paused:"Suspendue", completed:"Achevée",   mastered:"Consacrée", dropped:"Renoncée" },
  book:   { wishlist:"Convoité",  playing:"En lecture", paused:"Suspendu",  completed:"Lu",        mastered:"Médité",    dropped:"Renoncé" },
};

export const VERB: Record<MediaType, Record<Status, string>> = {
  game:   { completed:"a achevé",    mastered:"a accompli", dropped:"a renoncé à", playing:"a entrepris", paused:"a suspendu", wishlist:"convoite" },
  film:   { completed:"a contemplé", mastered:"a consacré", dropped:"a renoncé à", playing:"a entamé",    paused:"a suspendu", wishlist:"convoite" },
  series: { completed:"a achevé",    mastered:"a consacré", dropped:"a renoncé à", playing:"a entrepris", paused:"a suspendu", wishlist:"convoite" },
  book:   { completed:"a lu",        mastered:"a médité",   dropped:"a renoncé à", playing:"a entamé",    paused:"a suspendu", wishlist:"convoite" },
};

export const KIND:  Record<MediaType, string> = { game:"Jeu",  film:"Film",  series:"Série",  book:"Livre"  };
export const KINDS: Record<MediaType, string> = { game:"Jeux", film:"Films", series:"Séries", book:"Livres" };
export const UNIT: Record<string, string> = { hours:" h", episodes:" ép.", pages:" p.", chapters:" ch." };

/** L'ordre d'affichage d'une liste d'inscriptions : le présent d'abord. */
export const ORDER: Status[] = ["playing", "completed", "mastered", "paused", "dropped", "wishlist"];
/** L'ordre du cycle de vie, pour un sélecteur d'état. */
export const STATE_ORDER: Status[] = ["wishlist", "playing", "paused", "completed", "mastered", "dropped"];

export type Circle = {
  id: CircleId; name: string; one: string; order: string;
  emoji: string; color: string; hex: string; blurb: string;
};

export const CIRCLES: Circle[] = [
  { id:"mage",     name:"Mages",     one:"Mage",     order:"Ordre des Mages",     emoji:"\u{1F52E}",
    color:"var(--mage)",     hex:"#3F6FB8", blurb:"Lisent les grimoires avant d'ouvrir la porte." },
  { id:"guerrier", name:"Guerriers", one:"Guerrier", order:"Ordre des Guerriers", emoji:"\u{1F6E1}️",
    color:"var(--guerrier)", hex:"#B5453A", blurb:"Entrent sans jamais consulter la carte." },
  { id:"ranger",   name:"Rangers",   one:"Ranger",   order:"Ordre des Rangers",   emoji:"\u{1F3F9}",
    color:"var(--ranger)",   hex:"#2F7D55", blurb:"Ne laissent aucun recoin derrière eux." },
  { id:"soigneur", name:"Soigneurs", one:"Soigneur", order:"Ordre des Soigneurs", emoji:"\u{1F54A}️",
    color:"var(--soigneur)", hex:"#A8762A", blurb:"Reviennent toujours finir ce qu'ils ont commencé." },
  { id:"barde",    name:"Bardes",    one:"Barde",    order:"Ordre des Bardes",    emoji:"\u{1F3B5}",
    color:"var(--barde)",    hex:"#6E4B9E", blurb:"Ne jouent rien sans en écrire la suite." },
];

export const circle = (id: CircleId): Circle => CIRCLES.find(c => c.id === id) ?? CIRCLES[0];

/* ---- chiffres et dates, ton cérémonieux ---- */

const ROM: [number, string][] = [[1000,"M"],[900,"CM"],[500,"D"],[400,"CD"],[100,"C"],[90,"XC"],
  [50,"L"],[40,"XL"],[10,"X"],[9,"IX"],[5,"V"],[4,"IV"],[1,"I"]];

export function roman(n: number): string {
  if (!n) return "—";
  let out = "";
  for (const [v, s] of ROM) while (n >= v) { out += s; n -= v; }
  return out;
}

export const dec = (n: number) => n.toFixed(1).replace(".", ",");

const RTF = new Intl.RelativeTimeFormat("fr", { numeric: "auto" });

export function ago(iso: string, now: Date = new Date()): string {
  const d = Math.round((new Date(iso).getTime() - now.getTime()) / 86400000);
  if (d > -1) return "ce jour";
  if (d > -7) return RTF.format(d, "day");
  if (d > -31) return RTF.format(Math.round(d / 7), "week");
  return RTF.format(Math.round(d / 30), "month");
}

export const dateShort = (iso: string) =>
  new Intl.DateTimeFormat("fr", { day: "2-digit", month: "short" }).format(new Date(iso));

export const dayName = (iso: string) =>
  new Intl.DateTimeFormat("fr", { weekday: "long", day: "numeric", month: "long" }).format(new Date(iso));

/** Le jour d'un horodatage se lit dans le fuseau de celui qui regarde.
    Découper la chaîne ISO donnait le jour UTC, et le fil de la Loge affichait
    deux fois le même séparateur autour de minuit. */
export function dayKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export const hhmm = (iso: string) =>
  new Intl.DateTimeFormat("fr", { hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

/** « de Éliot » ne se dit pas. L'élision fait partie du ton, pas du décor. */
export const de = (n: string) => /^[aeiouyàâéèêëîïôöûüh]/i.test(n) ? `d'${n}` : `de ${n}`;
