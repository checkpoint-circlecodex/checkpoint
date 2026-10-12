<script lang="ts">
  /* **Poser une jaquette, et la cadrer.** Ouvert à tous, inscrit ou non :
     c'est une contribution à la fiche, pas un fait sur soi. **Son adresse,
     jamais ses octets** — Git n'efface jamais un binaire remplacé. Et
     puisqu'on ne garde pas l'image, on ne la découpe pas : on dit **quelle
     part en montrer** (`Frame`), et tout le monde voit le même cadrage,
     partout. La plus récente l'emporte, image et cadrage ensemble.

     Le recadrage : on fait glisser l'image dans le cadre, on zoome, on voit
     le résultat avant de poser. Au clavier aussi — les flèches déplacent,
     + et − zooment (invariant 19 : rien qui ne se fasse qu'à la souris). */
  import { untrack } from "svelte";
  import { registre } from "#core/model/store.svelte.ts";
  import { poserJaquette } from "#core/model/acts.ts";
  import { frameStyle } from "#core/ui/frame.ts";
  import type { Frame, Work } from "#core/model/schema.ts";

  let { id, work, close }: { id: string; work: Work; close?: () => void } = $props();

  /* « Changer la jaquette » rouvre l'image posée et son cadrage : recadrer,
     c'est reposer la même adresse avec une autre fenêtre. */
  const start = untrack(() => ({ url: work.cover ?? "", frame: work.coverFrame ?? null }));
  let url = $state(start.url);
  let broken = $state(false);
  const ok = $derived(/^https:\/\/\S+$/i.test(url.trim()));
  const mine = $derived.by(() => { void registre.world; return registre.myWork(id)?.cover || ""; });

  /* --- Le cadre fait deux sur trois, comme partout dans l'application. --- */
  const FW = 200, ASPECT = 1.5;
  let ratio = $state(0);                 // hauteur / largeur de l'image, connue au chargement
  let f = $state<Frame>({ x: 0, y: 0, w: 1 });
  const wmax = $derived(ratio ? Math.min(1, ratio / ASPECT) : 1);
  const hOf = (w: number) => (ratio ? (ASPECT * w) / ratio : 1);   // hauteur de la fenêtre, en fraction de l'image
  const zoom = $derived(f.w ? wmax / f.w : 1);

  const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
  function place(x: number, y: number, w: number) {
    const ww = clamp(w, wmax / 4, wmax);
    f = { x: clamp(x, 0, 1 - ww), y: clamp(y, 0, Math.max(0, 1 - hOf(ww))), w: ww };
  }
  const centered = () => place((1 - wmax) / 2, (1 - hOf(wmax)) / 2, wmax);

  function loaded(e: Event) {
    const img = e.currentTarget as HTMLImageElement;
    if (!img.naturalWidth) return;
    const first = !ratio;
    ratio = img.naturalHeight / img.naturalWidth;
    broken = false;
    /* Le cadrage d'avant ne vaut que pour la même image. */
    if (first && start.frame && url.trim() === start.url) place(start.frame.x, start.frame.y, start.frame.w);
    else centered();
  }

  /** Zoomer **autour du centre** de ce qu'on voit, pas de son coin. */
  function setZoom(z: number) {
    const w = wmax / clamp(z, 1, 4);
    const cx = f.x + f.w / 2, cy = f.y + hOf(f.w) / 2;
    place(cx - w / 2, cy - hOf(w) / 2, w);
  }

  /* Glisser : un pixel déplacé à l'écran, c'est `w / FW` de l'image en
     largeur, et `w / (FW × ratio)` en hauteur. */
  let drag: { px: number; py: number; x: number; y: number } | null = null;
  function down(e: PointerEvent) {
    if (!ratio) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag = { px: e.clientX, py: e.clientY, x: f.x, y: f.y };
  }
  function move(e: PointerEvent) {
    if (!drag) return;
    const dx = e.clientX - drag.px, dy = e.clientY - drag.py;
    place(drag.x - (dx * f.w) / FW, drag.y - (dy * f.w) / (FW * ratio), f.w);
  }
  const up = () => { drag = null; };
  function key(e: KeyboardEvent) {
    const step = f.w * 0.04;
    const by: Record<string, () => void> = {
      ArrowLeft: () => place(f.x - step, f.y, f.w), ArrowRight: () => place(f.x + step, f.y, f.w),
      ArrowUp: () => place(f.x, f.y - step, f.w), ArrowDown: () => place(f.x, f.y + step, f.w),
      "+": () => setZoom(zoom + 0.1), "=": () => setZoom(zoom + 0.1), "-": () => setZoom(zoom - 0.1),
    };
    if (by[e.key]) { e.preventDefault(); by[e.key](); }
  }

  function save() {
    if (!ok || broken || !ratio) return;
    registre.act(poserJaquette(id, url, work, f));
    close?.();
  }
</script>

<form class="jq" onsubmit={e => { e.preventDefault(); save(); }}>
  <p class="legend">Colle l'adresse d'une image trouvée en ligne : <b>clic droit sur l'image › Copier l'adresse de
    l'image</b>. Puis cadre-la : fais-la glisser dans le cadre, et zoome. La plus récente posée l'emporte, pour
    tout le monde.</p>
  <!-- Une autre adresse, une autre image : on oublie sa taille, elle sera
       remesurée au chargement. -->
  <input bind:value={url} oninput={() => { ratio = 0; broken = false; }} inputmode="url" placeholder="https://…" aria-label="Adresse de l'image" />
  {#if url.trim() && !ok}<span class="why">Il faut une adresse qui commence par https://</span>{/if}

  {#if ok}
    {#if broken}
      <span class="why">Cette adresse ne donne pas d'image — vérifie qu'elle mène à l'image elle-même, pas à la page qui la contient.</span>
    {:else}
      <div class="crop">
        <!-- Le cadre se manipule à la souris, au doigt **et au clavier** : il
             prend le focus, et ses touches sont dites dans son nom. -->
        <!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
        <div class="cadre" class:ready={ratio > 0} style="width:{FW}px" tabindex="0" role="application"
             aria-label="Cadrage : flèches pour déplacer, plus et moins pour zoomer"
             onpointerdown={down} onpointermove={move} onpointerup={up} onpointercancel={up} onkeydown={key}>
          {#key url}
            <img src={url.trim()} alt="" draggable="false" onload={loaded} onerror={() => (broken = true)}
                 style={ratio ? frameStyle(f) : ""} />
          {/key}
        </div>
        <div class="ctl">
          <label class="z"><span class="k">Zoom</span>
            <input type="range" min="1" max="4" step="0.01" value={zoom} disabled={!ratio}
                   oninput={e => setZoom(Number((e.currentTarget as HTMLInputElement).value))} /></label>
          <div class="zb">
            <button type="button" class="btn" onclick={() => setZoom(zoom - 0.25)} disabled={!ratio || zoom <= 1} aria-label="Dézoomer">−</button>
            <button type="button" class="btn" onclick={() => setZoom(zoom + 0.25)} disabled={!ratio || zoom >= 4} aria-label="Zoomer">＋</button>
            <button type="button" class="btn" onclick={centered} disabled={!ratio}>Recentrer</button>
          </div>
          <p class="hint">Ce que tu vois dans le cadre est ce que tout le monde verra — dans la grille, la recherche et sur la fiche.</p>
        </div>
      </div>
    {/if}
  {/if}

  <div class="go">
    <button class="btn-main" disabled={!ok || broken || !ratio}>Poser la jaquette</button>
    {#if mine}
      <button type="button" class="btn" onclick={() => { registre.act(poserJaquette(id, "", work)); close?.(); }}>Retirer la mienne</button>
    {/if}
  </div>
</form>

<style>
  .jq { display: grid; gap: 12px; }
  .legend { font-size: 11.5px; color: var(--dim); line-height: 1.55; }
  .legend b { color: var(--ink2); font-weight: 600; }
  input[inputmode="url"] { width: 100%; min-height: 44px; padding: 10px 12px; border: 1px solid var(--rule2); background: var(--raise);
          font: inherit; font-size: 13px; color: var(--ink); outline: none; }
  input[inputmode="url"]:focus { border-color: var(--ink); background: var(--paper); }
  .why { font-size: 11px; color: var(--dim); font-style: italic; }

  .crop { display: flex; gap: 18px; flex-wrap: wrap; align-items: flex-start; }
  /* Le cadre : deux sur trois, ce qui dépasse est coupé. On l'attrape pour
     faire glisser l'image dessous. */
  .cadre { position: relative; aspect-ratio: 2 / 3; overflow: hidden; border: 1px solid var(--ink); background: var(--raise);
           touch-action: none; user-select: none; cursor: grab; flex: none; }
  .cadre:active { cursor: grabbing; }
  .cadre img { width: 100%; height: 100%; object-fit: cover; pointer-events: none; opacity: 0; }
  .cadre.ready img { opacity: 1; }
  .ctl { display: grid; gap: 10px; flex: 1; min-width: 180px; }
  .z { display: grid; gap: 6px; }
  .k { font-size: 9px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: var(--faint); }
  .z input { width: 100%; min-height: 44px; accent-color: var(--ink); }
  .zb { display: flex; gap: 6px; flex-wrap: wrap; }
  .hint { font-size: 11px; color: var(--dim); font-style: italic; line-height: 1.5; }

  .go { display: flex; gap: 10px; flex-wrap: wrap; padding-top: 10px; border-top: 1px solid var(--rule); }
  .btn-main, .btn { min-height: 44px; min-width: 44px; padding: 9px 14px; border: 1px solid var(--rule2); font-size: 10px; font-weight: 700;
                    letter-spacing: .1em; text-transform: uppercase; color: var(--dim); }
  .btn-main { border-color: var(--ink); color: var(--ink); }
  .btn-main:hover:not(:disabled) { background: var(--ink); color: var(--paper); }
  .btn-main:disabled, .btn:disabled { opacity: .4; }
  .btn:hover:not(:disabled) { color: var(--ink); border-color: var(--ink); }
</style>
