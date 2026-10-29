<script lang="ts">
  /* **Une porte par pièce.** La barre sépare *agir* — inscrire, voir ses en
     cours, ouvrir une quête — de *parcourir*. Une règle les sépare, et elle
     subsiste quand la barre est repliée.

     « Ma Feuille » n'y figure pas : le visage en bas y mène déjà, et deux
     portes pour la même pièce, c'est une porte de trop. */
  import { registre } from "#core/model/store.svelte.ts";
  import { Face } from "#core/ui/index.ts";
  import { gestes, pile } from "#core/ui/index.ts";
  import { Live } from "#features/live/index.ts";
  import { Builder } from "#features/quests/index.ts";
  import { HOME, REGISTRY } from "./routes.ts";
  import { lanceur } from "./launcher.svelte.ts";

  let { hash }: { hash: string } = $props();
  const collapsed = $derived(!lanceur.open);

  /* **Trois gestes s'y distinguent, et la distinction est la règle** :
     choisir une destination referme ; déplier une section ne referme pas —
     le chevron n'est pas un choix ; cliquer dans le champ ne referme pas —
     c'est le contraire d'un choix, c'est le début d'un. Les liens appellent
     donc `chose()`, et rien d'autre ne le fait. */
  const chose = () => lanceur.chose();

  const doors = $derived(REGISTRY.filter(v => !v.only || v.only()));
  const roam = $derived(doors.filter(v => !v.hold));
  /* Ce qu'on **tient**, sous sa propre règle : ni une action, ni une
     promenade. Absent pour qui n'a pas la charge — pas grisé, absent. */
  const hold = $derived(doors.filter(v => v.hold));
  const moi = $derived(registre.moi);
  let open = $state<Record<string, boolean>>({});
</script>

<aside class="rail" class:collapsed>
  <div class="top">
    <a href="#/" class="sigil" title="Le registre">C</a>
    <span class="mark"><b>Checkpoint</b></span>
    <button class="tgl" onclick={() => lanceur.set(!lanceur.open)}
            aria-label={collapsed ? "Déplier la barre latérale" : "Replier la barre latérale"}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="1.6" stroke-linecap="round"><path d="M14.5 6L9 12l5.5 6" /></svg>
    </button>
  </div>

  {#if collapsed}
    <button class="find-ic" onclick={() => lanceur.seek()} aria-label="Chercher une œuvre ou quelqu'un">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="11" cy="11" r="6.4" /><path d="M19.6 19.6l-3-3" /></svg>
    </button>
  {:else}
    <label class="find">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="11" cy="11" r="6.4" /><path d="M19.6 19.6l-3-3" /></svg>
      <input bind:this={lanceur.field} bind:value={lanceur.query} type="search" placeholder="Œuvres, gens…" autocomplete="off" aria-label="Chercher" />
    </label>
  {/if}

  <!-- **Une porte par pièce**, et la barre sépare ce qu'on fait de ce qu'on
       parcourt. La règle entre les deux subsiste quand la barre est repliée. -->
  <div class="lbl">Agir</div>
  <button class="act" onclick={() => gestes.inscrire?.()}>
    <span class="gl">+</span><span class="t">Inscrire une œuvre</span>
  </button>
  <button class="act" onclick={() => pile.swap("panneau", "Ce que tu mènes", Live)}>
    <span class="gl">◈</span><span class="t">Mes en cours</span>
  </button>
  <button class="act" onclick={() => pile.swap("panneau", "Planter une quête", Builder)}>
    <span class="gl">⚑</span><span class="t">Ouvrir une quête</span>
  </button>

  <div class="sep"></div>
  <div class="lbl">Parcourir</div>
  <nav>
    <a class="row" class:on={hash === HOME.href} href={HOME.href} onclick={chose}>
      <span class="gl">{HOME.gl}</span><span class="t">{HOME.label}</span>
    </a>
    {#each roam as v (v.id)}
      {@const subs = v.subs?.() ?? null}
      <div class="grp" class:open={open[v.id]}>
        <div class="row" class:on={hash.startsWith(v.href)}>
          <a href={v.href} title={v.label} onclick={chose}><span class="gl">{v.gl}</span><span class="t">{v.label}</span></a>
          {#if subs}
            <!-- Déplier une section n'est pas choisir : ça ne referme rien. -->
            <button class="exp" aria-expanded={!!open[v.id]} aria-label="Déplier {v.label}"
                    onclick={() => (open = { ...open, [v.id]: !open[v.id] })}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   stroke-width="2.4" stroke-linecap="round"><path d="M9.5 6l6 6-6 6" /></svg>
            </button>
          {/if}
        </div>
        {#if subs && open[v.id]}
          <div class="sub">
            {#each subs as s (s.href)}
              <a href={s.href} class:on={hash === s.href} onclick={chose}>{s.label}<span class="n">{s.n}</span></a>
            {/each}
          </div>
        {/if}
      </div>
    {/each}
  </nav>

  {#if hold.length}
    <div class="sep"></div>
    <div class="lbl">Tenir</div>
    {#each hold as v (v.id)}
      <a class="act" class:here={hash.startsWith(v.href)} href={v.href} title={v.label} onclick={chose}>
        <span class="gl">{v.gl}</span><span class="t">{v.label}</span>
      </a>
    {/each}
  {/if}

  <!-- **Signaler un défaut** (demandé par Nathan le 12 octobre) : ni agir ni
       parcourir — un mot au projet. Juste au-dessus du visage, discret mais
       toujours là, replié compris. -->
  <button class="act report" onclick={() => gestes.signaler?.()} title="Signaler un défaut">
    <span class="gl">⚐</span><span class="t">Signaler un défaut</span>
  </button>

  <div class="foot">
    {#if moi}
      <a href="#/profil" onclick={chose}>
        <Face who={moi} size="m" />
        <span class="who"><b>{moi.firstName}</b><i>{moi.circleRef.one}</i></span>
      </a>
    {/if}
  </div>
</aside>

<style>
  .rail {
    position: relative;
    width: var(--rail); flex: none; display: flex; flex-direction: column;
    padding: 16px 16px 12px; border-right: 1px solid var(--rule);
    transition: width var(--t2) var(--e);
  }
  /* La barre latérale est le corps de la console : elle ne se défocalise
     jamais, et elle ne porte aucune couleur. */
  /* Repliée, la colonne utile fait **exactement 44 px** : la largeur d'une
     cible (invariant 20). Avec 10 px de marge elle en faisait 40, et tout ce
     qui mesurait 44 débordait d'un côté — le sceau sortait par la gauche. */
  .collapsed { width: var(--railc); padding-left: 8px; padding-right: 8px; }

  .top { display: flex; align-items: center; gap: 10px; min-height: 44px; }
  /* **Cibles tactiles d'au moins 44 px partout, bureau compris** (invariant
     20). Le cadre visible reste petit ; c'est la zone qu'on vise qui grandit,
     et les marges négatives empêchent la mise en page de s'écarter. */
  .sigil {
    position: relative;
    display: grid; place-items: center; width: 44px; height: 44px; flex: none;
    margin: -9px 0 -9px -9px; font-family: var(--fs); font-size: 15px;
    letter-spacing: 0; line-height: 1;
  }
  .sigil::before {
    content: ""; position: absolute; width: 26px; height: 26px;
    border: 1.5px solid var(--ink);
  }
  .mark { flex: 1; font-size: 12.5px; letter-spacing: .02em; }
  .tgl { display: grid; place-items: center; width: 44px; height: 44px; margin: 0 -9px 0 0; color: var(--dim); }
  .tgl:hover { color: var(--ink); }
  /* **Repliée, la barre se déplie par un bouton à elle**, entre le sceau et
     la loupe (décidé par Nathan le 12 octobre). Elle n'avait que la loupe,
     et il l'avait trouvée par hasard : masquer la bascule à l'état replié,
     c'était retirer la seule porte de sortie. Le chevron se retourne — il
     montre le sens où l'on va. */
  .collapsed .mark { display: none; }
  .collapsed .top { flex-direction: column; gap: 4px; }
  .collapsed .sigil, .collapsed .tgl { margin: 0; }
  .collapsed .tgl svg { transform: rotate(180deg); }

  .lbl {
    margin: 22px 0 6px; font-size: 9px; font-weight: 700; letter-spacing: .2em;
    text-transform: uppercase; color: var(--faint);
  }
  /* La règle qui sépare agir de parcourir subsiste quand la barre est repliée. */
  .collapsed .lbl { color: transparent; border-top: 1px solid var(--rule); margin-top: 18px; }

  .find { display: flex; align-items: center; gap: 8px; min-height: 44px; margin-top: 14px; padding: 0 10px;
          border: 1px solid var(--rule2); background: var(--paper); color: var(--dim); }
  .find:focus-within { border-color: var(--ink); color: var(--ink); }
  .find input { flex: 1; min-width: 0; border: none; background: none; outline: none; font-size: 12.5px; }
  .find-ic { display: grid; place-items: center; width: 44px; height: 44px; margin: 4px auto 0; color: var(--dim); }
  .find-ic:hover { color: var(--ink); }
  .sep { height: 1px; background: var(--rule); margin-top: 16px; }
  /* Repliée, c'est l'étiquette qui porte la règle : le filet en plus en
     faisait deux à chaque séparation. */
  .collapsed .sep { display: none; }
  .act { display: flex; align-items: center; gap: 11px; width: 100%; min-height: 44px; padding: 8px 0;
         font-size: 13px; font-weight: 600; color: var(--ink); white-space: nowrap; }
  /* Un bouton carré ne centre pas son glyphe tout seul : chasse normale,
     interlettrage à zéro, et une grille (invariant 30). */
  .act .gl { display: grid; place-items: center; width: 14px; flex: none;
             font-size: 16px; letter-spacing: 0; line-height: 1; }
  .act:hover .t { text-decoration: underline; text-underline-offset: 3px; }
  .collapsed .act { justify-content: center; }

  nav { display: flex; flex-direction: column; }
  .row { display: flex; align-items: center; min-height: 44px; }
  /* Le lien remplit toute la hauteur de sa rangée : centré dans 44 px, il
     n'en couvrait que 22 — la rangée avait la taille, pas la cible. */
  .row > a, nav > .row { flex: 1; align-self: stretch; display: flex; align-items: center; gap: 11px; }
  .row .gl { width: 14px; flex: none; text-align: center; font-family: var(--fs); font-size: 15px; letter-spacing: 0; color: var(--faint); }
  .row .t { font-size: 13px; font-weight: 400; white-space: nowrap; color: var(--ink2); }
  /* **La section en cours, comme le prototype la marque** : l'icône et le
     libellé passent à l'encre, le libellé en gras — et repliée, où il n'y a
     plus de libellé, un fond grisé. Le portage y avait mis un trait au bord
     gauche de la rangée ; replié il tombait juste, déplié il touchait
     l'icône (signalé par Nathan le 20 octobre). Le prototype n'avait pas de
     trait : on revient à lui. */
  .row.on .gl, .row.on .t { color: var(--ink); }
  .row.on .t { font-weight: 600; }
  .row:hover .gl, .row:hover .t { color: var(--ink); }
  .collapsed .row.on, .collapsed .act.here { background: var(--sink); }
  .row:hover .t { text-decoration: underline; text-underline-offset: 3px; }
  .collapsed .t, .collapsed .exp, .collapsed .sub, .collapsed .who { display: none; }
  /* **Un seul axe** : repliée, chaque glyphe se centre — ceux d'agir, ceux
     de parcourir, le visage. Ils se centraient pour agir et se collaient à
     gauche pour parcourir. */
  .collapsed .row > a, .collapsed nav > .row { justify-content: center; gap: 0; }
  .collapsed .foot a { justify-content: center; gap: 0; }

  .exp { display: grid; place-items: center; width: 44px; height: 44px; margin-right: -9px; color: var(--faint); }
  .exp:hover { color: var(--ink); }
  .sub { display: flex; flex-direction: column; padding: 2px 0 6px 25px; }
  .sub a { display: flex; gap: 8px; padding: 5px 0; min-height: 44px; align-items: center; font-size: 12px; color: var(--dim); }
  .sub a.on, .sub a:hover { color: var(--ink); }
  .sub .n { margin-left: auto; font-size: 10px; color: var(--faint); }

  /* Le signalement pousse le pied vers le bas : c'est lui qui prend
     l'espace libre, et le visage reste collé en dessous. */
  .report { margin-top: auto; color: var(--dim); font-weight: 500; }
  .report:hover { color: var(--ink); }
  .foot { padding-top: 12px; border-top: 1px solid var(--rule); }
  .foot a { display: flex; align-items: center; gap: 10px; min-height: 44px; }
  .who { display: grid; }
  .who b { font-size: 12px; }
  .who i { font-style: normal; font-size: 10px; color: var(--faint); }

  /* **La barre n'existe pas en étroit** : le visage passe dans l'en-tête et
     la barre basse prend le relais. La règle est posée ici, dans le composant
     qui la connaît — depuis la coque, un `:global` perdrait contre la
     spécificité du style scopé, en silence. */
  @media (max-width: 860px) { .rail { display: none; } }
</style>
