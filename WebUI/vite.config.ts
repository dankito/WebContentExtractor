import { defineConfig } from "vite"
import { svelte } from "@sveltejs/vite-plugin-svelte"
import tailwindcss from "@tailwindcss/vite"

// https://vite.dev/config/
export default defineConfig({
  base: "./", // set a relative base path so that .js and .css files get correctly resolved when app/API is being served from a custom root path
  plugins: [
    svelte(),
    tailwindcss(),
  ],
  server: {
    host: "0.0.0.0",

    hmr: true,
  }
})
