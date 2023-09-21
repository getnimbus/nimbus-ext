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
                      "src": "https://lh3.googleusercontent.com/pw/AIL4fc_ODTwel8JDBKpsyOe3Fiihw0ipqD9bNp9JbWVw0AK2OwPmAEHH12bx73BnZYP1SEZOTuVpRFcQ9cTJOuzGwHAm4nXAN-1z8uB9lrNU6UNEg2LqLo7nHh0wTjNbPR08qZwIG-rOT_dwefvXWwPubWIbkltVkW1uJCwsh6uCnfZgBv88BoKWzEqZoCcGyNizaUsT4AXa0hfuV8Afpsly8KDV_V4wLbfpJV0oZPf9Rny6-D6jYiXouTdcvcsQ7XAcpEM6mdsXBuMR878O7JiZrjVhH5E1SoEZ_QWW2oiBkhfr33fu2wpVv4HAS3jOq6hyhjIdbhGVbn7vB5XtDCVjwLgDM_-7NDhFC4vp_eWwL4J4S75KbjcJ_-Gc9qqarsEk7cuG0NAf5eyy3WaXdljVP5CGGh48ksam21j9CQ8cf4I9DqXrdEFU6Hllfsj3PunjPpifCHTC_pv7ekUm2aBDA5GRrZXXR5xQFYqOmFfbDwFBCthq2jZw8C10OILmv3n0u_DnflPpMjkp4EMdiazhZ19JRTJsCa-SRjyCyjUQI5XsdTxUSU11zl1Yp-TSnN4DmihhJ8Y6OUc6fZD8PDgTrB7q2UKLWuZh_RPAtQWJdNJXRGvzIRjn_xR6lk5dsGCqX8J8gX5f3gUfh28GTtYESwGjQK8VcAJDCP9ZF3UZa806mJS_saePLlYliO1I097tf_H0WFQHDtkOBDmrBpEz-Ei7g9ls1F8_Kn9ZQtYdu3hV0CfTGP_J443mo5ZI-tYdQJlz7lJ5B7FQJaXd57pFqWEhWEe-yB83JJBfTSYomNBT9XL7wES8TlfQ5Z-gCTBQo9lcRI6dDZosQUSPL89pmmVbnVINrWEr6ug0tNQl6DzN5onk8r74EKqu89VvbKoHnXOe3HKHUK0vRQ37fOODFqf5etzlwgr58VDeQ35DGtbFjH7AZ1kH5e23jhK0xtBQWoMNgm41p8hCMimWdORSKTrBR4H8ymwT=w512-h512-s-no?authuser=0",
                      "type": "image/png",
                      "sizes": "512x512",
                      "purpose": "any",
                  },
                  // {
                  // "src": "/assets/logo/256.png", 
                  // "type": "image/png",
                  // "sizes": "256x256",
                  // "purpose": "any",
                  // },
                  // {
                  //   "src": "/assets/logo/144.png", 
                  //   "type": "image/png",
                  //   "sizes": "144x144",
                  //   "purpose": "any",
                  // },
                  // {
                  // "src": "/assets/logo/48.png", 
                  // "type": "image/png",
                  // "sizes": "48x48",
                  // "purpose": "any",
                  // },
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
