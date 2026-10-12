<script lang="ts">
  /* **Le Greffe : ce qui demande une autorité, et rien d'autre.** Admettre,
     écarter, fondre un doublon, passer la charge. Ce qui ne demande que de la
     discrétion — resynchroniser, régler l'affichage — vit au pied de sa
     propre feuille. *Une autorité n'est pas une discrétion.*

     Trois choses que l'écran dit au lieu de les taire : rien n'y est en
     coulisse (tout acte paraît dans l'historique que chacun lit) ; il n'y a
     pas de modération (elle n'est pas représentable) ; rien ne s'y efface. */
  import { registre } from "#core/model/store.svelte.ts";
  import { Face } from "#core/ui/index.ts";
  import { KIND, ago, dateShort, de, roman } from "#core/model/lexicon.ts";
  import { aliasList, nameList, suspected, titleOf, vouchedBy } from "#core/selectors/index.ts";
  import { defaire, fondre } from "#core/model/acts.ts";

  const w = $derived(registre.world);
  const pref = $derived(registre.titlePref);
  const knocks = $derived(registre.knocks);
  const dups = $derived(suspected(w));
  const al = $derived(aliasList(w));
  const stewards = $derived(registre.stewards);
  let pass = $state("");

  const LABEL: Record<string, string> = {
    admission: "Admission", ecart: "Écarté", alias: "Doublon fondu", defait: "Alias défait", greffe: "Greffe confié",
    correction: "Fiche corrigée",
  };
  const nameOf = (login: string) => w.people[login]?.firstName ?? `@${login}`;
</script>

{#if !registre.steward}
  <!-- **La porte n'est pas fermée : elle n'existe pas** pour qui n'a pas la
       charge (invariant 32). Qui tape l'adresse reçoit une phrase qui le dit,
       sans cérémonie et sans mensonge. -->
  <div class="wrap shut">
    <span class="eyebrow">Le Greffe</span>
    <h1>Tu ne tiens pas le greffe</h1>
    <p class="lede">
      Ce n'est pas une pièce fermée, c'est une charge — et elle se lit dans
      l'organisation, pas dans une liste de l'application.
    </p>
    <p class="legend">Rien ne s'y décide en coulisse : tout acte de greffier paraît dans l'historique du dépôt, que tout le monde lit.</p>
  </div>
{:else}
  <div class="wrap">
    <span class="eyebrow">Le Greffe</span>
    <h1>{knocks.length ? `${roman(knocks.length)} ${knocks.length > 1 ? "coups" : "coup"} à la porte` : "Personne à la porte"}</h1>
    <p class="lede">
      Tu tiens le registre : tu admets, tu fonds les doublons, tu passes la charge.
      <strong>Rien de plus</strong> — il n'y a pas de modération ici, et il n'y en
      aura pas : on n'a pas accès en écriture au fichier d'un autre.
    </p>
    <p class="open">Et rien n'y est en coulisse : chaque acte paraît dans l'historique du dépôt, que les {roman(Object.keys(w.people).length)} membres lisent.</p>

    {#if registre.orgError}
      <!-- Un acte qui échoue se dit. On n'inscrit rien au journal tant que
           l'organisation n'a pas répondu oui. -->
      <p class="err">GitHub a refusé : {registre.orgError}</p>
    {/if}

    <section>
      <h2>Les admissions</h2>
      <p class="legend">
        Une demande est une issue du dépôt public — le seul geste qu'un compte
        étranger puisse faire. <strong>Personne n'en est averti</strong> : elles
        attendent ici qu'on ouvre l'application.
      </p>
      {#if knocks.length}
        <div class="ks">
          {#each knocks as k (k.issue)}
            {@const v = vouchedBy(w, k.vouchedName)}
            <div class="k">
              <div class="k-l">
                <span class="login">@{k.login}</span>
                <span class="nm">{#if k.firstName}{k.firstName}{:else}<i>sans prénom</i>{/if}</span>
                <span class="kind">{ago(k.at)}</span>
              </div>
              <div class="k-v">
                {#if v}
                  <span class="v"><Face who={v} size="s" />se réclame {de(v.firstName).slice(0, -v.firstName.length)}<b>{v.firstName}</b>{#if k.vouchedAs} — <i>{k.vouchedAs}</i>{/if}</span>
                {:else if v === false}
                  <span class="no">⚠ se réclame de « {k.vouchedName} » — aucun membre de ce nom</span>
                {:else}
                  <span class="no">⚠ ne se réclame de personne</span>
                {/if}
                <span class="kind">{k.discord ? `discord · ${k.discord}` : "aucune adresse laissée"}</span>
              </div>
              <div class="k-a">
                <button class="btn ink" onclick={() => registre.admit(k)}>Admettre</button>
                <button class="btn" onclick={() => registre.shun(k)}>Écarter</button>
              </div>
            </div>
          {/each}
        </div>
        <p class="legend what">
          <b>Admettre</b> envoie une <strong>invitation</strong> dans l'organisation et referme la
          demande avec un mot — GitHub ne fait entrer personne de force : il
          faudra l'accepter. Son fragment naîtra avec sa première inscription.
          <b>Écarter</b> referme la demande et n'inscrit rien d'autre : on n'ouvre aucune liste noire.
        </p>
      {:else}
        <p class="none">Personne à la porte. C'est l'état normal.</p>
      {/if}
    </section>

    <section>
      <h2>Les doublons</h2>
      <p class="legend">
        Deux personnes inscrivent la même œuvre à la main, et le catalogue en porte deux.
        <strong>Fondre n'est pas réécrire</strong> : leurs fichiers sont hors d'atteinte. Tu
        déclares un alias dans le tien, et il s'applique à la lecture — comme un favori,
        comme un surlignage.
      </p>
      {#if dups.length}
        <div class="ds">
          {#each dups as d (d.keep)}
            <div class="d">
              <span class="keep"><b>{titleOf(w, d.keep, pref)}</b><i>{KIND[w.catalog[d.keep].mediaType]} · {w.catalog[d.keep].year} · {d.keep}</i></span>
              <span class="arr" aria-hidden="true">←</span>
              <span class="drop">
                {#each d.drop as x (x)}<b>{titleOf(w, x, pref)}</b><i>{x}{w.catalog[x]?.manual ? " · inscrit à la main" : ""}</i>{/each}
              </span>
              <button class="btn" onclick={() => registre.act(fondre(d.drop[0], d.keep))}>Fondre</button>
            </div>
          {/each}
        </div>
      {:else}
        <p class="none">Aucun rapprochement de titres. Le catalogue est net.</p>
      {/if}
      {#if al.length}
        <div class="al">
          <span class="lbl">Alias déclarés</span>
          {#each al as a (a.from)}
            <div class="a">
              <span><b>{titleOf(w, a.from, pref) || a.from}</b> <i>{a.from}</i> → <b>{titleOf(w, a.to, pref)}</b> <i>{a.to}</i></span>
              <button class="btn" onclick={() => registre.act(defaire(a.from))}>Défaire</button>
            </div>
          {/each}
          <p class="legend">Une déclaration se retire. <strong>Rien ici n'efface quoi que ce soit</strong> — et c'est la seule garantie qui tienne quand on se trompe.</p>
        </div>
      {/if}
    </section>

    <section>
      <h2>Le journal</h2>
      {#if w.journal.length}
        <div class="js">
          {#each w.journal as j (j.at + j.by + j.what)}
            {@const by = w.people[j.by]}
            <div class="j">
              <span class="jd">{dateShort(j.at)}</span>
              <span class="jk">{LABEL[j.kind] ?? j.kind}</span>
              <span class="jw"><b>{j.kind === "alias" || j.kind === "defait" || j.kind === "correction" ? titleOf(w, j.what, pref) || j.what : nameOf(j.what)}</b>{#if j.note} <i>{j.note}</i>{/if}</span>
              <span class="jb">{#if by}<Face who={by} size="s" />{/if}<span>{by?.firstName ?? j.by}</span></span>
            </div>
          {/each}
        </div>
      {:else}
        <p class="none">Aucun acte encore. Le premier s'inscrira ici, et chez celui qui l'a fait.</p>
      {/if}
    </section>

    <section>
      <h2>La charge</h2>
      <p class="legend">
        Tenue par <b>{nameList(w, stewards.filter(s => w.people[s])) || stewards.map(s => "@" + s).join(", ")}</b>.
        La passer change un rôle dans l'organisation GitHub — <strong>il n'y a pas
        d'administrateur du côté de l'application</strong>, et c'est ce qui empêche une
        autorité fictive de s'y installer.
      </p>
      <form class="pass" onsubmit={e => { e.preventDefault(); if (pass) { registre.entrust(pass); pass = ""; } }}>
        <select bind:value={pass}>
          <option value="">Confier le greffe à…</option>
          {#each Object.values(w.people).filter(p => !stewards.includes(p.id)).sort((a, b) => a.firstName.localeCompare(b.firstName, "fr")) as p (p.id)}
            <option value={p.id}>{p.firstName} — {p.circleRef.one}</option>
          {/each}
        </select>
        <button class="btn ink" disabled={!pass}>Confier</button>
      </form>
    </section>
  </div>
{/if}

<style>
  .wrap { max-width: 900px; margin: 0 auto; padding: 30px 34px 60px; }
  .eyebrow { display: block; font-size: 9px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; color: var(--faint); }
  h1 { font-family: var(--fs); font-weight: 400; font-size: 34px; line-height: 1.05; margin-top: 8px; }
  .shut h1 { max-width: 22ch; }
  .lede { font-family: var(--fr); font-size: 14.5px; line-height: 1.6; color: var(--ink2); max-width: 62ch; margin-top: 8px; }
  .open { font-size: 11.5px; color: var(--dim); border-left: 2px solid var(--rule2); padding-left: 11px; margin-top: 12px; }
  .err { margin-top: 14px; padding: 10px 13px; border: 1px solid var(--ink); background: var(--raise); font-size: 12.5px; }
  section { margin-top: 32px; }
  h2 { font-family: var(--fs); font-weight: 400; font-size: 20px; margin-bottom: 6px; }
  .legend { font-size: 11.5px; color: var(--dim); line-height: 1.55; max-width: 66ch; margin-bottom: 12px; }
  .what { margin-top: 12px; }
  .none { font-size: 12.5px; color: var(--dim); font-style: italic; }
  .kind { font-size: 11px; color: var(--dim); }

  .btn { min-height: 44px; padding: 0 13px; border: 1px solid var(--rule2);
         font-size: 10px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--dim); }
  .btn:hover:not(:disabled) { color: var(--ink); border-color: var(--ink); }
  .btn.ink { color: var(--ink); border-color: var(--ink); }
  .btn:disabled { opacity: .4; cursor: default; }

  .ks, .ds { display: flex; flex-direction: column; border: 1px solid var(--rule2); }
  .k { display: grid; grid-template-columns: 1fr auto; gap: 4px 18px; align-items: center; padding: 12px 14px; }
  .k + .k, .d + .d { border-top: 1px solid var(--rule); }
  .k-l { display: flex; align-items: baseline; gap: 11px; flex-wrap: wrap; }
  .login { font-family: ui-monospace, monospace; font-size: 11.5px; color: var(--dim); }
  .nm { font-family: var(--fs); font-size: 17px; }
  .nm i { color: var(--faint); font-size: 14px; }
  .k-v { grid-column: 1; display: flex; align-items: center; gap: 16px; flex-wrap: wrap; font-size: 12px; }
  .v { display: inline-flex; align-items: center; gap: 8px; color: var(--ink2); }
  .v i { color: var(--dim); }
  /* L'avertissement ne porte pas de couleur : un filet et du gras. */
  .no { font-weight: 600; border-bottom: 1.5px solid var(--ink); padding-bottom: 2px; }
  .k-a { grid-row: 1 / span 2; grid-column: 2; display: flex; gap: 8px; }

  .d { display: flex; align-items: center; gap: 16px; padding: 12px 14px; flex-wrap: wrap; }
  .keep, .drop { display: flex; flex-direction: column; gap: 1px; }
  .keep b, .drop b { font-family: var(--fs); font-weight: 400; font-size: 16px; }
  .keep i, .drop i { font-style: normal; font-size: 10px; letter-spacing: .09em; text-transform: uppercase; color: var(--faint); }
  .drop b { text-decoration: line-through; text-decoration-thickness: 1px; color: var(--dim); }
  .arr { color: var(--faint); }
  .d .btn { margin-left: auto; }
  .al { margin-top: 18px; }
  .lbl { display: block; font-size: 9px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; color: var(--faint); margin-bottom: 4px; }
  .a { display: flex; align-items: center; gap: 14px; min-height: 44px; border-top: 1px solid var(--rule); font-size: 12.5px; }
  .a b { font-family: var(--fs); font-weight: 400; font-size: 15px; }
  .a i { font-style: normal; font-size: 10px; color: var(--faint); }
  .a .btn { margin-left: auto; }

  .j { display: grid; grid-template-columns: 62px 112px 1fr auto; gap: 14px; align-items: center;
       min-height: 44px; border-top: 1px solid var(--rule); font-size: 12.5px; }
  .jd { font-variant-numeric: tabular-nums; color: var(--faint); font-size: 11px; }
  .jk { font-size: 9px; font-weight: 700; letter-spacing: .15em; text-transform: uppercase; color: var(--dim); }
  .jw b { font-family: var(--fs); font-weight: 400; font-size: 15px; }
  .jw i { color: var(--faint); font-size: 11.5px; }
  .jb { display: inline-flex; align-items: center; gap: 7px; font-size: 11px; color: var(--dim); }

  .pass { display: flex; gap: 10px; flex-wrap: wrap; }
  select { flex: 1; min-width: 220px; min-height: 44px; padding: 8px 10px; font: inherit; font-size: 12.5px;
           color: var(--ink); background: var(--paper); border: 1px solid var(--rule2); border-radius: 0; }

  @media (max-width: 720px) {
    .wrap { padding: 22px 18px 80px; }
    .k { grid-template-columns: 1fr; }
    .k-a { grid-row: auto; grid-column: 1; margin-top: 6px; }
    .d .btn { margin-left: 0; }
    .j { grid-template-columns: 62px 1fr; gap: 2px 12px; padding: 6px 0; }
    .jk, .jw, .jb { grid-column: 2; }
  }
</style>
