<script lang="ts">
  import { registre } from "$core/model/store.svelte.ts";
  import { platform } from "$platform/index.ts";
  import { Stage, Surface, pile } from "$core/ui/index.ts";
  import Rail from "./Rail.svelte";
  import { HOME, REGISTRY, route } from "./routes.ts";

  let hash = $state(location.hash || "#/");
  let collapsed = $state(false);

  /* `forward` se décide **au moment où la route change**, parce que la coque
     est la seule à connaître celle qu'on quitte. Déduit après coup, il aurait
     toujours un cran de retard. */
  let forward = $state(true);
  let lastDepth = route(location.hash || "#/").depth;

  const onHash = () => {
    const next = location.hash || "#/";
    const d = route(next).depth;
    forward = d >= lastDepth;
    lastDepth = d;
    hash = next;
    /* Changer de destination referme ce qui était ouvert par-dessus : une
       surface laissée derrière une navigation est une surface orpheline. */
    pile.closeAll();
  };

  $effect(() => {
    addEventListener("hashchange", onHash);
    return () => removeEventListener("hashchange", onHash);
  });

  $effect(() => { registre.open(platform().storage, platform().cache); });

  const current = $derived(route(hash));
  const tabs = $derived([HOME, ...REGISTRY.filter(v => !v.bench && !v.hold && (!v.only || v.only()))]);
</script>

<div class="app">
  <Rail {hash} bind:collapsed />

  <!-- En étroit la barre n'existe pas : le visage passe dans l'en-tête, et la
       barre basse reste à quatre entrées. -->
  <header class="mob">
    <a href="#/" class="sigil">C</a>
    <span class="mark">Checkpoint</span>
  </header>

  <main>
    {#if registre.phase === "prêt"}
      <Stage routeKey={current.key} {forward}>
        <current.entry.view {...current.props} />
      </Stage>
    {:else}
      <p class="wait">{registre.phase === "ouverture" ? "Lecture des fragments…" : "…"}</p>
    {/if}
  </main>

  <nav class="tabs">
    {#each tabs.slice(0, 4) as t (t.id)}
      <a href={t.href} class:on={t.href === "#/" ? hash === "#/" : hash.startsWith(t.href)}>
        <span class="gl">{t.gl}</span>{t.label.replace(/^(Les|Le|La) /, "")}
      </a>
    {/each}
  </nav>
</div>

{#each pile.stack as s, i (s.id)}
  <Surface surface={s} index={i}>
    {#if typeof s.render === "function"}{@render (s.render as import("svelte").Snippet)()}{/if}
  </Surface>
{/each}

<style>
  .app { display: flex; height: 100%; }
  main { flex: 1; min-width: 0; position: relative; }
  .wait { display: grid; place-content: center; height: 100%; color: var(--dim); font-size: 12.5px; }

  .mob, .tabs { display: none; }

  @media (max-width: 860px) {
    .app { display: block; }
    .mob {
      display: flex; align-items: center; gap: 12px;
      padding: 10px 16px; border-bottom: 1px solid var(--rule);
    }
    /* 44 px de cible, cadre de 26 px — invariant 20, comme dans la barre. */
    .sigil {
      position: relative; display: grid; place-items: center;
      width: 44px; height: 44px; margin: -7px 0 -7px -9px;
      font-family: var(--fs); font-size: 15px; letter-spacing: 0; line-height: 1;
    }
    .sigil::before {
      content: ""; position: absolute; width: 26px; height: 26px; border: 1.5px solid var(--ink);
    }
    .mark { font-size: 12.5px; font-weight: 600; }
    main { height: calc(100% - 47px - 54px); }
    .tabs {
      display: grid; grid-template-columns: repeat(4, 1fr);
      position: fixed; left: 0; right: 0; bottom: 0; z-index: 30;
      background: var(--paper); border-top: 1px solid var(--rule);
      padding: 4px 4px calc(4px + env(safe-area-inset-bottom));
    }
    .tabs a {
      display: flex; flex-direction: column; align-items: center; gap: 3px;
      padding: 8px 0; min-height: 46px; color: var(--faint);
      font-size: 9px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase;
    }
    .tabs a .gl { font-family: var(--fs); font-size: 16px; letter-spacing: 0; }
    .tabs a.on { color: var(--ink); }
  }
</style>
