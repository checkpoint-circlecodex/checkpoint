<script lang="ts">
  import { untrack } from "svelte";
  import { registre } from "#core/model/store.svelte.ts";
  import { platform } from "#platform/index.ts";
  import { Face, Stage, Surface, gestes, pile } from "#core/ui/index.ts";
  import { Inscribe } from "#features/inscribe/index.ts";
  import Rail from "./Rail.svelte";
  import { HOME, REGISTRY, route } from "./routes.ts";
  import { lanceur } from "./launcher.svelte.ts";
  import Deck from "./Deck.svelte";
  import SeekSheet from "./SeekSheet.svelte";
  import { Entry, porte } from "#features/entry/index.ts";
  import Release from "./Release.svelte";

  /* La coque est la seule à connaître tous les blocs : c'est elle qui dit
     ce que fait « inscrire », pour tous ceux qui l'offrent. */
  gestes.inscrire = () => pile.swap("panneau", "Inscrire une œuvre", Inscribe);

  let hash = $state(location.hash || "#/");

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

  /* Échap referme le lanceur, ⌘K / Ctrl+K l'ouvre sur la recherche. Ce sont
     des **raccourcis**, pas des portes : le bouton de la barre fait la même
     chose, en vue — un geste qui n'existerait qu'au clavier serait aussi
     peu découvrable qu'un survol (invariants 19 et 32). */
  const onKey = (e: KeyboardEvent) => {
    if (porte.door !== "dedans" || porte.veil) return;   // ni l'entrée ni l'ouverture n'ont de lanceur
    if (e.key === "Escape" && lanceur.open && !pile.depth) { lanceur.chose(); return; }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); lanceur.seek(); }
  };
  $effect(() => {
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  });

  /* **La porte d'abord.** On ne lit pas le dépôt avant de savoir si on y a
     droit : c'est la porte qui l'ouvre, une fois l'adhésion établie.

     `untrack` n'est pas un détail : un effet Svelte suit tout ce qu'on lit
     pendant qu'il s'exécute. Sans lui, l'ouverture lisait `phase`, que
     l'ouverture modifie — elle se relançait elle-même, plusieurs fois, en
     parallèle, et l'encart du guetteur restait vide sans un message
     (invariant 35). */
  $effect(() => { untrack(() => porte.start(platform())); });

  const current = $derived(route(hash));
  const tabs = $derived([HOME, ...REGISTRY.filter(v => !v.hold && (!v.only || v.only()))]);
</script>

<!-- L'application ne se monte qu'une fois la porte franchie — **dessous** le
     rideau de l'ouverture, qui s'efface ensuite sur elle : on la voit se
     former au travers, déjà prête. -->
{#if porte.door === "dedans"}
<div class="shell">
<!-- Le bandeau attend que le rideau soit levé : rien ne doit percer
     l'ouverture. -->
{#if !porte.veil}<Release />{/if}
<div class="app">
  <Rail {hash} />

  <!-- En étroit la barre n'existe pas : le visage passe dans l'en-tête, et la
       barre basse reste à quatre entrées. -->
  <header class="mob">
    <a href="#/" class="sigil">C</a>
    <span class="mark">Checkpoint</span>
    <!-- En étroit la barre n'existe pas : la recherche devient une feuille
         qui monte du bas, la forme étroite de la même surface. -->
    <button class="mob-seek" onclick={() => pile.swap("panneau", "Chercher", SeekSheet)} aria-label="Chercher">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="11" cy="11" r="6.4" /><path d="M19.6 19.6l-3-3" /></svg>
    </button>
    <!-- En étroit la barre basse reste à quatre entrées : la charge passe
         dans l'en-tête, comme le visage — et seulement pour qui la tient. -->
    {#each REGISTRY.filter(v => v.hold && (!v.only || v.only())) as v (v.id)}
      <a class="mob-hold" class:on={hash.startsWith(v.href)} href={v.href} aria-label={v.label}>{v.gl}</a>
    {/each}
    <!-- **Le visage passe dans l'en-tête** : sans lui, en étroit, personne
         n'atteignait sa propre feuille — ni ses titres, ni « se déconnecter ». -->
    {#if registre.moi}
      <a class="mob-me" href="#/profil" aria-label="Ma feuille"><Face who={registre.moi} size="m" /></a>
    {/if}
  </header>

  <!-- Volet déplié : **le contenu passe au flou et le volet prend la main**.
       Le flou est l'événement d'ouvrir le lanceur, jamais un état de repos —
       replié, rien n'est flou. -->
  <main class:dim={lanceur.open}>
    {#if registre.phase === "prêt"}
      <div class="focus">
        <Stage routeKey={current.key} {forward}>
          <current.entry.view {...current.props} />
        </Stage>
      </div>
      {#if lanceur.open}<Deck />{/if}
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
</div>

{#each pile.stack as s, i (s.id)}
  <Surface surface={s} index={i}>
    <s.comp {...(s.props ?? {})} close={() => pile.close(s.id)} />
  </Surface>
{/each}
{/if}

<!-- **Le rideau** : l'ouverture à chaque lancement, puis, pour qui n'est pas
     encore entré, les quatre tuiles. -->
{#if porte.veil}
  {#if porte.door !== "examen" && porte.door !== "dedans"}<Release />{/if}
  <Entry />
{/if}

<style>
  /* Une colonne : le bandeau de version, s'il y en a un, puis l'application. */
  .shell { display: flex; flex-direction: column; height: 100%; }
  .app { display: flex; flex: 1; min-height: 0; }
  main { flex: 1; min-width: 0; position: relative; }
  .focus { height: 100%; transition: filter var(--t3) var(--e), transform var(--t3) var(--e); }
  .dim .focus { filter: blur(13px); transform: scale(1.015); pointer-events: none; }
  .mob-seek { display: none; }
  .wait { display: grid; place-content: center; justify-items: center; gap: 10px; height: 100%; color: var(--dim); font-size: 12.5px; }


  .mob, .tabs { display: none; }

  @media (max-width: 860px) {
    /* Une colonne : l'en-tête, la page, la barre basse. **La barre basse est
       dans le flux**, pas fixée : fixée, il fallait soustraire sa hauteur à
       la main, et la soustraction avait 10 px de retard sur sa vraie
       hauteur — la dernière ligne de chaque page passait dessous. */
    .app { flex-direction: column; }
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
    .mark { font-size: 12.5px; font-weight: 600; flex: 1; }
    .mob-seek { display: grid; place-items: center; width: 44px; height: 44px; margin: -7px 0; color: var(--dim); }
    /* En étroit le lanceur n'existe pas : jamais de flou ni de volet derrière. */
    .dim .focus { filter: none; transform: none; pointer-events: auto; }
    main :global(.deck) { display: none; }
    .mob-hold { display: grid; place-items: center; width: 44px; height: 44px; margin: -7px -8px -7px 0;
                font-family: var(--fs); font-size: 17px; color: var(--dim); letter-spacing: 0; line-height: 1; }
    .mob-hold.on { color: var(--ink); box-shadow: inset 0 -1.5px 0 var(--ink); }
    .mob-me { flex: none; display: grid; place-items: center; width: 44px; height: 44px; margin: -7px -8px -7px 0; }
    .mob { flex: none; }
    main { flex: 1; min-height: 0; }
    .tabs {
      display: grid; grid-template-columns: repeat(4, 1fr); flex: none; z-index: 30;
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
