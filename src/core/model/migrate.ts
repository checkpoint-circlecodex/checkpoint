/* Les migrations vivent ici, et elles sont **montantes seulement**.
   Il n'y a pas de serveur pour migrer rétroactivement (invariant 3) : chaque
   client répare ce qu'il lit, en mémoire, à chaque ouverture.

   Deux règles qui ne se discutent pas :
   · **on n'enlève jamais un champ, on en ajoute** (invariant 4) — donc une
     migration ne supprime rien, elle complète ;
   · **on n'écrit pas le fichier d'un autre** (invariant 1) — une migration ne
     réécrit donc jamais le fragment d'autrui, même « pour l'aider ». Elle
     corrige la copie en mémoire, et c'est tout. */

import { SCHEMA_VERSION, type Shard } from "./schema.ts";

type Step = { to: number; apply: (s: Record<string, unknown>) => void };

/* Aucune migration à ce jour : le schéma n'a qu'une version. Le mécanisme est
   là d'avance parce qu'il est pénible à ajouter après coup — il faudrait
   alors deviner ce qu'étaient les anciens fichiers. */
const STEPS: Step[] = [];

export class SchemaTooNew extends Error {
  found: number;
  constructor(found: number) {
    super(`Ce fragment est en version ${found}, l'application en lit ${SCHEMA_VERSION}. Mets-la à jour.`);
    this.name = "SchemaTooNew";
    this.found = found;
  }
}

export function migrate(raw: unknown): Shard {
  const s = raw as Record<string, unknown>;
  const v = typeof s.schemaVersion === "number" ? s.schemaVersion : 1;

  /* **Un fragment plus récent que l'application ne se devine pas.** On
     refuse de le lire plutôt que d'en afficher une version amputée : le
     bandeau « nouvelle version disponible » existe pour ce cas. */
  if (v > SCHEMA_VERSION) throw new SchemaTooNew(v);

  for (const step of STEPS) if (v < step.to) step.apply(s);
  s.schemaVersion = SCHEMA_VERSION;

  /* Les sections facultatives sont normalisées ici, une fois, pour que rien
     au-dessus n'ait à écrire `?? []` cinquante fois. */
  s.works ??= {};
  s.entries ??= {};
  return s as unknown as Shard;
}
