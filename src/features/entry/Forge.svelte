<script lang="ts">
  /* **L'atelier.** Frapper, attendre et se composer un visage sont un seul
     geste — on demande à entrer, et on se présente pendant qu'on attend.
     C'est **le maintien du résultat sous les yeux** qui fait une création de
     personnage et non un formulaire : le portrait reste à gauche pendant
     qu'on remplit à droite.

     **L'attente est le pivot**, pas un accident : la demande est une issue,
     un greffier la verra en ouvrant l'application, et **personne ne sera
     averti**. L'écran le dit franchement, et demande le Discord parce que
     c'est le seul canal de relance qui existe. */
  import { porte } from "./gate.svelte.ts";
  import { draft, keep } from "./draft.svelte.ts";
  import { knockFields } from "./door.ts";
  import { SIGNS, SIGN_COUNT, TONES, VOUCHED_AS } from "./emblems.ts";
  import { dateShort } from "#core/model/lexicon.ts";

  /* Sur une autre machine, la demande est sur GitHub mais le brouillon n'est
     pas là : on reprend ce que la demande porte, plutôt que de faire
     resaisir ce qui a déjà été dit. */
  if (porte.knock && !draft.firstName && !draft.vouched) {
    draft.firstName = porte.knock.firstName;
    draft.vouched = porte.knock.vouchedName;
    draft.vouchedAs = porte.knock.vouchedAs || draft.vouchedAs;
    draft.discord = porte.knock.discord;
    keep();
  }

  const admitted = $derived(porte.door === "admis");
  const sent = $derived(porte.knock?.state === "open");
  const refused = $derived(porte.knock?.state === "closed" && porte.knock.reason === "not_planned");
  /* Ce qui est parti dans la demande ne se corrige plus ici : la demande
     dirait une chose, l'écran une autre. */
  const locked = $derived(sent || admitted || porte.invited);
  /* Admis sans avoir frappé — quelqu'un l'a fait entrer à la main dans
     l'organisation : le vasistas n'a plus d'objet. */
  const vasistas = $derived(!(admitted && !porte.knock));

  const knock = () => porte.sendKnock(knockFields(draft));
</script>

<h2 class="onb-t">Vous frappez à la porte</h2>
<p class="onb-p">Les données du groupe sont fermées. <b>L'application est ouverte, ce qu'elle lit ne l'est pas.</b> Votre demande ouvre une issue sur le dépôt public.</p>
<p class="acct">Compte GitHub : <b>@{porte.login}</b>
  <button class="lk" onclick={() => porte.leave()}>Changer de compte</button></p>

<div class="forge">
  <aside class="forge-face">
    <span class="halo" style="--c:{draft.tone}">
      <span class="face" style="--g:{draft.tone}"><span>{draft.sign}</span></span>
    </span>
    <b>{draft.firstName.trim() || "Sans nom"}</b>
    <span class="forge-h">{draft.handle.trim() || "sans maison"}</span>
    <span class="forge-n">Voilà ce qu'on verra de vous.</span>
  </aside>

  <div class="forge-x">
    {#if vasistas}
      <section class="forge-s">
        <span class="forge-k">Par le vasistas, deux yeux vous fixent</span>
        <div class="fld-2">
          <div class="fld"><label for="f-vouched">Qui vous connaît ?</label>
            <input id="f-vouched" type="text" bind:value={draft.vouched} oninput={keep} disabled={locked}
                   placeholder="Un prénom" autocomplete="off" /></div>
          <div class="fld"><label for="f-as">À quel titre</label>
            <select id="f-as" bind:value={draft.vouchedAs} onchange={keep} disabled={locked}>
              {#each VOUCHED_AS as o (o)}<option>{o}</option>{/each}
            </select></div>
        </div>
        <p class="legend"><b>Personne ne sera averti</b> : il n'y a pas de serveur pour prévenir qui que ce soit. Un administrateur verra la demande en ouvrant l'application — une heure, ou un soir.</p>
        <div class="fld" style="margin-top:12px"><label for="f-dsc">Vous laissez votre adresse, on vous trouvera plus facilement</label>
          <input id="f-dsc" type="text" bind:value={draft.discord} oninput={keep} disabled={locked}
                 placeholder="Votre Discord" autocomplete="off" /></div>
      </section>
    {/if}

    <section class="forge-s">
      <span class="forge-k">Votre emblème</span>
      <p class="onb-p dim" style="margin-bottom:10px">C'est le seul masque par lequel on vous connaîtra.</p>
      <div class="fld"><span class="lbl">Le fond</span>
        <div class="tones" role="radiogroup" aria-label="Le fond">
          {#each TONES as c (c)}
            <button type="button" class="tone" class:on={c === draft.tone} role="radio" aria-checked={c === draft.tone}
                    aria-label="Fond {c}" onclick={() => { draft.tone = c; keep(); }}><i style="background:{c}"></i></button>
          {/each}
        </div></div>
      <!-- Un choix qu'on ne voit pas n'existe pas : les familles s'affichent
           en entier, jamais dans une boîte à défilement interne. -->
      <div class="fld"><span class="lbl">Le signe <em>— {SIGN_COUNT} au choix</em></span>
        {#each SIGNS as fam (fam.g)}
          <div class="sgn-fam">
            <span class="sgn-g">{fam.g}</span>
            <div class="sgn-row" role="radiogroup" aria-label={fam.g}>
              {#each fam.l as g (g)}
                <button type="button" class="sgn" class:on={g === draft.sign} role="radio" aria-checked={g === draft.sign}
                        onclick={() => { draft.sign = g; keep(); }}>{g}</button>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    </section>

    <section class="forge-s">
      <span class="forge-k">Votre nom</span>
      <div class="fld-2">
        <div class="fld"><label for="f-fn">Prénom</label>
          <input id="f-fn" type="text" bind:value={draft.firstName} oninput={keep}
                 placeholder="Comme on vous appelle" autocomplete="off" /></div>
        <div class="fld"><label for="f-hd">Pseudo de famille <em>— pas votre vrai nom</em></label>
          <input id="f-hd" type="text" bind:value={draft.handle} oninput={keep}
                 placeholder="de la Forge, Deux-Lunes…" autocomplete="off" /></div>
      </div>
      <p class="legend">Une particule, pour qu'on sache lequel des trois Thomas vous êtes.</p>
    </section>

    <!-- La porte elle-même : ce qu'on a demandé, et où ça en est. -->
    <section class="forge-s" aria-live="polite">
      <span class="forge-k">La porte</span>
      {#if admitted}
        <p class="st"><b>Vous êtes admis.</b> Il ne reste qu'à finir votre visage, puis à choisir votre Ordre.</p>
      {:else if porte.invited}
        <p class="st"><b>Un greffier vous a admis.</b> GitHub vous a envoyé une invitation que l'application n'a pas pu accepter d'ici : acceptez-la sur GitHub, puis revenez — cet écran avancera de lui-même.</p>
        <p class="legend">Une invitation expire au bout de sept jours. Si elle n'est plus là, frappez de nouveau.</p>
        <div class="row">
          <button class="btn-main" onclick={() => porte.invitation()}>Voir l'invitation</button>
          <button class="btn-ghost" onclick={knock} disabled={porte.busy}>Frapper de nouveau</button>
        </div>
      {:else if sent && porte.knock}
        <p class="st"><b>Votre demande est posée</b> — nº {porte.knock.issue}, le {dateShort(porte.knock.at)}.</p>
        <p class="legend">On regarde toutes les trente secondes ; il n'y a rien à faire qu'attendre. Si rien ne bouge d'ici un soir, relancez la personne qui vous connaît, sur Discord.</p>
        <div class="row">
          <button class="btn-ghost" onclick={() => porte.knock && porte.visit(porte.knock.url)}>La voir sur GitHub</button>
        </div>
      {:else}
        {#if refused}<p class="st"><b>Votre demande a été refermée.</b> Rien n'empêche de frapper de nouveau.</p>{/if}
        <p class="legend">Votre prénom, la personne qui vous connaît et votre Discord partent dans une demande <b>publique</b>, sur GitHub. Le reste — fond, emblème, Ordre — attend ici votre admission.</p>
        <div class="row">
          <button class="btn-main" onclick={knock} disabled={!draft.firstName.trim() || porte.busy}>Frapper à la porte</button>
        </div>
      {/if}
      {#if porte.error}<p class="err" role="alert">{porte.error}</p>{/if}
    </section>
  </div>
</div>

<style>
  .acct { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; font-size: 11.5px; color: var(--dim); margin: -6px 0 6px; }
  .acct b { color: var(--ink); font-weight: 600; }
  .lk { min-height: 44px; display: inline-flex; align-items: center; margin: -10px 0;
        font-size: 11.5px; color: var(--dim); text-decoration: underline; text-underline-offset: 3px; }
  .lk:hover { color: var(--ink); }

  .forge { display: grid; grid-template-columns: 200px 1fr; gap: 30px; align-items: start; margin-top: 14px; }
  .forge-face {
    position: sticky; top: 8px; display: flex; flex-direction: column; align-items: center;
    text-align: center; gap: 3px; padding: 18px 10px 16px;
    background: var(--paper); border: 1px solid var(--rule);
  }
  .forge-face > b { font-family: var(--fs); font-size: 25px; font-weight: 400; line-height: 1.1; overflow-wrap: anywhere; }
  .forge-h { font-family: var(--fr); font-style: italic; font-size: 13px; color: var(--dim); }
  .forge-n { font-family: var(--fr); font-style: italic; font-size: 11px; color: var(--faint);
             margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--rule); width: 100%; }

  /* Le visage flotte dans son halo, comme les disques de la racine. */
  .halo { position: relative; display: block; margin-bottom: 12px; animation: drift 7.5s ease-in-out infinite; }
  .halo::before {
    content: ""; position: absolute; inset: -42%; border-radius: 50%; z-index: 0;
    background: radial-gradient(circle, var(--c) 0%, transparent 62%);
    filter: blur(17px); animation: halo 7.5s ease-in-out infinite;
  }
  .face {
    position: relative; z-index: 1; display: grid; place-items: center; border-radius: 50%;
    width: 104px; height: 104px; font-size: 50px; background: var(--g); overflow: hidden;
    box-shadow: 0 0 0 1px rgba(20,20,18,.12) inset; letter-spacing: 0;
  }
  .face span { line-height: 1; }
  @keyframes drift { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-11px); } }
  @keyframes halo { 0%,100% { opacity: .26; transform: scale(1); } 50% { opacity: .46; transform: scale(1.1); } }

  .forge-x { min-width: 0; display: flex; flex-direction: column; gap: 22px; }
  .forge-s { padding-bottom: 20px; border-bottom: 1px solid var(--rule); }
  .forge-s:last-child { padding-bottom: 0; border-bottom: none; }
  .forge-k { display: block; font-size: 9px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; color: var(--faint); margin-bottom: 12px; }
  .forge-s .legend { margin: -4px 0 0; }

  /* Invariant 20 : la cible fait 44 px, le disque visible en garde 30. */
  .tones { display: flex; flex-wrap: wrap; gap: 0; margin: -7px; }
  .tone { display: grid; place-items: center; width: 44px; height: 44px; }
  .tone i { width: 30px; height: 30px; border-radius: 50%; border: 1px solid var(--rule2);
            transition: transform var(--t1) var(--e), box-shadow var(--t1) var(--e); }
  .tone:hover i { transform: scale(1.12); }
  .tone.on i { box-shadow: 0 0 0 2px var(--paper), 0 0 0 3.5px var(--ink); }

  .sgn-fam + .sgn-fam { margin-top: 10px; }
  .sgn-g { display: block; font-size: 8.5px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: var(--faint); margin-bottom: 4px; }
  .sgn-row { display: flex; flex-wrap: wrap; gap: 0; }
  .sgn { width: 44px; height: 44px; display: grid; place-items: center; font-size: 19px; letter-spacing: 0; line-height: 1;
         border: 1px solid transparent; transition: all var(--t1) var(--e); }
  .sgn:hover { border-color: var(--rule2); }
  .sgn.on { border-color: var(--ink); background: var(--paper); }

  .st { font-family: var(--fr); font-weight: 300; font-size: 14px; line-height: 1.6; color: var(--ink2); margin-bottom: 8px; max-width: 60ch; }
  .st b { font-weight: 400; color: var(--ink); }
  .row { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 14px; }

  @media (prefers-reduced-motion: reduce) { .halo, .halo::before { animation: none; } }
  @media (max-width: 860px) {
    .forge { grid-template-columns: 1fr; gap: 18px; }
    /* Le portrait ne reste pas collé en haut : en étroit, il prendrait la
       moitié de l'écran à chaque défilement. */
    .forge-face { position: static; flex-direction: row; justify-content: flex-start; text-align: left; gap: 14px; padding: 12px 14px; }
    .halo { margin-bottom: 0; }
    .face { width: 56px; height: 56px; font-size: 27px; }
    .forge-n { display: none; }
  }
</style>
