import { defineConfig, loadEnv } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import webExtension from "@samrum/vite-plugin-web-extension";
import path from "path";
import { getManifest } from "./src/manifest";
import { windi } from "svelte-windicss-preprocess";
import sveltePreprocess from "svelte-preprocess";
import AutoImport from "unplugin-auto-import/vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { VitePWA } from "vite-plugin-pwa";

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
          globPatterns: ["**/*.{css,html,svelte,ts,gif,svg,png,woff2}"],
        },
        devOptions: {
          enabled: true,
        },
        registerType: "autoUpdate",
        manifest: {
          name: "Nimbus",
          short_name: "Nimbus",
          start_url: "/",
          display: "standalone",
          description: "https://getnimbus.io",
          icons: [
            {
              src: "https://raw.githubusercontent.com/thanhlmm/landing/main/public/PWA/logo/512.png?token=GHSAT0AAAAAACGDWB6XLETBUX3GEXJUNPNMZKN2SMQ",
              type: "image/png",
              sizes: "512x512",
              purpose: "any",
            },
            {
              src: "https://raw.githubusercontent.com/thanhlmm/landing/main/public/PWA/logo/256.png?token=GHSAT0AAAAAACGDWB6XOASYL7KPMQCDRTOMZKN2TBQ",
              type: "image/png",
              sizes: "256x256",
              purpose: "any",
            },
            {
              src: "https://raw.githubusercontent.com/thanhlmm/landing/main/public/PWA/logo/144.png?token=GHSAT0AAAAAACGDWB6XVS4M3MGEO4RE4GV4ZKN2Y6A",
              type: "image/png",
              sizes: "144x144",
              purpose: "any",
            },
            {
              src: "https://raw.githubusercontent.com/thanhlmm/landing/main/public/PWA/logo/128.png?token=GHSAT0AAAAAACGDWB6WI3777X47JWKJOCDCZKN2TYQ",
              type: "image/png",
              sizes: "128x128",
              purpose: "any",
            },
            {
              src: "https://raw.githubusercontent.com/thanhlmm/landing/main/public/PWA/logo/48.png?token=GHSAT0AAAAAACGDWB6XY2SQELE4MIQ5ACOQZKN2SYA",
              type: "image/png",
              sizes: "48x48",
              purpose: "any",
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        "~": path.resolve(__dirname, "./src"),
        "webext-bridge": path.resolve(__dirname, "./src/lib/web-bridge"),
        "webextension-polyfill": path.resolve(
          __dirname,
          "./src/lib/web-chrome"
        ),
      },
    },
    define: {
      APP_TYPE: {
        TYPE: "WEB",
      },
    },
    server: {
      port: 5173,
    },
    root: path.resolve(__dirname, "./src"),
    optimizeDeps: {
      esbuildOptions: {
        target: "es2020",
      },
    },
    build: {
      target: ["es2020"],
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
