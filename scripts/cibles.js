/* Balayage des cibles — à coller dans la console du serveur de développement.
 *
 * Invariant 20 : cibles d'au moins 44 px partout, bureau compris. Quatre
 * passes d'affilée ont trouvé une cible oubliée par la passe précédente — la
 * mesure ne vit donc plus dans ma mémoire mais ici. Il parcourt chaque route,
 * ouvre chaque volet, et rend ce qui est trop petit et ce qui déborde.
 *
 * Le refaire à 375 px de large (émulation mobile) : l'étroit a ses propres
 * cibles, qui n'existent pas en large.
 */
(async () => {
  const ROUTES = ["#/", "#/media", "#/media/t/book", "#/fiche/g-elden", "#/cercles",
    "#/cercles/mage", "#/personne/jfaure", "#/profil", "#/quetes", "#/quete/q-eveils"];
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const zone = () => document.querySelector(".stage .layer:not(.ghost)");
  const scan = () => {
    const z = zone();
    const small = [...z.querySelectorAll("a,button,input,textarea,select,[role=tab]")]
      .filter(e => { const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0 && b.height < 44; })
      .map(e => `${e.tagName.toLowerCase()}.${(e.className + "").split(" ").find(c => !c.startsWith("svelte")) ?? "-"} ${Math.round(e.getBoundingClientRect().height)} px`);
    return { small, over: z.scrollWidth - z.clientWidth };
  };
  const out = {};
  for (const h of ROUTES) {
    location.hash = h; await wait(900);
    const r = scan(); const small = [...r.small]; let over = r.over;
    for (const t of [...document.querySelectorAll('.stage .layer:not(.ghost) [role="tab"]')].slice(1)) {
      t.click(); await wait(500);
      const x = scan(); small.push(...x.small); over = Math.max(over, x.over);
    }
    const u = [...new Set(small)];
    if (u.length || over > 0) out[h] = { trop_petites: u, debordement_px: over };
  }
  console.table(Object.keys(out).length ? out : { tout: "≥ 44 px, aucun débordement" });
  return out;
})();
