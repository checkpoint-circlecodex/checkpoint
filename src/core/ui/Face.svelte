<script lang="ts">
  /* Un visage. **C'est la première des quatre exceptions au noir et blanc**,
     et elle est limitée à ça : un disque teinté, un signe dessus. Un point
     coloré à côté d'un nom diluerait l'exception — c'est interdit ailleurs. */
  import type { Person } from "../model/world.ts";

  let { who, size = "m", link = false }:
    { who: Person; size?: "s" | "m" | "l"; link?: boolean } = $props();

  const label = $derived(who.firstName);
</script>

{#snippet disc()}
  <span class="face f-{size}" style="--tone:{who.tone ?? '#D9D5CB'}" aria-hidden="true">
    {who.sign ?? who.firstName.slice(0, 1).toUpperCase()}
  </span>
{/snippet}

{#if link}
  <a class="wrap" href="#/personne/{who.id}" aria-label={label}>{@render disc()}</a>
{:else}
  {@render disc()}
{/if}

<style>
  .wrap { display: inline-flex; }
  .face {
    display: grid; place-items: center; flex: none;
    border-radius: 50%; background: var(--tone); color: var(--ink);
    letter-spacing: 0; line-height: 1; user-select: none;
  }
  .f-s { width: 22px; height: 22px; font-size: 11px; }
  .f-m { width: 30px; height: 30px; font-size: 15px; }
  .f-l { width: 56px; height: 56px; font-size: 27px; }
</style>
