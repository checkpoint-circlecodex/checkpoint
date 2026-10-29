<script lang="ts">
  /* La feuille de personnage. Elle **porte la trame de son Ordre à présence
     réduite** — touchée par lui, sans être la chambre : la quatrième des
     quatre exceptions au noir et blanc. */
  import { registre } from "#core/model/store.svelte.ts";
  import { Banner, Face, Panes, Traits, gestes, pile } from "#core/ui/index.ts";
  import Lignee from "./Lignee.svelte";
  import KinDeclare from "./KinDeclare.svelte";
  import Fragment from "./Fragment.svelte";
  import { preferTitres } from "#core/model/acts.ts";
  import { platform } from "#platform/index.ts";
  import { hhmm } from "#core/model/lexicon.ts";
  import { weave } from "#core/ui/weave.ts";
  import { KIND, KINDS, STATUS, UNIT, dec, roman, ago } from "#core/model/lexicon.ts";
  import {
    KIN, affinity, favsOf, figures, peaks, pct, signed, singularity, temper, household, kinAsked, progressOf, questsDoneBy, rowsBy, soulLine, titleOf,
  } from "#core/selectors/index.ts";

  let { id }: { id: string } = $props();

  const w = $derived(registre.world);
  const pref = $derived(registre.titlePref);
  const p = $derived(w.people[id]);
  const self = $derived(id === registre.me);
  const f = $derived(p ? figures(w, id) : null);
  const favs = $derived(p ? favsOf(w, id) : []);
  const rows = $derived(p ? rowsBy(w, id) : []);
  const done = $derived(p ? questsDoneBy(w, id) : []);
  const house = $derived(p ? household(w, id) : null);
  /* Ce que d'autres ont déclaré à ton sujet et que tu n'as pas rendu. Ça ne
     se voit que sur ta propre feuille — c'est à toi de répondre, à personne
     d'autre de le savoir. */
  const asked = $derived(self ? kinAsked(w, id) : []);
  const openLignee = () => pile.open("panneau", "La maisonnée", Lignee, { pid: id });
  const openDeclare = () => pile.open("panneau", "Parenté", KinDeclare);

  /* --- Le pied de la feuille : **ce qui ne demande que de la discrétion**.
     L'autorité vit au Greffe ; ici, rien que pour soi. *Une autorité n'est
     pas une discrétion.* --- */
  let reread = $state<string | null>(null);
  let rereading = $state(false);
  async function resync() {
    rereading = true;
    await registre.resync();
    rereading = false;
    reread = hhmm(new Date().toISOString());
  }
  let leaving = $state(false);
  async function leave() {
    await registre.flush();
    await platform().session.forget();
    location.reload();
  }

  let tab = $state("portrait");
  /* **Le portrait dit qui on lit**, pas seulement ce qu'il a fait : son
     tempérament face au groupe, ce qu'il tient pour le meilleur, l'œuvre où
     il est seul contre tous. */
  const t = $derived(p ? temper(w, rows) : null);
  const traits = $derived(t && f ? [
    t.sev === null ? null : { k: "Sévérité", v: signed(t.sev),
      d: Math.abs(t.sev) < .25 ? "juge comme l'ensemble"
        : t.sev < 0 ? `juge ${dec(Math.abs(t.sev))} point${Math.abs(t.sev) >= 2 ? "s" : ""} plus durement que l'ensemble`
                    : `juge ${dec(t.sev)} point${t.sev >= 2 ? "s" : ""} plus généreusement que l'ensemble` },
    { k: "Achèvement", v: pct(t.rate), d: `contre ${pct(t.grate)} pour l'ensemble` },
    t.pref ? { k: "Prédilection", v: KINDS[t.pref as keyof typeof KINDS], d: `${pct(t.prefShare)} de ce qui est inscrit` } : null,
    { k: "Renoncements", v: roman(f.gone), d: f.gone ? "œuvres laissées en chemin" : "ne lâche jamais rien" },
  ] : []);
  const tops = $derived(p ? peaks(w, id).slice(0, 6) : []);
  const alone = $derived(p ? singularity(w, id) : null);
  /* **Toi et X** — sur la feuille de quelqu'un d'autre seulement. */
  const aff = $derived(p && !self && registre.me ? affinity(w, registre.me, id) : null);

  const tabs = $derived([
    { k: "portrait", l: "Portrait" },
    ...(self || !p ? [] : [{ k: "toi", l: `Toi et ${p.firstName}`, n: aff?.common.length ?? 0 }]),
    { k: "favorites", l: "Favoris", n: favs.length },
    { k: "quests", l: "Quêtes", n: done.length },
    { k: "registry", l: "Le registre", n: rows.length },
  ]);
</script>

{#if !p}
  <div class="wrap"><p class="none">Âme inconnue de l'Ordre.</p></div>
{:else}
  <div class="sheet" style="--c:{p.circleRef.color}">
    <canvas class="weave" use:weave={{ kind: p.circle, hex: p.circleRef.hex }} aria-hidden="true"></canvas>

    <div class="wrap">
      <header class="head">
        <Face who={p} size="l" />
        <div class="who">
          <span class="eyebrow">Feuille de personnage</span>
          <h1>{p.firstName}</h1>
          <div class="meta">
            {p.handle} · <a href="#/cercles/{p.circle}">{p.circleRef.one}</a>{p.discord ? ` · ${p.discord} sur Discord` : ""}
            {#if house && house.size > 1}
              <!-- **Le point de la lignée est neutre, et il doit l'être** : les
                   membres d'une maisonnée ne sont pas du même Ordre, une marque
                   colorée obligerait à en trahir un. -->
              <button class="kin" onclick={openLignee} aria-label="La maisonnée, {roman(house.size)} âmes">⁂ {roman(house.size)}</button>
            {/if}
            {#if self}
              <button class="kin" onclick={openDeclare}>Parenté</button>
            {/if}
          </div>
          <p class="line">{soulLine(w, id)}</p>
          {#each asked as a (a.from)}
            <button class="asked" onclick={openDeclare}>
              <b>{w.people[a.from]?.firstName}</b> te déclare <i>{KIN[a.rel].l}</i> — répondre
            </button>
          {/each}
        </div>
        {#if favs.length}
          <a class="opus" href="#/fiche/{favs[0]}">
            <span class="k">Magnum opus</span>
            <span class="t">{titleOf(w, favs[0], pref)}</span>
          </a>
        {/if}
      </header>

      {#if f}
        <div class="meas">
          <div><span class="k">Achevées</span><span class="v">{roman(f.done)}</span></div>
          <div><span class="k">En cours</span><span class="v">{roman(f.under)}</span></div>
          <div><span class="k">Jugement</span><span class="v">{f.avg === null ? "—" : dec(f.avg)}</span></div>
          <div><span class="k">Heures</span><span class="v">{roman(f.hours)}</span></div>
        </div>
      {/if}

      <Panes {tabs} bind:active={tab}>
        {#snippet children(k)}
          {#if k === "portrait"}
            <section class="pane-b">
              <Traits {traits} />
              {#if tops.length}
                <p class="aside">{self ? "Ce que tu tiens" : `Ce que ${p.firstName} tient`} pour le meilleur :</p>
                <div class="peaks">
                  {#each tops as r (r.mediaId)}
                    <a class="pk" href="#/fiche/{r.mediaId}">
                      <span class="pk-n">{r.rating}</span>
                      <span class="pk-t">{titleOf(w, r.mediaId, pref)}</span>
                      <span class="kind">{KIND[w.catalog[r.mediaId].mediaType]}</span>
                    </a>
                  {/each}
                </div>
              {/if}
              {#if alone}
                <Banner href="#/fiche/{alone.id}" k="Seul contre le reste" t={titleOf(w, alone.id, pref)}
                        d="{alone.d > 0 ? 'Défendue' : 'Déclassée'} à {alone.mine} sur dix, quand les autres la jugent {dec(alone.theirs)}. Un écart de {dec(Math.abs(alone.d))}." />
              {/if}
            </section>
            <section class="pane-b">
              <h2>En cours</h2>
              <!-- **« En cours » est un tableau de bord, pas une lecture** :
                   titre et commandes sur la même ligne, dernier checkpoint sur
                   l'autre, tronqué. On vient y agir, pas s'y attarder. -->
              {#each rows.filter(r => r.status === "playing") as r (r.mediaId)}
                {@const m = w.catalog[r.mediaId]}
                {@const last = r.reflections?.at(-1)}
                <a class="live" href="#/fiche/{r.mediaId}">
                  <span class="lv-t">{titleOf(w, r.mediaId, pref)}</span>
                  <span class="lv-m">{KIND[m.mediaType]}{r.progress ? ` · ${progressOf(r, UNIT)}` : ""} · {ago(r.at)}</span>
                  {#if last}<span class="lv-c">« {last.text} »</span>{/if}
                </a>
              {:else}
                <p class="none">Rien en cours.</p>
              {/each}
            </section>
          {:else if k === "toi" && aff}
            <!-- **Toi et X : la comparaison entre amis**, le cœur du projet.
                 Ce qu'on a fréquenté tous les deux, l'écart, le désaccord —
                 et ce que l'autre a adoré sans que tu y aies touché. -->
            <section class="pane-b">
              {#if !aff.common.length}
                <p class="none">Vous n'avez encore rien fréquenté en commun.</p>
              {:else}
                <Traits traits={[
                  { k: "En commun", v: roman(aff.common.length), d: "œuvres fréquentées par vous deux" },
                  { k: "Accord", v: aff.accord === null ? "—" : dec(aff.accord),
                    d: aff.accord === null ? "aucun jugement comparable"
                      : aff.accord < 1 ? "point d'écart moyen — vous vous ressemblez"
                      : aff.accord < 2 ? "points d'écart moyen" : "points d'écart moyen — vous divergez" },
                  aff.clash ? { k: "Divergence", v: dec(aff.clash.d),
                    d: `sur ${titleOf(w, aff.clash.id, pref)} — toi ${aff.clash.me}, ${p.firstName} ${aff.clash.them}` } : null,
                ]} />
                {#if aff.clash && aff.clash.d >= 3}
                  <Banner href="#/fiche/{aff.clash.id}" k="Votre plus grand désaccord" t={titleOf(w, aff.clash.id, pref)}
                          d="Tu l'as jugée {aff.clash.me} sur dix. {p.firstName} {aff.clash.them}. Il y a là une conversation." />
                {/if}
              {/if}
              {#if aff.urge.length}
                <p class="aside">{p.firstName} a adoré, tu n'en as rien fait :</p>
                <div class="reg">
                  {#each aff.urge.slice(0, 6) as r (r.mediaId)}
                    {@const m = w.catalog[r.mediaId]}
                    <a class="r" href="#/fiche/{r.mediaId}">
                      <span class="t">{titleOf(w, r.mediaId, pref)}</span>
                      <span class="kind">{KIND[m.mediaType]} · {m.year}</span>
                      <span class="sc">{r.rating}</span>
                    </a>
                  {/each}
                </div>
              {/if}
            </section>
          {:else if k === "favorites"}
            <section class="pane-b">
              <h2>Ce qu'{p.firstName} distingue</h2>
              <p class="legend">
                <strong>Un favori n'est pas une note.</strong> C'est une liste déclarée,
                ordonnée, plafonnée à douze — le premier rang est son magnum opus.
              </p>
              {#if favs.length}
                <ol class="favs">
                  {#each favs as id2, i (id2)}
                    <li><a href="#/fiche/{id2}"><span class="rk">{roman(i + 1)}</span>{titleOf(w, id2, pref)}</a></li>
                  {/each}
                </ol>
              {:else}
                <p class="none">N'a encore rien distingué.</p>
              {/if}
            </section>
          {:else if k === "quests"}
            <section class="pane-b">
              <h2>Planches accomplies</h2>
              {#if done.length}
                <div class="reg">
                  {#each done as q (q.id)}
                    <a class="r" href="#/quete/{q.id}"><span class="t">{q.title}</span><span class="kind">{q.line}</span></a>
                  {/each}
                </div>
              {:else}
                <p class="none">Aucune, pour l'instant. Les planches attendent.</p>
              {/if}
            </section>
          {:else}
            <section class="pane-b">
              <h2>Le registre</h2>
              <div class="reg">
                {#each rows as r (r.mediaId)}
                  {@const m = w.catalog[r.mediaId]}
                  <a class="r" href="#/fiche/{r.mediaId}">
                    <span class="t">{titleOf(w, r.mediaId, pref)}</span>
                    <span class="kind">{KIND[m.mediaType]} · {STATUS[m.mediaType][r.status]}</span>
                    <span class="sc">{typeof r.rating === "number" ? r.rating : "—"}</span>
                  </a>
                {/each}
              </div>
            </section>
          {/if}
        {/snippet}
      </Panes>

      {#if self}
        <!-- Au pied de sa propre feuille, et seulement de la sienne : des
             réglages que personne d'autre n'a à voir. -->
        <section class="foot">
          <span class="fk">Pour toi seul</span>

          <div class="fr">
            <span class="fl">Titres</span>
            <!-- La recherche interroge toujours les deux titres ; ceci ne
                 change que celui qu'on affiche (invariant 9). -->
            <div class="pick2">
              <button class:on={(p.prefs?.titles ?? "fr") === "fr"} onclick={() => registre.act(preferTitres("fr"))}>En français</button>
              <button class:on={p.prefs?.titles === "vo"} onclick={() => registre.act(preferTitres("vo"))}>D'origine</button>
            </div>
          </div>

          <div class="fr">
            <span class="fl">Le dépôt</span>
            <button class="lk" onclick={resync} disabled={rereading}>{rereading ? "Lecture…" : "Relire maintenant"}</button>
            {#if reread}<span class="fn">relu à {reread}</span>{/if}
            <button class="lk" onclick={() => pile.open("panneau", "Ton fragment", Fragment)}>Lire ton fragment</button>
          </div>

          <!-- En étroit, la barre n'existe pas : signaler un défaut doit se
               trouver aussi ici, au pied de sa propre feuille. -->
          {#if gestes.signaler}
            <div class="fr">
              <span class="fl">Un défaut</span>
              <button class="lk" onclick={() => gestes.signaler?.()}>Signaler un défaut</button>
            </div>
          {/if}
          <div class="fr">
            <span class="fl">Le compte</span>
            {#if !leaving}
              <button class="lk" onclick={() => (leaving = true)}>Se déconnecter</button>
            {:else}
              <span class="fn">Le jeton sera oublié sur cette machine ; il faudra se reconnecter.</span>
              <button class="lk strong" onclick={leave}>Oui, oublier</button>
              <button class="lk" onclick={() => (leaving = false)}>Rester</button>
            {/if}
          </div>
        </section>
      {/if}
    </div>
  </div>
{/if}

<style>
  .sheet { position: relative; min-height: 100%; }
  /* **Présence réduite** : touchée par sa trame, pas baignée dedans. */
  .weave { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 0;
           opacity: .45; pointer-events: none; }
  .wrap { position: relative; z-index: 1; max-width: 900px; margin: 0 auto; padding: 30px 34px 60px; }

  .head { display: flex; align-items: flex-end; gap: 22px; padding-bottom: 20px; border-bottom: 1.5px solid var(--ink); }
  .who { flex: 1; min-width: 0; }
  .eyebrow { display: block; font-size: 9px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; color: var(--faint); }
  h1 { font-family: var(--fs); font-weight: 400; font-size: 40px; line-height: 1; margin-top: 2px; }
  .meta { font-size: 11.5px; color: var(--dim); margin-top: 5px; }
  .meta a { display: inline-flex; align-items: center; min-height: 44px; margin: -14px 0;
            color: var(--ink); font-weight: 600;
            text-decoration: underline; text-decoration-color: var(--rule2); text-underline-offset: 3px; }
  .kin { display: inline-flex; align-items: center; min-height: 44px; margin: -14px 0 -14px 8px;
         padding: 0 4px; font-size: 11.5px; color: var(--dim); }
  .kin:hover { color: var(--ink); text-decoration: underline; text-underline-offset: 3px; }
  /* Neutre, comme le point : une parenté en attente n'est pas une alerte. */
  .asked { display: flex; align-items: center; gap: 5px; min-height: 44px; margin-top: 6px;
           padding: 0 12px; border: 1px solid var(--rule2); font-size: 12px; color: var(--ink2); }
  .asked b { font-family: var(--fs); font-weight: 400; font-size: 15px; }
  .asked:hover { border-color: var(--ink); }
  /* Pas de pronom : on ne connaît pas le genre, et on n'a pas à le demander. */
  .line { font-family: var(--fr); font-style: italic; font-size: 15px; line-height: 1.55;
          color: var(--ink2); margin-top: 9px; max-width: 58ch; }
  .opus { display: grid; gap: 2px; max-width: 190px; min-height: 44px; align-content: center; text-align: right; }
  .opus .k { font-size: 9px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: var(--faint); }
  .opus .t { font-family: var(--fs); font-size: 19px; line-height: 1.1; }

  .meas { display: flex; gap: 34px; margin: 20px 0 26px; }
  .meas .k { display: block; font-size: 9px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: var(--faint); }
  .meas .v { display: block; font-family: var(--fs); font-size: 26px; line-height: 1.1; }

  .pane-b { padding-top: 18px; }
  h2 { font-family: var(--fs); font-weight: 400; font-size: 20px; margin-bottom: 10px; }
  .legend { font-size: 11.5px; color: var(--dim); margin: -4px 0 14px; max-width: 60ch; }
  .none { font-size: 12.5px; color: var(--dim); font-style: italic; }
  .aside { font-size: 11px; color: var(--dim); margin: 20px 0 6px; font-style: italic; font-family: var(--fr); }
  .peaks { display: grid; grid-template-columns: repeat(auto-fill, minmax(216px, 1fr)); border-top: 1px solid var(--rule); }
  .pk { display: grid; grid-template-columns: auto 1fr; gap: 2px 12px; align-items: baseline; padding: 10px 4px;
        min-height: 44px; border-bottom: 1px solid var(--rule); }
  .pk:hover { background: var(--raise); }
  .pk-n { font-family: var(--fs); font-size: 23px; line-height: 1; }
  .pk-t { font-family: var(--fs); font-size: 16px; line-height: 1.15; }
  .pk .kind { grid-column: 2; }

  .live { display: grid; gap: 1px; padding: 10px 0; min-height: 44px; border-bottom: 1px solid var(--rule); }
  .live:hover { background: var(--raise); }
  .lv-t { font-family: var(--fs); font-size: 18px; }
  .lv-m { font-size: 11px; color: var(--dim); }
  .lv-c { font-family: var(--fr); font-style: italic; font-size: 12.5px; color: var(--ink2);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  .favs { list-style: none; border-top: 1px solid var(--rule); }
  .favs a { display: flex; align-items: center; gap: 14px; padding: 9px 0; min-height: 44px;
            border-bottom: 1px solid var(--rule); font-family: var(--fs); font-size: 18px; }
  .favs a:hover { background: var(--raise); }
  .rk { width: 28px; font-size: 11px; color: var(--faint); font-family: var(--fu); }

  .reg { border-top: 1px solid var(--rule); }
  .r { display: grid; grid-template-columns: minmax(0,1fr) auto 32px; gap: 14px; align-items: center;
       padding: 9px 0; min-height: 44px; border-bottom: 1px solid var(--rule); }
  .r:hover { background: var(--raise); }
  .t { font-family: var(--fs); font-size: 17px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .kind { font-size: 11px; color: var(--dim); }
  .sc { font-family: var(--fs); font-size: 17px; text-align: right; font-variant-numeric: tabular-nums; }

  .foot { margin-top: 44px; padding-top: 12px; border-top: 1px solid var(--rule); display: grid; gap: 2px; }
  .fk { font-size: 9px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; color: var(--faint); margin-bottom: 4px; }
  .fr { display: flex; align-items: center; gap: 4px 14px; flex-wrap: wrap; min-height: 44px; }
  .fl { width: 92px; font-size: 11px; color: var(--dim); }
  .pick2 { display: flex; gap: 2px; }
  .pick2 button { min-height: 44px; padding: 0 12px; border: 1px solid var(--rule2); font-size: 11px; color: var(--dim); }
  .pick2 button.on { color: var(--paper); background: var(--ink); border-color: var(--ink); }
  .lk { min-height: 44px; font-size: 11.5px; color: var(--ink2); text-decoration: underline;
        text-decoration-color: var(--rule2); text-underline-offset: 3px; }
  .lk:hover:not(:disabled) { text-decoration-color: var(--ink); color: var(--ink); }
  .lk:disabled { opacity: .5; cursor: default; }
  .lk.strong { font-weight: 600; color: var(--ink); }
  .fn { font-size: 11px; color: var(--faint); font-style: italic; }

  @media (max-width: 860px) {
    .wrap { padding: 22px 18px 80px; }
    .head { flex-wrap: wrap; gap: 14px; }
    .opus { max-width: none; text-align: left; }
    .meas { gap: 20px; flex-wrap: wrap; }
  }
</style>
