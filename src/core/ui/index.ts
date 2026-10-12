export { default as Face } from "./Face.svelte";
export { default as Surface } from "./Surface.svelte";
export { default as Stage } from "./Stage.svelte";
export { default as Panes } from "./Panes.svelte";
/* Dans le noyau dès sa première utilisation, et c'est une exception à la
   règle de promotion qui n'en est pas une : le lanceur vit dans la coque,
   le Répertoire dans un bloc, et la coque ne partage rien avec un bloc
   autrement que par le noyau. */
export { default as Cover } from "./Cover.svelte";
export * from "./surfaces.svelte.ts";
export { gestes } from "./gestes.ts";
