<script lang="ts">
  /* **Un bandeau qui mène quelque part** : un désaccord, une œuvre défendue
     seul contre tous. Il ne décore pas, il ouvre une conversation — c'est
     pour ça qu'il est un lien vers la fiche. */
  let { k, t, d, href }: { k: string; t: string; d: string; href: string } = $props();
</script>

<a class="banner" {href}><span class="k">{k}</span><span class="t">{t}</span><span class="d">{d}</span></a>

<style>
  .banner { display: block; width: 100%; margin-top: 16px; padding: 16px 18px; min-height: 44px;
            border: 1px solid var(--rule); border-left: 2px solid var(--c, var(--ink));
            transition: background var(--t1) var(--e); }
  .banner:hover { background: var(--raise); }
  .k { display: block; font-size: 9px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: var(--faint); }
  .t { display: block; font-family: var(--fs); font-size: 21px; margin: 3px 0 4px; }
  .d { display: block; font-size: 11.5px; color: var(--dim); }
</style>
