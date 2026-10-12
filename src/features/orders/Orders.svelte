<script lang="ts">
  /* La racine des Ordres : **cinq disques qui flottent**, pleine couleur. Et
     la chambre, où la couleur baigne la page en halo flou — la deuxième des
     quatre exceptions au noir et blanc. */
  import { registre } from "#core/model/store.svelte.ts";
  import { CIRCLES, KINDS, STATUS, circle, dec, roman } from "#core/model/lexicon.ts";
  import { Banner, Face, Traits } from "#core/ui/index.ts";
  import { burst } from "#core/ui/burst.ts";
  import { weave } from "#core/ui/weave.ts";
  import { Panes } from "#core/ui/index.ts";
  import Loge from "./Loge.svelte";
  import { avgOf, logeOf, magnum, membersOf, partisan, pct, questsInCircle, register, signed, speaksIn, temper, titleOf } from "#core/selectors/index.ts";
  import { inCircle } from "#core/model/world.ts";
  import type { CircleId } from "#core/model/schema.ts";

  let { cid = null }: { cid?: CircleId | null } = $props();

  const w = $derived(registre.world);
  const pref = $derived(registre.titlePref);
  const c = $derived(cid ? circle(cid) : null);
  const members = $derived(cid ? membersOf(w, cid) : []);
  const rows = $derived(cid ? w.rows.filter(inCircle(w, cid)) : []);
  /* **Le caractère d'un Ordre**, face aux autres : ce qui le distingue, pas
     ce qu'il a en commun avec tout le monde. */
  const tp = $derived(cid ? temper(w, rows) : null);
  const ctraits = $derived(tp ? [
    tp.sev === null ? null : { k: "Sévérité", v: signed(tp.sev),
      d: Math.abs(tp.sev) < .25 ? "juge comme l'ensemble"
        : tp.sev < 0 ? "juge plus durement que les autres Ordres" : "juge plus généreusement que les autres Ordres" },
    { k: "Achèvement", v: pct(tp.rate), d: `contre ${pct(tp.grate)} pour l'ensemble — ${tp.rate >= tp.grate ? "cet Ordre va au bout" : "cet Ordre se lasse"}` },
    tp.pref ? { k: "Prédilection", v: KINDS[tp.pref as keyof typeof KINDS], d: `${pct(tp.prefShare)} de ce qui est inscrit` } : null,
    { k: "Renoncements", v: roman(rows.filter(r => r.status === "dropped").length),
      d: rows.some(r => r.status === "dropped") ? "œuvres laissées en chemin" : "ne lâche jamais rien" },
    { k: "Jugement moyen", v: (a => a === null ? "—" : dec(a))(avgOf(rows)), d: `sur ${roman(rows.filter(r => typeof r.rating === "number").length)} jugements` },
    { k: "Heures", v: roman(rows.reduce((h, r) => h + (r.progress?.unit === "hours" ? r.progress.value : 0), 0)), d: "consacrées, jeux seulement" },
  ] : []);
  const par = $derived(cid ? partisan(w, cid) : null);
  const annals = $derived(cid ? register(w, inCircle(w, cid)).slice(0, 12) : []);
  const opus = $derived(cid ? magnum(w, cid, pref) : []);
  const cquests = $derived(cid ? questsInCircle(w, cid) : []);
  const me = $derived(registre.me ?? "");

  /* La chambre a cinq volets, et le mouvement y est LATÉRAL : changer de
     volet n'est pas descendre d'un cran. */
  let tab = $state("chamber");
  const tabs = $derived(cid ? [
    { k: "chamber", l: "La chambre" },
    { k: "annals",  l: "Annales" },
    { k: "magnum",  l: "Magnum opus", n: opus.filter(x => x.holders.length > 1).length },
    { k: "quests",  l: "Quêtes", n: cquests.length },
    { k: "loge",    l: "La grande loge", n: speaksIn(w, me, cid) ? logeOf(w, cid).length : 0 },
  ] : []);

  const go = (e: MouseEvent, id: CircleId) => {
    e.preventDefault();
    const el = (e.currentTarget as HTMLElement).querySelector(".disc") ?? e.currentTarget as HTMLElement;
    burst(el, circle(id).color, () => { location.hash = `#/cercles/${id}`; });
  };
</script>

{#if !cid}
  <div class="wrap">
    <div class="eyebrow">Les Ordres</div>
    <h1>Cinq manières de fréquenter une œuvre</h1>
    <p class="lede">
      On choisit son Ordre une fois. Il ne dit pas ce qu'on vaut — il dit
      <strong>comment on entre dans les choses</strong>.
    </p>

    <div class="orbs">
      {#each CIRCLES as o (o.id)}
        {@const n = membersOf(w, o.id).length}
        <a class="orb" href="#/cercles/{o.id}" onclick={e => go(e, o.id)}>
          <span class="disc" style="--c:{o.color}">{o.emoji}</span>
          <span class="nm">{o.name}</span>
          <span class="ct">{roman(n)} membre{n > 1 ? "s" : ""}</span>
        </a>
      {/each}
    </div>
  </div>
{:else if !c}
  <div class="wrap"><p class="none">Ordre inconnu.</p></div>
{:else}
  <div class="chamber" style="--c:{c.color}">
    <!-- La trame : dans sa couleur, derrière tout, à très faible opacité.
         Si on la remarque, elle a déjà échoué. -->
    <canvas class="weave" use:weave={{ kind: c.id, hex: c.hex }} aria-hidden="true"></canvas>
    <div class="bath" aria-hidden="true"></div>

    <div class="wrap">
      <a class="back" href="#/cercles">← Les Ordres</a>
      <header class="head">
        <span class="sigil" style="--c:{c.color}">{c.emoji}</span>
        <div>
          <span class="eyebrow">Chambre</span>
          <h1>{c.order}</h1>
          <p class="lede">{c.blurb}</p>
        </div>
      </header>

      <Panes {tabs} bind:active={tab}>
        {#snippet children(k)}
          {#if k === "chamber"}
            <section class="pane-b">
              <Traits traits={ctraits} />
              {#if par}
                <Banner href="#/fiche/{par.id}" k="Ce que cet Ordre défend" t={titleOf(w, par.id, registre.titlePref)}
                        d="{dec(par.mine)} ici, contre {dec(par.theirs)} ailleurs. Un écart de {dec(par.d)}." />
              {/if}
            </section>
            <section class="pane-b">
              <h2>Les membres</h2>
              <div class="troop">
                {#each members as p (p.id)}
                  <a class="sold" href="#/personne/{p.id}">
                    <Face who={p} size="m" />
                    <b>{p.firstName}</b>
                    <i>{roman(w.rows.filter(r => r.personId === p.id).length)}</i>
                  </a>
                {/each}
              </div>
            </section>

          {:else if k === "annals"}
            <section class="pane-b">
              <h2>Annales de l'Ordre</h2>
              <div class="reg">
                {#each annals as r (r.personId + r.mediaId)}
                  {@const m = w.catalog[r.mediaId]}
                  {@const p = w.people[r.personId]}
                  <a class="r r-ann" href="#/fiche/{r.mediaId}">
                    {#if p}<Face who={p} size="s" />{/if}
                    <span class="t">{titleOf(w, r.mediaId, pref)}</span>
                    <span class="st">{STATUS[m.mediaType][r.status]}</span>
                    <span class="sc">{typeof r.rating === "number" ? r.rating : "—"}</span>
                  </a>
                {/each}
              </div>
            </section>

          {:else if k === "magnum"}
            <section class="pane-b">
              <h2>Magnum opus</h2>
              <p class="legend">
                Ce que les membres ont <strong>déclaré</strong>, jamais ce qu'ils ont le mieux noté.
              </p>
              {#if opus.filter(x => x.holders.length > 1).length}
                <div class="reg">
                  {#each opus.filter(x => x.holders.length > 1) as x (x.id)}
                    <a class="r" href="#/fiche/{x.id}">
                      <span class="t">{titleOf(w, x.id, pref)}</span>
                      <span class="hold">{#each x.holders as h (h.id)}<Face who={h} size="s" />{/each}</span>
                      <span class="sc">{x.avg === null ? "—" : dec(x.avg)}</span>
                    </a>
                  {/each}
                </div>
              {:else}
                <!-- Quand aucune œuvre ne réunit deux voix, on le dit plutôt
                     que de feindre l'unanimité. -->
                <p class="none">Aucune œuvre ne réunit deux voix de cet Ordre. L'accord viendra, ou pas.</p>
              {/if}
            </section>

          {:else if k === "quests"}
            <section class="pane-b">
              <h2>Planches de l'Ordre</h2>
              {#if cquests.length}
                <div class="reg">
                  {#each cquests as x (x.q.id)}
                    <a class="r" href="#/quete/{x.q.id}">
                      <span class="t">{x.q.title}</span>
                      <span class="hold">{#each x.holders as h (h.id)}<Face who={h} size="s" />{/each}</span>
                      <span class="sc">{roman(x.holders.length)}</span>
                    </a>
                  {/each}
                </div>
              {:else}
                <p class="none">Aucune planche accomplie par cet Ordre.</p>
              {/if}
            </section>

          {:else}
            <Loge {cid} />
          {/if}
        {/snippet}
      </Panes>
    </div>
  </div>
{/if}

<style>
  .wrap { max-width: 980px; margin: 0 auto; padding: 30px 34px 60px; }
  .eyebrow { display: block; font-size: 9px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; color: var(--faint); }
  h1 { font-family: var(--fs); font-weight: 400; font-size: 34px; line-height: 1.05; margin-top: 8px; }
  .lede { font-family: var(--fr); font-size: 14.5px; line-height: 1.6; color: var(--ink2); max-width: 62ch; margin-top: 8px; }
  .legend { font-size: 11.5px; color: var(--dim); margin: -4px 0 12px; }
  .none { font-size: 12.5px; color: var(--dim); font-style: italic; }

  .orbs { display: flex; justify-content: center; gap: clamp(14px, 3.6vw, 44px); flex-wrap: wrap; padding: 46px 0 26px; }
  .orb { display: flex; flex-direction: column; align-items: center; gap: 14px; padding: 14px; }
  .disc {
    display: grid; place-items: center; width: 104px; height: 104px; border-radius: 50%;
    background: var(--c); font-size: 43px; letter-spacing: 0;
    transition: transform var(--t2) var(--e);
    /* Les disques dérivent : ils flottent, ils ne tournent pas. */
    animation: derive 9s ease-in-out infinite;
  }
  .orb:nth-child(2n) .disc { animation-delay: -3.2s; }
  .orb:nth-child(3n) .disc { animation-delay: -6.1s; }
  .orb:hover .disc { transform: scale(1.045); }
  @keyframes derive { 0%,100% { translate: 0 0; } 50% { translate: 0 -7px; } }
  @media (prefers-reduced-motion: reduce) { .disc { animation: none; } }
  .nm { font-family: var(--fs); font-size: 23px; }
  .ct { font-size: 10.5px; letter-spacing: .14em; text-transform: uppercase; color: var(--faint); margin-top: -10px; }

  /* `min-height` et non `height` : la trame doit couvrir toute la hauteur de
     ce qu'on fait défiler, sinon elle s'arrête au premier écran et la page
     continue sur du papier nu. */
  .chamber { position: relative; min-height: 100%; }
  .weave { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 0; pointer-events: none; }
  /* Le halo est la couleur, jamais un aplat. */
  .bath {
    position: absolute; inset: 0; pointer-events: none; z-index: 0; opacity: 0;
    background: radial-gradient(60% 52% at 50% 16%, var(--c) 0%, transparent 72%);
    filter: blur(48px); animation: bathe 620ms var(--e) forwards;
  }
  @keyframes bathe { to { opacity: .3; } }
  .chamber .wrap { position: relative; z-index: 1; }
  .chamber h1 { color: var(--c); }

  .back { display: inline-flex; align-items: center; min-height: 44px; font-size: 10px;
          font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: var(--faint); }
  .back:hover { color: var(--ink); }
  .head { display: flex; align-items: center; gap: 20px; margin-top: 4px; }
  .sigil { display: grid; place-items: center; width: 64px; height: 64px; flex: none;
           border-radius: 50%; background: var(--c); font-size: 30px; letter-spacing: 0; }

  .pane-b { padding-top: 18px; }
  h2 { font-family: var(--fs); font-weight: 400; font-size: 20px; margin-bottom: 10px; }

  .troop { display: flex; flex-wrap: wrap; gap: 4px; }
  .sold { display: flex; flex-direction: column; align-items: center; gap: 7px; width: 82px; padding: 10px 0; min-height: 44px; }
  .sold:hover { background: var(--raise); }
  .sold b { font-size: 11.5px; font-weight: 600; }
  .sold i { font-style: normal; font-size: 10px; color: var(--faint); }

  .reg { border-top: 1px solid var(--rule); }
  .r { display: grid; grid-template-columns: minmax(0,1fr) auto 34px; gap: 14px; align-items: center;
       padding: 9px 0; min-height: 44px; border-bottom: 1px solid var(--rule); }
  .r-ann { grid-template-columns: 22px minmax(0,1fr) auto 34px; }
  .r:hover { background: var(--raise); }
  .t { font-family: var(--fs); font-size: 17px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .hold { display: flex; gap: 3px; }
  .st { font-size: 11px; font-weight: 600; color: var(--ink2); }
  .sc { font-family: var(--fs); font-size: 17px; text-align: right; font-variant-numeric: tabular-nums; }

  @media (max-width: 860px) {
    .wrap { padding: 22px 18px 80px; }
    .orbs { gap: 10px; padding: 26px 0 16px; }
    .disc { width: 84px; height: 84px; font-size: 34px; }
    .nm { font-size: 19px; }
    .head { gap: 14px; }
    .sigil { width: 48px; height: 48px; font-size: 23px; }
  }
</style>
