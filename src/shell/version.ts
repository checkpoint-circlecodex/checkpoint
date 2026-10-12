/* Comparer deux versions. Écrit ici plutôt qu'importé : trois nombres et
   une préversion, ça ne vaut pas une dépendance. */

const parts = (v: string) => {
  const [core, pre = ""] = v.trim().replace(/^v/, "").split("-", 2);
  return { n: core.split(".").map(x => parseInt(x, 10) || 0), pre };
};

/** Vrai si `remote` est **strictement plus récente** que `local`. Une
    préversion passe avant la version qu'elle précède : 0.2.0-rc.1 < 0.2.0. */
export function newer(remote: string, local: string): boolean {
  const a = parts(remote), b = parts(local);
  for (let i = 0; i < 3; i++) {
    const d = (a.n[i] ?? 0) - (b.n[i] ?? 0);
    if (d) return d > 0;
  }
  if (a.pre === b.pre) return false;
  if (!a.pre) return true;     // 0.2.0 après 0.2.0-rc.1
  if (!b.pre) return false;
  return a.pre.localeCompare(b.pre, "en", { numeric: true }) > 0;
}
