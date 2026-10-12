<script lang="ts">
  /* **Corriger une fiche** — titre, titre français, année. Un geste de
     greffier : la correction s'applique à tout le monde, et elle part au
     journal du Greffe. Les autres ne voient pas cette porte : elle n'existe
     que pour qui tient la charge (invariant 32). */
  import { untrack } from "svelte";
  import { registre } from "#core/model/store.svelte.ts";
  import { corriger } from "#core/model/acts.ts";
  import type { Work } from "#core/model/schema.ts";

  let { id, work, close }: { id: string; work: Work; close?: () => void } = $props();
  const before = untrack(() => ({ ...work }));

  let title = $state(before.title);
  let titleFr = $state(before.titleFr ?? "");
  let year = $state(String(before.year));

  const changes = $derived.by(() => {
    const f: { title?: string; titleFr?: string; year?: number } = {};
    if (title.trim() && title.trim() !== before.title) f.title = title.trim();
    if (titleFr.trim() !== (before.titleFr ?? "")) f.titleFr = titleFr.trim();
    const y = Number(year);
    if (/^\d{4}$/.test(year.trim()) && y !== before.year) f.year = y;
    return f;
  });
  const yearBad = $derived(!/^\d{4}$/.test(year.trim()));
  const ready = $derived(!!title.trim() && !yearBad && Object.keys(changes).length > 0);

  function save() {
    if (!ready) return;
    const c = changes;
    const note = [
      c.title !== undefined ? `« ${before.title} » → « ${c.title} »` : "",
      c.titleFr !== undefined ? `titre français : « ${before.titleFr ?? "—"} » → « ${c.titleFr || "—"} »` : "",
      c.year !== undefined ? `${before.year} → ${c.year}` : "",
    ].filter(Boolean).join(" · ");
    registre.act(corriger(id, c, note));
    close?.();
  }
</script>

<form class="cor" onsubmit={e => { e.preventDefault(); save(); }}>
  <p class="legend">La correction vaut <b>pour tout le monde</b> et paraît au journal du Greffe. Le fichier de qui a
    inscrit l'œuvre n'est pas touché : elle s'applique à la lecture, et une correction plus récente la remplace.</p>
  <label class="f"><span class="k">Titre original</span><input bind:value={title} /></label>
  <label class="f"><span class="k">Titre français <em>— vide s'il n'y en a pas</em></span><input bind:value={titleFr} /></label>
  <label class="f"><span class="k">Année</span><input class="yr" bind:value={year} inputmode="numeric" /></label>
  {#if yearBad}<span class="why">Une année s'écrit en quatre chiffres.</span>{/if}
  <div class="go"><button class="btn-main" disabled={!ready}>Consigner la correction</button></div>
</form>

<style>
  .cor { display: grid; gap: 12px; }
  .legend { font-size: 11.5px; color: var(--dim); line-height: 1.55; }
  .legend b { color: var(--ink); font-weight: 600; }
  .f { display: grid; gap: 6px; }
  .k { font-size: 9px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: var(--faint); }
  .k em { font-style: normal; text-transform: none; letter-spacing: .02em; font-weight: 400; }
  input { width: 100%; min-height: 44px; padding: 10px 12px; border: 1px solid var(--rule2); background: var(--raise);
          font-family: var(--fs); font-size: 18px; color: var(--ink); outline: none; }
  input:focus { border-color: var(--ink); background: var(--paper); }
  .yr { width: 120px; font-family: var(--fu); font-size: 14px; }
  .why { font-size: 11px; color: var(--dim); font-style: italic; }
  .go { padding-top: 10px; border-top: 1px solid var(--rule); }
  .btn-main { min-height: 44px; padding: 9px 16px; border: 1px solid var(--ink); color: var(--ink);
              font-size: 10px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; }
  .btn-main:hover:not(:disabled) { background: var(--ink); color: var(--paper); }
  .btn-main:disabled { opacity: .4; }
</style>
