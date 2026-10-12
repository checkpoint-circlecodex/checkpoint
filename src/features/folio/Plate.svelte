<script lang="ts">
  /* **La planche** : la jaquette en grand, en couleur. C'est la troisième
     exception au noir et blanc, rendue ici en image puisqu'on l'a demandée. */
  import type { Frame } from "#core/model/schema.ts";
  import { frameStyle } from "#core/ui/frame.ts";
  let { src, title, sub, frame = null }: { src: string; title: string; sub: string; frame?: Frame | null; close?: () => void } = $props();
</script>

<figure class="plate">
  <span class="fr"><img {src} alt={title} style={frameStyle(frame)} /></span>
  <figcaption><b>{title}</b><span>{sub}</span></figcaption>
</figure>

<style>
  .plate { display: grid; justify-items: center; gap: 14px; padding: 6px 0 4px; }
  .fr { position: relative; display: block; width: min(100%, 400px); aspect-ratio: 2 / 3; overflow: hidden; border: 1px solid var(--rule2); }
  .fr img { width: 100%; height: 100%; object-fit: cover; }
  figcaption { display: grid; justify-items: center; text-align: center; }
  b { font-family: var(--fs); font-weight: 400; font-size: 23px; line-height: 1.15; }
  span { font-size: 10.5px; color: var(--faint); letter-spacing: .1em; text-transform: uppercase; }
</style>
