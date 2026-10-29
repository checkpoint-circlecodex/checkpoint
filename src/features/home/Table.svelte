<script lang="ts">
  /* **Le Tableau — la seconde face de l'accueil.** Les œuvres en lignes, les
     membres en colonnes, rangés par Ordre ; dans chaque case, où en est
     chacun, et sa note s'il en a donné une. Demandé par Nathan le
     29 octobre.

     Deux couleurs, et elles ne parlent pas de la même chose. **La colonne
     porte la teinte douce de son Ordre** : chacun a la sienne, aucune n'est
     choisie contre une autre — l'argument qui autorise déjà la lignée.
     **La case porte l'état, en couleur franche** : c'est elle qu'on lit.
     Les états **reprennent les teintes des Ordres, assumées** — vert, bleu,
     jaune, rouge — et ne s'y confondent pas : l'Ordre est un lavis à peine
     posé, l'état un aplat plein (Nathan, 29 octobre). **Le nom de l'Ordre
     n'est pas écrit** : la teinte de la colonne suffit à le dire.

     La colonne des titres ne quitte jamais l'écran au défilement
     horizontal, et la ligne des noms ne le quitte pas au défilement
     vertical : un tableur dont on perd les en-têtes n'est plus qu'une
     mosaïque.

     **Sa propre colonne vient en tête**, marquée à l'encre : on lit
     toujours le Tableau depuis soi. Et **c'est la seule où l'on agit** —
     toucher une de ses cases ouvre une bulle pour changer son état, ou
     inscrire l'œuvre si la case est vide. Le jugement, lui, se porte sur la
     fiche. Les cases des autres ne réagissent pas : on n'écrit jamais dans
     le fragment d'un autre (invariant 1), et une commande qui ne peut rien
     faire n'a pas à exister (invariant 32). */
  import { untrack } from "svelte";
  import { registre } from "#core/model/store.svelte.ts";
  import { Bubble, Face } from "#core/ui/index.ts";
  import { changerStatut, identity, inscrire } from "#core/model/acts.ts";
  import { KIND, KINDS, STATE_ORDER, STATUS, roman } from "#core/model/lexicon.ts";
  import { ledger, titleOf, tracked, unfollowed } from "#core/selectors/index.ts";
  import type { MediaType, Status } from "#core/model/schema.ts";
  import { vue } from "./side.svelte.ts";

  const w = $derived(registre.world);
  const pref = $derived(registre.titlePref);
  const me = $derived(registre.me ?? "");
  const L = $derived(ledger(w, { kind: vue.kind ?? undefined, pref, me, q: vue.q }));
  /* Une recherche qui ne trouve rien laisse la grille en place, champ
     compris : sinon on ne pourrait plus corriger ce qu'on a tapé. */
  const any = $derived(tracked(w).length > 0 || unfollowed(w).length > 0);
  /* Le filtre ne propose que les natures présentes : un choix qui mène à
     une grille vide n'est pas un choix. */
  const kinds = $derived((Object.keys(KINDS) as MediaType[]).filter(k => tracked(w, k).length || unfollowed(w, k).length));
  const firsts = $derived(new Set(L.bands.map((b, i) =>
    L.people[L.bands.slice(0, i).reduce((s, x) => s + x.n, 0)]?.id)));

  /* La légende parle au masculin du jeu ; chaque case, elle, dit le mot de
     sa nature (invariant du lexique) dans son nom accessible. La note, elle,
     ne se légende pas : un chiffre dans une case se lit tout seul. */
  const LEGEND: { st: Status; l: string }[] = STATE_ORDER.map(st => ({ st, l: STATUS.game[st] }));

  /* On revient où l'on était : ouvrir une œuvre puis revenir ne doit pas
     renvoyer en haut à gauche d'une grille de cinquante lignes. */
  let sheet = $state<HTMLElement | null>(null);
  $effect(() => {
    if (!sheet) return;
    untrack(() => { sheet!.scrollLeft = vue.x; sheet!.scrollTop = vue.y; });
  });
  const keep = () => { if (sheet) { vue.x = sheet.scrollLeft; vue.y = sheet.scrollTop; } };

  /* **Les colonnes qui attendent leur membre.** La grille ne s'arrête pas au
     dernier membre : elle va jusqu'au bord, en colonnes vides et sans
     couleur — un tableur a des colonnes avant d'avoir des noms (Nathan,
     29 octobre). On en compte assez pour remplir la feuille et pas une de
     plus : la dernière prend ce qui reste, sans faire défiler. On mesure la
     feuille, pas la fenêtre (invariant 21) — et sa largeur ne dépend pas de
     son contenu, donc compter ne relance pas le comptage. */
  let spare = $state(0);
  $effect(() => {
    const el = sheet, n = L.people.length;
    if (!el) return;
    const count = () => {
      const css = getComputedStyle(el);
      const wcol = parseFloat(css.getPropertyValue("--wcol")) || 250;
      const ccol = parseFloat(css.getPropertyValue("--ccol")) || 46;
      spare = Math.max(0, Math.floor((el.clientWidth - wcol - n * ccol) / ccol));
    };
    count();
    const ro = new ResizeObserver(count);
    ro.observe(el);
    return () => ro.disconnect();
  });
  const spares = $derived(Array.from({ length: spare }, (_, i) => i));

  const label = (pid: string, id: string) => {
    const r = L.cell[pid]?.[id], p = w.people[pid], m = w.catalog[id];
    if (!r || !p || !m) return "";
    return `${p.firstName} · ${STATUS[m.mediaType][r.status]}${typeof r.rating === "number" ? ` · ${r.rating}/10` : ""}`;
  };

  /* --- La bulle de sa propre colonne. --- */
  let open = $state<{ id: string; el: HTMLElement } | null>(null);
  const toggle = (id: string, e: MouseEvent) =>
    (open = open?.id === id ? null : { id, el: e.currentTarget as HTMLElement });
  function setStatus(id: string, st: Status) {
    const had = L.cell[me]?.[id];
    if (had?.status === st) { open = null; return; }
    /* Une case vide de sa colonne, c'est une œuvre qu'on n'a pas encore
       inscrite : on l'inscrit, avec son **identité seule** (invariant 37). */
    registre.act(had ? changerStatut(id, st) : inscrire(id, { status: st }, identity(w.catalog[id])));
    open = null;
  }
</script>

<div class="tab">
  <header class="head">
    <div class="eyebrow">Le Tableau</div>
    <h1>{L.works.length ? `${roman(L.works.length)} œuvres, ${roman(L.people.length)} registres` : "Le tableau est vide"}</h1>
    <div class="bar">
      <div class="legend" aria-label="Légende des cases">
        {#each LEGEND as x (x.st)}
          <span class="lg"><span class="sw st-{x.st}" aria-hidden="true"></span>{x.l}</span>
        {/each}
      </div>
      {#if kinds.length > 1}
        <div class="filt">
          <button class:on={!vue.kind} aria-pressed={!vue.kind} onclick={() => (vue.kind = null)}>Tout</button>
          {#each kinds as k (k)}
            <button class:on={vue.kind === k} aria-pressed={vue.kind === k} onclick={() => (vue.kind = k)}>{KINDS[k]}</button>
          {/each}
        </div>
      {/if}
    </div>
  </header>

  {#if any && L.people.length}
    <div class="sheet" bind:this={sheet} onscroll={keep}>
      <table>
        <thead>
          <tr class="ppl">
            <th class="corner" scope="col">
              <!-- Chercher dans les deux titres, quelle que soit la
                   préférence d'affichage (invariant 9). -->
              <label class="q"><span class="ql">Œuvre</span>
                <input type="search" bind:value={vue.q} placeholder="Chercher…" autocomplete="off" aria-label="Chercher une œuvre" />
              </label>
            </th>
            {#each L.people as p (p.id)}
              <th scope="col" class:first={firsts.has(p.id)} class:me={p.id === me} style="--c:{p.circleRef.color}">
                <a href="#/personne/{p.id}" title="{p.firstName}, {p.circleRef.one}">
                  <Face who={p} size="s" /><span class="nm">{p.firstName}</span>
                </a>
              </th>
            {/each}
            {#each spares as i (i)}<th class="spare" aria-hidden="true"></th>{/each}
          </tr>
        </thead>
        {#snippet line(id: string)}
          {@const m = w.catalog[id]}
          <tr>
            <th scope="row" class="w">
              <a href="#/fiche/{id}">
                <span class="t">{titleOf(w, id, pref)}</span>
                <span class="k">{KIND[m.mediaType]} · {m.year}</span>
              </a>
            </th>
            {#each L.people as p (p.id)}
              {@const r = L.cell[p.id]?.[id]}
              <td class:first={firsts.has(p.id)} class:me={p.id === me} style="--c:{p.circleRef.color}">
                {#if p.id === me}
                  <button class="sw {r ? `st-${r.status}` : 'empty'}" class:open={open?.id === id}
                          aria-label={r ? `${label(p.id, id)} — changer` : `Inscrire « ${titleOf(w, id, pref)} »`}
                          aria-expanded={open?.id === id} onclick={e => toggle(id, e)}>
                    {r ? (typeof r.rating === "number" ? r.rating : "") : "+"}
                  </button>
                {:else if r}
                  <span class="sw st-{r.status}" role="img" aria-label={label(p.id, id)} title={label(p.id, id)}>
                    {typeof r.rating === "number" ? r.rating : ""}
                  </span>
                {/if}
              </td>
            {/each}
            {#each spares as i (i)}<td class="spare"></td>{/each}
          </tr>
        {/snippet}
        <tbody>
          {#each L.works as id (id)}{@render line(id)}{/each}
        </tbody>
        {#if L.fonds.length}
          <!-- **Un blanc, puis le fonds** : ce que personne ne suit encore.
               Ses lignes sont vides, sauf la sienne, où chaque case inscrit
               l'œuvre — elle remonte alors au-dessus du blanc. -->
          <tbody class="fonds">
            <tr class="gap">
              <th scope="rowgroup" class="w"><span class="gl">Au fonds — personne ne les suit encore</span></th>
              <td colspan={L.people.length + spare}></td>
            </tr>
            {#each L.fonds as id (id)}{@render line(id)}{/each}
          </tbody>
        {/if}
      </table>
      {#if !L.works.length && !L.fonds.length}
        <p class="none miss">Aucune œuvre ne répond à « {vue.q.trim()} ».</p>
      {/if}
    </div>

    {#if open && w.catalog[open.id]}
      {@const id = open.id}
      {@const m = w.catalog[id]}
      {@const r = L.cell[me]?.[id]}
      <Bubble anchor={open.el} label="Ta position sur {titleOf(w, id, pref)}" close={() => (open = null)}>
        <div class="pk">
          <span class="pk-t"><b>{titleOf(w, id, pref)}</b> · {r ? "ta position" : "pas encore à ton registre"}</span>
          <div class="pk-l">
            {#each STATE_ORDER as st (st)}
              <button class="pk-b" class:on={r?.status === st} aria-pressed={r?.status === st} onclick={() => setStatus(id, st)}>
                <span class="pk-sw st-{st}" aria-hidden="true"></span>{STATUS[m.mediaType][st]}
              </button>
            {/each}
          </div>
          <a class="pk-a" href="#/fiche/{id}">{r ? "Juger sur la fiche" : "Ouvrir la fiche"} ›</a>
        </div>
      </Bubble>
    {/if}
  {:else}
    <p class="none">Personne n'a encore rien inscrit : le tableau se remplira à la première inscription.</p>
  {/if}
</div>

<style>
  /* **Les quatre états, en couleur franche** — la teinte de quatre Ordres,
     poussée à saturation : achevé dans le vert des Rangers, entrepris dans le
     bleu des Mages, convoité dans le jaune tiré de l'ocre des Soigneurs,
     renoncé dans le rouge des Guerriers. Un premier jet évitait ces teintes
     (jaune, turquoise, encre, hachure) ; Nathan a tranché : à 7 % sur la
     colonne, l'Ordre est trop léger pour qu'on confonde. C'est le seul
     endroit qui les montre ; elles restent ici tant qu'un second bloc n'en a
     pas besoin (invariant 13). */
  .tab, .pk {
    --st-wishlist: #ECAE1D; --st-playing: #246DDB; --st-completed: #1FA35F; --st-dropped: #DF3020;
    --wcol: 250px; --ccol: 46px;
  }
  .tab {
    display: flex; flex-direction: column; height: 100%; min-height: 0;
  }
  .st-wishlist  { background: var(--st-wishlist); color: var(--ink); }
  .st-playing   { background: var(--st-playing); color: var(--paper); }
  .st-completed { background: var(--st-completed); color: var(--paper); }
  .st-dropped   { background: var(--st-dropped); color: var(--paper); }

  .head { flex: none; padding: 30px 30px 14px 22px; }
  .eyebrow { font-size: 9px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; color: var(--faint); }
  h1 { font-family: var(--fs); font-weight: 400; font-size: 30px; line-height: 1.05; margin-top: 8px; }
  .bar { display: flex; align-items: center; flex-wrap: wrap; gap: 6px 22px; margin-top: 12px; }
  .legend { display: flex; flex-wrap: wrap; gap: 6px 14px; font-size: 11px; color: var(--dim); }
  .lg { display: inline-flex; align-items: center; gap: 6px; }
  .legend .sw { width: 22px; height: 18px; }
  .legend .n { font-size: 14px; }
  .filt { display: flex; flex-wrap: wrap; gap: 2px 4px; }
  .filt button { min-height: 44px; padding: 0 10px; font-size: 11px; font-weight: 600; color: var(--dim); }
  .filt button:hover { color: var(--ink); }
  .filt button.on { color: var(--ink); box-shadow: inset 0 -1.5px 0 var(--ink); }
  .none { padding: 0 30px 0 22px; font-size: 12.5px; color: var(--dim); font-style: italic; }

  /* La feuille défile dans les deux sens, **et c'est elle qui défile** :
     les en-têtes collants se règlent sur le conteneur qui défile, et un
     seul conteneur pour les deux sens est ce qui les fait tenir ensemble. */
  .sheet { flex: 1; min-height: 0; overflow: auto; border-top: 1px solid var(--rule); }
  table { border-collapse: separate; border-spacing: 0; }
  th, td { padding: 0; }

  /* Les en-têtes sont opaques : ce qui défile dessous ne doit pas s'y lire. */
  thead th { position: sticky; z-index: 2; background: var(--paper); }
  .ppl th { top: 0; }
  .corner {
    left: 0; z-index: 4 !important; width: var(--wcol); min-width: var(--wcol);
    vertical-align: bottom; text-align: left; border-bottom: 1.5px solid var(--ink); border-right: 1px solid var(--rule);
  }
  .q { display: flex; align-items: center; gap: 10px; padding: 0 8px 4px 12px; }
  .ql { flex: none; font-size: 9px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; color: var(--faint); }
  /* Le champ est une ligne d'instrument : un filet dessous, pas une boîte. */
  .q input { flex: 1; min-width: 0; min-height: 44px; border: none; border-bottom: 1px solid var(--rule2);
             background: none; outline: none; font-size: 12.5px; }
  .q input:focus { border-bottom-color: var(--ink); }
  .miss { padding: 18px 12px; }

  .ppl th { width: var(--ccol); min-width: var(--ccol); max-width: var(--ccol);
            background: color-mix(in srgb, var(--c) 18%, var(--paper)); border-bottom: 1.5px solid var(--ink); }
  /* L'angle est dans la même rangée que les noms, mais il n'a pas d'Ordre :
     la teinte d'Ordre, sans `--c`, devenait une couleur invalide — donc
     transparente —, et les titres défilaient en se lisant au travers (vu le
     29 octobre, après le retrait de la rangée des Ordres). Il reprend le
     papier, et sa largeur à lui. */
  .ppl th.corner { background: var(--paper); max-width: var(--wcol); }
  .ppl a { display: grid; justify-items: center; gap: 4px; padding: 7px 2px 6px; min-height: 44px; }
  .nm { max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        font-size: 10px; font-weight: 600; color: var(--ink2); }
  .ppl a:hover .nm { color: var(--ink); text-decoration: underline; text-underline-offset: 3px; }
  .first { border-left: 1px solid color-mix(in srgb, var(--c) 45%, var(--paper)); }

  /* La colonne des titres ne bouge qu'avec le défilement vertical. */
  .w { position: sticky; left: 0; z-index: 1; background: var(--paper); text-align: left;
       width: var(--wcol); min-width: var(--wcol); max-width: var(--wcol);
       border-bottom: 1px solid var(--rule); border-right: 1px solid var(--rule); }
  .w a { display: grid; align-content: center; min-height: 44px; padding: 4px 12px; }
  .t { font-family: var(--fs); font-weight: 400; font-size: 15.5px; line-height: 1.12;
       white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .k { font-size: 10px; color: var(--faint); }
  .w a:hover .t { text-decoration: underline; text-underline-offset: 3px; }
  tr:hover .w { background: var(--raise); }

  /* La colonne porte la teinte douce de son Ordre ; la case, l'état franc. */
  td { height: 44px; background: color-mix(in srgb, var(--c) 7%, var(--paper)); vertical-align: middle;
       border-bottom: 1px solid color-mix(in srgb, var(--c) 14%, var(--rule));
       border-right: 1px solid color-mix(in srgb, var(--c) 14%, var(--rule)); }
  tr:hover td { background: color-mix(in srgb, var(--c) 13%, var(--paper)); }
  /* **La case est le bloc** : sa couleur dit l'état, et la note se pose
     dessus. Un carré dans un carré faisait deux choses à lire pour une
     seule (Nathan, 29 octobre). Le filet entre les cases reste, sinon deux
     achevés voisins se fondraient en une barre. La note est en Instrument
     Serif, comme tous les chiffres cérémonieux de l'application. */
  .sw { display: grid; place-items: center; font-family: var(--fs); font-size: 19px; font-weight: 400;
        letter-spacing: 0; line-height: 1; }
  td .sw { height: 44px; }

  /* **Sa propre colonne** : en tête, et tenue à l'encre — un filet de chaque
     côté qui la sépare des autres. Elle garde ses 44 px même en étroit :
     c'est la seule où chaque case est une cible (invariant 20). */
  th.me, td.me { width: 46px; min-width: 46px; max-width: 46px;
                 border-left: 1px solid var(--ink); border-right: 1px solid var(--ink); }

  /* Les colonnes en attente : du papier, des filets, aucune teinte. La
     dernière n'a pas de largeur bornée — c'est elle qui prend le reste. */
  table { min-width: 100%; }
  th.spare { background: var(--paper); border-bottom: 1.5px solid var(--ink); width: var(--ccol); min-width: var(--ccol); }
  td.spare { background: var(--paper); border-bottom: 1px solid var(--rule); border-right: 1px solid var(--rule); }
  tr:hover td.spare { background: var(--paper); }

  /* Le blanc avant le fonds : une rangée sans filet, et son nom en petites
     capitales dans la colonne des titres, qui reste à l'écran. */
  .gap th, .gap td { height: 40px; background: var(--paper); border: none; border-bottom: 1px solid var(--rule2); }
  .gap .w { border-right: none; vertical-align: bottom; }
  .gl { display: block; padding: 0 12px 7px; font-size: 9px; font-weight: 700; letter-spacing: .18em;
        text-transform: uppercase; color: var(--faint); white-space: nowrap; }
  tr.gap:hover .w { background: var(--paper); }
  th.me .nm { color: var(--ink); font-weight: 700; }
  td.me button { width: 100%; }
  td.me .empty { color: var(--faint); font-family: var(--fu); font-size: 15px; }
  td.me button:hover { box-shadow: inset 0 0 0 1.5px var(--ink); }
  td.me .empty:hover { color: var(--ink); }
  td.me button.open { box-shadow: inset 0 0 0 2px var(--ink); }

  /* --- La bulle : quatre états, le sien marqué, et la fiche pour juger. --- */
  .pk { display: grid; gap: 6px; width: min(400px, calc(100vw - 32px)); }
  .pk-t { font-size: 11px; color: var(--dim); padding: 0 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .pk-t b { font-family: var(--fs); font-weight: 400; font-size: 15px; color: var(--ink); }
  .pk-l { display: grid; grid-template-columns: repeat(auto-fit, minmax(86px, 1fr)); gap: 4px; }
  .pk-b { display: flex; align-items: center; gap: 7px; min-height: 44px; padding: 0 9px; border: 1px solid var(--rule2);
          font-size: 10px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--dim); }
  .pk-b:hover { color: var(--ink); border-color: var(--ink); }
  .pk-b.on { color: var(--ink); border-color: var(--ink); background: var(--paper); }
  .pk-sw { width: 12px; height: 12px; flex: none; }
  .pk-a { display: flex; align-items: center; justify-content: flex-end; min-height: 44px; padding: 0 4px;
          font-size: 10px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--dim); }
  .pk-a:hover { color: var(--ink); }

  @media (max-width: 860px) {
    .tab { --wcol: 136px; --ccol: 40px; }
    .head { padding: 22px 18px 12px 10px; }
    h1 { font-size: 24px; }
    .none { padding: 0 18px 0 10px; }
    .t { font-size: 14px; }
    .w a { padding: 4px 8px; }
    .q { padding-left: 8px; }
    .ql { display: none; }
  }
</style>
