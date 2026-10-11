<script lang="ts">
  /* **La Loge est un fil, pas une pile de blocs.** Dense, dans le sens du
     temps, avec son propre défilement, ouvert en bas — c'est là qu'est le
     présent.

     Les messages consécutifs d'une même personne à moins d'un quart d'heure
     se groupent sous un seul nom : **c'est ce groupement qui fait la
     différence entre un fil et un forum.**

     ⚠️ Lecture seule pour l'instant — prendre la parole et surligner sont des
     écritures, elles arrivent avec la passe des écritures. */
  import { registre } from "#core/model/store.svelte.ts";
  import { Face } from "#core/ui/index.ts";
  import { dayKey, dayName, hhmm, roman } from "#core/model/lexicon.ts";
  import { groupsWith, litIn, logeOf, markers, marksOf, postById, speaksIn, titleOf } from "#core/selectors/index.ts";
  import type { CircleId } from "#core/model/schema.ts";

  let { cid }: { cid: CircleId } = $props();

  const w = $derived(registre.world);
  const pref = $derived(registre.titlePref);
  const me = $derived(registre.me ?? "");
  const allowed = $derived(speaksIn(w, me, cid));
  const thread = $derived(logeOf(w, cid));
  const lit = $derived(litIn(w, cid));

  let folded = $state(false);
  let host = $state<HTMLElement | null>(null);
  /* Deux intentions se disputent le même défilement : « le fil s'ouvre en
     bas » et « rouvrir ramène à l'endroit exact d'où l'on vient ». **La
     seconde doit gagner**, parce qu'elle est explicite et l'autre n'est
     qu'un défaut. Sans ce drapeau, le retour visait juste puis était
     aussitôt écrasé par le défilement de fin — et rien ne le disait. */
  let aiming = false;

  /** **Rouvrir ramène à l'endroit exact d'où l'on vient**, jamais en haut ni
      en bas. Le défilement se fait par minuterie et non par image d'animation :
      une fenêtre masquée n'en produit aucune, et le fil resterait au mauvais
      endroit sans que rien ne le dise. */
  function jump(id: string) {
    aiming = true;
    folded = false;
    setTimeout(() => {
      aiming = false;
      const el = host?.querySelector(`[data-post="${id}"]`) as HTMLElement | null;
      if (!el || !host) return;
      host.scrollTop = el.offsetTop - host.clientHeight / 3;
      el.classList.add("flash");
      setTimeout(() => el.classList.remove("flash"), 1200);
    }, 0);
  }

  /* Le fil s'ouvre en bas : c'est là qu'est le présent. Par minuterie,
     toujours pour la même raison. */
  $effect(() => {
    thread; folded;
    if (folded || !host || aiming) return;
    const h = host;
    setTimeout(() => { if (!aiming) h.scrollTop = h.scrollHeight; }, 0);
  });
</script>

{#if !allowed}
  <!-- **Le vouvoiement de la porte close.** L'application tutoie partout ;
       une seule phrase vouvoie, et c'est volontaire : la porte ne te connaît
       pas. Un écran de refus n'a pas à être aimable, il a à être net. -->
  <div class="shut">
    <p>Vous ne faites pas partie de la grande loge.<br />Ses secrets vous sont interdits.</p>
  </div>
{:else}
  <div class="loge">
    <div class="bar">
      <!-- Un signe qu'on n'a jamais lu n'est pas découvrable : les glyphes
           sont nommés une fois, en tête du fil. -->
      <span class="legend">
        <b>✦</b> surligné — ce que quelqu'un a voulu pouvoir retrouver
      </span>
      <button class="fold" onclick={() => (folded = !folded)} disabled={!lit.length}>
        {folded ? "Dérouler le fil" : `Replier sur ${roman(lit.length)} passages`}
      </button>
    </div>

    {#if folded}
      <div class="kept">
        {#each lit as m (m.id)}
          {@const p = w.people[m.personId]}
          {@const mk = markers(w, m.id)}
          <button class="keep" onclick={() => jump(m.id)}>
            {#if p}<Face who={p} size="s" />{/if}
            <span class="kp">
              <span class="kb">{m.body}</span>
              <span class="km">{p?.firstName} · {dayName(m.at)} · surligné par {mk.map(x => x.firstName).join(", ")}</span>
            </span>
            <span class="go">↩</span>
          </button>
        {/each}
      </div>
    {:else}
      <div class="thread" bind:this={host}>
        {#each thread as m, i (m.id)}
          {@const prev = thread[i - 1]}
          {@const p = w.people[m.personId]}
          {@const grouped = groupsWith(prev, m)}
          {@const mk = markers(w, m.id)}
          {#if !prev || dayKey(prev.at) !== dayKey(m.at)}
            <div class="day"><span>{dayName(m.at)}</span></div>
          {/if}
          <div class="msg" class:grouped data-post={m.id}>
            <span class="av">{#if !grouped && p}<Face who={p} size="s" />{/if}</span>
            <div class="bd">
              {#if !grouped}
                <span class="hd"><b>{p?.firstName}</b><i>{hhmm(m.at)}</i></span>
              {/if}
              {#if m.replyTo}
                {@const r = postById(w, m.replyTo)}
                {#if r}
                  <button class="quote" onclick={() => jump(r.id)}>
                    en réponse à {w.people[r.personId]?.firstName} — « {r.body.slice(0, 60)}… »
                  </button>
                {/if}
              {/if}
              <p>{m.body}</p>
              {#if m.ref && w.catalog[m.ref]}
                <a class="ref" href="#/fiche/{m.ref}">❧ {titleOf(w, m.ref, pref)}</a>
              {/if}
            </div>
            <span class="mk" class:on={mk.length > 0} title={mk.length ? mk.map(x => x.firstName).join(", ") : ""}>
              {#if mk.length}✦ {mk.length > 1 ? mk.length : ""}{/if}
            </span>
          </div>
        {/each}
      </div>
    {/if}

    <p class="price">
      Aucun message n'est poussé : il paraît à la synchronisation suivante, et
      <strong>personne n'est averti</strong>.
    </p>
  </div>
{/if}

<style>
  .shut { padding: 44px 0 30px; }
  .shut p { font-family: var(--fr); font-size: 17px; line-height: 1.7; color: var(--ink2); }

  .loge { padding-top: 14px; }
  .bar { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; margin-bottom: 10px; }
  .legend { font-size: 10.5px; color: var(--faint); }
  .legend b { color: var(--ink); }
  .fold {
    margin-left: auto; padding: 9px 12px; min-height: 44px;
    font-size: 9.5px; font-weight: 700; letter-spacing: .13em; text-transform: uppercase;
    color: var(--dim); border: 1px solid var(--rule2);
  }
  .fold:hover:not(:disabled) { color: var(--ink); border-color: var(--ink); }
  .fold:disabled { opacity: .4; cursor: default; }

  /* Son propre défilement, ouvert en bas. */
  /* `position:relative` n'est pas décoratif : sans lui, `offsetTop` se mesure
     depuis un ancêtre plus lointain et le retour visait 400 px trop haut.
     Et c'est `offsetTop` et non `getBoundingClientRect`, parce que le volet
     est peut-être en train de glisser — une mesure prise pendant une
     transformation inclut la transformation (invariant 18). */
  .thread { position: relative; max-height: 56vh; overflow: auto; border: 1px solid var(--rule); padding: 12px 14px; }
  .day { display: flex; align-items: center; gap: 12px; margin: 16px 0 10px; }
  .day::before, .day::after { content: ""; flex: 1; height: 1px; background: var(--rule); }
  .day span { font-size: 9.5px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: var(--faint); }

  .msg { display: grid; grid-template-columns: 22px minmax(0,1fr) 34px; gap: 10px; padding: 4px 0; }
  .msg.grouped { padding-top: 1px; }
  .hd { display: flex; align-items: baseline; gap: 8px; }
  .hd b { font-size: 12px; font-weight: 600; }
  .hd i { font-style: normal; font-size: 10px; color: var(--faint); font-variant-numeric: tabular-nums; }
  .bd p { font-family: var(--fr); font-size: 14px; line-height: 1.55; color: var(--ink); }
  .quote {
    display: block; text-align: left; font-size: 11px; color: var(--dim);
    border-left: 2px solid var(--rule2); padding: 1px 0 1px 8px; margin: 2px 0 3px;
  }
  .quote:hover { color: var(--ink); border-color: var(--ink); }
  .ref { display: inline-block; margin-top: 3px; font-size: 11px; color: var(--dim); border-bottom: 1px solid var(--rule2); }
  .ref:hover { color: var(--ink); border-color: var(--ink); }
  /* Les commandes restent visibles : dans un fil dense la tentation du survol
     est à son maximum, et c'est là qu'il faut y résister. */
  .mk { font-size: 11px; color: var(--rule2); text-align: right; }
  .mk.on { color: var(--ink); }
  :global(.msg.flash) { background: var(--raise); box-shadow: inset 2px 0 0 var(--ink); }

  .kept { display: flex; flex-direction: column; border-top: 1px solid var(--rule); }
  .keep { display: grid; grid-template-columns: 22px minmax(0,1fr) 20px; gap: 11px; align-items: center;
          padding: 11px 0; min-height: 44px; text-align: left; border-bottom: 1px solid var(--rule); }
  .keep:hover { background: var(--raise); }
  .kp { display: grid; min-width: 0; }
  .kb { font-family: var(--fr); font-size: 14px; line-height: 1.45;
        display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .km { font-size: 10.5px; color: var(--faint); margin-top: 2px; }
  .go { color: var(--faint); text-align: right; }

  .price { margin-top: 12px; font-size: 11px; color: var(--dim); }
</style>
