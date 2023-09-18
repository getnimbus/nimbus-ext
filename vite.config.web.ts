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
              "background_color": "#ffffff",
              "theme_color": "#27326f",
              "name": "getnimbus.io",
              "short_name": "Nimbus",
              "start_url": "/",
              "display": "standalone",
              "icons": [
                  {
                      "src": "/assets/logo-2.png",
                      "sizes": "533x248",
                      "type": "image/png",
                      "purpose": "any",
                  },
                  {
                    "src": "/assets/logo-icon-1.svg",
                    "sizes": "508x542",
                    "type": "image/svg+xml",
                    "purpose": "any",
                },{
                  "src": "/assets/logo-icon-1.svg",
                  "sizes": "508x542",
                  "type": "image/svg+xml",
                  "purpose": "any",
              }
              ]
          }
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
