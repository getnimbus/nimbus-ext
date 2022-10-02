import { defineConfig, loadEnv } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import webExtension from "@samrum/vite-plugin-web-extension";
import path from "path";
import { getManifest } from "./src/manifest";
import { windi } from "svelte-windicss-preprocess";
import sveltePreprocess from "svelte-preprocess";
import AutoImport from "unplugin-auto-import/vite";

// https://vitejs.dev/config/
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
      webExtension({
        manifest: getManifest(Number(env.MANIFEST_VERSION)),
      }),
      AutoImport({
        imports: [
          {
            "webextension-polyfill": [["default", "browser"]],
          },
        ],
      }),
    ],
    resolve: {
      alias: {
        "~": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      rollupOptions: {
        // input: {
        //   newTab: path.resolve(__dirname, "./src/entries/newTab/index.html"),
        //   option: path.resolve(__dirname, "./src/entries/options/index.html"),
        //   contentScript: path.resolve(
        //     __dirname,
        //     "./src/entries/contentScript/main.ts"
        //   ),
        // },
        output: {
          entryFileNames: `assets/[name].js`,
          chunkFileNames: `assets/[name].js`,
          assetFileNames: `assets/[name].[hash].[ext]`,
        },
      },
      sourcemap: env.WATCH === "true" ? "inline" : false,
    },
    optimizeDeps: {
      include: ["webextension-polyfill"],
    },
  };
});
