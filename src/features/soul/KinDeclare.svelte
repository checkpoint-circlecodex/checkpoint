<script lang="ts">
  /* **Déclarer une parenté.** Chacun n'écrit que dans son fragment : un lien
     n'existe que si les deux l'ont posé, dans des sens qui se répondent. C'est
     ce qui interdit de s'inventer une famille (invariant 29).

     D'où les trois parties de cette surface : ce qu'on attend de toi, ce que
     tu as déclaré, et déclarer. La première est la plus importante — **une
     déclaration qu'on ne voit pas ne peut pas être rendue**, et le lien
     n'existerait jamais. */
  import { registre } from "#core/model/store.svelte.ts";
  import { Face } from "#core/ui/index.ts";
  import { KIN, answersTo, kinAsked, kinLink, kinOf } from "#core/selectors/index.ts";
  import { declarerParente, retirerParente } from "#core/model/acts.ts";

  let { close: _close }: { close: () => void } = $props();

  const w = $derived(registre.world);
  const me = $derived(registre.me ?? "");
  const asked = $derived(kinAsked(w, me));
  const mine = $derived(kinOf(w, me));

  let q = $state("");
  let who = $state<string | null>(null);

  const others = $derived(Object.values(w.people)
    .filter(p => p.id !== me && !mine.some(k => k.id === p.id))
    .filter(p => q.trim().length < 1 || p.firstName.toLowerCase().includes(q.toLowerCase().trim())
                 || p.handle.toLowerCase().includes(q.toLowerCase().trim()))
    .sort((a, b) => a.firstName.localeCompare(b.firstName, "fr"))
    .slice(0, 8));

  /* Le mot est libre, le sens est contraint : on range les mots par ce
     qu'ils disent de la place de l'autre. */
  const SENSES: { l: string; d: number }[] = [
    { l: "Au-dessus de toi", d: 1 }, { l: "À côté", d: 0 }, { l: "Au-dessous", d: -1 },
  ];
  const wordsFor = (d: number) => Object.keys(KIN).filter(k => KIN[k].d === d);

  function declare(id: string, rel: string) {
    registre.act(declarerParente(id, rel));
    who = null; q = "";
  }
</script>

<div class="kd">
  {#if asked.length}
    <section>
      <span class="k">Ce qu'on attend de toi</span>
      {#each asked as a (a.from)}
        {@const p = w.people[a.from]}
        {#if p}
          <div class="ask">
            <Face who={p} size="s" />
            <p><b>{p.firstName}</b> te déclare <i>{KIN[a.rel].l}</i>.</p>
            <!-- On répond avec son propre mot, pris parmi ceux qui ont le
                 même sens : « mon fils » appelle « mon père », « ma mère » ou
                 « mon parent ». -->
            <div class="words">
              <span class="lead">Lui répondre :</span>
              {#each answersTo(a.rel) as r (r)}
                <button onclick={() => declare(a.from, r)}>{KIN[r].l}</button>
              {/each}
            </div>
          </div>
        {/if}
      {/each}
    </section>
  {/if}

  {#if mine.length}
    <section>
      <span class="k">Tes déclarations</span>
      {#each mine as k (k.id)}
        {@const p = w.people[k.id]}
        {@const ok = !!kinLink(w, me, k.id)}
        {#if p}
          <div class="decl">
            <Face who={p} size="s" />
            <span class="dt"><b>{p.firstName}</b>, <i>{KIN[k.rel].l}</i></span>
            <span class="st" class:ok>{ok ? "confirmée" : "attend sa déclaration"}</span>
            <button class="rm" onclick={() => registre.act(retirerParente(k.id))}>Retirer</button>
          </div>
        {/if}
      {/each}
    </section>
  {/if}

  <section>
    <span class="k">Déclarer une parenté</span>
    {#if !who}
      <input bind:value={q} placeholder="Un prénom…" autocomplete="off" />
      <div class="people">
        {#each others as p (p.id)}
          <button class="pp" onclick={() => (who = p.id)}>
            <Face who={p} size="s" /><span>{p.firstName}</span><i>{p.circleRef.one}</i>
          </button>
        {/each}
      </div>
    {:else}
      {@const p = w.people[who]}
      <p class="what">Ce que <b>{p?.firstName}</b> est pour toi :</p>
      {#each SENSES as s (s.d)}
        <div class="words">
          <span class="lead">{s.l}</span>
          {#each wordsFor(s.d) as r (r)}
            <button onclick={() => declare(who as string, r)}>{KIN[r].l}</button>
          {/each}
        </div>
      {/each}
      <button class="back" onclick={() => (who = null)}>← Quelqu'un d'autre</button>
    {/if}
    <p class="legend">
      <strong>Elle n'existera que si l'autre la déclare aussi</strong>, dans l'autre sens.
      Personne ne peut s'inventer une famille — et personne ne peut écrire chez un autre.
    </p>
  </section>
</div>

<style>
  .kd { display: grid; gap: 22px; }
  section { display: grid; gap: 8px; }
  .k { font-size: 9px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; color: var(--faint); }

  .ask { display: grid; grid-template-columns: 22px 1fr; gap: 6px 10px; align-items: center;
         padding: 12px 14px; border: 1px solid var(--ink); background: var(--raise); }
  .ask p { font-family: var(--fr); font-size: 14px; }
  .ask p b, .dt b { font-family: var(--fs); font-weight: 400; font-size: 16px; }
  .ask p i, .dt i { font-style: italic; }
  .ask .words { grid-column: 2; }

  .words { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }
  .lead { font-size: 10.5px; color: var(--dim); min-width: 96px; }
  .words button { min-height: 44px; padding: 8px 13px; border: 1px solid var(--rule2);
                  font-family: var(--fr); font-style: italic; font-size: 14px; }
  .words button:hover { border-color: var(--ink); background: var(--ink); color: var(--paper); }

  .decl { display: grid; grid-template-columns: 22px 1fr auto auto; gap: 10px; align-items: center;
          min-height: 44px; border-bottom: 1px solid var(--rule); }
  .st { font-size: 10.5px; color: var(--dim); font-style: italic; }
  .st.ok { color: var(--ink); font-style: normal; font-weight: 600; }
  .rm { min-height: 44px; padding: 0 10px; font-size: 10.5px; color: var(--dim); text-decoration: underline; text-underline-offset: 3px; }
  .rm:hover { color: var(--ink); }

  input { width: 100%; min-height: 44px; padding: 10px 12px; border: 1px solid var(--rule2); background: var(--paper); font-size: 13.5px; }
  .people { display: flex; flex-direction: column; }
  .pp { display: grid; grid-template-columns: 22px 1fr auto; gap: 10px; align-items: center; min-height: 44px;
        border-bottom: 1px solid var(--rule); text-align: left; }
  .pp:hover { background: var(--raise); }
  .pp span { font-family: var(--fs); font-size: 16px; }
  .pp i { font-style: normal; font-size: 10.5px; color: var(--faint); }
  .what { font-family: var(--fr); font-size: 14px; }
  .what b { font-family: var(--fs); font-weight: 400; font-size: 16px; }
  .back { justify-self: start; min-height: 44px; font-size: 11px; color: var(--dim); }
  .back:hover { color: var(--ink); }
  .legend { font-size: 11.5px; color: var(--dim); line-height: 1.55; margin-top: 4px; }
</style>
