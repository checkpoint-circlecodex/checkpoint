/* Le lexique des états.

   ⚠️ *Révisé le 29 octobre, à la demande de Nathan* : **les quatre mêmes mots
   pour toutes les natures** — Convoité, Entrepris, Achevé, Renoncé. Le
   lexique était accordé par nature (un film « Entamé » puis « Contemplé »,
   un livre « En lecture » puis « Lu », une série au féminin) ; à côté du
   Tableau, où une case dit un état d'un seul mot pour toutes les natures,
   la fiche d'un film semblait parler d'autre chose. Un état se reconnaît
   mieux s'il porte toujours le même nom. La table reste indexée par nature :
   si un accord revient un jour, il se pose ici, sans toucher aux vues. */

import type { CircleId, MediaType, Status } from "./schema.ts";

const STATES: Record<Status, string> = { wishlist:"Convoité", playing:"Entrepris", completed:"Achevé", dropped:"Renoncé" };
export const STATUS: Record<MediaType, Record<Status, string>> =
  { game: STATES, film: STATES, series: STATES, book: STATES };

/** Les verbes du fil des inscriptions suivent les mêmes mots : « a contemplé »
    à côté d'une case « Achevé » aurait recréé l'écart qu'on vient de fermer. */
const VERBS: Record<Status, string> = { completed:"a achevé", dropped:"a renoncé à", playing:"a entrepris", wishlist:"convoite" };
export const VERB: Record<MediaType, Record<Status, string>> =
  { game: VERBS, film: VERBS, series: VERBS, book: VERBS };

export const KIND:  Record<MediaType, string> = { game:"Jeu",  film:"Film",  series:"Série",  book:"Livre"  };
export const KINDS: Record<MediaType, string> = { game:"Jeux", film:"Films", series:"Séries", book:"Livres" };
export const UNIT: Record<string, string> = { hours:" h", episodes:" ép.", pages:" p.", chapters:" ch." };
/** Ce qu'on compte pour avancer dans une œuvre. Un film ne se compte pas :
    on l'a vu, ou pas. */
export const UNIT_OF: Record<MediaType, "hours" | "episodes" | "pages" | null> =
  { game: "hours", film: null, series: "episodes", book: "pages" };
export const UNIT_LBL: Record<string, string> = { hours: "heures", episodes: "épisodes", pages: "pages", chapters: "chapitres" };

/** **L'ordre des états, un seul, partout : le présent d'abord** — Entrepris,
    Achevé, Renoncé, Convoité. Tranché par Nathan le 29 octobre. Il y en avait
    deux : celui-ci pour les listes, et le cycle de vie (convoité d'abord) pour
    les choix de la fiche, de la bulle et la légende — personne ne l'avait
    décidé, et les deux se voyaient côte à côte. */
export const ORDER: Status[] = ["playing", "completed", "dropped", "wishlist"];

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
