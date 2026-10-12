<script lang="ts">
  /* **Le seuil.** Ce qu'est Checkpoint en trois lignes, et la connexion.
     Aucun compte à créer ici, aucun mot de passe : GitHub identifie, et
     c'est la seule chose qu'on demande.

     La connexion est le *device flow* : un code à saisir sur GitHub. On ne
     prétend pas l'avoir copié — le presse-papiers d'une fenêtre native peut
     refuser sans le dire ; on le montre en grand, et un bouton le copie. */
  import { porte } from "./gate.svelte.ts";

  let copied = $state(false);
  async function copy() {
    if (!porte.code) return;
    try { await navigator.clipboard.writeText(porte.code.user); copied = true; }
    catch { copied = false; }
  }
</script>

<h2 class="onb-t">Un registre tenu à plusieurs</h2>
<p class="onb-p">Checkpoint note ce que vous jouez, regardez et lisez — <b>et surtout ce que les autres en ont fait.</b> Il n'y a <b>aucun compte à créer ici</b>, aucun mot de passe à retenir : vos écrits vivent dans un dépôt que le groupe possède.</p>

{#if !porte.code}
  <p class="onb-p dim">L'entrée se fait avec un compte GitHub. C'est lui qui vous identifie — et c'est la seule chose qu'on vous demande.</p>
  <div class="onb-act">
    <button class="btn-main" onclick={() => porte.connect()} disabled={porte.busy}>Se connecter avec GitHub</button>
    <button class="btn-ghost" onclick={() => porte.visit("https://github.com/signup")}>Je n'en ai pas — en créer un</button>
  </div>
{:else}
  <div class="code">
    <span class="onb-k">Votre code</span>
    <b class="cd" aria-live="polite">{porte.code.user}</b>
    <p class="onb-p dim">La page de GitHub s'est ouverte dans votre navigateur et vous le demande. Saisissez-le, autorisez Checkpoint, puis revenez ici : <b>cet écran avancera de lui-même.</b></p>
  </div>
  <div class="onb-act">
    <button class="btn-main" onclick={copy}>{copied ? "Copié" : "Copier le code"}</button>
    <button class="btn-ghost" onclick={() => porte.reopen()}>Rouvrir GitHub</button>
    <button class="btn-ghost" onclick={() => { copied = false; porte.cancel(); }}>Annuler</button>
  </div>
{/if}

{#if porte.error}<p class="err" role="alert">{porte.error}</p>{/if}

<style>
  .code { display: flex; flex-direction: column; align-items: flex-start; gap: 6px; padding: 18px 20px; background: var(--paper); border: 1px solid var(--rule); }
  /* Le code se lit à voix haute et se recopie à la main : grand, espacé,
     sélectionnable. */
  .cd { font-family: var(--fs); font-weight: 400; font-size: 44px; letter-spacing: .14em; line-height: 1.1; user-select: all; }
  .code .onb-p { margin: 4px 0 0; }
</style>
