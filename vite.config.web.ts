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
                      "sizes": "509x509",
                      "purpose": "any",
                  },
                  {
                    "src": "https://lh3.googleusercontent.com/pw/AIL4fc96zoITCubpS-OFw0yvx7itZIYOlRvEPiV0htTyhWnxHgJz3XqClMkNjozgOvwHlJIhFtpHLudbklrPrG_iK3BiWnE166jDkYViZffTz7Q6-FZWE6Sv1StSg4CBU8G9a_E4KuL91Tg81FSyGkC6Er0AvgzT9RLRuGNVcZwico8Pzpi_JPhLyoM-AlHnihd1pUZf_lCedgisnXNmE3e66L0NQqWBx10FefJinK6PwtrE-WLLwl5zXxhbZ6ummiLeggCX0oPCBDwr-GQRGLVB-5X-TXIjo3k80x1_NPfTgjJz-p2tq4-Ka4LbhBNoQBgnN3eTNzRDN5MJ1oFT5_MBkw2ZyPvOoThommnGBUdQRl6o5edTtLzgTdTkPXmDoarWmXT2hNYBUhk7O405grHyeFS9EeplD4g9Wv3dGtEV2aXUTZuXxPn1rMi_iSO0-5JO4l-sh4ZlCUiiM-K5hcVKUjFvK52ZU51AAfkd3_lr_rx3aDxyl4n-dhbMInh4T5gfuyGry1oi_DWxyPc7TPiWQp_Nr62zyIYxvr1i0EPnqr4-41oFW4UzPSwil5fIRywgvU-VB7f1-QXshQDLrSBAXv-_Ox9ng4cv5DMcJ-zBXf0GtLob9UQhsJEOvLKkPLM9H8VHSd-EcVCqu6o3h0E7eVoFyPJAkpld3fI6C9dKDAPHZ45pD09WlpYlAHy7RWz7mDJH6pBcrh3zIuAp65A4948q0sDQr_EnnEK-xe8ti82KDEQebVhuBEI2bxCJ8hqP8a1NAdq2gURCCHbZ5uLT1Z1UmNAVIhO10N2xiDcFcgfd_iZjMTYH13hlqwOO476nYBFPjCYoc5l-POFYCHuM3giAr1F-3hpNivWyVTruUuXj9_VY9BdO-rrpEQO80dsHV3tV0yrtaodg2Kffg_6zzYK1OLSf9CZmtlhOJvPgUQJhRcRGvpGWVOZBmwsGZMIoPN-XHD1fPA0atu8UCtt-DGE2sLYsl7Bz=w533-h248-s-no?authuser=0",
                    "sizes": "533x248",
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
