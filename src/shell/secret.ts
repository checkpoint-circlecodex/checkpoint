/* La séquence qui ouvre l'établi : **cinq clics sur deux boutons invisibles**,
   dans la zone floutée quand le volet est déplié — la demande de Nathan,
   le 11 octobre, réservée à l'atelier et jamais à l'autorité.

   La séquence est **gauche, droite, gauche, droite, gauche**, sans pause de
   plus d'une seconde et demie entre deux clics. Un clic hors séquence la
   remet à zéro — mais s'il est lui-même un bon départ, il compte comme tel :
   on ne punit pas une reprise. */

export type Side = "g" | "d";

export const SEQUENCE: Side[] = ["g", "d", "g", "d", "g"];
export const MAX_GAP_MS = 1500;

export function makeSecret(seq: Side[] = SEQUENCE, gap = MAX_GAP_MS) {
  let at = 0;
  let last = -Infinity;
  /** Rend `true` quand la séquence vient d'être complétée. */
  return (side: Side, now: number): boolean => {
    if (now - last > gap) at = 0;
    last = now;
    if (side === seq[at]) at++;
    else at = side === seq[0] ? 1 : 0;
    if (at === seq.length) { at = 0; return true; }
    return false;
  };
}
