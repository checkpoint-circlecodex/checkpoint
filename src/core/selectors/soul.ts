/* **Une feuille doit dire qui on lit, pas seulement comment il s'appelle.**

   Sous le nom, une ligne engendrée des faits — et **chaque trait y porte une
   saillance, son écart à la norme**, de sorte que seuls les plus marquants
   sortent. Réciter les mêmes trois traits pour tout le monde produirait des
   feuilles interchangeables, ce qui est l'exact contraire du but.

   Pas de pronom : on ne connaît pas le genre, et on n'a pas à le demander. */

import { roman } from "../model/lexicon.ts";
import type { World } from "../model/world.ts";
import { favsOf, temper } from "./people.ts";
import { figures, rowsBy } from "./works.ts";

const KINDS_ART: Record<string, string> = {
  game: "des jeux", film: "des films", series: "des séries", book: "des livres",
};

export function soulLine(w: World, pid: string): string {
  const all = rowsBy(w, pid);
  const rs = all.filter(r => r.status !== "wishlist");
  if (rs.length < 3) return "Vient d'arriver. Tout reste à écrire.";

  const t = temper(w, all), f = figures(w, pid);
  const cps = rs.reduce((n, r) => n + (r.reflections?.length ?? 0), 0);
  const chr = rs.filter(r => r.review).length;

  const c: { s: number; t: string }[] = [];
  if (t.pref && t.prefShare > 0.52) c.push({ s: t.prefShare, t: `surtout ${KINDS_ART[t.pref]}` });
  if (t.sev !== null && Math.abs(t.sev) >= 0.35)
    c.push({ s: Math.abs(t.sev) / 2.2,
             t: t.sev < 0 ? "juge plus durement que l'Ordre" : "juge plus généreusement que l'Ordre" });
  /* « IV œuvres laissées en chemin » dit déjà « se lasse » : on ne met pas
     deux fois le même trait dans la même phrase. */
  if (t.rate >= t.grate || f.gone < 3)
    c.push({ s: 0.3 + Math.abs(t.rate - t.grate) * 2.2,
             t: t.rate >= t.grate ? "va au bout de ce qui est entrepris"
                                  : "se lasse plus souvent que les autres" });
  if (f.gone === 0 && rs.length > 5) c.push({ s: 1.1, t: "n'a jamais rien lâché" });
  else if (f.gone >= 3) c.push({ s: 0.6 + f.gone / 8, t: `${roman(f.gone)} œuvres laissées en chemin` });
  if (chr >= 3) c.push({ s: 0.55 + chr / 9, t: "écrit sur presque tout" });
  else if (!chr && rs.length > 6) c.push({ s: 0.85, t: "n'écrit jamais une ligne" });
  if (cps >= 3) c.push({ s: 0.75, t: "consigne ses pensées en chemin" });
  if (f.hours >= 150) c.push({ s: 0.5 + f.hours / 900, t: `${roman(f.hours)} heures au compteur` });
  if (favsOf(w, pid).length >= 4) c.push({ s: 0.5, t: "distingue beaucoup" });

  const bits = c.sort((a, b) => b.s - a.s).slice(0, 3).map(x => x.t);
  return bits.join(", ").replace(/^./, ch => ch.toUpperCase()) + ".";
}
