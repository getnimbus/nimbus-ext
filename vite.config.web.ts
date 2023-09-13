import { defineConfig, loadEnv } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import webExtension from "@samrum/vite-plugin-web-extension";
import path from "path";
import { getManifest } from "./src/manifest";
import { windi } from "svelte-windicss-preprocess";
import sveltePreprocess from "svelte-preprocess";
import AutoImport from "unplugin-auto-import/vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
/** @type {import('vite').UserConfig} */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [
      svelte({
        preprocess: [sveltePreprocess(), windi({})],
        experimental: {
          dynamicCompileOptions({ filename, compileOptions }) {
            return {
              ...compileOptions,
              customElement: filename.endsWith(".custom.svelte"),
            };
          },
        },
      }),
      viteStaticCopy({
        targets: [
          {
            src: "src/_locales",
            dest: "",
          },
          {
            src: "public",
            dest: "",
          },
        ],
      }),
      VitePWA({
          workbox: {
              globPatterns: ['**/*.{js,css,html,svelte,ts,gif,svg,png,woff2}'],
          },
          devOptions: {
            enabled: true
          },
          registerType: "autoUpdate",
          manifest: {
              "name": "Nimbus",
              "short_name": "Nimbus",
              "start_url": "/",
              "display": "standalone",
              "description": "https://getnimbus.io",
              "icons": [
                  {
                      "src": "https://lh3.googleusercontent.com/pw/AIL4fc9zAqbIl3Vp_e2vUB6j5gv_UMoING2QAYbQLlJPA3UqayJCqxRzYDYHhzbszSaQmRvqQApZ9a3eBA1M6kIbHKu6bA3EsPmDJgnjK7HvkldSfQUCbT-bO6ZeLNgXcxDLT_xHVlEAQF4v7lnfuzRKv-t3=w509-h509-s-no?authuser=0",
                      "type": "image/png",
                      "sizes": "509x509",
                      "purpose": "any",
                  },
              ]
          }, 
      })
    ],
    resolve: {
      alias: {
        "~": path.resolve(__dirname, "./src"),
        "webext-bridge": path.resolve(__dirname, "./src/lib/web-bridge"),
        "webextension-polyfill": path.resolve(__dirname, "./src/lib/web-chrome"),
      },
    },
    define: {
      APP_TYPE: {
        TYPE: 'WEB'
      }
    },
    server: {
      port: 5173,
    },
    root: path.resolve(__dirname, "./src"),
    optimizeDeps: {
      esbuildOptions: {
        target: 'es2020'
      }
    },
    build: {
      target: ['es2020'],
      rollupOptions: {
        input: {
          app: path.resolve(__dirname, "./src/index.html"),
          options: path.resolve(__dirname, "./src/entries/options/index.html"),
        },
        output: {
          entryFileNames: `assets/[name].js`,
          chunkFileNames: `assets/[name].js`,
          assetFileNames: `assets/[name].[hash].[ext]`,
        },
      },
      outDir: path.resolve(__dirname, "web-build"),
      sourcemap: env.WATCH === "true" ? "inline" : false,
    },
  };
});
