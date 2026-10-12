<script lang="ts">
  /* **Signaler un défaut** — demandé par Nathan le 12 octobre. Le
     signalement devient **une issue du dépôt public** : c'est le seul geste
     d'écriture hors des fragments, il existe déjà pour frapper à la porte.
     Il est public, et l'écran le dit **avant** l'envoi, comme la demande
     d'adhésion le dit. La version et le système partent d'office : ce sont
     les deux choses qu'on oublie toujours de préciser. */
  import { platform } from "#platform/index.ts";

  let { close }: { close?: () => void } = $props();

  const system = (() => {
    const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
    return /Mac/i.test(ua) ? "macOS" : /Windows/i.test(ua) ? "Windows" : /Android/i.test(ua) ? "Android" : /Linux/i.test(ua) ? "Linux" : "inconnu";
  })();

  let what = $state("");
  let expected = $state("");
  let where = $state("");
  let busy = $state(false);
  let error = $state<string | null>(null);
  let sent = $state<{ issue: number; url: string } | null>(null);

  async function send() {
    if (!what.trim() || busy) return;
    busy = true; error = null;
    try { sent = await platform().org.report({ what, expected, where, version: __APP_VERSION__, system }); }
    catch (e) { error = (e as Error).message; }
    finally { busy = false; }
  }
</script>

{#if sent}
  <div class="done">
    <p><b>Signalement nº {sent.issue} envoyé.</b> Merci — il attend sur GitHub, où on le lira.</p>
    <div class="row">
      <button class="btn-main" onclick={() => sent && platform().open(sent.url)}>Le voir sur GitHub</button>
      <button class="btn" onclick={() => close?.()}>Fermer</button>
    </div>
  </div>
{:else}
  <form class="rep" onsubmit={e => { e.preventDefault(); void send(); }}>
    <p class="legend">Ton signalement devient une <b>issue publique</b> sur GitHub : n'y mets rien de privé.
      La version de l'application et ton système y sont joints d'office.</p>
    <label class="f"><span class="k">Ce qui ne va pas</span>
      <textarea bind:value={what} rows="4" placeholder="Ce que tu as vu, le plus simplement possible."></textarea></label>
    <label class="f"><span class="k">Ce que tu attendais <em>— facultatif</em></span>
      <textarea bind:value={expected} rows="2" placeholder="Ce qui aurait dû se passer."></textarea></label>
    <label class="f"><span class="k">Où <em>— facultatif</em></span>
      <input bind:value={where} placeholder="Sur quelle page, après quel geste" /></label>
    <p class="meta">Checkpoint {__APP_VERSION__} · {system}</p>
    {#if error}<p class="err" role="alert">L'envoi a échoué : {error}</p>{/if}
    <div class="row"><button class="btn-main" disabled={!what.trim() || busy}>{busy ? "Envoi…" : "Envoyer le signalement"}</button></div>
  </form>
{/if}

<style>
  .rep, .done { display: grid; gap: 12px; }
  .legend { font-size: 11.5px; color: var(--dim); line-height: 1.55; }
  .legend b, .done b { color: var(--ink); font-weight: 600; }
  .done p { font-size: 13px; line-height: 1.55; color: var(--ink2); }
  .f { display: grid; gap: 6px; }
  .k { font-size: 9px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: var(--faint); }
  .k em { font-style: normal; text-transform: none; letter-spacing: .02em; font-weight: 400; }
  textarea, input { width: 100%; min-height: 44px; padding: 10px 12px; border: 1px solid var(--rule2); background: var(--raise);
                    font: inherit; font-size: 13px; color: var(--ink); outline: none; resize: vertical; }
  textarea { font-family: var(--fr); font-size: 14px; line-height: 1.55; }
  textarea:focus, input:focus { border-color: var(--ink); background: var(--paper); }
  .meta { font-size: 10.5px; color: var(--faint); letter-spacing: .04em; }
  .err { font-size: 12px; color: var(--ink); border-left: 2px solid var(--ink); padding-left: 10px; }
  .row { display: flex; gap: 10px; flex-wrap: wrap; padding-top: 4px; }
  .btn-main, .btn { min-height: 44px; padding: 9px 16px; border: 1px solid var(--rule2); font-size: 10px; font-weight: 700;
                    letter-spacing: .1em; text-transform: uppercase; color: var(--dim); }
  .btn-main { border-color: var(--ink); color: var(--ink); }
  .btn-main:hover:not(:disabled) { background: var(--ink); color: var(--paper); }
  .btn-main:disabled { opacity: .4; }
  .btn:hover { color: var(--ink); border-color: var(--ink); }
</style>
