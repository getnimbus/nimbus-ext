import { defineConfig, loadEnv } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import webExtension from "@samrum/vite-plugin-web-extension";
import path from "path";
import { getManifest } from "./src/manifest";
import { windi } from "svelte-windicss-preprocess";
import sveltePreprocess from "svelte-preprocess";
import AutoImport from "unplugin-auto-import/vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import inject from "@rollup/plugin-inject";

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
          // {
          //   src: path.resolve(__dirname, "./public"),
          //   dest: "",
          // },
          // {
          //   src: path.resolve(__dirname, "./public/robots.txt"),
          //   dest: "",
          // },
          {
            src: path.resolve(__dirname, "./src/assets/logo/"),
            dest: "assets",
          },
        ],
      }),
    ],
    resolve: {
      alias: {
        "~": path.resolve(__dirname, "./src"),
        "webext-bridge": path.resolve(__dirname, "./src/lib/web-bridge.ts"),
        "webextension-polyfill": path.resolve(
          __dirname,
          "./src/lib/web-chrome.ts"
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
    publicDir: path.resolve(__dirname, "./public"),
    build: {
      target: ["es2020"],
      rollupOptions: {
        plugins: [
          inject({ Buffer: ["buffer/", "Buffer"] }),
          // json(),
          // globals(),
          // builtins(),
        ],
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
