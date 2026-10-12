<script lang="ts">
  /* Une jaquette. **En noir et blanc, elle reprend sa couleur au survol** —
     la troisième des quatre exceptions. **Et quand une œuvre n'a pas de
     jaquette, le cadre porte son titre** : un rectangle vide ne dirait rien,
     une image inventée mentirait. */

  let { href, title, sub = "", cover = null, onpick = () => {} }:
    { href: string; title: string; sub?: string; cover?: string | null; onpick?: () => void } = $props();
</script>

<a class="cv" {href} onclick={onpick}>
  <span class="frame">
    {#if cover}
      <img src={cover} alt="" loading="lazy" />
    {:else}
      <span class="tt">{title}</span>
    {/if}
  </span>
  <span class="cap"><b>{title}</b>{#if sub}<i>{sub}</i>{/if}</span>
</a>

<style>
  .cv { display: grid; gap: 7px; min-width: 0; }
  .frame {
    display: grid; place-items: center; aspect-ratio: 2 / 3; overflow: hidden;
    border: 1px solid var(--rule2); background: var(--raise);
  }
  img { width: 100%; height: 100%; object-fit: cover; filter: grayscale(1) contrast(1.05);
        transition: filter var(--t2) var(--e); }
  .cv:hover img, .cv:focus-visible img { filter: none; }
  .tt { padding: 10px; text-align: center; font-family: var(--fs); font-size: 17px; line-height: 1.15;
        color: var(--ink2); }
  .cv:hover .frame { border-color: var(--ink); }
  .cap { display: grid; min-width: 0; }
  .cap b { font-size: 11.5px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .cap i { font-style: normal; font-size: 10px; color: var(--faint); }
</style>
