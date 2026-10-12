<script lang="ts">
  /* **Inscrire une œuvre.** Deux chemins dans la même surface : la chercher
     dans ce que le cercle a déjà porté, ou la décrire soi-même quand elle
     n'y est pas.

     ⚠️ Le fonds externe (IGDB, TMDb) n'est pas encore branché : tant qu'il
     ne l'est pas, le second chemin est le seul pour une œuvre nouvelle, et
     l'écran le dit au lieu de faire semblant de chercher. */
  import { registre } from "#core/model/store.svelte.ts";
  import { KIND, KINDS, STATE_ORDER, STATUS } from "#core/model/lexicon.ts";
  import { groupsWithLegacy } from "#core/model/genres.ts";
  import { inscrire } from "#core/model/acts.ts";
  import { matchTitle, titleOf } from "#core/selectors/index.ts";
  import { pile } from "#core/ui/index.ts";
  import type { MediaType, Status } from "#core/model/schema.ts";

  let { close }: { close: () => void } = $props();

  const w = $derived(registre.world);
  const pref = $derived(registre.titlePref);
  const me = $derived(registre.me ?? "");

  let q = $state("");
  let mode = $state<"chercher" | "decrire">("chercher");

  /* Une liste déroulante de cent entrées n'est pas un choix, c'est une
     épreuve : on cherche, et le choix ne met à jour que ses résultats. */
  const hits = $derived(
    q.trim().length < 2 ? []
    : Object.keys(w.catalog)
        .filter(id => !w.alias[id] && matchTitle(w, id, q.toLowerCase().trim()))
        .filter(id => !w.rows.some(r => r.personId === me && r.mediaId === id))
        .sort((a, b) => titleOf(w, a, pref).localeCompare(titleOf(w, b, pref), "fr"))
        .slice(0, 8));

  /* --- décrire soi-même --- */
  let kind = $state<MediaType>("game");
  let title = $state("");
  let titleFr = $state("");
  let year = $state<number | "">("");
  let gn = $state<Set<string>>(new Set());
  let status = $state<Status>("wishlist");

  /* **Changer de nature vide les genres** : un genre de jeu ne veut rien
     dire pour un livre, et le garder en silence serait pire que le perdre. */
  const setKind = (k: MediaType) => { kind = k; gn = new Set(); };
  const toggle = (g: string) => {
    const n = new Set(gn);
    n.has(g) ? n.delete(g) : n.add(g);
    gn = n;
  };

  const groups = $derived(groupsWithLegacy(kind, gn));
  const ready = $derived(title.trim().length > 1 && String(year).length === 4);

  function takeExisting(id: string) {
    /* La description part **dans le fragment** de qui inscrit : une œuvre
       venue du fonds ne doit pas devenir orpheline le jour où le fonds
       change. Pour une œuvre déjà suivie, rien ne bouge — `inscrire` ne
       remplace pas une description qu'on porte déjà. */
    registre.act(inscrire(id, { status: "wishlist" }, w.catalog[id]));
    close();
  }

  function createNew() {
    if (!ready) return;
    const id = `local:${kind}-${title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40)}`;
    registre.act(inscrire(id, { status }, {
      mediaType: kind, title: title.trim(),
      ...(titleFr.trim() ? { titleFr: titleFr.trim() } : {}),
      year: Number(year), genres: [...gn], manual: true,
    }));
    close();
  }
</script>

<div class="ins">
  <div class="modes">
    <button class:on={mode === "chercher"} onclick={() => (mode = "chercher")}>Dans le corpus</button>
    <button class:on={mode === "decrire"} onclick={() => (mode = "decrire")}>Hors du fonds</button>
  </div>

  {#if mode === "chercher"}
    <label class="find">
      <input bind:value={q} placeholder="Un titre…" autocomplete="off" />
    </label>
    {#if q.trim().length >= 2}
      {#if hits.length}
        <div class="res">
          {#each hits as id (id)}
            {@const m = w.catalog[id]}
            <button class="hit" onclick={() => takeExisting(id)}>
              <span class="t">{titleOf(w, id, pref)}</span>
              <span class="k">{KIND[m.mediaType]} · {m.year}</span>
              <span class="add">＋</span>
            </button>
          {/each}
        </div>
      {:else}
        <p class="none">
          Rien sous ce nom dans le corpus — ou tu l'as déjà inscrite.
          <button class="lien" onclick={() => { mode = "decrire"; title = q; }}>La décrire toi-même</button>
        </p>
      {/if}
    {:else}
      <p class="legend">
        Le corpus ne contient que ce que le cercle a déjà porté.
        <strong>La recherche IGDB et TMDb n'est pas encore branchée</strong> : pour une
        œuvre nouvelle, passe par « hors du fonds ».
      </p>
    {/if}

  {:else}
    <div class="f">
      <span class="k">Sa nature</span>
      <div class="picks">
        {#each ["game", "film", "series", "book"] as const as t}
          <button class="pick" class:on={kind === t} onclick={() => setKind(t)}>{KINDS[t]}</button>
        {/each}
      </div>
    </div>

    <div class="f two">
      <label><span class="k">Titre d'origine</span><input bind:value={title} placeholder="Hollow Knight" /></label>
      <label><span class="k">Titre français</span><input bind:value={titleFr} placeholder="s'il diffère" /></label>
    </div>

    <div class="f">
      <label><span class="k">Année</span><input class="yr" bind:value={year} inputmode="numeric" placeholder="2017" /></label>
    </div>

    <div class="f">
      <span class="k">Ses catégories</span>
      <!-- **Un choix qu'on ne voit pas n'existe pas** : les familles
           s'affichent en entier, jamais dans une boîte à défilement interne. -->
      {#each groups as grp (grp.g)}
        <div class="grp">
          <span class="gl">{grp.g}</span>
          <div class="tags">
            {#each grp.l as g (g)}
              <button class="tag" class:on={gn.has(g)} onclick={() => toggle(g)}>{g}</button>
            {/each}
          </div>
        </div>
      {/each}
    </div>

    <div class="f">
      <span class="k">Ta position</span>
      <div class="picks">
        {#each STATE_ORDER as st}
          <button class="pick" class:on={status === st} onclick={() => (status = st)}>{STATUS[kind][st]}</button>
        {/each}
      </div>
    </div>

    <div class="go">
      <button class="btn-main" onclick={createNew} disabled={!ready}>Inscrire au registre</button>
      {#if !ready}<span class="why">Il faut au moins un titre et une année.</span>{/if}
    </div>
  {/if}
</div>

<style>
  .ins { display: grid; gap: 18px; }
  .modes { display: flex; gap: 2px; border-bottom: 1px solid var(--rule); }
  .modes button { padding: 10px 14px; min-height: 44px; font-size: 11px; font-weight: 600; color: var(--dim); }
  .modes button:hover { color: var(--ink); }
  .modes button.on { color: var(--ink); box-shadow: inset 0 -1.5px 0 var(--ink); }

  .find input, .f input {
    width: 100%; min-height: 44px; padding: 11px 13px; font-size: 14px;
    border: 1px solid var(--rule2); background: var(--paper);
  }
  .yr { max-width: 120px; }
  .legend, .none { font-size: 12px; color: var(--dim); line-height: 1.6; }
  .lien { text-decoration: underline; text-underline-offset: 3px; color: var(--ink); font-size: 12px; }

  .res { display: flex; flex-direction: column; border-top: 1px solid var(--rule); }
  .hit { display: grid; grid-template-columns: minmax(0,1fr) auto 24px; gap: 12px; align-items: center;
         padding: 10px 0; min-height: 44px; border-bottom: 1px solid var(--rule); text-align: left; }
  .hit:hover { background: var(--raise); }
  .t { font-family: var(--fs); font-size: 17px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .hit .k, .f .k { font-size: 11px; color: var(--dim); }
  /* Le « + » d'une commande carrée ne se centre pas tout seul (invariant 30). */
  .add { display: grid; place-items: center; width: 24px; height: 24px; letter-spacing: 0; line-height: 1; }

  .f { display: grid; gap: 7px; }
  .f.two { grid-template-columns: 1fr 1fr; gap: 12px; }
  .f label { display: grid; gap: 6px; }
  .f .k { font-size: 9px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: var(--faint); }

  .picks, .tags { display: flex; gap: 4px; flex-wrap: wrap; }
  .pick, .tag, .btn-main {
    min-height: 44px; padding: 9px 12px; border: 1px solid var(--rule2);
    font-size: 11px; font-weight: 600; color: var(--dim);
  }
  .tag { min-height: 34px; padding: 7px 10px; font-weight: 500; }
  .pick:hover, .tag:hover, .btn-main:hover:not(:disabled) { color: var(--ink); border-color: var(--ink); }
  .pick.on, .tag.on { color: var(--paper); background: var(--ink); border-color: var(--ink); }
  .btn-main { border-color: var(--ink); color: var(--ink); font-weight: 700; letter-spacing: .1em; text-transform: uppercase; font-size: 10px; }
  .btn-main:disabled { opacity: .4; cursor: default; }

  .grp { display: grid; gap: 5px; margin-top: 8px; }
  .gl { font-size: 10px; letter-spacing: .1em; text-transform: uppercase; color: var(--dim); }
  .go { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; padding-top: 4px; }
  .why { font-size: 11px; color: var(--dim); font-style: italic; }

  @media (max-width: 860px) { .f.two { grid-template-columns: 1fr; } }
</style>
