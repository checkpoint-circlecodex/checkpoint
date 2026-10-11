/* Le point d'entrée fait partie de la coque, pas d'une couche à part.

   **L'amorçage attend la plateforme avant de monter quoi que ce soit** : une
   vue qui se peint avant de savoir si elle a un dépôt afficherait un cercle
   vide, puis sauterait. Mieux vaut cent millisecondes de rien. */
import "#core/ui/app.css";
import { mount } from "svelte";
import { bootPlatform } from "#platform/index.ts";
import App from "./App.svelte";

const target = document.getElementById("app")!;
await bootPlatform();
mount(App, { target });
