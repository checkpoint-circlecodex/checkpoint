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
     mosaïque. */
  import { untrack } from "svelte";
  import { registre } from "#core/model/store.svelte.ts";
  import { Face } from "#core/ui/index.ts";
  import { KIND, KINDS, STATE_ORDER, STATUS, roman } from "#core/model/lexicon.ts";
  import { ledger, titleOf, tracked } from "#core/selectors/index.ts";
  import type { MediaType, Status } from "#core/model/schema.ts";
  import { vue } from "./side.svelte.ts";

  const w = $derived(registre.world);
  const pref = $derived(registre.titlePref);
  const L = $derived(ledger(w, vue.kind ?? undefined, pref));
  /* Le filtre ne propose que les natures présentes : un choix qui mène à
     une grille vide n'est pas un choix. */
  const kinds = $derived((Object.keys(KINDS) as MediaType[]).filter(k => tracked(w, k).length));
  const firsts = $derived(new Set(L.bands.map((b, i) =>
    L.people[L.bands.slice(0, i).reduce((s, x) => s + x.n, 0)]?.id)));

  /* La légende parle au masculin du jeu ; chaque case, elle, dit le mot de
     sa nature (invariant du lexique) dans son nom accessible. */
  const LEGEND: { st: Status; l: string }[] = STATE_ORDER.map(st => ({ st, l: STATUS.game[st] }));

  /* On revient où l'on était : ouvrir une œuvre puis revenir ne doit pas
     renvoyer en haut à gauche d'une grille de cinquante lignes. */
  let sheet = $state<HTMLElement | null>(null);
  $effect(() => {
    if (!sheet) return;
    untrack(() => { sheet!.scrollLeft = vue.x; sheet!.scrollTop = vue.y; });
  });
  const keep = () => { if (sheet) { vue.x = sheet.scrollLeft; vue.y = sheet.scrollTop; } };

  const label = (pid: string, id: string) => {
    const r = L.cell[pid]?.[id], p = w.people[pid], m = w.catalog[id];
    if (!r || !p || !m) return "";
    return `${p.firstName} · ${STATUS[m.mediaType][r.status]}${typeof r.rating === "number" ? ` · ${r.rating}/10` : ""}`;
  };
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
        <span class="lg"><span class="sw st-completed n" aria-hidden="true">8</span>sa note</span>
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

  {#if L.works.length && L.people.length}
    <div class="sheet" bind:this={sheet} onscroll={keep}>
      <table>
        <thead>
          <tr class="ppl">
            <th class="corner" scope="col"><span>Œuvre</span></th>
            {#each L.people as p (p.id)}
              <th scope="col" class:first={firsts.has(p.id)} style="--c:{p.circleRef.color}">
                <a href="#/personne/{p.id}" title="{p.firstName}, {p.circleRef.one}">
                  <Face who={p} size="s" /><span class="nm">{p.firstName}</span>
                </a>
              </th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each L.works as id (id)}
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
                <td class:first={firsts.has(p.id)} style="--c:{p.circleRef.color}">
                  {#if r}
                    <span class="sw st-{r.status}" role="img" aria-label={label(p.id, id)} title={label(p.id, id)}>
                      {typeof r.rating === "number" ? r.rating : ""}
                    </span>
                  {/if}
                </td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
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
  .tab {
    --st-wishlist: #ECAE1D; --st-playing: #246DDB; --st-completed: #1FA35F; --st-dropped: #DF3020;
    --wcol: 250px; --ccol: 46px;
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
  .corner span { display: block; padding: 0 12px 9px; font-size: 9px; font-weight: 700; letter-spacing: .2em;
                 text-transform: uppercase; color: var(--faint); }

  .ppl th { width: var(--ccol); min-width: var(--ccol); max-width: var(--ccol);
            background: color-mix(in srgb, var(--c) 18%, var(--paper)); border-bottom: 1.5px solid var(--ink); }
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

  @media (max-width: 860px) {
    .tab { --wcol: 136px; --ccol: 40px; }
    .head { padding: 22px 18px 12px 10px; }
    h1 { font-size: 24px; }
    .none { padding: 0 18px 0 10px; }
    .t { font-size: 14px; }
    .w a { padding: 4px 8px; }
  }
</style>
