/* Le point d'entrée fait partie de la coque, pas d'une couche à part : c'est
   lui qui monte la coque, et le vérificateur de couches n'aurait pas su où
   le ranger s'il était resté à la racine de src/. */
import "$core/ui/app.css";
import { mount } from "svelte";
import App from "./App.svelte";

export default mount(App, { target: document.getElementById("app")! });
