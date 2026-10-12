/* Les cinq principes du défilé, repris **tels quels** du prototype — qui
   fait foi. ⚠️ Écrits pour quelqu'un qui n'a jamais ouvert l'application :
   aucun mot de l'intérieur — ni fragment, ni palier, ni synchronisation —
   ces mots-là ne veulent rien dire avant d'avoir servi. Des exemples, pas
   des définitions.

   Chaque principe porte une vignette dessinée au trait, plate et
   monochrome : un principe illustré se retient, un principe écrit se saute.
   Les cinq disques d'Ordre sont la seule couleur, et c'est l'exception déjà
   consentie. */

import { CIRCLES } from "#core/model/lexicon.ts";

export type Creed = { n: string; t: string; d: string };

export const CREEDS: Creed[] = [
  { n:"I",  t:"Chacun son carnet",
    d:"Vous écrivez dans le vôtre, personne d'autre. Rien de ce que vous notez ne peut être effacé par quelqu'un, et rien ne se perd en route." },
  { n:"II", t:"Seul, ça n'a aucun intérêt",
    d:"Tout se passe à côté : qui a fini quoi, qui a adoré ce que vous avez détesté, et ce que vous feriez bien d'essayer." },
  { n:"III",t:"Cinq Ordres",
    d:"Vous en choisissez un. Il ne vous limite en rien : il vous donne une couleur, une salle, et des gens avec qui vous serez comparé." },
  { n:"IV", t:"Deux façons d'en parler",
    d:"Une pensée jetée en chemin, ou une critique écrite à la fin. La première n'engage à rien, la seconde porte un titre et se lit." },
  { n:"V",  t:"Des défis qui se remplissent seuls",
    d:"Quelqu'un en pose un — finir ces sept livres, commencer ces quatre jeux. Personne ne valide : il se coche à mesure que vous avancez." },
];

/** Les vignettes. Du SVG écrit à la main dans le prototype, et rien d'autre
    ne s'y injecte : aucune donnée de personne n'y passe. */
export const CREED_ART: Record<string, string> = {
  I: `<svg viewBox="0 0 132 62" aria-hidden="true">
    ${[0,1,2,3].map(k => `<g transform="translate(${8 + k*32} 10)">
      <rect class="${k===1?"ink":"rule"}" x="0" y="0" width="24" height="42" />
      ${[8,15,22,29].map(y => `<line class="rule" x1="5" y1="${y}" x2="19" y2="${y}" />`).join("")}
      <circle class="${k===1?"fill":"rule"}" cx="12" cy="48" r="2.4" />
    </g>`).join("")}</svg>`,
  II: `<svg viewBox="0 0 132 62" aria-hidden="true">
    ${[0,1,2,3,4].map(k => `<line class="rule" x1="10" y1="${10+k*10}" x2="${46 - (k%2)*12}" y2="${10+k*10}" />`).join("")}
    ${[0,1,2,3,4].map(k => `<line class="rule" x1="86" y1="${10+k*10}" x2="${122 - ((k+1)%2)*12}" y2="${10+k*10}" />`).join("")}
    ${[1,3].map(k => `<line class="ink" x1="48" y1="${10+k*10}" x2="84" y2="${10+k*10}" />`).join("")}
    <circle class="fill" cx="66" cy="20" r="2.6" /><circle class="fill" cx="66" cy="40" r="2.6" /></svg>`,
  III: `<svg viewBox="0 0 132 62" aria-hidden="true">
    ${CIRCLES.map((c, k) => `<circle cx="${18 + k*24}" cy="${31 + (k%2?5:-5)}" r="9"
      fill="${c.hex}" opacity=".5" /><circle cx="${18 + k*24}" cy="${31 + (k%2?5:-5)}" r="9"
      fill="none" stroke="${c.hex}" stroke-width="1" opacity=".9" />`).join("")}</svg>`,
  IV: `<svg viewBox="0 0 132 62" aria-hidden="true">
    <line class="rule" x1="10" y1="18" x2="122" y2="18" stroke-dasharray="2 4" />
    ${[0,1,2,3].map(k => `<circle class="fill" cx="${18 + k*26}" cy="18" r="2.6" />`).join("")}
    <rect class="ink" x="86" y="30" width="36" height="24" />
    ${[37,43,49].map(y => `<line class="rule" x1="91" y1="${y}" x2="117" y2="${y}" />`).join("")}</svg>`,
  V: `<svg viewBox="0 0 132 62" aria-hidden="true">
    <g transform="rotate(-2 40 28)"><rect class="rule" x="14" y="8" width="52" height="30" />
      <line class="rule" x1="20" y1="18" x2="54" y2="18" /><line class="rule" x1="20" y1="26" x2="46" y2="26" />
      <line class="rule" x1="40" y1="38" x2="40" y2="52" /></g>
    <g transform="rotate(2 96 28)"><rect class="fill" x="70" y="8" width="52" height="30" />
      <line class="paper" x1="76" y1="18" x2="110" y2="18" /><line class="paper" x1="76" y1="26" x2="102" y2="26" />
      <line class="ink" x1="96" y1="38" x2="96" y2="52" /></g></svg>`,
};
