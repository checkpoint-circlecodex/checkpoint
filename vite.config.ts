import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";

const at = (p: string) => fileURLToPath(new URL(p, import.meta.url));
import { readFileSync } from "node:fs";
const pkg = JSON.parse(readFileSync(at("./package.json"), "utf8"));

/* Le port est fixe et strict : Tauri l'attend à cette adresse, et un repli
   silencieux sur 1421 donnerait une fenêtre blanche sans message d'erreur. */
export default defineConfig({
  plugins: [svelte()],
  resolve: { alias: {
    "#core":     at("./src/core"),
    "#platform": at("./src/platform"),
    "#features": at("./src/features"),
    "#shell":    at("./src/shell"),
  } },
  clearScreen: false,
  /* La version vient du paquet, une seule source : l'établi la montre, et un
     écart entre ce qu'il affiche et ce qui tourne serait une fausse piste. */
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  server: { port: 1420, strictPort: true },
  envPrefix: ["VITE_", "TAURI_"],
  build: { target: "es2022", sourcemap: true },
});
