/* **La porte** : où en est quelqu'un qui ouvre l'application. Écrit sans
   aucune rune, pour que les essais la franchissent comme une personne le
   ferait — du seuil à l'entrée, sur le faux.

   L'ordre des écrans n'est pas un goût, c'est une contrainte : **le profil
   ne peut pas s'écrire avant l'admission**, faute de droits sur le dépôt.
   D'où : se connecter, frapper, attendre en se composant un visage — puis
   seulement, écrire. */

import { AuthError, type KnockFields, type MyKnock, type Platform } from "#platform/index.ts";
import type { CircleId, User } from "#core/model/schema.ts";

export type Verdict =
  | { door: "dehors" }
  | { door: "attente"; login: string; knock: MyKnock | null; invited: boolean }
  | { door: "membre"; login: string };

export async function examine(p: Platform): Promise<Verdict> {
  if (!(await p.session.has())) return { door: "dehors" };
  let login: string | null;
  try { login = await p.storage.me(); }
  catch (e) {
    /* Un jeton révoqué depuis GitHub : on l'oublie et on repart du seuil.
       Toute autre erreur remonte — une panne n'est pas une déconnexion. */
    if (e instanceof AuthError) { await p.session.forget(); return { door: "dehors" }; }
    throw e;
  }
  return login ? standing(p, login) : { door: "dehors" };
}

/** Où en est un compte connu. **Une invitation en attente s'accepte ici,
    sans rien demander** : c'est le geste qui manquerait à un inconnu, qui
    ne sait pas qu'un courriel de GitHub l'attend. */
export async function standing(p: Platform, login: string): Promise<Verdict> {
  let m = await p.org.membership();
  let refused = false;
  if (m === "pending") {
    try { await p.org.accept(); m = "active"; }
    catch { refused = true; }
  }
  if (m === "active") return { door: "membre", login };

  const knock = await p.org.myKnock(login);
  /* Admis, mais sans adhésion qu'on puisse lire ou accepter d'ici : soit
     GitHub refuse que l'application accepte à la place de la personne, soit
     l'invitation a expiré — GitHub la garde sept jours. Dans les deux cas,
     ça se règle sur GitHub, et l'écran le dira. */
  const invited = refused || (knock?.state === "closed" && knock.reason === "completed");
  return { door: "attente", login, knock, invited };
}

/** Ce qu'on compose en attendant. Il vit sur cette machine jusqu'à
    l'admission — on ne peut l'écrire nulle part ailleurs. */
export type Draft = {
  tone: string; sign: string; firstName: string; handle: string;
  discord: string; vouched: string; vouchedAs: string; circle: CircleId | null;
};

export const knockFields = (d: Draft): KnockFields =>
  ({ firstName: d.firstName, vouchedName: d.vouched, vouchedAs: d.vouchedAs, discord: d.discord });

/** L'identité qu'on écrira, **champ par champ** : jamais le brouillon
    répandu, qui ferait tomber dans le fichier ce qui n'a rien à y faire
    (« qui vous connaît » appartient à la demande, pas au profil). */
export function founding(login: string, d: Draft): User | null {
  const firstName = d.firstName.trim();
  if (!firstName || !d.circle) return null;
  const u: User = { id: login, firstName, handle: d.handle.trim(), circle: d.circle, tone: d.tone, sign: d.sign };
  if (d.discord.trim()) u.discord = d.discord.trim();
  return u;
}
