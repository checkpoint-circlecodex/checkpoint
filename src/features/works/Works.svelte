<script lang="ts">
  /* **Catalogue typographique, jaquettes en exception.** Deux vues : un
     registre dense sans aucune image, et une grille de jaquettes en noir et
     blanc. Quand une œuvre n'a pas de jaquette, le cadre porte son titre. */
  import { registre } from "$core/model/store.svelte.ts";
  import { KIND, KINDS, STATUS, dec, roman } from "$core/model/lexicon.ts";
  import { avgOf, rowsFor, titleOf, tracked } from "$core/selectors/index.ts";
  import type { MediaType } from "$core/model/schema.ts";

  let { kind = null }: { kind?: MediaType | null } = $props();

  const w = $derived(registre.world);
  const pref = $derived(registre.titlePref);
  const ids = $derived(tracked(w, kind ?? undefined, pref));
  const me = $derived(registre.me);

  const mine = (id: string) => w.rows.find(r => r.personId === me && r.mediaId === id) ?? null;
</script>

<div class="wrap">
  <div class="eyebrow">{kind ? KINDS[kind] : "Les Œuvres"}</div>
  <h1>{roman(ids.length)} au corpus</h1>
  <p class="lede">
    Une œuvre est au corpus parce qu'<strong>au moins une personne la suit</strong>.
    Le catalogue n'est pas tenu, il est dérivé.
  </p>

  <div class="reg">
    {#each ids as id (id)}
      {@const m = w.catalog[id]}
      {@const rs = rowsFor(w, id)}
      {@const avg = avgOf(rs)}
      {@const own = mine(id)}
      <a class="r" href="#/fiche/{id}">
        <span class="line">
          <span class="t">{titleOf(w, id, pref)}</span>
          <span class="kind">{KIND[m.mediaType]} · {m.year}</span>
        </span>
        <span class="n">{roman(rs.length)}</span>
        <span class="avg">{avg === null ? "—" : dec(avg)}</span>
        <span class="own">{own ? STATUS[m.mediaType][own.status] : ""}</span>
      </a>
    {/each}
  </div>
</div>

<style>
  .wrap { max-width: 980px; margin: 0 auto; padding: 30px 34px 60px; }
  .eyebrow { font-size: 9px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; color: var(--faint); }
  h1 { font-family: var(--fs); font-weight: 400; font-size: 34px; line-height: 1.05; margin-top: 8px; }
  .lede { font-family: var(--fr); font-size: 14.5px; line-height: 1.6; color: var(--ink2); max-width: 62ch; margin: 8px 0 22px; }

  .reg { border-top: 1px solid var(--rule); }
  .r {
    display: grid; grid-template-columns: minmax(0,1fr) 46px 46px 96px;
    gap: 14px; align-items: center; padding: 9px 0; min-height: 44px;
    border-bottom: 1px solid var(--rule);
  }
  .r:hover { background: var(--raise); }
  .line { display: grid; min-width: 0; }
  .t { font-family: var(--fs); font-size: 17px; line-height: 1.15;
       white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .kind { font-size: 11px; color: var(--dim); }
  .n, .avg { font-size: 12px; color: var(--ink2); text-align: right; font-variant-numeric: tabular-nums; }
  .own { font-size: 11px; font-weight: 600; color: var(--dim); text-align: right; }

  @media (max-width: 860px) {
    .wrap { padding: 22px 18px 80px; }
    .r { grid-template-columns: minmax(0,1fr) 42px 42px; }
    .own { grid-column: 1 / -1; text-align: left; }
  }
</style>
