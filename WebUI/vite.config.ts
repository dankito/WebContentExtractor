import { defineConfig } from "vite"
import { svelte } from "@sveltejs/vite-plugin-svelte"
import tailwindcss from "@tailwindcss/vite"

// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? "/",
  plugins: [
    svelte(),
    tailwindcss(),
  ],
  server: {
    host: "0.0.0.0",

    hmr: true,
  }
})
