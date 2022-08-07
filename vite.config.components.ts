import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { windi } from "svelte-windicss-preprocess";
import { imagetools } from "vite-imagetools";
import sveltePreprocess from "svelte-preprocess";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: path.resolve(__dirname, "./build-component"),
    lib: {
      entry: "src/lib/index.js",
      name: "NimbusComponent",
    },
    rollupOptions: {
      // output: {
      //   format: "esm",
      // },
      // input: [
      //   "./src/entries/contentScript/views/TrxHighlight.svelte",
      //   "./src/entries/contentScript/views/AddressHighlight.svelte",
      // ],
    },
  },
  plugins: [
    svelte({
      compilerOptions: {
        customElement: true,
      },
      preprocess: [sveltePreprocess(), windi({})],
    }),
    imagetools(),
  ],
});
