import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import path from "path"
import { cloudflare } from "@cloudflare/vite-plugin";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    svelte(),
    cloudflare()
  ],
  base: './',
  resolve: {
    alias: {
      "@": path.resolve("./src"),
      "@app": path.resolve("./src/app"),
      "@features": path.resolve("./src/features"),
      "@shared": path.resolve("./src/shared"),
      "@assets": path.resolve("./src/assets"),
    },
  },
  server: {
    fs: {
      strict: false
    }
  }
})
