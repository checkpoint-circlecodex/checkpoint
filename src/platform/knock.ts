/* Le format d'une demande d'adhésion, écrit **une seule fois** : l'écran
   d'entrée le compose, le Greffe le relit. Un marqueur en commentaire HTML
   la distingue des autres issues — invisible sur GitHub, sans ambiguïté
   pour l'application.

   Pourquoi pas une étiquette : un compte extérieur à l'organisation n'a pas
   le droit d'en poser. Le marqueur, lui, voyage avec le texte. */

export const KNOCK_MARK = "<!-- checkpoint:knock v1 -->";

export type KnockFields = { firstName: string; vouchedName: string; vouchedAs: string; discord: string };

export const knockTitle = (login: string) => `Demande d'adhésion — @${login}`;

export function knockBody(f: KnockFields): string {
  return [
    KNOCK_MARK,
    `prénom: ${f.firstName.trim()}`,
    `connu de: ${f.vouchedName.trim()}`,
    `à quel titre: ${f.vouchedAs.trim()}`,
    `discord: ${f.discord.trim()}`,
    "",
    "Cette demande a été ouverte depuis l'application Checkpoint. Un greffier la verra en l'ouvrant ; personne n'est averti.",
  ].join("\n");
}

/** Relit une demande. Rend `null` si ce n'est pas une demande — une issue
    ordinaire du dépôt public ne doit pas se retrouver au guichet. */
export function parseKnock(body: string | null | undefined): KnockFields | null {
  if (!body || !body.includes(KNOCK_MARK)) return null;
  const get = (k: string) => (body.match(new RegExp(`^${k}:[ \\t]*(.*)$`, "m"))?.[1] ?? "").trim();
  return { firstName: get("prénom"), vouchedName: get("connu de"), vouchedAs: get("à quel titre"), discord: get("discord") };
}
