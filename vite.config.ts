import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";

const at = (p: string) => fileURLToPath(new URL(p, import.meta.url));

/* Le port est fixe et strict : Tauri l'attend à cette adresse, et un repli
   silencieux sur 1421 donnerait une fenêtre blanche sans message d'erreur. */
export default defineConfig({
  plugins: [svelte()],
  resolve: { alias: {
    "$core":     at("./src/core"),
    "$platform": at("./src/platform"),
    "$features": at("./src/features"),
    "$shell":    at("./src/shell"),
  } },
  clearScreen: false,
  server: { port: 1420, strictPort: true },
  envPrefix: ["VITE_", "TAURI_"],
  build: { target: "es2022", sourcemap: true },
});
