/* Le format d'un signalement de défaut, écrit **une seule fois** — comme
   celui d'une demande d'adhésion (`knock.ts`). Un marqueur en commentaire
   HTML le distingue des autres issues du dépôt public : invisible sur
   GitHub, sans ambiguïté pour l'application. */

export const REPORT_MARK = "<!-- checkpoint:defaut v1 -->";

export type ReportFields = { what: string; expected: string; where: string; version: string; system: string };

/** Le titre : la première ligne de ce qui ne va pas, assez courte pour se
    lire dans une liste. */
export function reportTitle(what: string): string {
  const first = what.trim().split("\n")[0].trim();
  return `Défaut — ${first.length > 70 ? first.slice(0, 69) + "…" : first}`;
}

export function reportBody(f: ReportFields): string {
  return [
    REPORT_MARK,
    "**Ce qui ne va pas**",
    f.what.trim(),
    "",
    ...(f.expected.trim() ? ["**Ce qui était attendu**", f.expected.trim(), ""] : []),
    ...(f.where.trim() ? ["**Où**", f.where.trim(), ""] : []),
    `version: ${f.version}`,
    `système: ${f.system}`,
    "",
    "Signalé depuis l'application Checkpoint.",
  ].join("\n");
}

/** Relit un signalement — `null` si l'issue n'en est pas un. */
export function parseReport(body: string | null | undefined): { version: string; system: string } | null {
  if (!body || !body.includes(REPORT_MARK)) return null;
  const get = (k: string) => (body.match(new RegExp(`^${k}:[ \\t]*(.*)$`, "m"))?.[1] ?? "").trim();
  return { version: get("version"), system: get("système") };
}
